"use strict";

function attach_cpReport(app) {
    app.directive('report', [function () {
        return {
            restrict: 'E',
            scope: {
            },
            templateUrl: '/sources/common/templates/report.html',
            controller: 'reportController',
        };
    }]);
}
