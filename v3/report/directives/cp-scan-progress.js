function attach_cpScanProgress(app) {
    
    app.directive('cpScanProgress', [function () {
        return {
            restrict: 'E',
            templateUrl: '/v3/report-html/directives/cp-scan-progress.html'
        };
    }]);
}
