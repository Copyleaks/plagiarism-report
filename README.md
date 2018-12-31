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

The report is made from js only. The report uses the following third party libraries:
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


## installation
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