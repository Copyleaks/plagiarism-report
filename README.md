# Copyleaks Plagiarism Report
Allow Copyleaks API users to view the plagiarism report using their downloaded data and present it on their platform.
You can view the report anytime without being restricted by the Copyleaks expiration policy (that deletes the report's data after a few months). Use this report to have access to your Copyleaks report anytime without having to build your own UI to present the data.

## How to use
1. Scan a document using the [Copyleaks API](https://api.copyleaks.com "Copyleaks api homepage").
2. Download the results and store them.
3. Present the downloaded data with this report on your website or platform.

### Customization
Highlights: 
1. The Report can be used in your own domain.
2. You can add your own logo to the report and change its title.
3. You can change the report's look and feel (using css).

### Supported API versions:
The report is compatible with Copyleaks API versions:
* v1
* v3 - coming soon.

The report has two view configurations:
* One-to-many Report: shows the submitted text on the left side and all of the results that were found on the right side.
* One-to-one Report: shows your submitted text on the left side compared to one specific result on the right side. 

## Prerequisites

The report is in js only and is an angularJs directive. The report uses the following third party libraries:
 * angular
 * angular-animate
 * angular-aria
 * angular-chart.js
 * angular-loading-bar
 * angular-material
 * angular-moment
 * angular-route
 * angular-sanitize
 * angular-ui-notification
 * angular-ui-validate
 * chart.js
 * jquery
 * underscore

In order to run the demo you will need to have Node.js and npm installed on your system. If you are not interested in running the demo you can skip this.


## Installation
First install the report npm package (from the command line):
```
npm install @copyleaks\plagiarism-report
```

Next steps can be skipped if the demo is not of interest to you.
<br/>
Compile the third party libraries used in the report (underscore, angularJs, ...)
```
npm run preparethirdparty
```
## Running the demo
Start the server from the command line
```
npm run server
```
Open your browser to <a href="http://localhost:3000">http://localhost:3000</a> and check out the reports.

There are 3 different report views for each version (v1 and v3):
1. One-to-many Report: shows the submitted text on the left side and all of the results that were found on the right side.
2. One-to-one Report: shows your submitted text on the left side compared to one specific result on the right side. 
3. Error page in which we show there was an error showing the report.

## Using the report in your web site:
There are working examples of how the report is used in the v1/examples and v3/examples directories.
<br/>
Determine which version of the report you would like to work with. v1 or v3.
<br/>
Select an html page where you would like to show the report. Add the ```copyleaks-report-parent``` css class to a parent element of the ```<report></report>``` directive ( The report css is scoped under this class).
<br/>
Add the js and css resources (example taken from v1 examples:
```html
<!-- third party includes (angularjs, material, ...)-->
<link href="/dist/3rd-party.css" type="text/css" rel="stylesheet" />
<script src="/dist/3rd-party.js"></script>

<!-- report includes, css, js-->
<link href="/v1/dist/copyleaks-plagiarism-report.min.css" type="text/css" rel="stylesheet" />
<script src="/v1/dist/copyleaks-plagiarism-report.min.js"></script>

<!-- report host (application using report) -->
<script src="/v1/examples/js/app.js"></script>
```
Implement the host AngularJs application that will contain the report directive.
<br/>
The host initializes and communicates with the report by dependency injecting the `reportServiceListener` service into one of its components.
<br/>
The `reportServiceListener` exposes the following constant:
* `reportTypes` - used to communicate report type changes to report.

An example initialization code:
```javascript
//initialize report and get the promise that updates us regarding report events
var listenerPromise = reportServiceListener.init({
    id: $routeParams.id, // Take the report id from the url route
    reportType: reportType, // report type (single or multi suspect)
    suspectId: $routeParams.resultid, // if in single mode, pass result id.
    shareLinkCreationCallback: shareLinkCreationCallback,
    contentType: 'text' // the only option for v1
    //,showShareButton: false // optionally hide the share button completely
});
```
List of parameters to the init event

| Parameter name   | Meaning | Remarks |
| ------------- |-------------| -----|
|contentType | `'html'` or `'text'` | v3 only
|id| unique report id|
|reportType | `reportServiceListener.reportTypes.singleSuspect` or `reportServiceListener.reportTypes.multipleSuspects` also pass suspectId if using single suspect|
|suspectId | if report is initialized with report type `reportServiceListener.reportTypes.singleSuspect` then suspectId is mandatory
|showShareButton | `true` or `false` | optional
|showDownloadPdfReportButton | `true` or `false`. show or hide the download report button. | optional. v3 only.
|shareLinkCreationCallback | function called when share button is clicked. resolve function parameter with a valid share link (see demo) |
|multiSuspectePage | Set initial multi suspect page to show | v3 only. optional
|singleSuspectSourcePage | Set initial single suspect source page to show | v3 only. optional
|singleSuspectSuspectPage | Set initial single suspect suspect page to show | v3 only. optional

Listening to report events:
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

Events the report raises (using the notification promise returned by the init method)


| Event name   | When is it called | Remarks |
| ------------- |:-------------| -----|
| icon-button-clicked | The customized report icon is clicked |
| content-type-changed | report switched between html and text or vice versa | v3 only
| multiple-suspect-page-change | report page changed (in multiple suspect view) | v3 only
| single-suspect-source-page-change | report page changed (in single suspect view) | v3 only
| single-suspect-suspect-page-change | suspect page changed (in single suspect view) | v3 only
| download-source-clicked | report requests to download source document | in v3 contentType to download is passed as a parameter
| download-suspect-clicked | report requests to download suspect document | in v3 contentType to download is passed as a parameter


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
| setContentType | Ask the report to change contentType ('html' or 'text')| v3 only
| switchReportType | ask the report to switch type (reportServiceListener.reportTypes.multipleSuspects or reportServiceListener.reportTypes.singleSuspect, if single is used pass suspect id as second parameter)|
| setDocumentProperties | Set the report title and icon
| setMultipleSuspectPage | Set the page in multiple suspect report | v3 only
| setSingleSuspectSourcePage | Set the page in single suspect report | v3 only
| setSingleSuspectSuspectPage| Set the suspect page in single suspect report | v3 only
