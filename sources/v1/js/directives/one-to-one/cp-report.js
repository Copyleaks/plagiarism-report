"use strict";

function attach_cpOneToOneReport(app) {
    app.directive('cpOneToOneReport', [function () {
        return {
            restrict: 'E',
            templateUrl: '/sources/v1/templates/one-to-one/cp-report.html',
            controller: 'one-to-one-ctrl',
        };
    }]);
}
