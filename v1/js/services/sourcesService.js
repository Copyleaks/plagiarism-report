function attach_sourcesService(app) {
    app.service('sourcesService', ['DataService', 'contentTypeService', 'reportDataService', 'pageService', 'logService', 'settingsService','utilitiesService',
        function (DataService, contentTypeService, reportDataService,  pageService, logService, settingsService, utilitiesService) {

        var pageRangesSet = false;
        var pageRanges = null;
        var remainingSources = { /* Result-ID, Result Object */ };
        var sourcesWithoutMatchesCount = 0;
            
        this.isPageRangesSet = function () {
            return pageRangesSet;
        }

        this.setPageRanges = function (ranges) {
            pageRangesSet = true;
            pageRanges = ranges;
        };

        this.resetSourcesWithoutMatches = function (num) {
            sourcesWithoutMatchesCount = num;
        }


        this.checkForMissingMatches = function (num) {
            sourcesWithoutMatchesCount = underscore.find(reportDataService.sources, function (x) { return !x.hasOwnProperty('matches') }).length;
        }

        this.matchesBeforeSources = {};
        //handle how many suspects are left without matches
        this.handleMatches = function (resultId, matches) {
            var source = reportDataService.sources[resultId];

            if (source == null) {
                throw new Error('Must get source before matches');
                //this.matchesBeforeSources[resultId] = matches;
                //return sourcesWithoutMatchesCount;
            }

            if (source.matches) return sourcesWithoutMatchesCount;

            return handelSourceAndMatches(source, matches);
        }

        function handelSourceAndMatches(source,matches) {
            if (reportDataService.type == reportDataService.reportTypes.singleSuspect) {
                if (reportDataService.resultId == source.id) {
                    if (!source.matches) sourcesWithoutMatchesCount--;
                }
            } else {
                if (!source.matches) sourcesWithoutMatchesCount--;
            }

            var contentType = contentTypeService.contentTypesConverter[matches.contentType];

            if (contentTypeService.isHtmlContentType(matches.contentType)) {
                matches.hasHtmlContentType = true;
            }

            if (!doesResponseHaveWordRanges(matches.comparison)) {
                copyCharacterRangesToWordRanges(matches.comparison);
                source.isWordRangeCopied = true;
            }

            source.matches = matches.comparison;
            source.text = matches.text;
            source.info = matches.info;
            source.comparisonVersion = matches.comparisonVersion;
            source.contentType = matches.contentType;

            if (pageRanges !== null) {
                pageService.convert_comparison_report_with_pages(source, pageRanges, "sourceToSuspect");

            }
            return sourcesWithoutMatchesCount;
        }

        function doesResponseHaveWordRanges(comparison) {
            return (comparison.Identical && comparison.Identical.length > 0 && comparison.Identical[0].hasOwnProperty('SoWE'))
                || (comparison.Similar && comparison.Similar.length > 0 && comparison.Similar[0].hasOwnProperty('SoWE'))
                || (comparison && comparison.RelatedMeaning && comparison.RelatedMeaning.length > 0 && comparison.RelatedMeaning[0].hasOwnProperty('SoWE'));
        }

        function copyCharacterRangesToWordRanges(comparison) {
            var range = null;
            if (comparison.Identical) {
                for (var i = 0; i < comparison.Identical.length; ++i) {
                    range = comparison.Identical[i];
                    range.SoWS = range.SoS;
                    range.SoWE = range.SoE;
                }
            }
            if (comparison.Similar) {
                for (var i = 0; i < comparison.Similar.length; ++i) {
                    range = comparison.Similar[i];
                    range.SoWS = range.SoS;
                    range.SoWE = range.SoE;
                }
            }
            if (comparison.RelatedMeaning) {
                for (var i = 0; i < comparison.RelatedMeaning.length; ++i) {
                    range = comparison.RelatedMeaning[i];
                    range.SoWS = range.SoS;
                    range.SoWE = range.SoE;
                }
            }
        }

        this.incomingSource = function (result) {
            if (result.id in reportDataService.sources) // This source is already loaded.
                return; 
            
            if (reportDataService.type == reportDataService.reportTypes.singleSuspect){
                if (reportDataService.resultId == result.id) {
                    if (!result.matches) sourcesWithoutMatchesCount++;
                }
            } else {
                if (!result.matches) sourcesWithoutMatchesCount++;
            }
                
            reportDataService.sources[result.id] = result;

            if (this.matchesBeforeSources[result.id]) {
                handelSourceAndMatches(result, this.matchesBeforeSources[result.id]);
            }
        };

        this.incomingSources = function (sources) {

            sources = settingsService.sortSourcesByNumberOfMatches(sources);

            var max = settingsService.getMaxSourcesNumber();

            var i = 0;
            for (; i < sources.length && i < max; ++i) {
                var source = sources[i];
                if (source.id in reportDataService.sources) {
                    continue; // This source is already loaded.
                }

                if (reportDataService.type == reportDataService.reportTypes.singleSuspect) {
                    if (reportDataService.resultId == source.id) {
                        if (!source.matches) sourcesWithoutMatchesCount++;
                    }
                } else {
                    if (!source.matches) sourcesWithoutMatchesCount++;
                }

                reportDataService.sources[source.id] = source;

                if (this.matchesBeforeSources[source.id]) {
                    handelSourceAndMatches(source, this.matchesBeforeSources[source.id]);
                }
            }

            for (; i < sources.length; ++i) {
                remainingSources[sources[i].id] = sources[i];
            }

            logService.log('Parsed ' + utilitiesService.length(sources) + ' incoming sources');
            logService.log('There are' + utilitiesService.length(remainingSources) + ' remaining sources, that were not processed');


        };

        this.getRemainingSources = function () {
            logService.log('processing ' + utilitiesService.length(remainingSources) + ' remaining sources');
            for (var item in remainingSources) {
                incomingSource(remainingSources[item]);
            }
            remainingSources.length = 0;

        };

    }]);
}