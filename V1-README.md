## Running the demo
The demo let's you see the report in action using the dummy data ( stored in [Demo data](https://github.com/Copyleaks/plagiarism-report/blob/master/hosts/v1/data/ "v1 demo data") ). The data is served by the  [demo application](https://github.com/Copyleaks/plagiarism-report/blob/master/hosts/v1/demoApp.js/ "v1 demo  app")
Install Express and run the demo
```
cd yourProject/node_modules/@copyleaks/plagiarism-report
npm i express
npm run demoV1
```

Open your browser to [http://localhost:3001](http://localhost:3001 "demo site") and check out the reports.

There are 3 demos provided:
1. One-to-many Report: shows the submitted text on the left side and all of the results that were found on the right side.
2. One-to-one Report: shows your submitted text on the left side compared to one specific result on the right side. 
3. Error page in which we show there was an error showing the report.

## Integrating with the report
### Outline of process:
You will generally folow these steps ( with more details in the next section):
1. Viewing the demo report and make sure it's working in your environment.
2. Scanning a document using the [Copyleaks API](https://api.copyleaks.com "Copyleaks api homepage").
3. Downloading the results and storing them.
4. Creating endpoints in your server for serving the data from the scan.
5. Presenting the downloaded data with the Copyleaks report on your website or platform.

### In depth description of integration process:
1. Make sure the [Demo Report](https://github.com/Copyleaks/plagiarism-report/blob/master/hosts/v1/pages/showSuccessReportMultipleSuspect.html "Demo Report") is working for you.
2. Scan a document using the copyleaks api.
3. Gather all the results from the copyleaks api.
   1. Download and store in your storage the report info from: `http://api.copyleaks.com/v1/{product}/{ProcessId}/info`
   1. Download and store in your storage the report source document from: `http://api.copyleaks.com/v1/downloads/source-text?pid={PID}`
   1. Download and store in your storage the report results from: `http://api.copyleaks.com/v1/{product}/{scanId}/result`
   1. Download and store in your storage each result text from: `http://api.copyleaks.com/v1/downloads/result-text?rid={RID}`
   1. Download and store in your storage each result comparisson matches from: `http://api.copyleaks.com/v1/downloads/comparison?rid={RID}`
	
	
*Product can be education or buisnesses	
4. Create endpoints in your server to expose each data you stored in the previous step.
5. Present the downloaded data with the demo report:
  a. Copy the demo angularJs app from `./hosts/v1/showSuccessReportMultipleSuspect.html` into your webpage where you want to display the report.
  b. Customize the `$scope.fillAll` function in file `.hosts/v1/js/directives/cp-report-container.js` file to pass the report the data you downloaded at step 2 ( details in the next section).

6. Customize the demo report to show your data:
   1. Pass 100 to `reportServiceListener.progressChanged` - showing the report is complete.
   1. Fill the report title and icon using `reportServiceListener.setDocumentProperties`
   1. pass data you downloaded and stored in step 3.i to `reportServiceListener.onInfoReady`
   1. pass data you downloaded and stored in step 3.ii to `reportServiceListener.onDocumentReady`
   1. pass data you downloaded and stored in step 3.iii to `reportServiceListener.onCompletion`
   1. pass each match data you downloaded and stored in step 3.iv and 3.v to `reportServiceListener.onMatches`.

7. The report now shows your scan.
 

## Specification

The report has two view configurations:
* One-to-many Report: shows the submitted text on the left side and all of the results that were found on the right side.
* One-to-one Report: shows your submitted text on the left side compared to one specific result on the right side. 

### List of parameters to the init event

| Parameter name   | Meaning | Remarks |
| ------------- |-------------| -----|
|id| unique report id|
|reportType | `reportServiceListener.reportTypes.singleSuspect` or `reportServiceListener.reportTypes.multipleSuspects` also pass suspectId if using single suspect|
|suspectId | if report is initialized with report type `reportServiceListener.reportTypes.singleSuspect` then suspectId is mandatory
|showShareButton | `true` or `false` | optional
|showDownloadPdfReportButton | `true` or `false`. show or hide the download report button. | optional.
|shareLinkCreationCallback | function called when share button is clicked. resolve function parameter with a valid share link (see demo) |

### Listening to report events:
```javascript
listenerPromise.then(angular.noop, angular.noop, handleReportNotify);

        function handleReportNotify(message) {
            var type = message.type, params = message.params;
            switch (type) {
                case 'icon-button-clicked'://top icon was clicked
                    iconButtonClicked();
                    break;
                ...
            }
        }
```

### Events the report raises (using the notification promise returned by the init method)

| Event name   | When is it called | Remarks |
| ------------- |:-------------| -----|
| icon-button-clicked | The customized report icon is clicked |
| download-source-clicked | report requests to download source document | contentType to download is passed as a parameter
| download-suspect-clicked | report requests to download suspect document | contentType to download is passed as a parameter


Methods exposed by the report (using the `reportServiceListener` service)

| Method name   | What it does  | Remarks |
| ------------- |-------------| -----|
| init | initialize the report |
| progressChanged | give report the progress. 0-100.|
| onDocumentReady | add the document to the report (from your downloaded data).|
| onCompletion | add all suspects to report (The scan has ended and all suspects are known)|
| onMatches | add a suspect text and matches to the report.|
| setError | Ask the report to show an error to the user.|
| switchReportType | ask the report to switch type (reportServiceListener.reportTypes.multipleSuspects or reportServiceListener.reportTypes.singleSuspect, if single is used pass suspect id as second parameter)|
| setDocumentProperties | Set the report title and icon


## Faq
Q: How to use the report with different frameworks or different versions of angularJs?
A: There are a few options:
    1. Show report as a standalone page on your server outside of the flow of your app. And possibly show in an iframe.
    2. Find an interop configuration between your app and angularJs.
