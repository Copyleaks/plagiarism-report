const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');

app.use(express.static('.'))

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html");
})

//Listen to v3 report requests
app.get(['/v3/',
	'/v3/report/:id/:pageNum',
	'/v3/report/:id/:resultId/:sourcePageNum/:resultPageNum'], (req, res) => {
		res.sendFile(__dirname + "/v3/examples/showSuccessReportMultipleSuspect.html");
	})

//Listen to v3 report requests for single suspect report
app.get(['/v3single/',
	'/v3single/report/:id/:resultId/:sourcePageNum/:resultPageNum'], (req, res) => {
		res.sendFile(__dirname + "/v3/examples/showSuccessReportSingleSuspect.html");
	})

//Listen to v3 report with error requests
app.get(['/v3error/',
	'/v3error/report/:id/:pageNum'], (req, res) => {
		res.sendFile(__dirname + "/v3/examples/showFailedReport.html");
	})



//Listen to v1 report requests
app.get(['/v1/',
	'/v1/report/:id',
	'/v1/report/:id/:resultId'], (req, res) => {
		res.sendFile(__dirname + "/v1/examples/showSuccessReportMultipleSuspect.html");
	})

//Listen to v1 report requests for single suspect report
app.get(['/v1single/',
	'/v1single/report/:id/:resultId'], (req, res) => {
		res.sendFile(__dirname + "/v1/examples/showSuccessReportSingleSuspect.html");
	})

//Listen to v1 report with error requests
app.get(['/v1error/',
	'/v1error/report/:id'], (req, res) => {
		res.sendFile(__dirname + "/v1/examples/showFailedReport.html");
	})

app.get('/download-suspect/v3/:resultId/:contentType', function (req, res) {
	var resultId = req.params.resultId;
	var contentType = req.params.contentType;
	console.log(contentType);
	console.log(resultId);
	var file = __dirname + '/v3/examples/data/' + resultId + '_comparison.json';
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
	var file = __dirname + '/v3/examples/data/document.json';
	var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (contentType == "html") {
		downloadFile(res, obj.html.value, "document.html", 'text/html');
	} else {
		downloadFile(res, obj.text.value, "document.txt", 'text/plain');
	}
});

app.get('/download-suspect/v1/:resultId/', function (req, res) {
	var resultId = req.params.resultId;
	
	var file = __dirname + '/v1/examples/data/' + resultId + '_result-text.json';
	var obj = fs.readFileSync(file, 'utf8');
	downloadFile(res, obj, `${resultId}.text`, 'text/plain');
});

app.get('/download-source/v1', function (req, res) {
	var file = __dirname + '/v1/examples/data/source-text.json';
	var obj = fs.readFileSync(file, 'utf8');
	downloadFile(res, obj,'source-text.txt','text/plain');
});

function downloadFile(res, data, fileName, contentType) {
	res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
	res.setHeader('Content-type', contentType);
	res.write(data, function (err) {
		res.end();
	});
}


app.listen(port, () => console.log(`Report app listening on port ${port}!`))