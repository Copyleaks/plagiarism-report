//The directive that takes care of communicating with the report.
//The communication is handled through the reportServiceListener service, exported from the report module.
//The reportServiceListener service can recieve action requests and it raises events the host app can listen to.
function attach_reportContainer(app) {
    controller.$inject = ["$scope", 'reportServiceListener', '$routeParams', '$route', '$http', '$q'];
    function controller($scope, reportServiceListener, $routeParams, $route, $http, $q) {

        //read report type ( single/multiple suspect) from route.
        var reportType = null;
        if ($routeParams.resultid) {
            reportType = reportServiceListener.reportTypes.singleSuspect;
        } else {
            reportType = reportServiceListener.reportTypes.multipleSuspects;
        }

        //initialize report and get the promise that updates us regarding report events
        var listenerPromise = reportServiceListener.init({
            id: $routeParams.id, // Take the report id from the url route
            reportType: reportType, // report type ( single or multi suspect)
            suspectId: $routeParams.resultid, // if in single mode, pass result id.
            contentType: 'text' // the only option for v1
            //showShareButton: false // optionally hide the share button completely
        });


        //listen to events in report
        listenerPromise.then(angular.noop, angular.noop, handleReportNotify);

        function handleReportNotify(message) {
            var type = message.type, params = message.params;
            switch (type) {
                case 'icon-button-clicked':
                    iconButtonClicked(); //the report icon was clicked. select what to do ( go back to report list, or home page...)
                    break;
                default:
                    break;
            }
        }

        function iconButtonClicked() {
            document.location.href = "/";
        }

        //Fill report data
        $scope.fillAll = function () {
			reportServiceListener.setError("We could not get the report data");
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