const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const bearerToken = "<<copyleaks api token>>";

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

async function downloadFile(url, path, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `bearer ${token}`
    }
  });
  ensureDirectoryExistence(path);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", err => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve();
    });
  });
}

async function downloadResults(metaPath) {
  const meta = JSON.parse(fs.readFileSync(metaPath));
  const {
    scannedDocument: { scanId },
    results: { internet, database, batch, repositories }
  } = meta;
  const source = downloadFile(
    `https://api.copyleaks.com/v3/downloads/${scanId}`,
    `scans/${scanId}/source.json`,
    bearerToken
  );
  const failed = [];
  [...internet, ...database, ...batch, ...repositories].forEach(async ({ id }) => {
    try {
      await downloadFile(
        `https://api.copyleaks.com/v3/downloads/${scanId}/results/${id}`,
        `scans/${scanId}/results/${id}.json`,
        bearerToken
      );
    } catch (err) {
      failed.push(id);
    }
  });
  console.log(failed);
}
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Error: Download should take exactly one argument which is a scan-id");
  process.exit(1);
}
const completePath = `scans/${args[0]}/complete.json`;
if (!fs.existsSync(completePath)) {
  throw new Error(`file: ${completePath} is missing`);
}
downloadResults(completePath);
