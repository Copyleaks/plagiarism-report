function attach_cpStatistics(app) {
    cpStatisticsCntl.$inject = ["$scope", "$element", "logService"];
    function cpStatisticsCntl($scope, $element, logService) {

        function computeStatistics() {
            $scope.total = $scope.statistics.percentage.identical.round + $scope.statistics.percentage.similar.round + $scope.statistics.percentage.related.round;
            $scope.ready = true;
        }

        $scope.control.showStatistics = underscore.debounce(function (statistics) {
            logService.log('cpStatistics: showStatistics');
            $scope.$apply(function () {
                $scope.statistics = statistics;
                computeStatistics();
            });
        },1000);

        $scope.ready = false;

        

        if ($scope.control.isEmpty) {
            logService.log('cpStatistics: $scope.control.isEmpty');
            $scope.statistics = $scope.control.emptyResults;
            computeStatistics()
        } else if ($scope.control.statistics) {
            $scope.statistics = $scope.control.statistics;
            computeStatistics();
        }

        $scope.control.showEmpty = function (emptyResults) {
            $scope.statistics = emptyResults;
            computeStatistics()
        };

        $scope.$on('recalculatingStatistics', function () {
            $scope.ready = false;
            delete $scope.total;
        });
    }
    app.directive('cpStatistics', ["logService", function (logService) {
        return {
            restrict: 'E',
            scope: {
                control : '='
            },
            templateUrl: '/common/directives/cp-statistics.html',
            controller: cpStatisticsCntl
        };
    }]);
}
