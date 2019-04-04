function attach_cpGraph(app) {
    cpGraphCntl.$inject = ["$scope", "$element", "utilitiesService", "logService"];
    function cpGraphCntl($scope, $element, utilitiesService, logService) {

        $scope.labels = ["Original", "Identical", "Minor Changes", "Related Meaning"];
        $scope.colors = ['#ffffff', '#FF6666', '#FF9A9A', '#FFD9B0'];
        $scope.data = [10, 10, 10];
        //chart.js options -- 
        $scope.options = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            segmentShowStroke: false,
            elements: {
                arc: {
                    borderWidth: 0
                }
            },
            tooltips: {
                callbacks: {
                    title: function (tooltipItem, data) {
                        return data['labels'][tooltipItem[0]['index']];
                    },
                    label: function (tooltipItem, data) {
                        if (!$scope.roundedData) return;
                        var dataset = data['datasets'][0];
                        if (dataset.data[tooltipItem.index] >= 1 || dataset.data[tooltipItem.index] == 0) {
                            var percent = $scope.roundedData[tooltipItem.index]    
                            return '(' + percent + '%)';
                        } 
                        return '(<1%)';
                        
                    },
                    afterLabel: function (tooltipItem, data) {
                        return '';// + percent + '%)';
                    }
                },
                backgroundColor: '#ff0000',
                titleFontSize: 16,
                titleFontColor: '#fdfdfd',
                bodyFontColor: '#fdfdfd',
                bodyFontSize: 14,
                displayColors: false,
                mode: 'nearest',
                position: 'nearest'
            }
        };

        

        $scope.control.showStatistics = utilitiesService.throttleWithGuaranteedLastRun(function (statistics) {
            logService.log('cpGraph: showStatistics');
                $scope.ready = true;
                setData($scope.control.statistics.percentage);
        }, 1000);

        $scope.ready = false;

        if ($scope.control.isEmpty) {
            $scope.ready = true;
            $scope.data = [1, 0, 0, 0];
        } else if ($scope.control.statistics) {

            $scope.ready = true;
            setData($scope.control.statistics.percentage);
        }

        function setData(percentage) {
            $scope.data = [
                percentage.wordsNotCopied,
                percentage.identical.real,
                percentage.similar.real,
                percentage.related.real];

            $scope.roundedData = [
                percentage.wordsNotCopied,
                percentage.identical.round,
                percentage.similar.round,
                percentage.related.round];
        }

        $scope.control.showEmpty = function () {
            $scope.ready = true;
            $scope.data = [1, 0, 0, 0];
        };

        $scope.$on('recalculatingStatistics', function () {
            $scope.ready = false;
        });
    }
    app.directive('cpGraph', [function () {
        return {
            restrict: 'E',
            scope: {
                control: '='
            },
            templateUrl: '/sources/common/templates/cp-graph.html',
            controller: cpGraphCntl
        };
    }]);
}
