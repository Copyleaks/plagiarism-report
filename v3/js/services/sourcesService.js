function attach_sourcesService(app) {
    app.service('sourcesService', ['DataService', 'contentTypeService', 'reportDataService', 'pageService', 'logService', 'settingsService','utilitiesService',
        function (DataService, contentTypeService, reportDataService,  pageService, logService, settingsService, utilitiesService) {

        var remainingSources = { /* Result-ID, Result Object */ };
        var sourcesWithoutMatchesCount = 0;
            
        this.resetSourcesWithoutMatches = function (num) {
            sourcesWithoutMatchesCount = num;
        }


        this.checkForMissingMatches = function (num) {
            sourcesWithoutMatchesCount = underscore.find(reportDataService.sources, function (x) { return !x.hasOwnProperty('matches')}).length;
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

            
            return this.handelSourceAndMatches(source, matches);
        }

        this.handelSourceAndMatches = function (source, matches) {
            if (matches == null) return sourcesWithoutMatchesCount;
            decrementSourcesWithoutMatchesCount(source);

            source.matches = matches;
            source.text = matches.text.value;

            this.calculateSuspectPercentage(source);

            if (reportDataService.scanned_document &&
                reportDataService.scanned_document.text) {
                source.splitMatchesText = pageService.splitMatchesToPages(matches.text.comparison, reportDataService.scanned_document.text.pages.startPosition, "sourceToSuspect");
                if (!matches.html || !matches.html.comparison)
                    source.splitMatchesHtml = null;
                else
                    source.splitMatchesHtml = pageService.splitMatchesToPages(matches.html.comparison, [0], "sourceToSuspect");
            }
            source.status = DataService.eSourceStatus.completed;

            return sourcesWithoutMatchesCount;
        }

        this.splitExistingSources = function () {
            if (reportDataService.scanned_document && reportDataService.scanned_document.text) {
                for (var a in reportDataService.sources) {
                    var source = reportDataService.sources[a];
                    if (source.matches &&  !source.hasOwnProperty('splitMatchesText')) {
                        source.splitMatchesText = pageService.splitMatchesToPages(source.matches.text.comparison, reportDataService.scanned_document.text.pages.startPosition, "sourceToSuspect");
                        if (source.matches.html == null || source.matches.html.comparison == null)
                            source.splitMatchesHtml = null;
                        else
                            source.splitMatchesHtml = pageService.splitMatchesToPages(source.matches.html.comparison, [0], "sourceToSuspect");
                    }
                }
            }
        }

        this.calculateSuspectPercentage = function (source) {
            var copiedWords = source.matchedWords;
                        
            var totalWords = getTotalWords();
            if (!totalWords) return;
            var percentage = Math.floor(100* (copiedWords / totalWords));
            if (percentage == 0) {
                percentage = 1;
            }
            source.totalMatchedPercents = percentage;
        }
        var totalWordsWithoutExcluded = null;
        function getTotalWords() {

            if (totalWordsWithoutExcluded) return totalWordsWithoutExcluded;

            if (reportDataService.scannedDocumentMeta && reportDataService.scannedDocumentMeta.totalWords) {
                totalWordsWithoutExcluded = reportDataService.scannedDocumentMeta.totalWords - reportDataService.scannedDocumentMeta.totalExcluded;
                return totalWordsWithoutExcluded;
            }
            
            if (reportDataService.scanned_document &&
                 reportDataService.scanned_document.metadata &&
                reportDataService.scanned_document.metadata.words
            ) {
                totalWordsWithoutExcluded = reportDataService.scanned_document.metadata.words - reportDataService.scannedDocumentMeta.excluded;
                return totalWordsWithoutExcluded;
            }
        }

        function decrementSourcesWithoutMatchesCount(source) {
            if (!source.matches) sourcesWithoutMatchesCount--;
        }
        
        this.incomingSource = function (result) {
            if (result.id in reportDataService.sources) // This source is already loaded.
                return; 
            
            if (reportDataService.type == reportDataService.reportTypes.singleSuspect) {
                if (reportDataService.resultId == result.id) {
                    if (!result.matches) sourcesWithoutMatchesCount++;
                }
            } else {
                if (!result.matches) sourcesWithoutMatchesCount++;
            }
                
            reportDataService.sources[result.id] = result;

            if (this.matchesBeforeSources[result.id]) {
                this.handelSourceAndMatches(result, this.matchesBeforeSources[result.id]);
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
                    this.handelSourceAndMatches(source, this.matchesBeforeSources[source.id]);
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