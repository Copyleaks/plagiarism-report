function attach_cpEducationReportTopArea(app) {
    controller.$inject = ["$scope", "settingsService", "logService", '$element', "reportDataService", 'utilitiesService', 'shareDialogService'];
    function controller($scope, settingsService, logService, $element, reportDataService, utilitiesService, shareDialogService) {

        $scope.showShareModal = function () {
            shareDialogService.show();
        }

        $scope.reportDataService = reportDataService;
        $scope.statisticsControl = {};
        $scope.scanPropertiesControl = {};
        $scope.$on('showStatistics', function (event, statistics) {
            $scope.scanPropertiesControl.statistics = statistics;
            $scope.statisticsControl.statistics = statistics;
            if ($scope.scanPropertiesControl.showStatistics) $scope.scanPropertiesControl.showStatistics(statistics);
            if ($scope.statisticsControl.showStatistics) $scope.statisticsControl.showStatistics(statistics);
        })

        $scope.$on('setControlToNoResultsState', function (event, emptyResults) {
            utilitiesService.setControlToNoResultsState($scope.scanPropertiesControl, emptyResults);
            utilitiesService.setControlToNoResultsState($scope.statisticsControl, emptyResults);
        })

        // #region hide label until time is in the past

        $scope.$on('hideLabelIfRequestIsInTheFuture', function () {
            hideLabelIfRequestIsInTheFuture();
        })

        function hideLabelIfRequestIsInTheFuture() {
            if (reportDataService.scannedDocumentMeta && reportDataService.scannedDocumentMeta.creationTime) {
                var now = moment();
                var requestDate = moment.utc(reportDataService.scannedDocumentMeta.creationTime);
                if (now < requestDate) {
                    $scope.isRequestTimeInTheFuture = function () {
                        if (new moment() < moment.utc(reportDataService.scannedDocumentMeta.creationTime)) {
                            return true;
                        } else {
                            $scope.isRequestTimeInTheFuture = function () {
                                return false;
                            }
                            return false;
                        }
                    }
                } else {
                    $scope.isRequestTimeInTheFuture = function () {
                        return false;
                    }
                }
            }
        }

        // #endregion
    }
    app.directive('cpEducationReportTopArea', [function () {
        return {
            restrict: 'A',
            controller: controller
        };
    }]);
}
