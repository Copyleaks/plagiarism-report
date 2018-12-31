"use strict";
//Add comments explaining the report in one to many.
var app = angular.module('ReportDemo', ['ngRoute', 'CopyleaksReport']);
app.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
    
    // Add 2 routes.
    // one for multiple suspect report view
    // the second for single suspect report view.
    $routeProvider
        .when("/report/:id/:pageNum", { //reflect report id in route
            template: "<div></div>",
            multipleSuspect: true,
            isReportView: true,
        }).when("/report/:id/:resultid/:pageNumSource/:pageNumResult", { //reflect report id and suspect id in route
            template: "<div></div>",
            multipleSuspect: false,
            isReportView: true,
        });

    $locationProvider.html5Mode(true);
}]);

app.controller('reportHostController', ["$scope", "$route", '$rootScope',
function ($scope, $route, $rootScope) {

        $rootScope.$on('$locationChangeSuccess', function () {
            if ($route.current && $route.current.$$route) {                
                $scope.isReportView = $route.current.$$route.isReportView;//show report when in the right route
            }
        });
    }]);

attach_reportContainer(app);