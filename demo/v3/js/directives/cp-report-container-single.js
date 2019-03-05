//The directive that takes care of communicating with the report.
//The communication is handled through the reportServiceListener service, exported from the report module.
//The reportServiceListener service can recieve action requests and it raises events the host app can listen to.
function attach_reportContainer(app) {
    controller.$inject = ["$scope", 'reportServiceListener', '$routeParams', '$route', '$http', '$q', '$location'];
    function controller($scope, reportServiceListener, $routeParams, $route, $http, $q, $location) {

        var reportType =  reportServiceListener.reportTypes.singleSuspect;
        var availableContentTypes = ["text/html", "text/plain"];

        var contentType = 'html';
        var search = $location.search();
        if (search.contentType) {
            contentType = search.contentType;
        }

        var listenerPromise = reportServiceListener.init({
            id: $routeParams.id,
            reportType: reportType,
            suspectId: $routeParams.resultid,
            singleSuspectSourcePage: $routeParams.pageNumSource,
            singleSuspectSuspectPage: $routeParams.pageNumResult,
            shareLinkCreationCallback: shareLinkCreationCallback,
            contentType: contentType
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
            
                default:
                    break;
            }
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
            return $http.get('/demo/v3/data/results.json').then(function (response) {
                setSourcesSingleSuspectLink(response.data.results.internet); //add link to customize the single suspect url
                reportServiceListener.onCompletion(response.data);
            return response.data.results;
            });
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
            return $http.get('/demo/v3/data/document.json')
                .then(function (response) {
                   return reportServiceListener.onDocumentReady(response.data);
                });
        }
        var progress = 0;

        //simulate report status increment. 
        $scope.incrementStatus = function () {
            reportServiceListener.progressChanged(progress);
            progress += 50;
        }

        //download match text and comparison and pass to report
        $scope.fillMatch = function (matchId) {
            var jsonFileName = "" + matchId + "_comparison.json"; //get text demo file name
            $http.get('/demo/v3/data/' + jsonFileName).then(function (response) {
                reportServiceListener.onMatches(matchId, response.data);
            });
        }

        //Fill report data
        $scope.fillAll = function () {
            //Fill report status - https://api.copyleaks.com/documentation/education/status
            $scope.incrementStatus(); $scope.incrementStatus(); $scope.incrementStatus();
            //Fill report icon and title ( developer can select any icon and text to fill in report ).
            $scope.fillMetadata('Scanned document', '/images/loginlogo.png');
            //Fill report info - https://api.copyleaks.com/documentation/education/info

            $scope.fillDocument()//Fill report document
                .then($scope.fillResults)//Fill report results - https://api.copyleaks.com/documentation/education/result
                .then(function (results) {
                    for (var i = 0; i < results.internet.length; ++i) //there are 10 results in the demo
                        $scope.fillMatch(results.internet[i].id); // download their text and comparison and pass to report
                });
        }

        $scope.fillAll();

        //listen to route changes and ask report to update to reflect new path
        $scope.$on('$routeChangeSuccess', function (evert, to, from) {

        
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