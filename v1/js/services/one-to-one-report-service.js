function attach_oneToOneReportService(app) {
    app.service('oneToOneReportService', ['settingsService', 'DataService', '$q', '$interval', 'logService', '$timeout', 'sourcesService', '$window', 'reportDataService','pageService','$rootScope','contentTypeService',
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
                return getSuspectStoragePropertyNameAndType(resultId, contentTypeService.contentType.getOrDefault())
            }

            function getSuspectStoragePropertyNameAndType(resultId,type) {
                return resultId + '_suspect_' + type;
            }

            service.copySuspectToOtherTypes = function (fromType, toType) {
                var fromName = getSuspectStoragePropertyNameAndType(reportDataService.resultId, fromType);
                var toName = getSuspectStoragePropertyNameAndType(reportDataService.resultId, toType);
                reportDataService[toName] = reportDataService[fromName];
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
                return getSourceStoragePropertyNameAndType(resultId, contentTypeService.contentType.getOrDefault())
            }

            function getSourceStoragePropertyNameAndType(resultId, type) {
                return resultId + '_source_' + type;
            }

            service.copySourceToOtherTypes = function (fromType, toType) {
                var fromName = getSourceStoragePropertyNameAndType(reportDataService.resultId, fromType);
                var toName = getSourceStoragePropertyNameAndType(reportDataService.resultId, toType);
                reportDataService[toName] = reportDataService[fromName];
            }

            service.requestToScannedProcessSent = false;
            
            //Get document text and text ranges
            
            service.resultSuccess = function (sourceData) {

                var source = service.getSource();
                if (source == null) {
                    service.match = sourceData;
                    return;
                }
                source.matches = sourceData.comparison;
                source.info = sourceData.info;
                source.text = sourceData.text;
                source.contentType = sourceData.contentType;
                var suspectSource = angular.merge({}, source);


                if (!source.contentType || contentTypeService.isTextContentType(source.contentType)) {
                    var spliter = new PagesSpliter();
                    reportDataService.suspectRanges = sourceData.info.ranges;
                    reportDataService.suspectPages = spliter.splitText(sourceData.text, sourceData.info.ranges);

                    if (sourceData.comparisonVersion < 2 || !reportDataService.sourceHasGids(suspectSource)) {
                        reportDataService.fixOldTextScanGids(suspectSource);
                        reportDataService.fixOldTextScanGids(source);
                    }
                    
                    if (reportDataService.scanned_document)
                        pageService.convert_comparison_report_with_pages(source, reportDataService.scanned_document.ranges, "sourceToSuspect");

                    pageService.convert_comparison_report_with_pages(suspectSource, sourceData.info.ranges, "suspectToSource");
                } else if (contentTypeService.isHtmlContentType(source.contentType)) {
                    source.hasHtmlContentType = true;
                    reportDataService.suspectRanges = [0];
                    reportDataService.suspectPages = [sourceData.text];

                    if (reportDataService.scanned_document) {
                        if (contentTypeService.isTextContentType(reportDataService.scanned_document.contentType)) {
                            pageService.convert_comparison_report_with_pages(source, reportDataService.scanned_document.ranges, "sourceToSuspect");
                        } else if (contentTypeService.isHtmlContentType(reportDataService.scanned_document.contentType)) {
                            pageService.convert_comparison_report_with_pages(source, [0], "sourceToSuspect");
                        } else throw new Error('unsupported content type');
                    }
                        

                    pageService.convert_comparison_report_with_pages(suspectSource, [0], "suspectToSource");
                } else throw new Error('unsupported content type');
                    service.setSuspect(suspectSource);
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
