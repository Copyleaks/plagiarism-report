function attach_oneToOneReportController(app) {
    var count = 1;
    app.controller('one-to-one-ctrl', ["$scope", "$timeout", "utilitiesService", "statisticsService", "settingsService", "logService", 'shareDialogService', 'oneToOneReportService', 'pageService', 'reportDataService', 'scrollService', '$rootScope', 'contentTypeService', 'reportServiceListener', 'reportServiceMediator',
        function ($scope, $timeout, utilitiesService, statisticsService, settingsService, logService, shareDialogService, oneToOneReportService, pageService, reportDataService, scrollService, $rootScope, contentTypeService, reportServiceListener, reportServiceMediator) {
        reportDataService.type = reportDataService.reportTypes.singleSuspect;
        $scope.$emit('recalculateHeaderSegments');
        $scope.oneToOneReportService = oneToOneReportService;
        $scope.reportDataService = reportDataService;
        $scope.contentTypeService = contentTypeService;
        contentTypeService.noSuspectHtmlMatches = false;
        $scope.resultId = reportDataService.resultId;

        if (!reportDataService.pageNumSource) reportDataService.pageNumSource = 1;
        if (!reportDataService.pageNumResult) reportDataService.pageNumResult = 1;

        function setPageIndexes() {
            $scope.sourcePageIndex = Number(reportDataService.pageNumSource);
            $scope.resultPageIndex = Number(reportDataService.pageNumResult);
        }
        setPageIndexes();


        $scope.page1Control = {};
        $scope.page2Control = {};
        $scope.sourcePaginationObject = {
            control: {},
            pagination: {
                ready: false
            }
        }
        $scope.suspectPaginationObject = {
            control: {},
            pagination: {
                ready: false
            }
        }

        if (window.maxHeight) {
            $('html').css('maxHeight', window.maxHeight + 'px');
        }


        $scope.$on('gotParentHeight', function () {
            $('html').css('maxHeight', window.maxHeight + 'px');
        });

        function reportHeightToParent() {
            var height = getReportHeight();
            if (isNaN(height)) return;
            //console.log('total height: ' + height);
            window.parent.postMessage(JSON.stringify(height), "*");
        }

        $timeout(reportHeightToParent, 1000);

        $scope.$on('on-element-resized', function () {
            reportHeightToParent();
        });

        function getReportHeight() {
            var totalHeight = $('.contributing-to-height-1').height() +
                $('.contributing-to-height-report-info').height() +
                $('.contributing-to-height-scan-properties').height() +
                $('.source-page').height() + 100;

            return totalHeight;
        }

        $scope.sourceMatchSelected = function (matchId) {
            if (contentTypeService.contentType.isHtml() && $scope.suspectResult.matches.html) {
                $scope.page2Control.scrollToMatch(matchId);
                return;
            }

            scrollService.setSuspectMatchToScrollTo(matchId[0]);
            var pageIndex = getPageContainingMatch(matchId[0], oneToOneReportService.getSource(),
                $scope.suspectResult.matches.text.pages.startPosition, "suspect");
            if ($scope.suspectPaginationObject.pagination.current != pageIndex + 1) {
                $scope.suspectPaginationObject.pagination.current = pageIndex + 1;
                //scrollService.recordSourcePageTopLocation();// keep page location for pages that did not change, so the user doesn't get a page jump
                $scope.resultPagechanged(true);
            } else {
                scrollService.scrollSuspect($scope.page2Control);
            }
        }

        $scope.suspectMatchSelected = function (matchId) {
            if (contentTypeService.contentType.isHtml()) {
                $scope.page1Control.scrollToMatch(matchId);
                return;
            }

            scrollService.setSourceMatchToScrollTo(matchId[0]);

            var pageIndex = getPageContainingMatch(matchId[0], oneToOneReportService.getSource(),
                reportDataService.scanned_document.text.pages.startPosition, "source");
            if ($scope.sourcePaginationObject.pagination.current != pageIndex + 1) {
                $scope.sourcePaginationObject.pagination.current = pageIndex + 1;
                //scrollService.recordSuspectPageTopLocation();// keep location if clicked in panel
                $scope.sourcePageChanged();
            } else {
                scrollService.scrollSource($scope.page1Control);
            }
        }

        function getMatchProperty(type) {
            switch (type) {
                case 'i':
                    return 'identical';
                case 's':
                    return 'similar';
                case 'r':
                    return 'relatedMeaning';
                default:
                    throw new Error('argument out of range');
            }
        }


        //Find which page has the match
        function getPageContainingMatch(matchId, matches, pageRanges, targetType) {
            var matchGroup = getMatchGroupForMatchId(matchId, matches.matches.text.comparison);
            var gid = Number(matchId.substr(matchId.lastIndexOf('_') + 1));
            var matchIndex = matchGroup.groupId.indexOf(gid);
            var matchProperty = targetType == "source" ? "source" : "suspected";
            var startIndex = matchGroup[matchProperty].chars.starts[matchIndex];

            var pageIndex = getPageIndexContainingIndex(pageRanges, startIndex);
            return pageIndex;
        }

        function getMatchGroupForMatchId(matchId, matches) {
            var matchGroupTypeCharacter = matchId.substr(0, 1);
            switch (matchGroupTypeCharacter) {
                case 'i':
                    return matches.identical;
                case 'r':
                    return matches.relatedMeaning;
                case 's':
                    return matches.minorChanges;
            }
        }

        function getPageIndexContainingIndex(ranges, index) {
            for (var pageIndex = ranges.length - 1; pageIndex > 0; pageIndex--) {
                var rangeStart = ranges[pageIndex];
                if (index >= rangeStart) break;
            }
            return pageIndex;
        }

        function findMatch(clickedMatch, result, startProperty, ranges) {
            var pageIndex = getPageIndexContainingIndex(ranges, clickedMatch.SuS)

            var zeroBasedSuS = clickedMatch.SuS - ranges[pageIndex];

            var matchType = getMatchProperty(clickedMatch.type);

            var storedUnsplittedMatch = underscore.find(result.matches[matchType][pageIndex],
                function (matchParameter) { return matchParameter[startProperty] == zeroBasedSuS });

            return {
                pageIndex: pageIndex,
                match: storedUnsplittedMatch
            };
        }

        $scope.$on('setSingleSuspectSourcePage', function (event, data) {
            reportDataService.pageNumSource = $scope.sourcePaginationObject.pagination.current = data.pageNumber;
            handleSourcePageChange();
        })

        $scope.sourcePageChanged = function (fromClick) {
            if (!fromClick)
                scrollService.recordSuspectPageTopLocation();//keep page location for pages that did not change, so the user doesn't get a page jump

            reportDataService.pageNumSource = $scope.sourcePaginationObject.pagination.current;
            reportServiceMediator.changeSingleSuspectSourcePage(reportDataService.pageNumSource);
            handleSourcePageChange();
        }

        function handleSourcePageChange() {
            setPageIndexes();
            initScopeVariablesWhenSourceTextIsAvailable();
            highlightSourceText();
            $scope.page1Control.setText($scope.sourceText);
        }

        
        $scope.$on('setSingleSuspectSuspectPage', function (event, data) {
            reportDataService.pageNumResult = $scope.suspectPaginationObject.pagination.current = data.pageNumber;
            handleSuspectPageChange();
        })

        $scope.sourcePaginationObject.changed = $scope.sourcePageChanged;

        $scope.resultPagechanged = function resultPagechanged(fromClick) {
            if (!fromClick)
                scrollService.recordSourcePageTopLocation();// keep page location for pages that did not change, so the user doesn't get a page jump

            reportDataService.pageNumResult = $scope.suspectPaginationObject.pagination.current;
            reportServiceMediator.changeSingleSuspectSuspectPage(reportDataService.pageNumResult);
            handleSuspectPageChange();
        }

        function handleSuspectPageChange() {
            setPageIndexes();
            initScopeVariablesWhenResultIsAvailabe();
            highlightResultText();
            $scope.page2Control.setText($scope.resultText);
        }

        $scope.suspectPaginationObject.changed = $scope.resultPagechanged;
        $scope.result = oneToOneReportService.getSource();
        if (!$scope.suspectResult) $scope.suspectResult = oneToOneReportService.getSuspect();

        function storedDataMatchesContentType() {
            var contentType = contentTypeService.contentType.get();
            if (!contentType) return true;

            if (contentTypeService.isHtmlContentType($scope.result.contentType)) {
                return contentTypeService.contentType.isHtml();
            } else {
                return contentTypeService.contentType.isText();
            }
        }
        
        if ($scope.suspectResult &&
            $scope.result &&
            $scope.result.matches &&
            $scope.result.matches.pages &&
            $scope.reportDataService.scanned_document &&
            storedDataMatchesContentType()) {
            listenToServiceCallbacks(reportServiceListener.registerToEvents());
            initWithExistingData();
        } else {
            initNewData();
        }

        function initWithExistingData() {

            if ($scope.result.matches.html == null || $scope.result.matches.html.value == null){
                contentTypeService.noSuspectHtmlMatches = true;
                contentTypeService.contentType.setToText();
            }
            var suspectRanges = null;
            if (contentTypeService.isHtmlContentType($scope.result.contentType))
                suspectRanges = [0];
            else
               suspectRanges = $scope.result.matches.text.pages.startPosition;
            
            var spliter = new PagesSpliter();
            reportDataService.suspectPages = spliter.splitText($scope.result.text, suspectRanges);
            initScopeVariablesWhenSourceTextIsAvailable();
            initScopeVariablesWhenResultIsAvailabe();
            //get text for both sides
            callUpdateChildrenControls();

            highlightSourceText();
            highlightResultText();

            $timeout(function () {
                if ($scope.page1Control.setText) $scope.page1Control.setText($scope.sourceText);
                if ($scope.page2Control.setText) $scope.page2Control.setText($scope.resultText);
            })
        }

        function listenToServiceCallbacks(promise) {
            promise.then(
                handleReportSuccess,
                handleReportErrors,
                handleReportNotify);
        }
        function initNewData() {
            listenToServiceCallbacks(reportServiceListener.registerToEvents());
        }

        function handleReportNotify(message) {
            var type = message.type, params = message.params;
            switch (type) {
                case 'cb_scanned_document_success':
                    cb_scanned_document_success();
                    break;
                case 'new_result_recieved':
                    new_result_recieved(params.result);
                    break;
                case 'cb_result_ready':
                    cb_result_ready();
                    break;
                case 'cb_last_sourceRequestSent':
                    break;
                case 'cb_emptySources':
                    cb_emptySources();
                    break;
                case 'incoming_results':
                    incomingResults(params.sources);
                    break;
                case 'result_matches_recieved':
                    result_matches_recieved(params.suspectId, params.match);
                    break;
                case 'existing_result_with_matches':
                    existing_result_with_matches(params.result);
                    break;
                    
                default:
                    $timeout(function () {
                        throw new Error('out of range: ' + type);
                    });
                    break;
            }
        }

        function incomingResults(sources) {

            var source = underscore.find(sources.results.all, function (s) { return s.id == reportDataService.resultId });
            //oneToOneReportService.setSource(angular.merge({}, source));
            oneToOneReportService.setSource(source);
            reportDataService.resultTitle = source.title;
        }

        function existing_result_with_matches(result) {

            if (result.matches.html == null || result.matches.html.value == null) {
                contentTypeService.noSuspectHtmlMatches = true;
                contentTypeService.contentType.setToText();
            }

            oneToOneReportService.setSource(angular.merge({}, result));
            reportDataService.resultTitle = result.title;

            oneToOneReportService.resultSuccess(
                result.matches);
            fillScopeVariables();
        }

        function result_matches_recieved(suspectId, match) {
            if (suspectId != reportDataService.resultId) return;

            if (match.html == null) {
                contentTypeService.contentType.setToText();
                contentTypeService.noSuspectHtmlMatches = true;
                initScopeVariablesWhenSourceTextIsAvailable()
            }
                
            oneToOneReportService.resultSuccess(match);
            fillScopeVariables();
        }

        function fillScopeVariables() {
            $scope.result = oneToOneReportService.getSource();
            $scope.page1Control.hasResult = true;
            $scope.page2Control.hasResult = true;

            initScopeVariablesWhenResultIsAvailabe();
            
            callUpdateChildrenControls();

            highlightSourceText();
            highlightResultText();

            $timeout(function () {
                if ($scope.page1Control.setText) $scope.page1Control.setText($scope.sourceText);
                if ($scope.page2Control.setText) $scope.page2Control.setText($scope.resultText);
            })
        }

        function new_result_recieved(result) {
            oneToOneReportService.setSource(angular.merge({}, result));
            reportDataService.resultTitle = result.title;
        }

        function handleReportSuccess(type, params) {
        }

        function handleReportErrors(type, params) {
            switch (type) {
                case 'cb_scanned_document_error':
                    cb_scanned_document_error(params.response);
                    break;
                case 'cb_failed_to_get_resources':
                    break;
                default:
                    $timeout(function () {
                        throw new Error('out of range: ' + type);
                    });
                    break;
            }
        }

        function cb_scanned_document_success() {
            initScopeVariablesWhenSourceTextIsAvailable();
            highlightSourceText();
            $scope.showDocument = true;
            if ($scope.page1Control.setText) $scope.page1Control.setText($scope.sourceText);
            $scope.$emit('hideLabelIfRequestIsInTheFuture');
            callUpdateChildrenControls();
        }

        
        function cb_scanned_document_error(response) {
            $scope.showDocument = false;
        }

        function cb_result_ready() {
            initScopeVariablesWhenResultIsAvailabe();
            highlightResultText();
            highlightSourceText();
            if ($scope.page1Control.setText) $scope.page1Control.setText($scope.sourceText);
            if ($scope.page2Control.setText) $scope.page2Control.setText($scope.resultText);
            callUpdateChildrenControls();
        };

        function cb_emptySources() {
            if (reportDataService.scanned_document && reportDataService.scanProgressPercents == 100
                && reportDataService.scanned_document.metadata.words) {
                if (reportDataService.showStatisticControls) {
                    var emptyResults = statisticsService.getEmpty(reportDataService.scanned_document.metadata.words);
                    updateChildrenControls();
                    $scope.$emit('setControlToNoResultsState', emptyResults);
                }
                if ($scope.sourceListControl.showEmpty) $scope.sourceListControl.showEmpty();
            }
        }

        function getCurrentSourcePage() {
            if (contentTypeService.contentType.isHtml() && !contentTypeService.noSuspectHtmlMatches) return 0;
            if ($scope.sourcePaginationObject && $scope.sourcePaginationObject.pagination)
                return $scope.sourcePaginationObject.pagination.current - 1;
            return 0;
        }

        function getCurrentSuspectPage() {
            if (contentTypeService.contentType.isHtml() && !contentTypeService.noSuspectHtmlMatches) return 0;
            if ($scope.suspectPaginationObject && $scope.suspectPaginationObject.pagination)
                return $scope.suspectPaginationObject.pagination.current - 1;
            return 0;
        }

        function setSourcePages() {
            if (contentTypeService.contentType.isText() || contentTypeService.noSuspectHtmlMatches) {
                $scope.sourcePages = $scope.reportDataService.scanned_document.text.splitValue;
            } else {
                $scope.sourcePages = [$scope.reportDataService.scanned_document.html.value];
            }
        }

        function initScopeVariablesWhenSourceTextIsAvailable() {
            if (!$scope.reportDataService.scanned_document) return;
            
            setSourcePages();
            angular.extend($scope.sourcePaginationObject.pagination, {
                current: parseInt($scope.sourcePageIndex),
                total_pages: $scope.sourcePages.length,
                ready: true
            });
            $scope.$broadcast('updateNavigationButtons');
            $scope.sourceText = $scope.sourceTextClean = $scope.sourcePages[getCurrentSourcePage()];
        }

        function initScopeVariablesWhenResultIsAvailabe() {
            
            $scope.result = oneToOneReportService.getSource();

            if (!$scope.suspectResult) $scope.suspectResult = oneToOneReportService.getSuspect();
            $scope.sourcesForSource = {};
            $scope.sourcesForSource[$scope.result.id] = $scope.result;
            $scope.sourcesForSuspect = {};
            $scope.sourcesForSuspect[$scope.result.id] = $scope.suspectResult;

            $scope.sourcePaginationObject.results = $scope.sourcesForSource;
            $scope.suspectPaginationObject.results = $scope.sourcesForSuspect;

            //if (!$scope.comingFromTwoFilesCompare)
            $scope.suspectTitle = $scope.result.title;
            //else
            //    $scope.suspectTitle = "File 2";

            $scope.suspectUrl = $scope.suspectResult.url;
            initScopeVariablesWhenResultTextIsAvailabe();
        }


        function getSuspectPages() {
            
            if (contentTypeService.contentType.isText() || contentTypeService.noSuspectHtmlMatches) {
                if ($scope.suspectTextPages) return $scope.suspectTextPages;
                var spliter = new PagesSpliter();
                $scope.suspectTextPages = spliter.splitText($scope.result.matches.text.value, $scope.result.matches.text.pages.startPosition);
                return $scope.suspectTextPages;
            } else {
                return [$scope.result.matches.html.value];
            }
        }

        function initScopeVariablesWhenResultTextIsAvailabe() {
            $scope.resultPages = getSuspectPages();
            if (!$scope.resultPages) return;
            angular.extend($scope.suspectPaginationObject.pagination, {
                current: parseInt($scope.resultPageIndex),
                total_pages: $scope.resultPages.length,
                ready: true
            });
            $rootScope.$broadcast('updateNavigationButtons');
            $scope.resultText = $scope.resultPages[getCurrentSuspectPage()];
            if ($scope.page2Control.setText) $scope.page2Control.setText($scope.resultText);

            //if (!$scope.comingFromTwoFilesCompare)
            $scope.sourceTitle = 'Your text';
            //else
            //    $scope.sourceTitle = 'File 1';

            reportHeightToParent();
        }

        function fixScroll() {

            if (reportDataService.scrollToPagesPlease) {
                $timeout(function () {
                    reportDataService.scrollToPagesPlease = false;
                    $('html, body').scrollTop($(".contributing-to-height-page").offset().top);
                });
            }
        }

        function highlightSourceText() {
            if (!$scope.sourcesForSource) {
                if ($scope.page1Control.setText) $scope.page1Control.setText($scope.sourceText);
                return;
            }
            if (!$scope.result) return;

            var pageIndex = getCurrentSourcePage();
            
            var excludedRanges = contentTypeService.contentType.isHtml() ?
                reportDataService.excludedHtmlRangesPerPage :
                reportDataService.excludedTextRangesPerPage;

            var sourcePageMatches = pageService.updateCurrentPageMatches([$scope.result],
                pageIndex, excludedRanges,
                contentTypeService.contentType.get());

            //console.log('source-------------------------------------------------------------------------------------------------s');
            //console.log('page length: ' + $scope.sourceText.length);
            //console.log('all: ' + underscore.pluck(underscore.flatten(underscore.pluck(underscore.pluck([$scope.result], 'matches'), 'identical')), 'SoE').join());
            //console.log('page: ' + underscore.pluck(underscore.pluck(sourcePageMatches.identical, 'match'), 'SoE').join());

            $scope.sourceText = pageService.highlightText({
                text: $scope.sourceTextClean,
                matches: sourcePageMatches,
                sources: $scope.sourcesForSource,
                mapType: 'sourceToSuspect',
                reportType: '1to1',
                disableTooltip: true,
                pageType: reportDataService.pageTypes.source
            });
            $timeout(function () {
                scrollService.scrollSource($scope.page1Control);
                fixScroll();
            }, 300);
            if ($scope.sourcePaginationObject.control.recomputePageColors) $scope.sourcePaginationObject.control.recomputePageColors($scope.sourcesForSource);

        }

        function highlightResultText() {
            if (!$scope.sourcesForSuspect) return;
            if (!$scope.suspectPaginationObject.pagination) return;
            
            var contentType = contentTypeService.contentType.isHtml() && $scope.suspectResult.matches.html ?
                'html' :
                'text';

            var resultPageMatches = pageService.updateCurrentPageMatches([$scope.suspectResult],
                getCurrentSuspectPage(), null, contentType);

            //console.log('result-------------------------------------------------------------------------------------------------s');
            //console.log('page length: ' + $scope.resultText.length);
            //console.log('all: ' + underscore.pluck(underscore.flatten(underscore.pluck(underscore.pluck([$scope.suspectResult], 'matches'), 'identical')), 'SuE').join());
            //console.log('page: ' + underscore.pluck(underscore.pluck(resultPageMatches.identical, 'match'), 'SuE').join());

            $scope.resultText = pageService.highlightText({
                text: $scope.resultText,
                matches: resultPageMatches,
                sources: $scope.sourcesForSuspect,
                mapType: 'suspectToSource',
                reportType: '1to1',
                disableTooltip: true,
                contentType: $scope.result.contentType,
                pageType: reportDataService.pageTypes.suspect
            });
            $timeout(function () {
                scrollService.scrollSuspect($scope.page2Control);
                fixScroll();
            }, 300);
            if ($scope.suspectPaginationObject.control.recomputePageColors) $scope.suspectPaginationObject.control.recomputePageColors($scope.sourcesForSuspect);
        }

        function getStatistics() {
            if (!reportDataService.scanned_document) return;
            logService.log('word count: ' + reportDataService.scanned_document.metadata.words);
            var wordCount = reportDataService.scanned_document.metadata.words;
            if (!wordCount) return null;
            if (statisticsService.haveDataForStatistics($scope.sourcesForSource)) {
                logService.log('sources for statistics: ');
                logService.log($scope.sourcesForSource);
                var statistics = statisticsService.computeStatistics($scope.sourcesForSource,
                    wordCount, reportDataService.scanned_document.metadata.excluded);
                return statistics;
            }
            return null;
        }

        function callUpdateChildrenControls() {
            if (reportDataService.showStatisticControls) {
                var statistics = getStatistics();
            }
            updateChildrenControls(statistics);
        }

        function updateChildrenControls(statistics) {
            logService.log('updateChildrenControls');
            if (statistics) {
                logService.log('got statistics');
                $scope.$emit('showStatistics', statistics)
            }
        }

        // #region Change content type

        $scope.suspectHasHtmlContentType = function () {
            return $scope.suspectResult.matches.html;
        }

        $scope.$on('switchContentType', function (event, contentType) {
            switchContentType();
        });

        $scope.switchContentType = function () {
            contentTypeService.contentType.switch();
            reportServiceMediator.switchReportContentType(contentTypeService.contentType.get());
            switchContentType();
        }

        function switchContentType() {
            initScopeVariablesWhenSourceTextIsAvailable();
            initScopeVariablesWhenResultTextIsAvailabe();
            highlightSourceText();
            highlightResultText();

            $timeout(function () {
                if ($scope.page1Control.setText) $scope.page1Control.setText($scope.sourceText);
                if ($scope.page2Control.setText) $scope.page2Control.setText($scope.resultText);
            })

            switchingContentType = true;
        }
        // #endregion
    }]);
}