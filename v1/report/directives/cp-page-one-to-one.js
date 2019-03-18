"use strict";

function attach_cpPageOneToOne(app) {
    cpPageOneToOneCntl.$inject = ["$scope", "$timeout", "settingsService", "utilitiesService", "$rootScope", "logService", "shareDialogService", "reportDataService", "$element", 'pageService', 'reportServiceMediator']; 

    
    function cpPageOneToOneCntl($scope, $timeout, settingsService, utilitiesService, $rootScope, logService, shareDialogService, reportDataService, $element, pageService, reportServiceMediator) {
        $scope.reportDataService = reportDataService;
        $scope.highlighted_text = $scope.text;
        $scope.isShared = !!window.keyForToken;
        $scope.paginationObject.control.getMaxPagination = utilitiesService.getMaxPaginationOneToOne;
        $scope.download = function () {
            if ($scope.pageType == reportDataService.pageTypes.source) {
                reportServiceMediator.downloadSource();
            } else {
                reportServiceMediator.downloadSuspect();
            }
        }

        $scope.control.setText = function (text) {
            $scope.highlighted_text = text;
        }

        $scope.control.findElement = function (selector) {
            return $element.find(selector);
        }

        function setSelectedIdsStyle(ids) {
            var styleName = "copyleaksSelectedStyle" + ($scope.pageType == reportDataService.pageTypes.source ?
                'Source' : 'Suspect');
            
            var combinedClasses = '.' + ids.join('.');

            if (window[styleName]) {
                window[styleName].remove();
                window[styleName] = null;
            }

            var parentClassName = $scope.pageType == reportDataService.pageTypes.source ?
                '.source-page ' : '.suspect-page ';

            var style = window[styleName] = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = parentClassName + combinedClasses + '{border-bottom: 2px solid ' + pageService.getColorForClassName(ids) + '}';
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        
        $scope.clicked = function (items) {

            setSelectedIdsStyle(items);

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
            settingsService.set_settings(settingsService.instance);
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
            templateUrl: '/v1/report-html/directives/cp-page-one-to-one.html',
            controller: cpPageOneToOneCntl,
            link: function (scope, elm, attr) {
            }
        };
    }]);
}

