"use strict";

function attach_cpMultiSuspectTextPage(app) {
    cpTextPageCntl.$inject = ["$scope", "$timeout", "settingsService", "utilitiesService", "$rootScope", "logService", "shareDialogService", "pageService", 'reportDataService', 'contentTypeService', 'reportServiceMediator'];
    
    attachBindHtmlCompile(app);

    function cpTextPageCntl($scope, $timeout, settingsService, utilitiesService, $rootScope, logService, shareDialogService, pageService, reportDataService, contentTypeService, reportServiceMediator) {
        $scope.settings = settingsService.instance;
        $scope.reportDataService = reportDataService;
        $scope.isShared = !!window.keyForToken;
        $scope.showShareModal = function () {
            shareDialogService.show();
        }

        $scope.download = function () {
            reportServiceMediator.downloadSource();
        }

        $scope.shouldHide = function () {
            if (!reportDataService.scanned_document) return true;
            if (contentTypeService.contentType.isHtml()) return true;
            if (contentTypeService.isHtmlContentType(reportDataService.scanned_document.contentType)) return true;
            return false;
        }

        $scope.refreshMatches = refreshMatches;
        function refreshMatches() {
            logService.log('refreshMatches() called.');
            
            if (!reportDataService.scanned_document || !reportDataService.scanned_document.pages
                || !$scope.documentPagination.ready)
                return;

            var currentMatches = pageService.updateCurrentPageMatches(reportDataService.sources,
                $scope.documentPagination.current - 1, reportDataService.excludedRangesPerPage)
            var pageText = reportDataService.scanned_document.pages[$scope.documentPagination.current - 1];
            
            if (utilitiesService.length(reportDataService.sources) > 0 || reportDataService.noMatches) {
                $scope.isSwitchTypeVisible = true;
            }

            $scope.highlighted_text = pageService.highlightText({
                text: pageText,
                matches: currentMatches,
                sources: reportDataService.sources,
                mapType: 'sourceToSuspect'
            });
        
            $rootScope.$broadcast('registerAffix', { type: 'text' });
        }

        //function hasSomeMatches(currentMatches) {
        //    if (currentMatches.identical && currentMatches.identical.length > 0) return true;
        //    if (currentMatches.relatedMeaning && currentMatches.relatedMeaning.length > 0) return true;
        //    if (currentMatches.similar && currentMatches.similar.length > 0) return true;
        //    return false;
        //}

        if (reportDataService.scanned_document && reportDataService.scanned_document.pages) {
            try {
                if (!$scope.shouldHide()) refreshMatches();
            }catch(err){
                
            }
        }
        
        $scope.askForRefresh = underscore.throttle(function () {
            if (!$scope.askedForRefresh) return;
            logService.log('Asked page matches to refresh');
            refreshMatches();
        }, 15000);

        function setSelectedIdsStyle(ids) {
            var combinedClasses = '.' + ids.join('.');

            if (window.copyleaksSelectedStyle) {
                window.copyleaksSelectedStyle.remove();
                window.copyleaksSelectedStyle = null;
            }

            var style = window.copyleaksSelectedStyle = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = combinedClasses + '{border-bottom: 2px solid ' + pageService.getColorForClassName(ids) + '}';
            document.getElementsByTagName('head')[0].appendChild(style);
        }

        $scope.clicked = function (ids) {
            if (ids.length == 1 && ids[0] == -1) {
                return;
            }
            
            setSelectedIdsStyle(ids);
            
            var items = underscore.map(ids, reportDataService.getSourceIdFromMatchId);
            $scope.focusResults({ items: items });
        };

        $scope.exitLocked = function () {
            $scope.focusResults({});
        };

        // #region Texts options

        $scope.source_set_rtl = function (mode) {
            settingsService.instance.ui.rtlMode = mode;
            settingsService.set_settings(settingsService.instance);
        };

        $scope.source_font_inc = function () {
            settingsService.instance.ui.fontSize += 1;
            settingsService.instance.ui.fontSize = Math.min(settingsService.instance.ui.fontSize, 35);
            settingsService.set_settings(settingsService.instance);
        };

        $scope.source_font_dec = function () {
            settingsService.instance.ui.fontSize -= 1;
            settingsService.instance.ui.fontSize = Math.max(5, settingsService.instance.ui.fontSize);

            settingsService.set_settings(settingsService.instance);
        };
        // #endregion
    }

    app.directive('cpTextPage', ["logService", 'contentTypeService', function (logService, contentTypeService) {
        return {
            restrict: 'E',
            scope: {
                focusResults: '&',
                unfocus: '&',
                documentPagination: '=',
                switchContentType: '&'
            },
            templateUrl: '/v1/templates/cp-text-page.html',
            controller: cpTextPageCntl,
            link: function (scope, elm, attr) {
                scope.askedForRefresh = false;

                scope.$on('updatePageMatches', function () {
                    if (scope.shouldHide()) return;
                    logService.log("cp-text-page: currentMatches changed!");
                    scope.askedForRefresh = true;
                    scope.askForRefresh();// Auto update the current matches when list is changed.
                });
                scope.$on('updatePageMatchesNow', function () {
                    if (scope.shouldHide()) return;
                    scope.askedForRefresh = false;
                    scope.refreshMatches();
                });
            }
        };
    }]);
}
