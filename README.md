# Copyleaks Plagiarism Report
Allow Copyleaks API users to view the plagiarism report using their downloaded data.
Using this report allows users to view the report anytime without being restricted by the Copyleaks expiration policy (that deletes the reports data).

## How to use
1. Scan a document in Copyleaks.
2. Download the results and store them.
3. Present the downloaded data with this report inside your website.

### Customization
Highlights: 
1. Report can be used in your own domain.
2. You can add your own logo to the report and change its title.
3. You can change the reports look and feel (using css).

### Supported API versions:
The report is compatible with Copyleaks API versions:
* v1
* v3 - coming soon.

The report has two view configurations:
* Multiple suspects reports: all suspect matches found are shown together against source text.
* Single suspect report: a single suspect (a webpage or document) is compared to the source text.

## Prerequisites

The report is made from js only and is an angularJs directive. The report uses the following third party libraries:
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

In order to run the demo you need to have Node.js and npm installed on your system. If you are not interested in running the demo you can skip this.


## Installation
First install the report npm package (from the command line):
```
npm install @Copyleaks\plagiarism-report
```

Next steps can be skipped if demo is not of interest to you.
<br/>
Compile the 3rd party libraries used in the report (underscore, angularJs, ...)
```
npm run preparethirdparty
```
## Running the demo
Start the server from the command line
```
npm run server
```
Open your browser in to <a href="http://localhost:3000">http://localhost:3000</a> and check out the reports.

There are 3 different report views for each version (v1 and v3):
1. Multiple suspect report in which all suspect matches are shown together against source text.
2. Single suspect report in which 1 suspect is compared to the source text.
3. Error page in which we show there was an error showing the report.

## Using the report in your web site:
There are working examples of how the report is used in the v1/examples and v3/examples directories.
<br/>
Determine which version of the report you want to work with. v1 or v3.
<br/>
Select an html page where you want to show the report.
<br/>
Add the js and css resources (example taken from v1 examples:
```html
<!-- third party includes (angularjs, material, ...)-->
<link href="/v1/dist/3rd-party.css" type="text/css" rel="stylesheet" />
<script src="/v1/dist/3rd-party.js"></script>

<!-- report includes, css, js-->
<link href="/v1/dist/copyleaks-plagiarism-report.min.css" type="text/css" rel="stylesheet" />
<script src="/v1/dist/copyleaks-plagiarism-report.min.js"></script>

<!-- report host (application using report) -->
<script src="/v1/examples/js/app.js"></script>
```
Implement the host AngularJs application that will contain the report directive.
<br/>
The host initializes and comunicates with the report by dependency injecting the `reportServiceListener` service into one of its components.
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
List of parameters to the init event:

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
| onNewResult | add a new suspect to the report (from your downloaded data)..|
| onCompletion | add all suspects to report (The scan has ended and all suspects are known)|
| onMatches | add a suspect text and matches to the report.|
| setError | Ask the report to show an error to the user.|
| setContentType | Ask report to change contentType ('html' or 'text')| v3 only
| switchReportType | ask report to switch type (reportServiceListener.reportTypes.multipleSuspects or reportServiceListener.reportTypes.singleSuspect, if single is used pass suspect id as second parameter)|
| setDocumentProperties | set report title and icon
| setMultipleSuspectPage | set the page in multiple suspect report | v3 only
| setSingleSuspectSourcePage | set the page in single suspect report | v3 only
| setSingleSuspectSuspectPage| set the page in single suspect report | v3 only
