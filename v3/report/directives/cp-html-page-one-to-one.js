"use strict";

function attach_cpHtmlPageOneToOne(app) {
    cpPageOneToOneCntl.$inject = ["$scope", "$timeout", "settingsService", "utilitiesService", "$rootScope", "logService", "shareDialogService", "reportDataService", "$element", 'pageService', 'iframeService', 'reportServiceMediator'];


    function cpPageOneToOneCntl($scope, $timeout, settingsService, utilitiesService, $rootScope, logService, shareDialogService, reportDataService, $element, pageService, iframeService, reportServiceMediator) {
        $scope.reportDataService = reportDataService;
        $scope.isShared = !!window.keyForToken;
        
        $scope.toggleBurger = function () {
            $scope.isBurgerMenuVisible = !$scope.isBurgerMenuVisible;
        }

        $scope.control.setText = function (pageText) {
            $scope.loaded = true;
            $timeout(function () {
                pageText = iframeService.getIframeText(pageText);

                var $iframe = $element.find(".content-iframe")
                var iframe = $iframe[0];
                $(iframe).attr('srcdoc', pageText);
            }, 100);

        }

        $scope.control.scrollToMatch = function (matchId) {
            var message = {
                matchId: matchId,
                type: 'copyleaksMatchScrollRequest'
            };

            var messageText = JSON.stringify(message);

            var $iframe = $element.find(".content-iframe")
            var iframe = $iframe[0];
            if (!iframe || !iframe.contentWindow) return;
            iframe.contentWindow.postMessage(messageText, "*");
        }

        if ($scope.text) {
            $scope.control.setText($scope.text);
        }

        utilitiesService.initScopeForIframeZoom($scope);
        
        $scope.clicked = function ($event) {
            var element = $event.currentTarget;
            var rangeIds = element.getAttribute('ranges');
            $scope.raiseFocusResults(rangeIds);
        }

        $scope.raiseFocusResults = function (items) {
            $scope.focusResult({ items: items });
        }

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

        window.addEventListener("message", receiveMessage, false);

        function receiveMessage(event) {
            if (!event || !event.data) return;

            var eventData = null;
            try {
                eventData = JSON.parse(event.data)
            } catch (ex) {
                return;
            }

            if (eventData.type !== "copyleaksMatchClicked") return;
            if (eventData.pageType != $scope.pageType) return;

            $timeout(function () {
                $scope.raiseFocusResults(eventData.rangeIds);
            });
        }

        $scope.download = function () {
            if ($scope.pageType == reportDataService.pageTypes.source) {
                reportServiceMediator.downloadSource('html');
            } else {
                reportServiceMediator.downloadSuspect('html');
            }
        }
    }

    app.directive('cpOneToOneHtmlPage', ["logService", function (logService) {
        return {
            restrict: 'E',
            scope: {
                control: '=',
                text: '=',
                focusResult: '&',
                pageTitle: '=',
                pageType: '@',
                pageUrl: '=?',
                switchContentType: '&'
            },
            templateUrl: '/v3/report-html/directives/cp-html-page-one-to-one.html',
            controller: cpPageOneToOneCntl,
            link: function (scope, elm, attr) {
            }
        };
    }]);
}
