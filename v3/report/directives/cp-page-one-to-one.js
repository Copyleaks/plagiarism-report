"use strict";

function attach_cpPageOneToOne(app) {
    cpPageOneToOneCntl.$inject = ["$scope", "$timeout", "settingsService", "utilitiesService", "$rootScope", "logService", "shareDialogService", "reportDataService", "$element", 'pageService', 'reportServiceMediator'];

    
    function cpPageOneToOneCntl($scope, $timeout, settingsService, utilitiesService, $rootScope, logService, shareDialogService, reportDataService, $element, pageService, reportServiceMediator) {
        $scope.reportDataService = reportDataService;
        $scope.highlighted_text = $scope.text;
        $scope.isSwitchToHtmlVisible = reportDataService.availableTypes.length > 1;
        $scope.isShared = !!window.keyForToken;
        $scope.paginationObject.control.getMaxPagination = utilitiesService.getMaxPaginationOneToOne;
        $scope.download = function () {
            if ($scope.pageType == reportDataService.pageTypes.source) {
                reportServiceMediator.downloadSource('text');
            } else {
                reportServiceMediator.downloadSuspect('text');
            }
        }

        $scope.control.setText = function (text) {
            $scope.highlighted_text = text;
        }

        $scope.control.findElement = function (selector) {
            return $element.find(selector);
        }

        $scope.clicked = function ($event, items) {
            $('.selected-match').removeClass('selected-match');
            $event.target.classList.add('selected-match');
            $scope.focusResult({ items: items });
        }
        $scope.settings = settingsService.instance;
        $scope.pageSettings = settingsService.instance[$scope.pageType];
        // #region Texts options

        $scope.source_set_rtl = function (mode) {
            $scope.pageSettings.ui.rtlMode = mode;
            settingsService.set_settings(settingsService.instance);
        };

        $scope.source_font_inc = function () {
            $scope.pageSettings.ui.fontSize += 1;
            $scope.pageSettings.ui.fontSize = Math.min($scope.pageSettings.ui.fontSize, 35);
            settingsService.set_settings( settingsService.instance);
        };

        $scope.source_font_dec = function () {
            $scope.pageSettings.ui.fontSize -= 1;
            $scope.pageSettings.ui.fontSize = Math.max(5, $scope.pageSettings.ui.fontSize);

            settingsService.set_settings(settingsService.instance);
        };
        // #endregion

        // #region burger

        $scope.toggleBurger = function () {
            $scope.isBurgerMenuVisible = !$scope.isBurgerMenuVisible;
        }

        $scope.showShareModal = function () {
            shareDialogService.show();
        }

        $scope.downloadPdfReport = function () {
            reportServiceMediator.downloadPdfReportButtonClicked();
        }

        // #endregion
        
        $scope.$watch('pageTitle', function (newValue, oldValue) {

            if (newValue == oldValue) return;

            $scope.showToolTip = newValue != 'Your text';
        })
    }

    app.directive('cpOneToOnePage', ["logService", function (logService) {
        return {
            restrict: 'E',
            scope: {
                control: '=',
                text: '=',
                focusResult: '&',
                pageTitle: '=',
                pageType: '@',
                paginationObject: '=',
                otherPageObject: '=',
                switchContentType: '&',
                pageUrl: '=?',
            },
            templateUrl: '/v3/report-html/directives/cp-page-one-to-one.html',
            controller: cpPageOneToOneCntl,
        };
    }]);
}

