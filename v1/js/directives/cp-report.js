"use strict";

function attach_cpReport(app) {
    app.directive('report', [function () {
        return {
            restrict: 'E',
            scope: {
            },
            templateUrl: '/common/directives/report.html',
            controller: 'reportController',
        };
    }]);
}
