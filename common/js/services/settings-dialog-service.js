function attach_settingsDialogService(app) {
    app.service('settingsDialogService', ['$mdDialog', function ($mdDialog) {

        var service = {
            show: show
        };

        function show() {
            return $mdDialog.show({
                controller: DialogController,
                templateUrl: '/common/templates/settings-dialog.html',
                //parent: angular.element(document.body),
                clickOutsideToClose: true,
                //targetEvent: '#saveToFolder'
            });
        }

        return service;
    }]);

    DialogController.$inject = ['$scope', '$element', '$timeout', '$mdDialog', 'reportDataService', 'settingsService', '$rootScope'];
    function DialogController($scope, $element, $timeout, $mdDialog, reportDataService, settingsService, $rootScope) {


        $scope.saveDisabled = true;

        $scope.tempSettings = angular.extend({}, settingsService.instance);

        $scope.settings_make_default = false;

        $scope.saveSettings = function () {

            var showPageSourcesChanged = settingsService.instance.showPageSources != $scope.tempSettings.showPageSources;
            var showOnlyTopResultsChanged = settingsService.instance.showOnlyTopResults != $scope.tempSettings.showOnlyTopResults;

            angular.extend(settingsService.instance, $scope.tempSettings);

            if ($scope.settings_make_default)
                settingsService.set_default_settings(settingsService.instance);

            settingsService.set_settings(settingsService.instance);

            if (!$scope.tempSettings.showPageSources) {
                $rootScope.$broadcast('getMoreResults');
            }

            if (showOnlyTopResultsChanged || showPageSourcesChanged) {
                $rootScope.$broadcast('raiseSourceListRefresh');
            }
            $mdDialog.cancel();

            $rootScope.$broadcast('updatePageMatches');
            $scope.$emit('updateGraph');
        };

        $scope.enableSave = function () {
            $scope.saveDisabled = false;
        };


        $scope.close = function () {
            $mdDialog.cancel();

            $rootScope.$broadcast('updatePageMatchesNow');
            $rootScope.$broadcast('updateGraph');
        }

    }
}