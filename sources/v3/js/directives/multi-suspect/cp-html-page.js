"use strict";
var maxHtmlHeight = window.innerHeight;

function attach_cpHtmlPage(app) {
    cpHtmlPageCntl.$inject = ["$scope", "$timeout", "settingsService", "utilitiesService", "$rootScope", "logService", "shareDialogService", "pageService", 'reportDataService', '$element', 'iframeService', 'contentTypeService', 'reportServiceMediator'];
    
    function cpHtmlPageCntl($scope, $timeout, settingsService, utilitiesService, $rootScope, logService, shareDialogService, pageService, reportDataService, $element, iframeService, contentTypeService, reportServiceMediator) {
        $scope.settings = settingsService.instance;
        $scope.reportDataService = reportDataService;
        $scope.isShared = !!window.keyForToken;
        $scope.showShareModal = function () {
            shareDialogService.show();
        }

        $scope.downloadPdfReport = function () {
            reportServiceMediator.downloadPdfReportButtonClicked();
        }

        $scope.download = function () {
            reportServiceMediator.downloadSource('html');
        }

        utilitiesService.initScopeForIframeZoom($scope);

        var currentMatchesIds = null;
        $scope.refreshMatches = refreshMatches;


        if (reportDataService.scanned_document && reportDataService.scanned_document.html) {
            refreshMatches();
        }

        function refreshMatches() {
            
            logService.log('refreshMatches() called.');
            
            if (!reportDataService.scanned_document || !reportDataService.scanned_document.html) return;

            var currentMatches = pageService.updateCurrentPageMatches(reportDataService.sources,
                0, reportDataService.excludedHtmlRangesPerPage,'html');

            if (hasSomeMatches(currentMatches)) 
                $scope.isSwitchTypeVisible = true;

            var newMatcheIds = getMatchIds(currentMatches);

            if (currentMatchesIds && areSameMatchIds(newMatcheIds,currentMatchesIds)) return;
            currentMatchesIds = newMatcheIds;

            $scope.loaded = true;
            var pageText = pageService.highlightText({
                text: reportDataService.scanned_document.html.value,
                matches: currentMatches,
                sources: reportDataService.sources,
                mapType: 'sourceToSuspect',
                disableTooltip: true
            });

            pageText = iframeService.getIframeText(pageText);

            var iframe = document.getElementById('sourceIframe');
            $(iframe).attr('srcdoc', pageText);

            $rootScope.$broadcast('registerAffix', {type: 'html'});
        }

        $scope.$on('isEmptySources', function () {
            //console.log('hehe2');
            $scope.isSwitchTypeVisible = true;
        });

        function hasSomeMatches(currentMatches) {
            if (currentMatches.identical && currentMatches.identical.length > 0) return true;
            if (currentMatches.relatedMeaning && currentMatches.relatedMeaning.length > 0) return true;
            if (currentMatches.similar && currentMatches.similar.length > 0) return true;
            return false;
        }

        window.addEventListener("message", receiveMessage, false);

        function receiveMessage(event) {
            if (!event || !event.data)return;

            var eventData = null;
            try{
                eventData  = JSON.parse(event.data)
            } catch (ex) {
                return;
            }
            
            if (eventData.type !== "copyleaksMatchClicked") return;

            $timeout(function(){
                $scope.clicked(eventData.rangeIds);
            });
        }

        function areSameMatchIds(newMatcheIds, currentMatchesIds) {
            return compareObjects(newMatcheIds.identical, currentMatchesIds.identical) &&
                compareObjects(newMatcheIds.similar, currentMatchesIds.similar) &&
            compareObjects(newMatcheIds.relatedMeaning, currentMatchesIds.relatedMeaning);
        }

        function getMatchIds(matches) {
            var matchIds = {};

            matchIds.identical = underscore.pluck(matches.identical, 'id')
            matchIds.similar = underscore.pluck(matches.similar, 'id')
            matchIds.relatedMeaning = underscore.pluck(matches.relatedMeaning, 'id')
            matchIds.similar = underscore.pluck(matches.similar, 'id')

            return matchIds;
        }

        function compareObjects(o1, o2) {
            for (var p in o1) {
                if (o1.hasOwnProperty(p)) {
                    if (o1[p] !== o2[p]) {
                        return false;
                    }
                }
            }
            for (var p in o2) {
                if (o2.hasOwnProperty(p)) {
                    if (o1[p] !== o2[p]) {
                        return false;
                    }
                }
            }
            return true;
        };

        $scope.askForRefresh = underscore.throttle(function () {
            logService.log('Asked page matches to refresh');
            //console.log(' askForRefresh: ' + new Date());
            if ($scope.refreshedNow) {
                $scope.refreshedNow = false;
                return;
            }
            refreshMatches();
        }, 30000);

        $scope.clicked = function (ids) {
            if (ids.length == 1 && ids[0] == -1) {
                return;
            }

            var items = underscore.map(ids, reportDataService.getSourceIdFromMatchId);
            $scope.focusResults({ items: items });
        };

        $scope.exitLocked = function () {
            $scope.focusResults({});
        };
    }

    app.directive('cpHtmlPage', ["logService", "contentTypeService", function (logService, contentTypeService) {
        return {
            restrict: 'E',
            scope: {
                focusResults: '&',
                unfocus: '&',
                switchContentType: '&',
                text: '=?'
            },
            templateUrl: '/sources/v3/templates/multi-suspect/cp-html-page.html',
            controller: cpHtmlPageCntl,
            link: function (scope, elm, attr) {
                scope.$on('updatePageMatches', function () {
                    if (contentTypeService.contentType.isText()) return;
                    logService.log("cp-text-page: currentMatches changed!");
                    scope.askForRefresh();// Auto update the current matches when list is changed.
                });
                scope.$on('updatePageMatchesNow', function () {
                    if (contentTypeService.contentType.isText()) return;
                    //console.log('updatePageMatchesNow: ' + new Date());
                    scope.refreshMatches();
                    scope.refreshedNow = true;
                });
            }
        };
    }]);
}
