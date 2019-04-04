function attach_cpPoweredBy(app) {
    app.directive('cpPoweredBy', [function () {
        return {
            restrict: 'E',
            scope: {
                control : '='
            },
            templateUrl: '/sources/common/templates/cp-powered-by.html',
        };
    }]);
}
