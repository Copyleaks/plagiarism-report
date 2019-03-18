"use strict";

function attach_cpMultiSuspectReport(app) {
    app.directive('multiSuspectReport', [function () {
        return {
            restrict: 'E',
            templateUrl: '/common/directives/multi-suspect-report.html',
            controller: 'education-report-ctrl',
        };
    }]);
}
