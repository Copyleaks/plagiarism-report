"use strict";

function attach_cpcontentTypeReport(app) {
    app.directive('multiSuspectReport', [function () {
        return {
            restrict: 'E',
            templateUrl: '/common/directives/multi-suspect-report.html',
            controller: 'education-report-ctrl',
        };
    }]);
}
