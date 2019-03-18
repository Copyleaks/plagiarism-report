function attach_reportServiceListener(app) {
    app.service('reportServiceMediator', ['$q', function ($q) {

        var service = {
            backButtonClicked: backButtonClicked,
            iconButtonClicked: iconButtonClicked,
            switchReportContentType: switchReportContentType,
            changeMultiSuspectPage: changeMultiSuspectPage,
            changeSingleSuspectSourcePage: changeSingleSuspectSourcePage,
            changeSingleSuspectSuspectPage: changeSingleSuspectSuspectPage,
            downloadSource: downloadSource,
            downloadSuspect: downloadSuspect,
            deleteSharingKey: deleteSharingKey,
            downloadPdfReportButtonClicked: downloadPdfReportButtonClicked
        }
        var deferred = $q.defer();
        service.promise = deferred.promise;

        function iconButtonClicked() {
            raiseEvent('icon-button-clicked', {});
        }

        function backButtonClicked() {
            raiseEvent('back-button-clicked', {});
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

        function downloadSuspect(contentType) {
            raiseEvent('download-suspect-clicked', { contentType: contentType });
        }

        function downloadSource(contentType) {
            raiseEvent('download-source-clicked', { contentType: contentType });
        }

        function deleteSharingKey() {
            raiseEvent('delete-sharing-key', {});
        }

        function downloadPdfReportButtonClicked() {
            raiseEvent('download-pdf-report-button-clicked', {});
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
            init: init,
            registerToEvents: registerToEvents,
            progressChanged: progressChanged,
            onDocumentReady: onDocumentReady,
            onNewResult: onNewResult,
            onCompletion: onCompletion,
            onMatches: onMatches,
            setError: setError,
            //getSources: getSources,
            setContentType: setContentType,
            switchReportType: switchReportType,
            setDocumentProperties: setDocumentProperties,
            reportTypes: reportDataService.reportTypes,
            getSharingUrl: getSharingUrl,
            setMultipleSuspectPage: setMultipleSuspectPage,
            setSingleSuspectSourcePage: setSingleSuspectSourcePage,
            setSingleSuspectSuspectPage: setSingleSuspectSuspectPage,
            setBackButtonVisibility: setBackButtonVisibility,
            setShareButtonVisibility: setShareButtonVisibility,
            setDownloadReportButtonVisibility: setDownloadReportButtonVisibility
        }

        function init(config) {
            reportDataService.clear();
            if (!config.id) throw new Error('missing id');
            if (!config.reportType) throw new Error('missing reportType ( single or multiple suspects');
            
            reportDataService.pid = config.id;
            reportDataService.availableTypes = ["text/html", "text/plain"];

            reportDataService.type = config.reportType;

            if (reportDataService.type == reportDataService.reportTypes.singleSuspect)
                reportDataService.resultId = config.suspectId;

            if (config.hasOwnProperty('showShareButton')) {
                reportDataService.showShareButton = config.showShareButton;
            } else {
                reportDataService.showShareButton = true;
            }

            if (config.hasOwnProperty('showBackButton')) {
                reportDataService.isBackButtonVisible = config.showBackButton;
            } else {
                reportDataService.isBackButtonVisible = false;
            }

            if (config.hasOwnProperty('showDownloadPdfReportButton')) {
                reportDataService.showDownloadPdfReportButton = config.showDownloadPdfReportButton;
            } else {
                reportDataService.showDownloadPdfReportButton = true;
            }

            if (config.shareLinkCreationCallback) {
                this.shareLinkCreationCallback = config.shareLinkCreationCallback;
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

            if (config.preventHtml) {
                contentTypeService.setPreventHtml();
            } else if (config.contentType){
                contentTypeService.contentType.init(config.contentType);
            }
            
            settingsService.initSettings();

            return reportServiceMediator.promise;
        }


        function setShareButtonVisibility(visible) {
            reportDataService.showShareButton = visible;
        }

        function setDownloadReportButtonVisibility(visible) {
            reportDataService.showDownloadPdfReportButton = visible;
        }

        function setBackButtonVisibility(visible) {
            reportDataService.isBackButtonVisible = visible;
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

        function setMultipleSuspectPage(pageNumber) {
            $rootScope.$broadcast('setMultipleSuspectPage', {
                pageNumber: pageNumber
            });
        }

        function switchReportType(reportType, suspectId) {
            if (reportType == reportDataService.reportTypes.singleSuspect) {
                reportDataService.resultId = suspectId;
                $rootScope.$broadcast('switchToSingleSuspectReport');
            } else {
                $rootScope.$broadcast('switchToMultiSuspectReport');
            }
        }

        function setContentType(contentType) {
            if (contentTypeService.contentType.get() == contentType) return;

            if (contentType == null) contentType = contentTypeService.types.html;
            contentTypeService.contentType.set(contentType);
            $rootScope.$broadcast('switchContentType');
        }

        //#region error

        function setError(error) {
            reportDataService.setError(error);
        }
        //#endregion


        var gotResults = false;

        function initResultType(sources, resultType) {
            if (!sources) return;
            for (var i = 0; i < sources.length; ++i) {
                initialize_result(sources[i]);
                sources[i].resultType = resultType;
            }
        }

        function onCompletion(sourcesObject) {
            if (reportDataService.scannedDocumentMeta) return;
            if (!sourcesObject.results.batch) sourcesObject.results.batch = [];
            if (!sourcesObject.results.database) sourcesObject.results.database = [];
            if (!sourcesObject.results.internet) sourcesObject.results.internet = [];

            initResultType(sourcesObject.results.batch, reportDataService.resultType.batch);
            initResultType(sourcesObject.results.internet, reportDataService.resultType.internet);
            initResultType(sourcesObject.results.database, reportDataService.resultType.database);

            sourcesObject.results.all = sourcesObject.results.database.concat(
                sourcesObject.results.internet, sourcesObject.results.batch);

            //delete sourcesObject.results.database;
            //delete sourcesObject.results.batch;
            //delete sourcesObject.results.internet;

            reportDataService.sourceCount = sourcesObject.results.all.length;
            reportDataService.scannedDocumentMeta = sourcesObject.scannedDocument;

            if (reportDataService.sourceCount == 0) {
                cb_emptySources();
            } else {
                gotResults = true;
                sourcesService.incomingSources(sourcesObject.results.all);
                service.deferred.notify({
                    type: 'incoming_results',
                    params: {
                        sources: sourcesObject
                    }
                });
            }
        }

        function cb_emptySources() {
            if (reportDataService.scanProgressPercents == 100) {
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

        function onDocumentReady(document) {
            DataService.splitTextDocument(document.text);

            if (document.html == null || document.html.value == null) {
                reportDataService.availableTypes = ["text/plain"];
                contentTypeService.contentType.setToText();
            }
            reportDataService.scanned_document = document;

            reportDataService.splitExcludedRanges();
            sourcesService.splitExistingSources();

            $rootScope.$broadcast('updatePageMatchesNow');
            service.deferred.notify({
                type: 'cb_scanned_document_success',
                params: {
                    doc: document
                }
            });
        }

        //#region info

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

        //#endregion

        //#region results

        function onMatches(suspectId, match) {
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

        function onNewResult(result,resultType) {
            initResultType([result], resultType);
            sourcesService.incomingSource(result);
            service.deferred.notify({
                type: 'new_result_recieved',
                params: {
                    result: result
                }
            });
        }

        //#endregion


        //function getsources() {
        //    if (reportdataservice.type == reportdataservice.reporttypes.multiplesuspects) {
        //        return underscore.values(reportdataservice.sources);
        //    } else {
        //        return [reportdataservice.sources[reportdataservice.resultid]];
        //    }
        //}

        //#region document properties
        function setDocumentProperties(properties) {
            reportDataService.reportIcon = properties.icon;
            reportDataService.reportTitle = properties.title;

        }

        //#endregion


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


        return service;
    }]);
}
