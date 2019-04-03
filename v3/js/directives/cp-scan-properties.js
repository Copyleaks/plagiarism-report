function attach_cpScanProperties(app) {
    cpScanPropertiesController.$inject = ["$scope", "settingsService", "logService", '$element', "reportDataService",'utilitiesService'];
    function cpScanPropertiesController($scope, settingsService, logService, $element, reportDataService, utilitiesService) {
        $scope.hide = window.hidePropertiesSectionCompletely;
        $scope.reportDataService = reportDataService;
        $scope.graphControl = {};
        $scope.graphLegendControl = {};

        $scope.panelVisible = true;
        $scope.togglePanel = function () {
            $('#scan-properties').slideToggle();
            $scope.panelVisible = !$scope.panelVisible;
        };

        if ($scope.control.statistics) {
            $scope.graphControl.statistics = $scope.control.statistics;
            $scope.graphLegendControl.statistics = $scope.control.statistics;
        }

        $scope.control.showStatistics = function (statistics) {
            $scope.graphControl.statistics = statistics;
            $scope.graphLegendControl.statistics = statistics;
            if ($scope.graphControl.showStatistics) $scope.graphControl.showStatistics(statistics);
            if ($scope.graphLegendControl.showStatistics) $scope.graphLegendControl.showStatistics(statistics);
        }
        
        $scope.control.showEmpty = function (emptyResults) {
            utilitiesService.setControlToNoResultsState($scope.graphControl, emptyResults);
            utilitiesService.setControlToNoResultsState($scope.graphLegendControl, emptyResults);
        }
        if ($scope.control.isEmpty) {
            $scope.control.showEmpty($scope.control.emptyResults);
        }
    }
    app.directive('cpScanProperties', [function () {
        return {
            restrict: 'E',
            scope: {
                control: '='
            },
            templateUrl: '/v3/templates/cp-scan-properties.html',
            controller: cpScanPropertiesController
        };
    }]);
}
