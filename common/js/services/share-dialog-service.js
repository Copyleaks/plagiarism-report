function attach_shareDialogService(app) {
    app.service('shareDialogService', ['$mdDialog', function ($mdDialog) {

        var service = {
            show: show
        };

        function show() {
            return $mdDialog.show({
                controller: DialogController,
                templateUrl: '/common/templates/share-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
            });
        }

        return service;
    }]);

    DialogController.$inject = ['$scope', '$element', '$timeout', '$mdDialog', 'reportDataService', 'reportServiceListener', '$rootScope', 'reportServiceMediator'];
    function DialogController($scope, $element, $timeout, $mdDialog, reportDataService, reportServiceListener, $rootScope, reportServiceMediator) {

        var removedMessage = "Only you can view this report.";
        $scope.urlForSharing = null;
        $scope.deleted = false;
        $scope.saveDisabled = true;
        init();
        var count = 0;
        $scope.selectText = function () {
            if (count++ >= 5) {
                $scope.saveDisabled = false;
                return;
            }
            if (angular.element(document.body).hasClass('md-dialog-is-showing')) {
                $timeout(function () {
                    var inputField = $element.find('#share-link-input')[0];
                    inputField.focus();
                    inputField.setSelectionRange(0, inputField.value.length);
                    $timeout(function () {
                        $scope.saveDisabled = false;
                    }, 500);
                }, 100);
                
            }
            else {
                $timeout($scope.selectText, 100);
            }
        }

        $scope.deleteSharedLink = function () {
            reportServiceMediator.deleteSharingKey($scope.pid);
            $scope.deleted = true;
            $scope.urlForSharing = removedMessage;
        }

        function init() {
            reportServiceListener.getSharingUrl(reportDataService.pid).then(function (sharingLink) {
                if (sharingLink) {
                    $scope.urlForSharing = sharingLink;
                    if ($scope.urlForSharing && $scope.urlForSharing != removedMessage) {
                        $scope.selectText();
                        return;
                    }
                }
            });
        };

        $scope.close = function () {
            $mdDialog.cancel();
        }
    }
}
