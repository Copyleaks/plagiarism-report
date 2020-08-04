const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiZWxhZGJpdHRvbjFAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIxYWVmNTkxMS1iODAwLTRmZmQtYmZiZS05M2NiMzRjMTE4NDMiLCJyZWZyZXNoLXNlY3JldCI6InA4dUxoTi9KNnp5Rk8wVnRSdUh0bEhTVGg0OFUzY2JpZG1Sb2tSTmd1YU09IiwiZXhwIjoxNTk2NjI2Mzc1LCJpc3MiOiJpZC5jb3B5bGVha3MuY29tIiwiYXVkIjoiYXBpLXYzLmNvcHlsZWFrcy5jb20ifQ.UCg15KDta7LaafxvYaKG3lULPa9gn1AXi5AOckbgv-Cl56H_rbjysGvS-ZVzi2p4EYuF1DjefSLoSPwRUN757lqLiUDRK2Xf6rHVKjsZhXXKkz32KvPXzWhNRfxJYTZMzOR_YkDTO_94ftHEhZVgJ6DyhL_7mBMFbcZX2zUpEV59Agry7EJ4vcslTKblput1rRPUVDtrJShfdjaysilOL0p4seXNN-YBnfgjYa78MPWO9IgFuI_MnT4ekkBP_NkVzT50dz8IgwS5Wdz_4iFN1xpovmwGAUu3u36TFzbjlqeLg-VPd3EuPNfnk5hB0xUdM_QCp1Fc-6CLEk1m_h-26A";

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
