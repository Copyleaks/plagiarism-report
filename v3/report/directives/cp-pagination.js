"use strict";

function attach_cpPagination(app) {
    cpPaginationCntl.$inject = ["$scope", "logService", "settingsService", "$window", "utilitiesService"];
    function cpPaginationCntl($scope, logService, settingsService, $window, utilitiesService) {
        //var pagesToHighlight = []; // Empty by default. Nothing to highlight yet.
        var pagesToHighlight = {
            a: [],
            get g() {
                return angular.merge({},this.a);
            },
            set s(x) {
                this.a = x;
            }
        };

        if ($scope.pagination.ready) $scope.savedCurrent = $scope.pagination.current;
        function fixCurrentUndefined() {
            if ($scope.pagination.current === undefined) {
                $scope.pagination.current = $scope.savedCurrent;
            }
        }

        $scope.source_next = function () {
            if (!$scope.pagination.ready)
                return;

            fixCurrentUndefined();
            if ($scope.pagination === undefined || $scope.pagination.total_pages === $scope.pagination.current)
                return;

            $scope.pagination.current += 1;
            updatePagination()
        };

        $scope.source_back = function () {

            if (!$scope.pagination.ready)
                return;

            fixCurrentUndefined();
            if ($scope.pagination === undefined || $scope.pagination.current <= 1)
                return;

            $scope.pagination.current -= 1;
            updatePagination();
        };

        $scope.findMatchBackwards = function () {
            if (!$scope.pagination.ready)
                return;

            fixCurrentUndefined();
            if ($scope.pagination.total_pages <= 1)
                return;

            var match = getPrevPageMatch();
            if (match) {
                $scope.pagination.current = match.index;
                updatePagination()
            }

        };

        function getPrevPageMatch() {
            if ($scope.pagination.current === undefined) return;
            if ($scope.pagination.current > 1) {
                var startIndex = 0;
                var lastIndex = $scope.pagination.current - 2;
                for (var i = lastIndex; i >= 0; i--) {
                    if (pagesToHighlight.g[i] != matchType.noMatch) {
                        return {
                            index: i + 1,
                            matchType: pagesToHighlight.g[i]
                        };
                    }
                }
            }
        }

        $scope.findMatchForwards = function () {
            if (!$scope.pagination.ready)
                return;

            fixCurrentUndefined();
            if ($scope.pagination.current === $scope.pagination.total_pages)
                return;

            var nextMatch = getNextPageMatch();
            if (nextMatch) {
                $scope.pagination.current = nextMatch.index;
                updatePagination()
            }
        };

        function getNextPageMatch() {
            if ($scope.pagination.current === undefined) return;
            if ($scope.pagination.current < $scope.pagination.total_pages) {
                var startIndex = $scope.pagination.current;
                var lastIndex = $scope.pagination.total_pages;
                for (var i = startIndex; i < lastIndex; i++) {
                    if (pagesToHighlight.g[i] != matchType.noMatch) {
                        return {
                            index: i + 1,
                            matchType: pagesToHighlight.g[i]
                        };
                    }
                }
            }
        }

        function updatePagination() {
            $scope.onChanged({ pagination: $scope.pagination });
            $scope.setNextMatchesButtons();
        }

        $scope.page_changed = function () {
            if ($scope.pagination.current == undefined) {
                $scope.pagination.current = $scope.savedCurrent;
                return;
            }
            updatePagination()
        };

        $scope.updateNavButtons = function () {
            logService.log('updateNavButtons() called');

            if ($scope.pagination.current == undefined) return;
            if (!$scope.pagination.ready) {
                $scope.source_next_disabled = false;
                $scope.source_back_disabled = false;
                return;
            }
            $scope.source_next_disabled = $scope.pagination.total_pages === $scope.pagination.current;
            $scope.source_back_disabled = $scope.pagination.current === 1;
        };

        $scope.setNextMatchesButtons = function () {
            var nextMatch = getNextPageMatch();
            if (nextMatch) {
                $scope.isExistMatchesForward = true;
            } else {
                $scope.isExistMatchesForward = false;
            }

            var prevMatch = getPrevPageMatch();
            if (prevMatch) {
                $scope.isExistMatchesBackward = true;
            } else {
                $scope.isExistMatchesBackward = false;
            }
        }

        $scope.isExistMatchesBackward = false;
        $scope.isExistMatchesForward = false;

        $scope.$on('updateNavigationButtons', function () {
            $scope.updateNavButtons();
        });
        $scope.updateNavButtons();

        var matchType = {
            noMatch: 0,
            related: 3,
            similar: 2,
            identical: 1
        };

        function highlightByPage(sources) {
            var settings = settingsService.instance;

            if (!settings) return;
            if (!$scope.pagination.ready) return;
            if (!sources) return;

            logService.log('cpPagination: highlightByPage');

            var pagesList = [];

            sources = underscore.filter(sources, function (s) {
                return s.is_active && s.status == 0;
            });

            sources = underscore.sortBy(sources, 'matchedWords').reverse();

            var firstIndex = 0;
            var lastIndex = $scope.pagination.total_pages;

            for (var pageIndex = firstIndex ; pageIndex < lastIndex; ++pageIndex) {
                pagesList[pageIndex] = matchType.noMatch;

                if (settings.showIdentical)
                    checkPageForMatchesOfType(pagesList, sources, 'identical', matchType.identical, pageIndex);

                if (pagesList[pageIndex] != matchType.noMatch) continue;

                if (settings.showSimilar)
                    checkPageForMatchesOfType(pagesList, sources, 'similar', matchType.similar, pageIndex);

                if (pagesList[pageIndex] != matchType.noMatch) continue;

                if (settings.showRelated)
                    checkPageForMatchesOfType(pagesList, sources, 'relatedMeaning', matchType.related, pageIndex);
            }

            pagesToHighlight.s = angular.merge({},pagesList);
            $scope.setNextMatchesButtons();
        }

        function checkPageForMatchesOfType(pagesList, sources, matchTypeProperty, matchType, pageIndex) {
            var sourceIndex;
            for (sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
                if (sources[sourceIndex].splitMatchesText
                    && sources[sourceIndex].splitMatchesText[matchTypeProperty]
                    && sources[sourceIndex].splitMatchesText[matchTypeProperty][pageIndex]
                    && sources[sourceIndex].splitMatchesText[matchTypeProperty][pageIndex].groupId
                    && sources[sourceIndex].splitMatchesText[matchTypeProperty][pageIndex].groupId.length > 0)
                    pagesList[pageIndex] = matchType;
                break;
            }
        }

        function SetNextPaginationButtonsColors() {
            if (!$scope.pagination.ready) return;

            var foundIdentical = false,
                foundRelated = false,
                foundSimilar = false;
            if ($scope.pagination.current > 1) {
                var startIndex = 0;
                var lastIndex = $scope.pagination.current - 1;
                for (var i = startIndex; i < lastIndex ; i++) {
                    if (pagesToHighlight.g[i] != matchType.noMatch) {

                    }
                }
            }

            if ($scope.pagination.total_pages !== $scope.pagination.current) {

            }
        }

        $scope.control.recomputePageColors = underscore.debounce(function (sources) {
            logService.log('cpPagination: recomputePageColors');

            $scope.$apply(function () {
                highlightByPage(sources);
            });

        }, 1000);

        if ($scope.initialSources) {
            highlightByPage($scope.initialSources);
        }

    }

    app.directive('cpPagination', function () {
        return {
            restrict: 'E',
            scope: {
                pagination: '=',
                onChanged: '&',
                control: '=',
                initialSources: '=?'
            },
            templateUrl: '/v3/templates/cp-pagination.html',
            controller: cpPaginationCntl,
            link: function (scope, elm, attr) {
                scope.$watch('pagination.current', function (newValue, oldValue) {
                    if (newValue == oldValue) return;

                    if (newValue !== undefined) {
                        scope.savedCurrent = newValue;
                        scope.updateNavButtons();
                    }

                }, true);
            }
        };
    });

    app.directive('updateOnEnter', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.bind("keyup", function (ev) {
                    if (ev.keyCode == 13) {
                        ctrl.$commitViewValue();
                        scope.$apply(function () {
                            if (ctrl) ctrl.$setTouched();
                        });
                    }
                });
            }
        }
    });
}
