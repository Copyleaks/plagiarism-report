"use strict";

function attach_cpSources(app) {
    cpSourcesCntl.$inject = ["$scope", "utilitiesService", "settingsService", "$timeout", "filterDialogService", "logService", 'reportDataService', 'contentTypeService', 'DataService', '$rootScope', 'settingsDialogService'];
    attachBindHtmlCompile(app);

    function cpSourcesCntl($scope, utilitiesService, settingsService, $timeout, filterDialogService, logService, reportDataService, contentTypeService, DataService, $rootScope, settingsDialogService) {
        $scope.settings = settingsService.instance;
        $scope.MODE_NORMAL = 0;
        $scope.MODE_LOCKED = 1;
        $scope.mode = $scope.MODE_NORMAL;
        $scope.sourcesToShow = [];
        $scope.numOfSources = 0;
        $scope.totalSources = 0;

        initShowHide();
        function initShowHide() {

            $(window).scroll(function () {
                if ($(window).width() >= 768) return;
                if ($scope.sourcesVisible) return;
                $timeout(function () {
                    $scope.hideSources();
                })
            });


            $(window).resize(function () {
                $scope.isMobile = $(window).width() < 768;
                if ($(window).width() >= 768) {
                    if (!$scope.sourcesVisible) {
                        showSources();
                    }
                    return;
                }
                if ($scope.sourcesVisible) return;
                $timeout(function () {
                    $scope.hideSources();
                })
            });

            $scope.toggleSourcesVisibility = function ($event) {
                if ($(window).width() >= 768) return;
                $event.stopPropagation();
                $scope.sourcesVisible ? $scope.hideSources() : $scope.showSources();
            }

            $scope.hideSources = function () {
                if ($(window).width() >= 768) return;
                var headingHeight = $('#sources-panel-heading').outerHeight();
                var actualResultElement = $('.actual-results');
                actualResultElement.stop();
                actualResultElement.css('overflow', 'hidden');

                if (!$scope.sourcesVisible) {
                    actualResultElement.height(headingHeight);
                    actualResultElement.css('top', 'auto');
                    actualResultElement.animate({
                        bottom: 0,
                    }, 300, function () {
                        $timeout(function () {
                            $scope.sourcesVisible = false;
                        });
                    });
                } else {
                    actualResultElement.animate({
                        top: window.innerHeight,
                    }, 300, function () {
                        $timeout(function () {
                            actualResultElement.height(headingHeight);
                            actualResultElement.css('bottom', 0);
                            actualResultElement.css('top', 'auto');
                            $scope.sourcesVisible = false;
                        })
                    });
                }

                utilitiesService.clearObject($scope.lockedSources);
                $scope.mode = $scope.MODE_NORMAL;
                $scope.refreshSources();
                
            }

            function showSources() {
                var actualResultElement = $('.actual-results');

                actualResultElement.stop();
                actualResultElement.animate({
                    height: '100%',
                    top: 0,
                    bottom: 'auto',
                }, 300, function () {
                    $timeout(function () {
                        $scope.sourcesVisible = true;
                        actualResultElement.css('overflow', 'auto');

                    })
                });
            }

            $scope.showSources = function () {
                if ($(window).width() >= 768) return;
                showSources();
            }
            
            $scope.control.show = $scope.showSources;

            $scope.isMobile = $(window).width() < 768;

            $timeout($scope.hideSources, 2000);
        }

        $scope.update_source_status = function () {
            $scope.selectionChanged({});
        };

        $scope.refreshSources = function () {
            logService.log('cpSources: refreshSources');
            $scope.totalSources = Object.keys($scope.sources).length;
            if ($scope.lockedSources && Object.keys($scope.lockedSources).length > 0) {
                var filteredSources = [];
                for (var id in $scope.sources)
                    if (id in $scope.lockedSources)
                        filteredSources.push($scope.sources[id]);

                $scope.numOfSources = filteredSources.length;
                $scope.mode = $scope.MODE_LOCKED;
                $scope.sourcesToShow = filteredSources;
            }
            else {
                if (!($scope.pagination)) {
                    $scope.numOfSources = Object.keys($scope.sources).length;
                    $scope.sourcesToShow = underscore.map($scope.sources, function (source) { return source; });
                }
                else {
                    var filteredResults = getFilteredResults();
            
                    $scope.numOfSources = filteredResults.length;
                    $scope.mode = $scope.MODE_NORMAL;
                    $scope.sourcesToShow = filteredResults;
                }
            }
        };

        $scope.goToSingleSuspectReport = function (source) {
            if (source.status != DataService.eSourceStatus.completed) return;

            reportDataService.resultId = source.id;
            $rootScope.$broadcast('switchToSingleSuspectReport');
        }

        function getFilteredResults() {
            var filteredResults = [];
            var source;
            var currentPageIndex = $scope.pagination.current - 1; // Zero based    
            var someSourceHasNoMatches = false;//only show empty if all results have empty matches
            var sourcesToLookForMatches = settingsService.getMaxSourcesWithMatches($scope.sources);

            if (sourcesToLookForMatches.length > 0) {
                if (settingsService.instance.showPageSources) {
                    for (var item in sourcesToLookForMatches) {
                        source = sourcesToLookForMatches[item];
                        if (!source.hasOwnProperty('matches')) {
                            someSourceHasNoMatches = true;
                        }
                        if (source.status === 0 /* Ready */ && source.hasOwnProperty('matches')){
                            if (source.matches.identical && source.matches.identical[currentPageIndex] && source.matches.identical[currentPageIndex].length > 0)
                                filteredResults.push(source);
                            else if (source.matches.similar && source.matches.similar[currentPageIndex] && source.matches.similar[currentPageIndex].length > 0)
                                filteredResults.push(source);
                            else if (source.matches.relatedMeaning && source.matches.relatedMeaning[currentPageIndex] && source.matches.relatedMeaning[currentPageIndex].length > 0)
                                filteredResults.push(source);
                        }   
                    }
                    $scope.isPageEmpty = filteredResults.length == 0 && !someSourceHasNoMatches; 
                } else {
                    for (var item in sourcesToLookForMatches) {
                        source = sourcesToLookForMatches[item];
                        filteredResults.push(source);
                    }
                }
            }
            return filteredResults;
        }

        $scope.changeVisibilityAndUpdateIfEnter = function ($event, source) {
            if ($event.keyCode !== 13) return;

            $scope.changeVisibilityAndUpdate(source);
        }

        $scope.changeVisibilityAndUpdate = function (source) {
            $scope.changeSourceVisibilityStatus(source);
            $scope.update_source_status();
        }

        $scope.changeSourceVisibilityStatus = function (source) {
            source.is_active = !source.is_active;
        };


        $scope.exitLockedModeIfNotInMobile = function ($event) {
            $scope.exitLockedMode($event);
        };

        $scope.exitLockedMode = function ($event) {
            $event.stopPropagation();
            utilitiesService.clearObject($scope.lockedSources);
            $scope.mode = $scope.MODE_NORMAL;
            $scope.refreshSources();
        };

        
        // #region Settings dialog

        $scope.showSettings = function ($event) {
            $event.stopPropagation();
            settingsDialogService.show();
        }

        // #endregion

        // #region Filter sources

        $scope.showFilter = function ($event) {
            $event.stopPropagation();
            filterDialogService.show();
        }
        // #endregion
        $scope.control.refresh = utilitiesService.throttleWithGuaranteedLastRun(function () {
            if ($scope.sources != null) {
                $scope.refreshSources();
                
            }
        }, 1000);

        $scope.control.showEmpty = function () {
            $scope.isEmpty = true;
        };
        $scope.reportDataService = reportDataService;
    }

    app.directive('cpSources', ["logService", function (logService) {
        return {
            restrict: 'E',
            scope: {
                sources: '=',
                selectionChanged: '&',
                lockedSources: '=',
                pagination: '=',
                control: '='
            },
            templateUrl: '/v1/templates/multi-suspect/cp-sources.html',
            controller: cpSourcesCntl,
            link: function (scope, elm, attr) {
                scope.$watchCollection('sources', function (newValue, oldValue) {
                    logService.log('sources changed.');
                    if (newValue !== oldValue) 
                        scope.refreshSources();
                });
                scope.$watch('lockedSources', function (newValue, oldValue) {
                    logService.log('lockedSources changed.');
                    if (newValue !== oldValue) {
                        scope.refreshSources();
                        
                    }
                }, true);                
            }
        };
    }]);
}
