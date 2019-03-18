function attach_reportController(app) {
    app.controller('reportController', ['$scope', 'reportDataService', 'contentTypeService', 'reportServiceListener', '$timeout', 'reportServiceMediator',
function ($scope, reportDataService, contentTypeService, reportServiceListener, $timeout, reportServiceMediator) {
    $scope.reportDataService = reportDataService;
    $scope.contentTypeService = contentTypeService;
    
    $scope.showOneToOne = reportDataService.type == reportDataService.reportTypes.singleSuspect;

    $scope.goBack = function () {
        reportDataService.backButtonClicked()
    }

    $scope.$on('switchToSingleSuspectReport', function () {
        $scope.showOneToOne = true;
        reportServiceMediator.registered = tryToShowSingleSuspectWithExistingData;
    });

    $scope.$on('switchToMultiSuspectReport', function () {
        $scope.showOneToOne = false;
        reportServiceMediator.registered = tryToShowMultiSuspectWithExistingData;
    });

    function tryToShowSingleSuspectWithExistingData() {
        reportServiceListener.onInfoReady(reportDataService.info);
        reportServiceListener.onDocumentReadyV2(reportDataService.scanned_document);
        var source = reportDataService.sources[reportDataService.resultId];
        reportServiceListener.deferred.notify({
            type: 'existing_result_with_matches',
            params: {
                result: source
            }
        });
    }
     

    function tryToShowMultiSuspectWithExistingData() {
        reportServiceListener.onInfoReady(reportDataService.info);
        reportServiceListener.onDocumentReadyV2(reportDataService.scanned_document);
        reportServiceListener.deferred.notify({
            type: 'existing_results_with_matches',
            params: {
                result: reportDataService.sources
            }
        });
    }
}]);

}