function attach_multiSuspectController(app) {
    app.controller('multi-suspect-ctrl', ["$scope", "$window", "$location", "$http", "$timeout", "utilitiesService", "statisticsService", "settingsService", "logService", 'shareDialogService', 'pageService', 'affixService', 'reportDataService', '$rootScope','contentTypeService','reportServiceListener','sourcesService','DataService','reportServiceMediator',
        function ($scope, $window, $location, $http, $timeout, utilitiesService, statisticsService, settingsService, logService, shareDialogService, pageService, affixService, reportDataService, $rootScope, contentTypeService, reportServiceListener, sourcesService, DataService, reportServiceMediator) {
        $('html').css('maxHeight', 'auto');
        if ($scope.comingFromBusinessReport) return;
        reportDataService.type = reportDataService.reportTypes.multipleSuspects;
        $scope.$emit('recalculateHeaderSegments');
        $scope.reportDataService = reportDataService;
        
        $scope.$on('on-element-resized', function () {
            reportHeightToParent();
        });

        function reportHeightToParent() {
            var height = getReportHeight();
            if (isNaN(height)) return;
            window.parent.postMessage(JSON.stringify(height), "*");
        }

        $timeout(reportHeightToParent, 1000);

        function getReportHeight() {
            var totalHeight = $('.contributing-to-height-1').height() +
                $('.contributing-to-height-report-info').height() +
                $('.contributing-to-height-scan-properties').height() +
                $('.contributing-to-height-page').height() + 100;

            return totalHeight;
        }

        window.addEventListener('popstate', handlePopState);
        $scope.$on('$destroy', function () {
            window.removeEventListener('popstate', handlePopState);
        });

        function handlePopState(event) {
            if (event.state) return;
            var pageNumber = location.href.substr(location.href.lastIndexOf('/') + 1)
            var numberPattern = /\d+/g;
            pageNumber.match(numberPattern)[0]
            pageNumber = pageNumber.match(numberPattern);
            load_page(pageNumber, false);
        };

        function scrollToTop() {
            $scope.okToAffix = false;
            try {
                var topOfPage = $(".contributing-to-height-page").offset().top;
            } catch (err){

            }
            if (isNaN(topOfPage)) topOfPage = 0;

            $('html').animate({ scrollTop: topOfPage }, 'slow', function () {
                $scope.okToAffix = true;
            });
        }
        scrollToTop();
        
        $scope.document_pagination = {
            current: -1,
            total_pages: -1,
            ready: false
        };

        $scope.lockedSources = {};
        $scope.sources = reportDataService.sources;

        $scope.sourceListControl = {};
        $scope.paginationControl = {};
        $scope.paginationControl.getMaxPagination = utilitiesService.getMaxPaginationCount;
        
        function setPaginationLength() {
            var pages = reportDataService.scanned_document.pages;
            $scope.document_pagination.total_pages = pages.length;
        }

        function load_page(pageNum, checkSamePage) {
            if (!reportDataService.scanned_document || !reportDataService.scanned_document.pages)
                return;

            $scope.document_pagination.ready = true;
            $scope.document_pagination.current = parseInt(pageNum);
            setPaginationLength();
            if (reportDataService.pageNum != pageNum || checkSamePage === false) {
                scrollToTop();
                reportDataService.pageNum = pageNum;
                if ($scope.removeAffix) $scope.removeAffix();
                $timeout(function () {
                    //ga('send', 'pageview', location.pathname);
                }, 10);

            }
            raiseSourceListRefresh();
            $scope.updateCurrentPageMatches();
            callUpdateNow();
        }

        function callUpdateNow() {
            $rootScope.$broadcast('updatePageMatchesNow');
        }

        /**
         * Update the object `$scope.current_page_matches` with the current page
         * matches for disply. The display of this member is 'cp-text-page' responsibility
         *
         */
        var inUpdateCurrentPageMatches = false;
        $scope.$on('updatePageMatches', function () {
            if (inUpdateCurrentPageMatches) return;
            $scope.updateCurrentPageMatchesAndStatistics ();
        });

        $scope.updateCurrentPageMatchesAndStatistics = function () {
            console.log('updateCurrentPageMatchesAndStatistics');
            $scope.updateCurrentPageMatches();
            cb_last_sourceRequestSent();
        }

        $scope.updateCurrentPageMatches = function () {
            logService.log('updateCurrentPageMatches() called.')
            if (!$scope.document_pagination.ready)
                return;

            inUpdateCurrentPageMatches = true;
            $scope.$broadcast('updatePageMatches');
            inUpdateCurrentPageMatches = false;
        }

        $scope.updateCurrentPageMatchesThrotteled = utilitiesService.throttleWithGuaranteedLastRun($scope.updateCurrentPageMatches, 1000);

        $scope.getMoreResults = function () {
            if (!settingsService.instance.showOnlyTopResults) {
                throw new Error('not implemented');
            }
        }
        $scope.$on('getMoreResults', $scope.getMoreResults);


        // #region Settings managment
        function handleReportNotify(message) {
            var type = message.type, params = message.params;
            switch (type) {
                case 'cb_process_info_success':
                    cb_process_info_success(params.info);
                    break;
                case 'cb_scanned_document_success':
                    cb_scanned_document_success();
                    break;
                case 'new_result_recieved':
                    new_result_recieved(params.result);
                    break;
                case 'cb_result_ready':
                    cb_result_ready(params.result);
                    break;
                case 'cb_last_sourceRequestSent':
                    console.log('cb_last_sourceRequestSent');
                    cb_last_sourceRequestSent();
                    break;
                case 'cb_emptySources':
                    cb_emptySources();
                    break;
                case 'cb_scanned_document_error':
                    cb_scanned_document_error();
                    break;
                case 'result_matches_recieved':
                    break;
                case 'existing_results_with_matches':
                    existing_results_with_matches();
                    break;
                case 'incoming_results':
                    break;
                default:
                    $timeout(function () {
                        throw new Error('out of range: ' + type);
                    });
                    break;
            }
        }

        function existing_results_with_matches() {
            cb_last_sourceRequestSent();
        }

        function handleReportErrors(message) {
            var type = message.type, params = message.params;
            switch (type) {
                default:
                    $timeout(function () {
                        throw new Error('out of range: ' + type);
                    });
                    break;
            }
        }

        function handleReportSuccess(type, params) {
            switch (type) {
                default:
                    $timeout(function () {
                        throw new Error('out of range: ' + type);
                    });
                    break;
            }
        }

        $scope.start = function () {
            //reportDataService.scanned_document = null;
            //reportDataService.clearSourcesMatch();
            reportServiceListener.registerToEvents().then(
                handleReportSuccess,
                handleReportErrors,
                handleReportNotify)
        }

        $scope.start();
        // #endregion

        function cb_process_info_success(info) {
            $scope.info = info;
            $scope.$emit('hideLabelIfRequestIsInTheFuture');
        }
        
        // #region Scanned Document

        function cb_scanned_document_success() {
            if ($scope.switchingContentType) {
                setPaginationLength();
                $scope.$broadcast('updateNavigationButtons');
                $scope.switchingContentType = false;
            }
            if (reportDataService.pageNum)
                load_page(reportDataService.pageNum);
            else
                load_page(1);
        }

        function cb_scanned_document_error() {
            if ($scope.switchingContentType) {
                $scope.switchingContentType = false;
            }
        }

        // #endregion

        // #region UI commands

        $scope.focusResults = function (items) {
            $scope.unfocusResults();
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                if (item != null)
                    $scope.lockedSources[item] = item;
            }
                
            if ($(window).width() < 768) {
                if ($scope.sourceListControl && $scope.sourceListControl.show) {
                    $scope.sourceListControl.show();
                }
            }
        };

        $scope.unfocusResults = function () {
            utilitiesService.clearObject($scope.lockedSources);
        };

        $scope.source_page_changed = function (pagination) {
            reportServiceMediator.changeMultiSuspectPage(pagination.current);
            load_page(pagination.current);
        };

        // #endregion

        function new_result_recieved(result) {
            raiseSourceListRefresh();
            refreshPageMatchesIfResultMeetsPageAndSettingsCriteria(result);

        };

        function cb_result_ready(result) {
            refreshPageMatchesIfResultMeetsPageAndSettingsCriteria(result);
            raiseSourceListRefresh();
            if ($scope.paginationControl.recomputePageColors) $scope.paginationControl.recomputePageColors(reportDataService.sources);
        };

        function refreshPageMatchesIfResultMeetsPageAndSettingsCriteria(result) {
                var pageIndex = $scope.document_pagination.total > 1 ? $scope.document_pagination.current - 1 : 0;
                if ($scope.document_pagination.ready
                && result.matches
                && (result.matches.identical && result.matches.identical[pageIndex].length > 0
                    || result.matches.similar && result.matches.similar[pageIndex].length > 0
                    || result.matches.relatedMeaning && result.matches.relatedMeaning[pageIndex].length > 0))
                    $scope.updateCurrentPageMatchesThrotteled();
        }

        var staticsHaveBeenComputed = false;

        function getStatistics() {
            if (!reportDataService.info) return;
            logService.log('word count: ' + reportDataService.info.wordsCount);
            var wordCount = reportDataService.info.wordsCount;
            if (!wordCount) return null;
            if (statisticsService.haveDataForStatistics(reportDataService.sources)) {
                logService.log('sources for statistics: ');
                logService.log(reportDataService.sources);
                var statistics = statisticsService.computeStatistics(reportDataService.sources, wordCount, reportDataService.excludedRangeCount);
                return statistics;
            }
            return null;
        }

        function updateChildrenControls(statistics) {
            logService.log('updateChildrenControls');
            if (statistics) {
                logService.log('got statistics');
                $scope.$emit('showStatistics', statistics)
            }
            if ($scope.paginationControl.recomputePageColors) $scope.paginationControl.recomputePageColors(reportDataService.sources);
        }

        $scope.$on('updateGraph', function () {
            console.log('updateGraph');
            cb_last_sourceRequestSent();
        });

        $scope.$on('switchToSingleSuspectReport', function () {
            $scope.deregisterAffix();
        });

        function cb_emptySources() {
            if ($scope.info && $scope.info.status != 'Processing'
                && $scope.info.wordsCount) {
                if (reportDataService.showStatisticControls) {
                    var emptyResults = statisticsService.getEmpty($scope.info.wordsCount);
                    updateChildrenControls();
                    $scope.$emit('setControlToNoResultsState', emptyResults);
                }
                if ($scope.sourceListControl.showEmpty) $scope.sourceListControl.showEmpty();
            }
            reportDataService.noMatches = true;
            $scope.$broadcast('isEmptySources', emptyResults);
            $scope.isEmpty = true;
        }

        var lastRequestTimeout = null;
        function cancelLastRequestTimeout() {
            if (lastRequestTimeout) {
                $timeout.cancel(lastRequestTimeout);
                lastRequestTimeout = null;
            }
        }
        function cb_last_sourceRequestSent() {
            cancelLastRequestTimeout();
            if (reportDataService.scanProgressPercents != 100) {
                lastRequestTimeout = $timeout(cb_last_sourceRequestSent, 1000);
                return;
            }

            if (reportDataService.showStatisticControls) {
                var statistics = getStatistics();
            }
            updateChildrenControls(statistics);

            //guarantee statistics display on first load 
            if (reportDataService.showStatisticControls && !statistics) {
                lastRequestTimeout = $timeout(cb_last_sourceRequestSent, 1000);
                return;
            }
            callUpdateNow();
        }

        $scope.$on('raiseSourceListRefresh', raiseSourceListRefresh);

        function raiseSourceListRefresh() {
            if ($scope.sourceListControl.refresh) {
                $scope.sourceListControl.refresh();
            }
        }
            
        // #region Change content type
        $scope.switchToHtmlContentType = function () {
            contentTypeService.contentType.setToHtml();
            reportServiceMediator.switchReportContentType('html');
            clearData();
        }

        $scope.switchToTextContentType = function () {
            contentTypeService.contentType.setToText();
            reportServiceMediator.switchReportContentType('text');
            clearData();
        }

        function clearData() {
            reportDataService.excludedRangesPerPage = null;
            reportDataService.clearSourcesMatch();
            underscore.each(reportDataService.sources, function (source) {
                source.status = DataService.eSourceStatus.switchingType
            });
            $scope.switchingContentType = true;
            clearAffix();
            sourcesService.resetSourcesWithoutMatches(utilitiesService.length(reportDataService.sources))
            reportDataService.working = true;
            $scope.$broadcast('updateNavigationButtons');
            $scope.$broadcast('refreshSingleSuspectReportLinks');
        }

        function clearAffix() {
            scrollToTop();
            if ($scope.removeAffix) $scope.removeAffix();
            
        }
        // #endregion

        affixService.init($scope, '.my-target', 'my-affix');
    
    }]);


}