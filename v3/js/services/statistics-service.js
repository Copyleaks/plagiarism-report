function attach_statistics_service(app) {
    app.service('statisticsService', ["settingsService", "utilitiesService", "logService", function (settingsService, utilitiesService,logService) {

        function getSourcesWithMatches(sources, checkIfActive) {
            if (!sources || Object.keys(sources).length == 0) return;

            var maxSourcesToCompute = settingsService.getMaxSourcesNumber();


            var sortedSources = settingsService.sortSourcesByNumberOfMatches(sources);
            var result = [];
            var source;
            var sourcesLength = sortedSources .length 
            for (var i = 0; i < sourcesLength && i < maxSourcesToCompute; i++) {
                source = sortedSources [i];
                if (source.hasOwnProperty('matches')) {
                    if (!checkIfActive)
                        result.push(source);
                    else if ( source.is_active)
                        result.push(source);
                }
            }

            return result ;
        }

        this.atLeastOneSourceWithMatches = function (sources) {
            if (sources == null) return;
            for (var sourceKey in sources) {
                var source = sources[sourceKey];
                if (source.hasOwnProperty('matches')
                    && source.matches.text.comparison.identical != null) {
                    return true;
                }
            }

            return false;
        }

        this.haveDataForStatistics = function (sources) {
            if (sources == null) return false;

            if (utilitiesService.length(sources) == 0) return false;

            if (!this.atLeastOneSourceWithMatches(sources)) return false;

            var sourcesWithMatches = getSourcesWithMatches(sources,false);

            var maxSourcesToCompute = settingsService.getMaxSourcesNumber();

            if (maxSourcesToCompute != Infinity && sourcesWithMatches.length >= maxSourcesToCompute ) return true;

            var sourcesLengh = Object.keys(sources).length;

            if (sourcesLengh == sourcesWithMatches.length) {
                return true;
            }

            return false;
        }

        function getRanges(sourcesWithMatches,propertyName) {
            var data =
                underscore.map(sourcesWithMatches, function (source) {
                    return source.matches.text.comparison[propertyName].source.words;
                });

            var result = {
                starts: [],
                lengths: []
            };

            for (var i = 0 ; i < data.length; ++i) {
                var dataItem = data[i];
                result.starts = result.starts.concat(dataItem.starts);
                result.lengths = result.lengths.concat(dataItem.lengths);
            }
            return result;
        }


        function getRelatedRanges(sourcesWithMatches) {
            return underscore.flatten(
                underscore.map(sourcesWithMatches, function (source) {
                    return source.matches.text.comparison.relatedMeaning.source.words;
                }));
        }

        function mergeSourceMatches(sources, wordCount) {
            logService.log('mergeSourceMatches');
            var sourcesWithMatches = getSourcesWithMatches(sources,true);

            var identiaclMatches = [];
            if (settingsService.instance.showIdentical) {
                identiaclMatches = getRanges(sourcesWithMatches,'identical');
            }

            var similarMatches = [];
            if (settingsService.instance.showSimilar) {
                similarMatches = getRanges(sourcesWithMatches,'minorChanges');
            }

            var relatedMatches = [];
            if (settingsService.instance.showRelated) {
                relatedMatches = getRanges(sourcesWithMatches,'relatedMeaning');
            }
            
            var identiaclMergedMatches = mergeRanges(identiaclMatches,1);
            var similarMergedMatches = mergeRanges(similarMatches,2);
            var relatedMergedMatches = mergeRanges(relatedMatches,3);

            var allMatchesMerged = mergeRangesWithPriority(identiaclMergedMatches, similarMergedMatches, relatedMergedMatches, wordCount);

            var wordCounts = getTotalWordCountForEachCategory(allMatchesMerged);

            return wordCounts;

        }

        function getTotalWordCountForEachCategory(ranges) {
            var groups = underscore.groupBy(ranges, 'p');

            var results = {
                identical: 0,
                similar: 0,
                related: 0
            }

            if (groups.hasOwnProperty('1')) {
                results.identical = countWordsInRanges(groups['1']);
            }
            if (groups.hasOwnProperty('2')) {
                results.similar = countWordsInRanges(groups['2']);
            }
            if (groups.hasOwnProperty('3')) {
                results.related = countWordsInRanges(groups['3']);
            }
            return results;
        }

        function countWordsInRanges(ranges) {
            var sum = 0;
            for (var i = 0; i < ranges.length; i++) {
                sum += ranges[i].e - ranges[i].s + 1;
            }
            return sum;
        }

        function mergeRangesWithPriority(identicalMatches, similarMatches, relatedMatches,wordCount) {
            var stack = [];

            var list = new PriorityMergeLinkedList();

            list.add({
                s: 0,
                e: wordCount-1,
                //e: wordCount,
                p: 4
            });

            var nodeToInsertInto = list.head;
            identicalMatches.forEach(function(element ){
                nodeToInsertInto = list.append(element, nodeToInsertInto);
            });

            nodeToInsertInto = list.head;
            similarMatches.forEach(function (element ){
                nodeToInsertInto = list.append(element, nodeToInsertInto);
            });

            nodeToInsertInto = list.head;
            relatedMatches.forEach(function (element ) {
                nodeToInsertInto = list.append(element, nodeToInsertInto);
            });

            return list.toArray();
        }

        function mergeRanges(matchRanges,priority) {

            var stack = [];

            if (!matchRanges || !matchRanges.starts || matchRanges.starts.length == 0)
                return [];

            for (var i = 0; i < matchRanges.starts.length; ++i) {
                var start = matchRanges.starts[i];
                stack.push({
                    wordIndex: start,
                    type: 0
                });
                stack.push({
                    wordIndex: start + matchRanges.lengths[i],
                    type: 1
                });
            }

            var sortedStack = stack.sort(function (a, b) {
                if (a.wordIndex < b.wordIndex) return -1;
                if (a.wordIndex > b.wordIndex) return 1;

                if (a.type < b.type) return -1;
                if (a.type > b.type) return 1;

                return 0;
            });


            var resultStack = [];

            var counter = 0;
            var startRange = 0;
            var endRange = 0;
            for (i = 0; i < sortedStack.length; ++i) {
                var range = sortedStack[i];

                if (range.type == 0) {
                    if (counter == 0) {
                        startRange = range.wordIndex;
                    }
                    counter = counter + 1;
                }
                if (range.type == 1) {
                    counter = counter - 1;
                    if (counter == 0) {
                        resultStack.push({
                            p: priority,
                            s: startRange,
                            e: range.wordIndex
                        });
                    }

                }

            };

            return resultStack;
        }

        function indexOfHeighestResult(finalResults) {
            var sorted = underscore.sortBy(finalResults, 'percentageRoundedDown').reverse();
            return sorted[0].name;
        }

        function getPriority(key) {
            switch (key) {
                case 'identical':
                    return 1;
                case 'similar':
                    return 2;
                case 'related':
                    return 3;
            }
        }

        function roundUpBy1(wordCounts, wordCount) {
            var wordCountArray = underscore.map(wordCounts, function (value, key) {
                var percentage = (value / wordCount) * 100;
                return {
                    name: key,
                    value: value,
                    percentage: percentage,
                    percentageRoundedDown: Math.floor(percentage),
                    priority: getPriority(key)
                };
            }).filter(function (wordCount) {
                return wordCount.value > 0;
            });

            var total = underscore.reduce(wordCountArray, function (sum, wordCount) {
                return sum + wordCount.percentage;
            }, 0);

            var totalRoundedDown = underscore.reduce(wordCountArray, function (sum, wordCount) {
                return sum + wordCount.percentageRoundedDown;
            }, 0);

            var reminder = Math.floor(total - totalRoundedDown);

            wordCountArray = underscore.sortBy(wordCountArray, 'percentageRoundedDown');
            //while (reminder > 0) {
            underscore.each(wordCountArray, function (wordCount) {
                if (reminder == 0) return false;

                if (wordCount.percentageRoundedDown >= 1) {
                    wordCount.percentageRoundedDown = wordCount.percentageRoundedDown + 1;
                    reminder--;
                }
            });
            //}
            
            var finalResults = underscore.indexBy(wordCountArray, 'name');
            return finalResults;
        }

        this.getEmpty = function (wordCount) {
            return {
                totalCopiedWords: 0,
                totalWordCount: wordCount,
                percentage: {
                    identical: {
                        round: 0,
                        real: 0
                    },
                    similar: {
                        round: 0,
                        real: 0
                    },
                    related: {
                        round: 0,
                        real: 0
                    },
                    wordsNotCopied: wordCount

                }
            };

        }

        this.computeStatistics = function (sources, wordCount, excludedWordCount) {

            if (!sources) return null;
            if (!wordCount) return null;

            var wordCounts = mergeSourceMatches(sources, wordCount);

            var wordCountWithoutExcluded = wordCount - excludedWordCount;
            var realPercent = ((wordCounts.identical + wordCounts.related + wordCounts.similar) / wordCountWithoutExcluded) * 100;

            var finalResults = roundUpBy1(wordCounts, wordCountWithoutExcluded);
            
            var result = {
                totalCopiedWords: wordCounts.identical + wordCounts.related + wordCounts.similar,
                totalWordCount: wordCountWithoutExcluded,
                percentage: {
                    identical: {
                        round: finalResults.identical && finalResults.identical.percentageRoundedDown || 0,
                        real: finalResults.identical && finalResults.identical.percentage || 0
                    },
                    similar: {
                        round: finalResults.similar && finalResults.similar.percentageRoundedDown || 0,
                        real: finalResults.similar && finalResults.similar.percentage || 0
                    },
                    related: {
                        round: finalResults.related && finalResults.related.percentageRoundedDown || 0,
                        real: finalResults.related && finalResults.related.percentage || 0
                    }
                }
            };

            result.percentage.wordsNotCopied = 100 - result.percentage.identical.round - result.percentage.similar.round - result.percentage.related.round;

            return result;
            
        }

    }]);
}
