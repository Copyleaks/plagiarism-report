# Copyleaks Plagiarism Report
Allow copyleaks api users to view the plagiarism report using data downloaded and store it in their storage.
Using this report allows users to view the report anytime without being restricted by the Copyleaks expiration policy ( that deletes the reports data ).

## How to use
1. Create a process in Copyleaks.
2. Store the results in your storage.
3. Present them in your website via this report.

### Customization
Highlights: 
1. Report can be used in your own domain.
2. You can add your own logo to the report.
3. You can change the reports look and feel ( using css).
4. You can change the report title.

### Report versions:
The report is compatible with Copyleaks api versions:
* v1
* v3 

The report has two view configurations:
* Multiple suspects reports.
* Single suspect report.
* 
## Prerequisites
NodeJs and npm must be installed for the report **demo** to work.
If you are not interested in the demo, just copy the report assets to your project.
Part of the installation compiles the 3rd party libraries in use ( see bellow). If you are not using this artifact please add the 3rd party libraries manually. For a list of libraries required check the package.json file dependencies entry.

The report uses the following 3rd parties:
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


## installation
First install the report npm package ( from the command line ):
```
npm install @copyleaks\plagiarism-report
```

then compile the 3rd party libraries used in the report ( underscore, angularJs, ...)
```
npm run preparethirdparty
```
## Running the demo
Start the server from the command line
```
npm run server
```
Open your browser in to <a href="http://localhost:3000">http://localhost:3000</a> and check out the reports.

There are 3 different report views for each version ( v1 and v3):
1. Multiple suspect report in which all suspect matches are shown together against source text.
2. Single suspect report in which 1 suspect is compared to the source text.
3. Error page in which we show there was an error showing the report.#   p l a g i a r i s m - r e p o r t  
 