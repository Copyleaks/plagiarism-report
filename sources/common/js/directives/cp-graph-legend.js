function attach_cpGraphLegend(app) {
    cpGraphLegendCntl.$inject = ["$scope", "settingsService", "logService"];
    function cpGraphLegendCntl($scope, settingsService, logService) {

        function computeStatistics(statistics) {
            $scope.ready = true;
            $scope.sources[0].percent = statistics.percentage.identical.real >= 1 ? statistics.percentage.identical.round : statistics.percentage.identical.real;
            $scope.sources[1].percent = statistics.percentage.similar.real >= 1 ? statistics.percentage.similar.round : statistics.percentage.similar.real;
            $scope.sources[2].percent = statistics.percentage.related.real >= 1 ? statistics.percentage.related.round : statistics.percentage.related.real;
        }

        $scope.control.showStatistics = underscore.debounce(function (statistics) {
            logService.log('cpGraphLegend: showStatistics');
            $scope.$apply(function () {
                computeStatistics(statistics);
            });
        }, 1000);

        function getUninitializedSources() {
            return [
            {
                percent: 0,
                text: 'Identical',
                colorBoxStyle: { 'background-color': '#FF6666' },
                setting: 'showIdentical',
                tooltipText: 'Exact wording in the text'
            },
            {
                percent: 0,
                text: 'Minor Changes',
                colorBoxStyle: { 'background-color': '#FF9A9A' },
                setting: 'showSimilar',
                tooltipText: 'Nearly identical with different form i.e. "slow" becomes "slowly"'
            },
            {
                percent: 0,
                text: 'Related Meaning',
                colorBoxStyle: { 'background-color': '#FFD9B0' },
                setting: 'showRelated',
                tooltipText: 'Close meaning but different words '
            }];
        }
        $scope.sources = getUninitializedSources();

        $scope.settings = settingsService.instance;

        if ($scope.control.isEmpty) {
            computeStatistics($scope.control.emptyResults);
        } else if ($scope.control.statistics) {
            computeStatistics($scope.control.statistics);
        }

        $scope.control.showEmpty = function (emptyResults) {
            computeStatistics(emptyResults);
        };

        $scope.$on('recalculatingStatistics', function () {
            $scope.ready = false;
            $scope.sources = getUninitializedSources();
        });

    }
    app.directive('cpGraphLegend', [function () {
        return {
            restrict: 'E',
            scope: {
                control: '='
            },
            templateUrl: '/sources/common/templates/cp-graph-legend.html',
            controller: cpGraphLegendCntl
        };
    }]);
}
