"use strict";

function attach_cpReport(app) {
    app.directive('report', [function () {
        return {
            restrict: 'E',
            scope: {
            },
            templateUrl: '/common/templates/report.html',
            controller: 'reportController',
        };
    }]);
}
