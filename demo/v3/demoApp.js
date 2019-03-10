const express = require('express')
const app = express()
const port = 3003
const fs = require('fs');
const path = require('path');

app.use(express.static(path.join(__dirname, '/../..')))

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/pages/index.html");
})

//Listen to v3 report requests
app.get(['/v3/',
	'/v3/report/:id/:pageNum',
	'/v3/report/:id/:resultId/:sourcePageNum/:resultPageNum'], (req, res) => {
		res.sendFile(__dirname + "/pages/showSuccessReportMultipleSuspect.html");
	})

//Listen to v3 report requests for single suspect report
app.get(['/v3single/',
	'/v3single/report/:id/:resultId/:sourcePageNum/:resultPageNum'], (req, res) => {
		res.sendFile(__dirname + "/pages/showSuccessReportSingleSuspect.html");
	})

//Listen to v3 report with error requests
app.get(['/v3error/',
	'/v3error/report/:id/:pageNum'], (req, res) => {
		res.sendFile(__dirname + "/pages/showFailedReport.html");
	})

app.get('/download-suspect/v3/:resultId/:contentType', function (req, res) {
	var resultId = req.params.resultId;
	var contentType = req.params.contentType;
	console.log(contentType);
	console.log(resultId);
	var file = __dirname + '/data/' + resultId + '_comparison.json';
	var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (contentType == "html") {
		downloadFile(res, obj.html.value, `${resultId}.html`, 'text/html');
	} else {
		downloadFile(res, obj.text.value, `${resultId}.txt`, 'text/plain');
	}
});

app.get('/download-source/v3/:contentType', function (req, res) {
	var contentType = req.params.contentType;
	console.log(contentType);
	var file = __dirname + '/data/document.json';
	var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (contentType == "html") {
		downloadFile(res, obj.html.value, "document.html", 'text/html');
	} else {
		downloadFile(res, obj.text.value, "document.txt", 'text/plain');
	}
});

function downloadFile(res, data, fileName, contentType) {
	res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
	res.setHeader('Content-type', contentType);
	res.write(data, function (err) {
		res.end();
	});
}


app.listen(port, () => console.log(`Report app listening on port ${port}!`))