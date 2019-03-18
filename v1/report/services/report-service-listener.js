function attach_reportServiceListener(app) {
    app.service('reportServiceMediator', ['$q', function ($q) {
        
        var service = {
            iconButtonClicked: iconButtonClicked,
            switchReportContentType: switchReportContentType,
            changeMultiSuspectPage: changeMultiSuspectPage,
            changeSingleSuspectSourcePage: changeSingleSuspectSourcePage,
            changeSingleSuspectSuspectPage: changeSingleSuspectSuspectPage,
            downloadSource: downloadSource,
            downloadSuspect: downloadSuspect,
            deleteSharingKey: deleteSharingKey
        }
        var deferred = $q.defer();
        service.promise = deferred.promise;

        function iconButtonClicked() {
            raiseEvent('icon-button-clicked', {});
        }

        function switchReportContentType(contentType) {
            raiseEvent('content-type-changed', {
                contentType: contentType
            });
        }

        function changeMultiSuspectPage(pageNumber) {
            raiseEvent('multiple-suspect-page-change', {
                pageNumber: pageNumber
            });
        }

        function changeSingleSuspectSourcePage(pageNumber) {
            raiseEvent('single-suspect-source-page-change', {
                pageNumber: pageNumber
            });
        }

        function changeSingleSuspectSuspectPage(pageNumber) {
            raiseEvent('single-suspect-suspect-page-change', {
                pageNumber: pageNumber
            });
        }

        function downloadSuspect() {
            raiseEvent('download-suspect-clicked', {});
        }

        function downloadSource() {
            raiseEvent('download-source-clicked', {});
        }

        function deleteSharingKey() {
            raiseEvent('delete-sharing-key', {});
        }

        function raiseEvent(type, params) {
            deferred.notify({
                type: type,
                params: params
                    
            });
        }
        return service;


    }]);

    app.service('reportServiceListener', ['reportDataService', '$rootScope', 'settingsService', 'DataService', 'reportServiceMediator', 'logService', 'sourcesService', '$q', '$timeout', 'contentTypeService',
    function (reportDataService, $rootScope, settingsService, DataService, reportServiceMediator, logService, sourcesService, $q, $timeout, contentTypeService) {
        var service = {
            registerToEvents: registerToEvents,
            progressChanged: progressChanged,
            onDocumentReadyV2: onDocumentReadyV2,
            onDocumentReady: onDocumentReady,
            onInfoReady: onInfoReady,
            onNewResult: onNewResult,
            onCompletion: onCompletion,
            onMatchesV2: onMatchesV2,
            onMatches: onMatches,
            setError: setError,
            //getSources: getSources,
            init: init,
            reportTypes: reportDataService.reportTypes,
            getSharingUrl: getSharingUrl,
            setDocumentProperties: setDocumentProperties,
            setMultipleSuspectPage: setMultipleSuspectPage,
            setSingleSuspectSourcePage: setSingleSuspectSourcePage,
            setSingleSuspectSuspectPage: setSingleSuspectSuspectPage,
            setContentType: setContentType,
            switchReportType: switchReportType,
        }

        function init(config) {
            reportDataService.clear();
            if (!config.id) throw new Error('missing id');
            if (!config.reportType) throw new Error('missing reportType ( single or multiple suspects');

            reportDataService.pid = config.id;
            reportDataService.type = config.reportType;

            if (config.shareLinkCreationCallback) {
                this.shareLinkCreationCallback = config.shareLinkCreationCallback;
            }

            if (reportDataService.type == reportDataService.reportTypes.singleSuspect)
                reportDataService.resultId = config.suspectId;

            if (config.hasOwnProperty('showShareButton')) {
                reportDataService.showShareButton = config.showShareButton;
            } else {
                reportDataService.showShareButton = true;
            }

            if (config.multiSuspectePage) {
                reportDataService.pageNum = config.multiSuspectePage;
            }

            if (config.singleSuspectSourcePage) {
                reportDataService.pageNumSource = config.singleSuspectSourcePage;
            }

            if (config.singleSuspectSuspectPage) {
                reportDataService.pageNumResult = config.singleSuspectSuspectPage;
            }

            if (config.contentType) {
                switch (config.contentType) {
                    case 'html':
                    case 'text':
                        break;
                    default:
                        throw new Error('unsuported content type');
                }
                contentTypeService.contentType.init(config.contentType);
            }

            settingsService.initSettings();

            return reportServiceMediator.promise;
        }

        function setContentType(contentType) {
            if (contentTypeService.contentType.get() == contentType) return;

            if (contentType == null) contentType = contentTypeService.types.html;
            contentTypeService.contentType.set(contentType);
            $rootScope.$broadcast('switchContentType');
        }

        function switchReportType(reportType, suspectId) {
            if (reportType == reportDataService.reportTypes.singleSuspect) {
                reportDataService.resultId = suspectId;
                $rootScope.$broadcast('switchToSingleSuspectReport');
            } else {
                $rootScope.$broadcast('switchToMultiSuspectReport');
            }
        }

        function setMultipleSuspectPage(pageNumber) {
            $rootScope.$broadcast('setMultipleSuspectPage', {
                pageNumber: pageNumber
            });
        }

        function setSingleSuspectSourcePage(pageNumber) {
            $rootScope.$broadcast('setSingleSuspectSourcePage', {
                pageNumber: pageNumber
            });
        }

        function setSingleSuspectSuspectPage(pageNumber) {
            $rootScope.$broadcast('setSingleSuspectSuspectPage', {
                pageNumber: pageNumber
            });
        }



        //#region error

        function setError(error) {
            reportDataService.setError(error);
        }
        //#endregion


        var gotResults = false;

        function onCompletion(sources) {

            for (var i = 0; i < sources.length; ++i)
                initialize_result(sources[i]);

            reportDataService.sourceCount = sources.length;
            if (!sources || sources.length == 0) {
                cb_emptySources();
            } else {
                gotResults = true;
                sourcesService.incomingSources(sources);
                service.deferred.notify({
                    type: 'incoming_results',
                    params: {
                        sources: sources
                    }
                });
            }
        }

        function cb_emptySources() {
            if (reportDataService.info && reportDataService.info.status !== 'Processing') {
                service.deferred.notify({
                    type: 'cb_emptySources',
                    params: {}
                });
            }
        }

        function initialize_result(result) {
            result.is_active = true; // By default, present all sources.
            result.status = DataService.eSourceStatus.reportDownloaded;
            if (result.URL == null)
                result.URL = "no public address";
        }

        function registerToEvents() {
            var deferred = $q.defer();
            service.deferred = deferred;
            $timeout(function () {
                if (reportServiceMediator.registered)
                    reportServiceMediator.registered();
            });
            return deferred.promise;
        }

        function progressChanged(progress) {
            reportDataService.scanProgressPercents = progress;
        }

        function onDocumentReadyV2(document, textOnly) {
            if (typeof textOnly != 'undefined') {
                reportDataService.textOnly = textOnly;
                if (textOnly) {
                    contentTypeService.contentType.setToText();
                }
            }

            document = DataService.splitDocument(document);
            reportDataService.scanned_document = document;
            sourcesService.setPageRanges(document.ranges);
            splitExcludedRanges();
            $rootScope.$broadcast('updatePageMatchesNow');
            service.deferred.notify({
                type: 'cb_scanned_document_success',
                params: {
                    doc: document
                }
            });
        }

        function onDocumentReady(documentText) {
            var document = {
                "text": documentText,
                "contentType": "text/plain",
                "info": {
                    "wordsCount": 1212121212,
                    "ranges": [
                        0
                    ]
                }
            };
            onDocumentReadyV2(document, true);
        }

        //#region info

        function onInfoReady(info) {
            reportDataService.info = info;
            extractReportTitleFromInfo();

            if (reportDataService.info.status === 'Processing') {
                reportDataService.scanProgressPercents = 5;
            }
            splitExcludedRanges();
        }

        function splitExcludedRanges() {
            reportDataService.splitExcludedRanges();
        }

        function getSourceType(title) {
            if (title == "Uploaded text")
                return 'FreeText';
            if (isURL(title))
                return 'Url';
            if (isImageFileName(title))
                return 'Ocr';
            if (isTextFileName(title))
                return 'Textual';
            $timeout(function () {
                throw new Error('Could not extract source type from title. Title: ' + title);
            });
        }

        function isTextFileName(str) {
            var pattern = /.*\.(html|pdf|docx|doc|txt|rtf|xml|pptx|ppt|odt|chm|epub|odp|ppsx|pages|xlsx|xls|csv|LaTeX)$/i;
            return pattern.test(str);
        }

        function isImageFileName(str) {
            var pattern = /.*\.(gif|png|bmp|jpg|jpeg)$/i;
            return pattern.test(str);
        }

        function isURL(str) {
            var pattern = new RegExp('^(https?:\\/\\/)');
            return pattern.test(str);
        }

        function extractReportTitleFromInfo() {
            if (!reportDataService.info || !reportDataService.info.title) return;

            var title = reportDataService.info.title;
            reportDataService.sourceTitle = title;
            reportDataService.sourceType = getSourceType(title);

        }

        //#endregion

        //#region results

        function onMatches(suspectId, text, comparison) {

            var match = {
                "comparison": comparison,
                "text": text,
                "contentType": "text/plain",
                "info": {
                    "wordsCount": 0,
                    "ranges": [0]
                }
            };



            var remainingSourcesWithoutMatches = sourcesService.handleMatches(suspectId, match);
            reportDataService.working = remainingSourcesWithoutMatches > 0;
            service.deferred.notify({
                type: 'result_matches_recieved',
                params: {
                    suspectId: suspectId,
                    match: match
                }
            });

            if (gotResults && remainingSourcesWithoutMatches == 0) {
                reportDataService.working = false;
                service.deferred.notify({
                    type: 'cb_last_sourceRequestSent',
                    params: {}
                });
            }
        }


        function onMatchesV2(suspectId, match) {
            var remainingSourcesWithoutMatches = sourcesService.handleMatches(suspectId, match);
            reportDataService.working = remainingSourcesWithoutMatches > 0;
            service.deferred.notify({
                type: 'result_matches_recieved',
                params: {
                    suspectId: suspectId,
                    match: match
                }
            });

            if (gotResults && remainingSourcesWithoutMatches == 0) {
                reportDataService.working = false;
                service.deferred.notify({
                    type: 'cb_last_sourceRequestSent',
                    params: {}
                });
            }
        }

        //#endregion

        //#region realtime results

        function onNewResult(result) {
            sourcesService.incomingSource(result);
            service.deferred.notify({
                type: 'new_result_recieved',
                params: {
                    result: result
                }
            });
        }

        //#endregion


        //function getSources() {
        //    if (reportDataService.type == reportDataService.reportTypes.multipleSuspects) {
        //        return underscore.values(reportDataService.sources);
        //    } else {
        //        return [reportDataService.sources[reportDataService.resultId]];
        //    }
        //}


        //#region sharing link
        function getSharingUrl(id) {
            if (!this.shareLinkCreationCallback) {
                return $q.reject();
            }

            var deffered = $q.defer();
            this.shareLinkCreationCallback(id, deffered);
            return deffered.promise;
        }

        //#endregion

        //#region document properties
        function setDocumentProperties(properties) {
            reportDataService.reportIcon = properties.icon;
            reportDataService.reportTitle = properties.title;

        }

        //#endregion

        return service;
    }]);
}
