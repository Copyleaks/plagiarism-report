## Running the demo
The demo let's you see the report in action using the dummy data ( stored in [Demo data](https://github.com/Copyleaks/plagiarism-report/blob/master/demo/v3/data/ "v3 demo data") ). The data is served by the  [demo application](https://github.com/Copyleaks/plagiarism-report/blob/master/demo/v3/demoApp.js/ "v3 demo  app")
Install Express and run the demo
```
cd yourProject/node_modules/@copyleaks/plagiarism-report
npm i express
npm run demoV3
```

Open your browser to [http://localhost:3003](http://localhost:3003 "demo site") and check out the reports.

There are 3 demos provided:
1. One-to-many Report: shows the submitted text on the left side and all of the results that were found on the right side.
2. One-to-one Report: shows your submitted text on the left side compared to one specific result on the right side. 
3. Error page in which we show there was an error showing the report.


# Integrating with the report
## Outline of process:
You will generally folow these steps ( with more details in the next section):
1. Viewing the demo report and make sure it's working.
2. Scanning a document using the [Copyleaks API](https://api.copyleaks.com "Copyleaks api homepage").
3. Downloading the results and storing them.
4. Creating endpoints in your server for serving the data from the scan.
5. Presenting the downloaded data with the Copyleaks report on your website or platform.

### In depth description of integration process:
1. Make sure the [Demo Report](https://github.com/Copyleaks/plagiarism-report/blob/master/demo/v3/showSuccessReportMultipleSuspect.html "Demo Report") is working for you.
2. Scan a document using the copyleaks api.
3. Gather all the results from the copyleaks api:
    a. Download and store in your storage the report source document from: `http://api.copyleaks.com/v3/downloads/{scanId}`
    b. Download and store in your storage the report sources from: `http://api.copyleaks.com/v3/{product}/{scanId}/result`
    c. Download and store in your storage each results matches from: `http://api.copyleaks.com/v3/downloads/{pid}/results/{resultId}`
4. Create endpoints in your server to expose each data you stored in the previous step.
5. Present the downloaded data with the demo report:
  a. Copy the demo angularJs app from `./demo/v3/showSuccessReportMultipleSuspect.html` into your webpage where you want to display the report.
  b. Customize the `$scope.fillAll` function in file `.demo/v3/js/directives/cp-report-container.js` file to pass the report the data you downloaded at step 2 ( details in the next section).

6. Customize the demo report to show your data:
  a. Pass 100 to `reportServiceListener.progressChanged` - showing the report is complete.
  b. Fill the report title and icon using `reportServiceListener.setDocumentProperties`
  b. pass data you downloaded and stored in step 2.a to `reportServiceListener.onDocumentReady`
  c. pass data you downloaded and stored in step 2.b to `reportServiceListener.onCompletion`
  d. pass each match data you downloaded and stored in step 2.c to `reportServiceListener.onMatches`.

7. The report now shows your scan.
 

## Specification

The report has two view configurations:
* One-to-many Report: shows the submitted text on the left side and all of the results that were found on the right side.
* One-to-one Report: shows your submitted text on the left side compared to one specific result on the right side. 

### List of parameters to the init event

| Parameter name   | Meaning | Remarks |
| ------------- |-------------| -----|
|contentType | `'html'` or `'text'` |
|id| unique report id|
|reportType | `reportServiceListener.reportTypes.singleSuspect` or `reportServiceListener.reportTypes.multipleSuspects` also pass suspectId if using single suspect|
|suspectId | if report is initialized with report type `reportServiceListener.reportTypes.singleSuspect` then suspectId is mandatory
|showShareButton | `true` or `false` | optional
|showDownloadPdfReportButton | `true` or `false`. show or hide the download report button. | optional.
|shareLinkCreationCallback | function called when share button is clicked. resolve function parameter with a valid share link (see demo) |
|multiSuspectePage | Set initial multi suspect page to show | optional
|singleSuspectSourcePage | Set initial single suspect source page to show | optional
|singleSuspectSuspectPage | Set initial single suspect suspect page to show | optional

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
| content-type-changed | report switched between html and text or vice versa |
| multiple-suspect-page-change | report page changed (in multiple suspect view) | 
| single-suspect-source-page-change | report page changed (in single suspect view) | 
| single-suspect-suspect-page-change | suspect page changed (in single suspect view) | 
| download-source-clicked | report requests to download source document | contentType to download is passed as a parameter
| download-suspect-clicked | report requests to download suspect document | contentType to download is passed as a parameter


Methods exposed by the report (using the `reportServiceListener` service)

| Method name   | What it does  | Remarks |
| ------------- |-------------| -----|
| init | initialize the report |
| progressChanged | give report the progress. 0-100.|
| onDocumentReady | add the document to the report (from your downloaded data).|
| onNewResult | add a new suspect to the report (from your downloaded data).|
| onCompletion | add all suspects to report (The scan has ended and all suspects are known)|
| onMatches | add a suspect text and matches to the report.|
| setError | Ask the report to show an error to the user.|
| setContentType | Ask the report to change contentType ('html' or 'text')| 
| switchReportType | ask the report to switch type (reportServiceListener.reportTypes.multipleSuspects or reportServiceListener.reportTypes.singleSuspect, if single is used pass suspect id as second parameter)|
| setDocumentProperties | Set the report title and icon
| setMultipleSuspectPage | Set the page in multiple suspect report | 
| setSingleSuspectSourcePage | Set the page in single suspect report | 
| setSingleSuspectSuspectPage| Set the suspect page in single suspect report | 

# Faq
Q: How to use the report with different frameworks or different versions of angularJs?
A: There are a few options:
    1. Show report as a standalone page on your server outside of the flow of your app. And possibly show in an iframe.
    2. Find an interop configuration between your app and angularJs.

Q: Can the report pdf be downloaded from the report?
A: Yes. Just listen to the `download-report-pdf-button-clicked` event. and download the report from `http://api.copyleaks.com/v3/downloads/{scanId}/report`.
   This report is customizable to meet your brand needs.
