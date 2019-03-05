//The directive that takes care of communicating with the report.
//The communication is handled through the reportServiceListener service, exported from the report module.
//The reportServiceListener service can recieve action requests and it raises events the host app can listen to.
function attach_reportContainer(app) {
    controller.$inject = ["$scope", 'reportServiceListener', '$routeParams', '$route', '$http', '$q'];
    function controller($scope, reportServiceListener, $routeParams, $route, $http, $q) {

        //set report to single suspect
        var reportType = reportServiceListener.reportTypes.singleSuspect;

        //initialize report and get the promise that updates us regarding report events
        var listenerPromise = reportServiceListener.init({
            id: $routeParams.id, // Take the report id from the url route
            reportType: reportType, // report type ( single or multi suspect)
            suspectId: $routeParams.resultid, // if in single mode, pass result id.
            shareLinkCreationCallback: shareLinkCreationCallback,
            contentType: 'text' // the only option for v1
            //,showShareButton: false // optionally hide the share button completely
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

        //listen to report events
        function handleReportNotify(message) {
            var type = message.type, params = message.params;
            switch (type) {
                case 'icon-button-clicked':
                    iconButtonClicked(); //the report icon was clicked. select what to do ( go back to report list, or home page...)
                    break;
                case 'download-source-clicked':
                    downloadSourceClicked();
                    break;
                case 'download-suspect-clicked':
                    downloadSuspectClicked();
                    break;

                default:
                    break;
            }
        }


        function downloadSourceClicked() {
            var url = '/download-source/v1';
            window.open(url, '_blank');
        }

        function downloadSuspectClicked() {
            var url = "/download-suspect/v1/" + $routeParams.resultid;
            window.open(url, '_blank');
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
            return $http.get('/demo/v1/data/results.json').then(function (response) {
                setSourcesSingleSuspectLink(response.data.results); //add link to customize the single suspect url
                reportServiceListener.onCompletion(response.data.results);
                return response.data.results;
            });

        }

        //Set each suspect singleSuspectLink property to allow for custom routing when suspect clicked.
        function setSourcesSingleSuspectLink(suspects) {
            for (var index in suspects) {
                var suspect = suspects[index];
                suspect.singleSuspectLink = '/v1/report/' + $routeParams.id + '/' + suspect.id;
            }
        }

        //fill report info - word count, excluded ranges, ...
        $scope.fillInfo = function () {
            return $http.get('/demo/v1/data/info.json').then(function (response) {
                reportServiceListener.onInfoReady(response.data);
            });
        }

        //Helper function to download text
        function getText(path) {
            return $http({
                url: path,
                method: 'GET',
                transformResponse: [function (data) {
                    // Do whatever you want!
                    return data;
                }]
            })
        }

        //download report document and pass to report
        $scope.fillDocument = function () {
            return getText('/demo/v1/data/source-text.json')
                .then(function (response) {
                    reportServiceListener.onDocumentReady(response.data);
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
            var textJsonFileName = "" + matchId + "_result-text.json";
            var comparisonJsonFileName = "" + matchId + "_comparison.json";
            var textPromise = getText('/demo/v1/data/' + textJsonFileName);
            var comparisonPromise = $http.get('/demo/v1/data/' + comparisonJsonFileName)

            return $q.all([textPromise, comparisonPromise]) //wait for all results to return and pass to report
                .then(function (responses) {
                    reportServiceListener.onMatches("" + matchId, responses[0].data, responses[1].data);
                });
        }

        //Fill report data
        $scope.fillAll = function () {
            //Fill report status - https://api.copyleaks.com/documentation/education/status
            $scope.incrementStatus(); $scope.incrementStatus(); $scope.incrementStatus();
            //Fill report icon and title ( developer can select any icon and text to fill in report ).
            $scope.fillMetadata('Scanned document', '/images/loginlogo.png');
            //Fill report info - https://api.copyleaks.com/documentation/education/info
            $scope.fillInfo()
                .then($scope.fillDocument)//Fill report document
                .then($scope.fillResults)//Fill report results - https://api.copyleaks.com/documentation/education/result
                .then(function (results) {
                    for (var i = 0; i < results.length; ++i) //there are 10 results in the demo
                        $scope.fillMatch(results[i].id); // download their text and comparison and pass to report
                });
        }

        $scope.fillAll();
    }
    app.directive('reportContainer', [function () {
        return {
            restrict: 'E',
            template: '<report></report>',
            controller: controller
        };
    }]);
}