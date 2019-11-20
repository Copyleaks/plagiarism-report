﻿//The directive that takes care of communicating with the report.
//The communication is handled through the reportServiceListener service, exported from the report module.
//The reportServiceListener service can recieve action requests and it raises events the host app can listen to.
function attach_reportContainer(app) {
    controller.$inject = ["$scope", 'reportServiceListener', '$routeParams', '$route', '$http', '$q', '$location','reportDataService','$timeout'];
    function controller($scope, reportServiceListener, $routeParams, $route, $http, $q, $location,reportDataService, $timeout) {

        //read report type ( single/multiple suspect) from route.
        var reportType = null;
        if ($routeParams.resultid) {
            reportType = reportServiceListener.reportTypes.singleSuspect;
        } else {
            reportType = reportServiceListener.reportTypes.multipleSuspects;
        }

        var contentType = 'html';
        var sourcesWaitingToDownloadMatches = [];
        var search = $location.search();
        if (search.contentType) {
            contentType = search.contentType;
        }

        var listenerPromise = reportServiceListener.init({
            id: $routeParams.id,
            reportType: reportType,
            suspectId: $routeParams.resultid,
            multiSuspectePage: $routeParams.pageNum,
            singleSuspectSourcePage: $routeParams.pageNumSource,
            singleSuspectSuspectPage: $routeParams.pageNumResult,
            shareLinkCreationCallback: shareLinkCreationCallback,
            contentType: contentType,
            showBackButton: true
        });

        //when report share link is called. this function will be called.
        //the developer can choose to create a url that can be viewed without credentials.
        //alternatively the showShareButton can be passed to the listener init function ( see above)
        function shareLinkCreationCallback(pid, deffered) {
            var urlForSharing = "demo/" + pid + '?key=randomKeyString';
            deffered.resolve(urlForSharing);
        }

        //listen to events in report
        listenerPromise.then(angular.noop, angular.noop, handleReportNotify);

        function handleReportNotify(message) {
            var type = message.type, params = message.params;
            switch (type) {
                case 'icon-button-clicked'://top icon was clicked
                    iconButtonClicked();
                    break;
                case 'content-type-changed': //html/text switch
                    switchedContentType(params.contentType);
                    break;
                case 'multiple-suspect-page-change'://page changed in multiple suspect report
                    multipleSuspectPageChange(params.pageNumber);
                    break;
                case 'single-suspect-source-page-change'://source page changed in single suspect report
                    singleSuspectSourcePageChange(params.pageNumber);
                    break;
                case 'single-suspect-suspect-page-change'://suspect page changed in single suspect report
                    singleSuspectSuspectPageChange(params.pageNumber);
                    break;
                case 'download-source-clicked':
                    downloadSourceClicked(params.contentType);
                    break;
                case 'download-suspect-clicked':
                    downloadSuspectClicked(params.contentType);
                    break;
                case 'download-pdf-report-button-clicked':
                    downloadPdfReportButtonClicked();
                    break;
                case 'back-button-clicked':
                    backButtonClicked();
                    break;
                default:
                    break;
            }
        }
        
        function backButtonClicked(){
            //Todo: change here the behavior where you want the page to go
            if ($routeParams.resultid){
                //going back from single suspect report
                var locationPath = "/report/" + $routeParams.id + "/" + $routeParams.pageNumSource; 
                $location.path(locationPath);
            } else {
                //going back from multi suspect report
                location.href = "/"
            }
        }
                
        function downloadPdfReportButtonClicked(contentType) {
            var url = '/download-pdf/v3/';
            window.open(url, '_blank');
        }
        
        function downloadSourceClicked(contentType) {
            var url = '/download-source/v3/' + contentType;
            window.open(url, '_blank');
        }

        function downloadSuspectClicked(contentType) {
            var url = "/download-suspect/v3/"+ $routeParams.resultid +"/" + contentType;
            window.open(url, '_blank');
        }

        var settingSingleSuspectSourcePageChangeFromReport = false;
        function singleSuspectSourcePageChange(pageNumber) {
            settingSingleSuspectSourcePageChangeFromReport = true;
            $route.updateParams(
                {
                    'pageNumSource': pageNumber
                });
        }

        var settingSingleSuspectSuspectPageChangeFromReport = false;
        function singleSuspectSuspectPageChange(pageNumber) {
            settingSingleSuspectSuspectPageChangeFromReport = true;
            $route.updateParams(
                {
                    'pageNumResult': pageNumber
                });
        }

        var settingMultipleSuspectPageChangeFromReport = false;
        function multipleSuspectPageChange(pageNumber) {
            settingMultipleSuspectPageChangeFromReport = true;
            $route.updateParams(
                {
                    'pageNum': pageNumber
                });
        }

        var settingContentTypeFromReport = false;
        function switchedContentType(contentType) {
            settingContentTypeFromReport = true;
            $location.search('contentType', contentType);
        }

        function iconButtonClicked() {
            document.location.href = "/";
        }

        //Fill report data ( data from api or host specific data source)

        //Fill Report title and icon
        $scope.fillMetadata = function (title, icon) {
            reportServiceListener.setDocumentProperties({
                title: title,
                icon: icon
            });
        }

        //Fill Report results ( list of suspects )
        $scope.fillResults = function () {
            
            ///Todo: get results from your server and pass to listener
            return $http.get('/hosts/v3/data/results.json').then(function (response) {
                setSourcesSingleSuspectLink(response.data.results.internet); //add link to customize the single suspect url
                setSourcesSingleSuspectLink(response.data.results.batch);
                setSourcesSingleSuspectLink(response.data.results.database);
                reportServiceListener.onCompletion(response.data);
            return response.data.results;
            });
        }
        
        //Prepare results to download matches
        $scope.prepareToDownloadMatches = function () {
            sourcesWaitingToDownloadMatches = underscore.values(reportDataService.sources);
            downloadSourcesMatches();
        }
        
        var downloadSourcesMatchesTimeout = null;
        function cancelSourcesMatchesTimeout() {
            if (downloadSourcesMatchesTimeout) $timeout.cancel(downloadSourcesMatchesTimeout);

        }
        
        function downloadSourcesMatches() {
            var counter = 0;

            if (sourcesWaitingToDownloadMatches.length == 0) {
                return;
            }

            for (var i = 0; i < sourcesWaitingToDownloadMatches.length; ++i) {
                if (counter++ >= 5) break;
                var result = sourcesWaitingToDownloadMatches[i];
                // download their text and comparison and pass to report
                $scope.fillMatch(result.id);
            }

            sourcesWaitingToDownloadMatches = sourcesWaitingToDownloadMatches.slice(i);
            cancelSourcesMatchesTimeout();
            downloadSourcesMatchesTimeout = $timeout(downloadSourcesMatches, 650);
        }

        //Set each suspect singleSuspectLink property to allow for custom routing when suspect clicked.
        function setSourcesSingleSuspectLink(suspects) {
            for (var index in suspects) {
                var suspect = suspects[index];
                suspect.singleSuspectLink = '/v3/report/' + $routeParams.id + '/' + suspect.id + '/1/1';
            }
        }

        //download report document and pass to report
        $scope.fillDocument = function () {
            
            ///Todo: get scanned document from your server here
            return $http.get('/hosts/v3/data/document.json')
                .then(function (response) {
                   return reportServiceListener.onDocumentReady(response.data);
                });
        }
        
        //simulate report status increment. 
        $scope.incrementStatus = function () {
            reportServiceListener.progressChanged(100);
        }

        //download match text and comparison and pass to report
        $scope.fillMatch = function (matchId) {
            
            ///Todo: get suspect matches from your db here
            var jsonFileName = "" + matchId + "_comparison.json"; //get text demo file name
            $http.get('/hosts/v3/data/' + jsonFileName).then(function (response) {
                reportServiceListener.onMatches(matchId, response.data);
            });
        }

        //Fill report data
        $scope.fillAll = function () {
            //Fill report status - https://api.copyleaks.com/documentation/education/status
            $scope.incrementStatus();
            //Fill report icon and title ( developer can select any icon and text to fill in report ).
            $scope.fillMetadata('Scanned document', '/images/loginlogo.png');
            //Fill report info - https://api.copyleaks.com/documentation/education/info

            $scope.fillDocument()//Fill report document
                .then($scope.fillResults)//Fill report results - https://api.copyleaks.com/documentation/education/result
                .then($scope.prepareToDownloadMatches);
        }

        $scope.fillAll();

        //listen to route changes and ask report to update to reflect new path
        $scope.$on('$routeChangeSuccess', function (evert, to, from) {

            if (to.$$route && from.$$route &&
                to.$$route.multipleSuspect != from.$$route.multipleSuspect) {

                if (to.$$route.multipleSuspect) { //report switched to multi suspect report
                    reportServiceListener.switchReportType(reportServiceListener.reportTypes.multipleSuspects);
                }
                else { //report switched to single suspect report
                    reportServiceListener.switchReportType(reportServiceListener.reportTypes.singleSuspect, to.params.resultid);
                }
            }

            if (to.$$route && from.$$route && //multi suspect page changed
                to.$$route.multipleSuspect && from.$$route.multipleSuspect) {
                if (settingMultipleSuspectPageChangeFromReport) {
                    settingMultipleSuspectPageChangeFromReport = false;
                    return;
                }
                if (to.params.pageNum != from.params.pageNum) {
                    reportServiceListener.setMultipleSuspectPage(to.params.pageNum);
                }
            }

            if (to.$$route && from.$$route && //single suspect source page changed
                !to.$$route.multipleSuspect && !from.$$route.multipleSuspect) {
                if (settingSingleSuspectSourcePageChangeFromReport) {
                    settingSingleSuspectSourcePageChangeFromReport = false;
                    return;
                }
                if (to.params.pageNumSource != from.params.pageNumSource) {
                    reportServiceListener.setSingleSuspectSourcePage(to.params.pageNumSource);
                }
            }

            if (to.$$route && from.$$route && //single suspect suspect page changed
                !to.$$route.multipleSuspect && !from.$$route.multipleSuspect) {
                if (settingSingleSuspectSuspectPageChangeFromReport) {
                    settingSingleSuspectSuspectPageChangeFromReport = false;
                    return;
                }
                if (to.params.pageNumResult != from.params.pageNumResult) {
                    reportServiceListener.setSingleSuspectSuspectPage(to.params.pageNumResult);
                }
            }


            if (to.params.contentType != from.params.contentType) { //content type changed ( html/text);
                if (settingContentTypeFromReport) {
                    settingContentTypeFromReport = false;
                    return;
                }
                reportServiceListener.setContentType(to.params.contentType);
            }

        });
    }
    app.directive('reportContainer', [function () {
        return {
            restrict: 'E',
            template: '<report></report>',
            controller: controller
        };
    }]);
}