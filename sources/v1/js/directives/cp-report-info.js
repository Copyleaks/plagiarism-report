function attach_cpReportInfo(app) {
    
    app.directive('cpReportInfo', [function () {
        return {
            restrict: 'E',
            templateUrl: '/sources/common/templates/cp-report-info.html',
            controller: ['$scope', 'reportServiceMediator', function ($scope, reportServiceMediator) {
                $scope.hideReportInfo = window.hideTitleSectionCompletely;

                $scope.raiseIconClick = function () {
                    reportServiceMediator.iconButtonClicked();
                }

                $scope.getScanTime = function () {
                    if (!$scope.reportDataService.info || 
                        !$scope.reportDataService.info.requestTime || 
                        $scope.reportDataService.isErrored)return null;
                    return $scope.reportDataService.info.requestTime;
                }
            }]
        };
    }]);
}
