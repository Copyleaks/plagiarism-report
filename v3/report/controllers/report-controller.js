function attach_reportController(app) {
    app.controller('reportController', ['$scope', 'reportDataService', 'contentTypeService', 'reportServiceListener', '$timeout', 'reportServiceMediator','utilitiesService',
function ($scope, reportDataService, contentTypeService, reportServiceListener, $timeout, reportServiceMediator,utilitiesService) {
    $scope.reportDataService = reportDataService;
    $scope.contentTypeService = contentTypeService;
    
    $scope.showOneToOne = reportDataService.type == reportDataService.reportTypes.singleSuspect;

    $scope.goBack = function () {
        reportServiceMediator.backButtonClicked();
    }

    $scope.$on('switchToSingleSuspectReport', function (event, args) {
        $scope.$broadcast('recalculatingStatistics');
        $scope.showOneToOne = true;
        reportServiceMediator.registered = tryToShowSingleSuspectWithExistingData;
    });

    $scope.$on('switchToMultiSuspectReport', function () {
        $scope.$broadcast('recalculatingStatistics');
        $scope.showOneToOne = false;
        reportServiceMediator.registered = tryToShowcontentTypeWithExistingData;
    });


    function tryToShowSingleSuspectWithExistingData() {
        if (!reportDataService.scanned_document) return;

        reportServiceListener.onDocumentReady(reportDataService.scanned_document);
        
        if (!reportDataService.resultId) return;
        var source = reportDataService.sources[reportDataService.resultId];
        if (!source) return;
        reportServiceListener.deferred.notify({
            type: 'existing_result_with_matches',
            params: {
                result: source
            }
        });
    }

    function tryToShowcontentTypeWithExistingData() {
        if (!reportDataService.scanned_document) return;

        reportServiceListener.onDocumentReady(reportDataService.scanned_document);

        if (!reportDataService.sources || utilitiesService.length(reportDataService.sources) == 0) return;

        reportServiceListener.deferred.notify({
            type: 'existing_results_with_matches',
            params: {
                result: reportDataService.sources
            }
        });
    }
}]);

}