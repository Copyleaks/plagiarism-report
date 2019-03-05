const express = require('express')
const app = express()
const port = 3001
const fs = require('fs');
const path = require('path');

app.use(express.static(path.join(__dirname, '/../..')))

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/pages/index.html");
})

//Listen to v1 report requests
app.get(['/v1/',
	'/v1/report/:id',
	'/v1/report/:id/:resultId'], (req, res) => {
		res.sendFile(__dirname + "/pages/showSuccessReportMultipleSuspect.html");
	})

//Listen to v1 report requests for single suspect report
app.get(['/v1single/',
	'/v1single/report/:id/:resultId'], (req, res) => {
		res.sendFile(__dirname + "/pages/showSuccessReportSingleSuspect.html");
	})

//Listen to v1 report with error requests
app.get(['/v1error/',
	'/v1error/report/:id'], (req, res) => {
		res.sendFile(__dirname + "/pages/showFailedReport.html");
	})

app.get('/download-suspect/v1/:resultId/', function (req, res) {
	var resultId = req.params.resultId;
	
	var file = __dirname + '/data/' + resultId + '_result-text.json';
	var obj = fs.readFileSync(file, 'utf8');
	downloadFile(res, obj, `${resultId}.text`, 'text/plain');
});

app.get('/download-source/v1', function (req, res) {
	var file = __dirname + '/data/source-text.json';
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