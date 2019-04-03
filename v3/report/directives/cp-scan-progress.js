function attach_cpScanProgress(app) {
    
    app.directive('cpScanProgress', [function () {
        return {
            restrict: 'E',
            templateUrl: '/v3/templates/cp-scan-progress.html'
        };
    }]);
}
