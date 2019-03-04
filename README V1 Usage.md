## How to use
1. Scan a document using the [Copyleaks API](https://api.copyleaks.com "Copyleaks api homepage").
2. Download the results and store them.
3. Present the downloaded data with this report on your website or platform.

### Details
1. Scan a document using the copyleaks api.
2. Gather all the results from the copyleaks api:
    a.  Download and store in your storage the report source document from: http://api.copyleaks.com/v3/downloads/{scanId}
    b. Download and store in your storage the report sources from: http://api.copyleaks.com/v3/{product}/{scanId}/result
    c. Download and store in your storage each results matches from: http://api.copyleaks.com/v3/downloads/{pid}/results/{resultId}

3. Present the downloaded data with the demo report:
  a.  Copy the demo angularJs app from ./v3/examples/showSuccessReportMultipleSuspect.html into your webpage where you want to display the report.
  b.  Customize the $scope.fillAll function in file .v3/examples/js/directives/cp-report-container.js file to pass the report the data you downloaded at step 2 ( details in the next section).

4. Customize the demo report to show your data:
  a. Pass 100 to reportServiceListener.progressChanged - showing the report is complete.
  b. Fill the report title and icon using reportServiceListener.setDocumentProperties
  b. pass data you downloaded and stored in step 2.a to reportServiceListener.onDocumentReady
  c. pass data you downloaded and stored in step 2.b to reportServiceListener.onCompletion
  d. pass each match data you downloaded and stored in step 2.c to reportServiceListener.onMatches.
