function attach_filterDialogService(app) {
    app.service('filterDialogService', ['$mdDialog', function ($mdDialog) {

        var service = {
            show: show
        };

        function show() {
            return $mdDialog.show({
                controller: DialogController,
                templateUrl: '/common/directives/filter-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                //targetEvent: '#saveToFolder'
            });
        }

        return service;
    }]);

    DialogController.$inject = ['$scope', '$element', '$timeout', '$mdDialog', 'reportDataService', '$rootScope'];
    function DialogController($scope, $element, $timeout, $mdDialog, reportDataService, $rootScope) {
        $scope.allSources = computeAllSources(reportDataService.sources);

        $scope.reportDataService = reportDataService;

        function computeAllSources(sources) {
            var arr = [];
            for (var key in sources)
                arr.push(sources[key]);
            return arr;
        };

        $scope.changeSourceVisibilityStatus = function (source) {
            source.is_active = !source.is_active;
        };

        $scope.test = function () {
        }

        $scope.uncheckAll = function () {
            for (var id in $scope.reportDataService.sources) {
                $scope.reportDataService.sources[id].is_active = false;
            }
        };

        $scope.checkAll = function () {
            for (var id in $scope.reportDataService.sources) {
                $scope.reportDataService.sources[id].is_active = true;
            }
        };

        $scope.close = function () {
            $mdDialog.cancel();

            $rootScope.$broadcast('updatePageMatchesNow');
            $rootScope.$broadcast('updateGraph');
        }
    }
}
