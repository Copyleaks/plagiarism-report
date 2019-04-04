function attach_oneToOneReportService(app) {
    app.service('oneToOneReportService', ['settingsService', 'DataService', '$q', '$interval', 'logService', '$timeout', 'sourcesService', '$window', 'reportDataService', 'pageService', '$rootScope', 'contentTypeService',
        function (settingsService, DataService, $q, $interval, logService, $timeout, sourcesService, $window, reportDataService, pageService, $rootScope, contentTypeService) {
            var service = {};

            service.setSuspect = function (suspect) {
                var name = getSuspectStoragePropertyName(reportDataService.resultId);
                reportDataService[name] = suspect;
            }

            service.getSuspect = function () {
                var name = getSuspectStoragePropertyName(reportDataService.resultId);
                return getSourceFromSessionOrService(name);
            }

            function getSourceFromSessionOrService(name) {
                return reportDataService[name];
            }

            function getSuspectStoragePropertyName(resultId) {
                return resultId + '_suspect';
            }

            service.setSource = function (source) {
                var name = getSourceStoragePropertyName(reportDataService.resultId);
                reportDataService[name] = source;
            }

            service.getSource = function () {
                var name = getSourceStoragePropertyName(reportDataService.resultId);
                return getSourceFromSessionOrService(name);
            }

            function getSourceStoragePropertyName(resultId) {
                return resultId + '_source';
            }

            service.requestToScannedProcessSent = false;

           
            service.resultSuccess = function (sourceData) {

                var source = service.getSource();
                if (source == null) {
                    service.match = sourceData;
                    return;
                }
                source.matches = sourceData;
                source.text = sourceData.text;
                //source.contentType = sourceData.contentType;
                var suspectSource = angular.merge({}, source);

                suspectSource.splitMatchesText = pageService.splitMatchesToPages(suspectSource.matches.text.comparison, suspectSource.matches.text.pages.startPosition, "suspectToSource");
                if (suspectSource.matches.html == null || suspectSource.matches.html.comparison == null)
                    suspectSource.splitMatchesHtml = null;
                else
                    suspectSource.splitMatchesHtml = pageService.splitMatchesToPages(suspectSource.matches.html.comparison, [0], "suspectToSource");
                suspectSource.status = DataService.eSourceStatus.completed;
                service.setSuspect(suspectSource);

                if (reportDataService.scanned_document && reportDataService.scanned_document.text) {
                    if (!source.splitMatchesText)
                        source.splitMatchesText = pageService.splitMatchesToPages(source.matches.text.comparison, reportDataService.scanned_document.text.pages.startPosition, "sourceToSuspect");

                    if (suspectSource.matches.html == null || suspectSource.matches.html.comparison == null)
                        source.splitMatchesHtml = null;
                    else {
                        if (!source.splitMatchesHtml)
                            source.splitMatchesHtml = pageService.splitMatchesToPages(source.matches.html.comparison, [0], "sourceToSuspect");
                    }
                                        
                    source.status = DataService.eSourceStatus.completed;
                }
            }

            function resultError(response) {
                if (response.status >= 500) {
                    reportDataService.setError(response.data && response.data.Message);
                    if (!reportDataService.ErrorMessage) {
                        reportDataService.setError(response.data);
                    }
                    if (!reportDataService.ErrorMessage) {
                        reportDataService.setError("Something went wrong. Please try again.");
                    }
                }
            }

            return service;
        }]);
}
