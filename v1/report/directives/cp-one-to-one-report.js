"use strict";

function attach_cpOneToOneReport(app) {
    app.directive('cpOneToOneReport', [function () {
        return {
            restrict: 'E',
            templateUrl: '/v1/templates/one-to-one-report.html',
            controller: 'one-to-one-ctrl',
        };
    }]);
}
