function attach_cpScanProgress(app) {
    
    app.directive('cpScanProgress', [function () {
        return {
            restrict: 'E',
            templateUrl: '/sources/v1/templates/cp-scan-progress.html'
        };
    }]);
}
