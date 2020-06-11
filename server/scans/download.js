const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiZWxhZGJpdHRvbjFAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIxYWVmNTkxMS1iODAwLTRmZmQtYmZiZS05M2NiMzRjMTE4NDMiLCJyZWZyZXNoLXNlY3JldCI6InBwYy9LYTdFL0w5YzFSVlJlZ1k1WEhJbXVsNUVQbFJ2YjRmUEVxSVg2bnc9IiwiZXhwIjoxNTkyMDQ0NTg3LCJpc3MiOiJpZC5jb3B5bGVha3MuY29tIiwiYXVkIjoiYXBpLXYzLmNvcHlsZWFrcy5jb20ifQ.MDql3r4vvSsjRtdEIv5JRFM4uKepW69vt86u3C__CkNG9Ei6uwkOdotnwWG6Otn_RaWrmp4m49u9iPvPBHLqCSgOCCPhWM1VKnpAhcFflinQunf5IpLHbwdDCO1CbpMk1cQObmsg84cwkdAmkZnVMDTWSdEgVMYWstwIgoW304j9PEDVFoFL1k6o_jWafTmvOmr517-FyueWVKLp5toT0aYSnEsSuL4supOwE6gS-8yJ1k32n8hpyYimBOattjcaXtuiNP8jiV244CPh_r1WwJeexdrGDQA_cSWaNPDXfIG-agyiYeWS592p4cq6BWVab2an1xP9LUaSAre5qruGpw";

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
