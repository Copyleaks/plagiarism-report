function attach_ReportDataService(app) {
    app.service('reportDataService', ['contentTypeService',
        function (contentTypeService) {
            var service = {};

            service.showStatisticControls = true;
            service.working = true;

            function clear() {
                service.sources = {};
                service.scanProgressPercents = 100;
                service.excludedRangesPerPage = null;
                service.excludedRangeCount = 0;
            }
            
            clear();

            service.reportTypes = {
                multipleSuspects: 1,
                singleSuspect: 2
            }

            service.pageTypes = {
                source: 'source',
                suspect: 'suspect'
            }
            
            service.splitExcludedRanges = function() {

                if (this.excludedRangesPerPage ||
                    !this.scanned_document ||
                    !this.scanned_document.ranges ||
                    !this.info ||
                    !this.info.excludedRanges ||
                    this.info.excludedRanges.length == 0) {
                    return;
                }

                var excluded = contentTypeService.isHtmlContentType(this.scanned_document.contentType) ?
                    this.info.htmlExcludedRanges :
                    this.info.excludedRanges;

                //window.excluded = this.info.excludedRanges;
                var trasformed = underscore.map(excluded, function (range) {
                    return {
                        SoS: range.start,
                        SoE: range.end,
                        id: -1
                    }
                });

                var spliter = new PagesSpliter();
                this.excludedRangesPerPage = spliter.split(trasformed, this.scanned_document.ranges,"sourceToSuspect");

                var oldCount = service.excludedRangeCount;
                service.computeTotalExcludedWords();

                if (oldCount != null && service.excludedRangeCount != oldCount)
                    console.log('old count does not match new count');
            }

            service.computeTotalExcludedWords = function () {
                service.excludedRangeCount = 0;
                if (service.excludedRangeCount || !service.info || !service.info.excludedRanges) return;

                var countedGids = {};

                service.excludedRangeCount = underscore.reduce(service.info.excludedRanges, function (sum, range) {

                    if (range.gid == null)
                        return range.numOfWords + sum;

                    if (countedGids[range.gid]) return sum;

                    countedGids[range.gid] = true;
                    return range.numOfWords + sum;
                }, 0);
            }

            service.setError = function (error) {
                service.isErrored = true;
                service.ErrorMessage = error;
            }

            service.getSourceIdFromMatchId = function(matchId) {
                var result = matchId.substr(2);
                result = result.substr(0, result.lastIndexOf('_'));
                return result;
            }

            service.clearSourcesMatch = function () {
                //service.scanned_document = null;
                underscore.each(service.sources, function (source) {
                    delete source.matches;
                    delete source.matchesBeforeSplit;
                });
            }

            function fixOldTextScanGids(source) {
                if (!source.matches) return;
                
                var identical = source.matches.Identical;
                var similar = source.matches.Similar;
                var relatedMeaning = source.matches.RelatedMeaning;
                
                if (contentTypeService.contentType.isText()) return;
                fixMatchGroupPid(identical);
                fixMatchGroupPid(similar);
                fixMatchGroupPid(relatedMeaning);
            }

            function fixMatchGroupPid(matchGroup) {
                var counter = 0;
                if (!matchGroup) return;
                if (matchGroup.length >= 2 && matchGroup[0].GID == matchGroup[1].GID ||
                    (matchGroup.length == 1 && !matchGroup[0].hasOwnProperty('GID'))) {
                    underscore.each(matchGroup, function (match) {
                        match.GID = counter++;
                    });
                }
            }

            function sourceHasGids(source) {

                var identical = source.matches.Identical;
                var similar = source.matches.Similar;
                var relatedMeaning = source.matches.RelatedMeaning;

                if (identical && identical.length > 0) {
                    return identical[0].hasOwnProperty('GID');
                }
                if (similar && similar.length > 0) {
                    return similar[0].hasOwnProperty('GID');
                }
                if (relatedMeaning && relatedMeaning.length > 0) {
                    return relatedMeaning[0].hasOwnProperty('GID');
                }
                return true;
            }

            service.fixOldTextScanGids = fixOldTextScanGids;
            service.sourceHasGids = sourceHasGids;

            service.clear = function () {
                delete service.isErrored;
                delete service.noMatches;
                delete service.excludedRangesPerPage;
                delete service.info;
                delete service.scanProgressPercents;
                clear();
                delete service.sourceType;
                delete service.sourceTitle;
                delete service.sourceCount;
                delete service.hasHtmlContentType;
                delete service.resultTitle;
                delete service.suspectRanges;
                delete service.suspectPages;
                delete service.reportTitle;
                delete service.reportIcon;
            }
            
            return service;
        }]);
}
