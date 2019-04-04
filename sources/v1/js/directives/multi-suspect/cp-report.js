"use strict";

function attach_cpMultiSuspectReport(app) {
    app.directive('multiSuspectReport', [function () {
        return {
            restrict: 'E',
            templateUrl: '/sources/common/templates/multi-suspect-report.html',
            controller: 'multi-suspect-ctrl',
        };
    }]);
}
