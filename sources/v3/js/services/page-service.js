function attach_pageService(app) {
    app.service('pageService', ['settingsService', 'DataService', 'reportDataService', 'contentTypeService',
        function (settingsService, DataService, reportDataService, contentTypeService) {
            var service = {
                updateCurrentPageMatches: updateCurrentPageMatches,
                highlightText: highlightText,
                splitMatchesToPages: splitMatchesToPages,
                getColorForMatchType: getColorForMatchType,
                getColorForClassName: getColorForClassName
            };

            function highlightText(params) {

                if (!params.text) return '';
                var text = params.text,
                    pageLength = params.text.length,
                    matches = params.matches,
                    sources = params.sources,
                    mapType = params.mapType,
                    reportType = params.reportType,
                    disableTooltip = params.disableTooltip,
                    pageType = params.pageType;

                if (!matches || matches.length == 0)
                    return [];
                var ranges = mergeMatches(pageLength, matches, mapType);
                if (ranges.length == 0) return text;

                ranges = mergeSimilarMatches(ranges);
                keepUniqueIds(ranges);
                ranges = sortRanges(ranges, mapType)

                var text = _highlightText(text, ranges, sources, mapType, reportType, disableTooltip, pageType);
                return text;
            }

            // Sorting current page matches DESC:
            function sortRanges(ranges, mapType) {
                ranges = ranges.sort(function (a, b) {
                    return parseFloat(b.SoS) - parseFloat(a.SoS);
                });
                return ranges;
            }

            String.prototype.splice = function (idx, str) {
                return this.slice(0, idx) + str + this.slice(idx);
            };

            function _highlightText(text, ranges, sources, mapType, reportType, disableTooltip, pageType) {
                var tooltip = null, range;
                var lastIndex = text.length - 1;
                var result = [];
                var originalText = text;
                for (var i = 0; i < ranges.length; ++i) {
                    range = ranges[i];
                    if (lastIndex >= range.SoE) {
                        result.unshift(text.substr(range.SoE, lastIndex - range.SoE + 1));
                    }

                    if (range.matchType == 4) {
                        tooltip = '';
                        if (!disableTooltip)
                            tooltip = "<md-tooltip md-direction=\"top\" md-delay=\"1000\">References are omitted according to your settings</md-tooltip>";

                        var textToAdd = text.substr(range.SoS, range.SoE - range.SoS);
                        result.unshift('<span class="highlight-4">' + tooltip + textToAdd + "</span>");
                    } else {
                        tooltip = '';
                        if (!disableTooltip)
                            tooltip = getTooltip(range.ids, sources, reportType);


                        var textToAdd = text.substr(range.SoS, range.SoE - range.SoS);
                        var preText = "<span" +
                            getClassesForHighlightedElement(range.matchType, range.ids) +
                            getClickAction(pageType, range.ids) +
                            tooltip +
                            ">";
                        result.unshift(preText + textToAdd + "</span>");
                    }
                    lastIndex = range.SoS - 1;
                }

                if (lastIndex != 0) {
                    result.unshift(text.substr(0, lastIndex + 1));
                }

                var newResults = result.join('');

                return newResults;
            }

            function getClickAction(pageType, rangeIds) {
                var rangeIdsString = getRangeIdsStringForClickParameter(rangeIds);

                if (contentTypeService.contentType.isHtml()) {
                    if (!pageType) pageType = 'test';
                    return " onclick=\"cpyc(" + rangeIdsString + ", '" + pageType + "');\"";
                }

                return " ng-click=\"clicked($event, " + rangeIdsString + ");\"";
            }

            function getRangeIdsStringForClickParameter(rangeIds) {
                var result = '[';

                for (var i = 0; i < rangeIds.length; ++i) {
                    result += "'" + rangeIds[i] + "',";
                }

                result = result.slice(0, -1);
                result += ']';
                return result;
            }

            function getClassesForHighlightedElement(matchType, rangeIds) {
                return " class=\"highlight-" + matchType + " " + rangeIds.join(' ') + "\"";
            }

            function getTooltip(ids, sources, reportType) {
                if (reportType != '1to1') {
                    return "title=\"" + getTooltipText(ids, sources) + "\"";
                } else {
                    return '';//"<md-tooltip class=\"multiline\" md-direction=\"top\" md-delay=\"1000\">" + 'test1212' + "</md-tooltip>";
                }

            }

            function getTooltipText(ids, sources) {
                if (ids.length == 1 && ids[0] == -1) {
                    return "<b>Ignored by request</b>";
                }
                else {
                    var urls = {};
                    var nonurls = {};
                    for (var i = 0; i < ids.length; ++i) {
                        var sourceId = reportDataService.getSourceIdFromMatchId(ids[i]);
                        var source = sources[sourceId];
                        var url = source.url;
                        if (url != null) {
                            var domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
                            if (urls.hasOwnProperty(domain)) {
                                urls[domain]++;
                            } else {
                                urls[domain] = 1;
                            }
                        } else {
                            if (nonurls.hasOwnProperty(source.title)) {
                                nonurls[source.title]++;
                            } else {
                                nonurls[source.title] = 1;
                            }
                        }
                    }

                    var urlKeys = Object.keys(urls);
                    var url, count, tempUrl, deepestParent;
                    for (var i = 0; i < urlKeys.length; ++i) {
                        url = urlKeys[i];
                        count = urls[url];
                        tempUrl = url;
                        deepestParent = null;
                        while (true) {
                            var dotIndex = tempUrl.indexOf('.');
                            if (dotIndex < 0) break;
                            tempUrl = tempUrl.substr(dotIndex + 1);
                            if (urls.hasOwnProperty(tempUrl)) {
                                deepestParent = tempUrl;
                            }
                        }

                        if (deepestParent != null) {
                            delete urls[url];
                            urls[deepestParent] = urls[deepestParent] + count;
                        }
                    }

                    var msg = "Results came from:";
                    var keys = Object.keys(urls);
                    for (var i = 0; i < keys.length && i < 7; ++i) {
                        var numberOfSubdomainsWithResults = urls[keys[i]];
                        if (numberOfSubdomainsWithResults > 1)
                            msg += "&#13;" + keys[i] + ' (' + urls[keys[i]] + ')';
                        else
                            msg += "&#13;" + keys[i];
                    }

                    if (i < 7) {
                        keys = Object.keys(nonurls);
                        for (; i < keys.length && i < 7; ++i)
                            msg += "&#13;" + keys[i] + ': ' + nonurls[keys[i]];
                    }
                    return msg;
                }
            }



            function mergeMatches(pageLength, matches, mapType) {
                var start = 0;
                var end = pageLength;

                var fromStart, fromEnd, toStart, toEnd;
                if (mapType == "sourceToSuspect") {
                    fromStart = 'SoS';
                    fromEnd = 'SoE';
                    toStart = 'SuS';
                    toEnd = 'SuE';
                } else if (mapType == "suspectToSource") {
                    fromStart = 'SuS';
                    fromEnd = 'SuE';
                    toStart = 'SoS';
                    toEnd = 'SoE';
                } else {
                    throw new Error('unsupported mapping type')
                }

                var positions = [];
                for (i = start; i < end; ++i) {
                    positions.push([]);
                }




                fillRangeWithMatchType(positions, matches.identical, 'i', 1);
                fillRangeWithMatchType(positions, matches.similar, 's', 2);
                fillRangeWithMatchType(positions, matches.relatedMeaning, 'r', 3);

                for (var i = 0; i < matches.excluded.length; ++i) {
                    var matchStart = matches.excluded[i].start;
                    var length = matches.excluded[i].length;
                    var matchEnd = matchStart + length;
                    for (var x = matchStart; x < matchEnd; ++x) {
                        positions[x].push({
                            matchType: 4,
                            id: -1//matches.relatedMeaning[i].id,
                        });
                    }
                }

                var dominantGroupNumber;
                for (var i = 0; i < positions.length; ++i) {
                    dominantGroupNumber = findDominantGroup(positions[i]);
                    if (dominantGroupNumber !== 0) {
                        // filter out all undominant items.
                        positions[i] = positions[i].filter(function (obj) {
                            return obj.matchType === dominantGroupNumber;
                        });

                    }
                }

                var ranges = [
                    {
                        matchType: -1,
                        SoS: -1,
                        SoE: -1,
                        ids: []
                    }];
                var rangesIds = {};

                for (var i = start; i < end; ++i) {
                    if (positions[i].length === 0)
                        continue;
                    var lastRange = ranges[ranges.length - 1];
                    if (positions[i].length === lastRange.ids.length
                        && positions[i][0].matchType == lastRange.matchType
                        && lastRange.SoE == i
                        && areAllIdsTheSame(positions[i], rangesIds[lastRange.SoS])) {
                        lastRange.SoE += 1;
                    } else {
                        ranges.push({
                            matchType: positions[i][0].matchType, // First item is from same type like all the other.
                            SoS: i,
                            SoE: i + 1,
                            ids: []
                        });
                        rangesIds[i] = {};
                        lastRange = ranges[ranges.length - 1];
                        for (var pos = 0; pos < positions[i].length; ++pos) {
                            var id = positions[i][pos].id;
                            lastRange.ids.push(id);
                            rangesIds[i][id] = true;
                        }
                    }
                }

                ranges.shift();

                return ranges;
            }

            function fillRangeWithMatchType(positions, matches, matchLetter, matchType) {
                for (var i = 0; i < matches.length; ++i) {
                    match = matches[i];
                    uniqueId = matchLetter + '_' + match.id + '_' + match.gid;
                    var matchStart = match.start;
                    var matchEnd = matchStart + match.length;
                    for (var x = matchStart; x < matchEnd; ++x) {
                        positions[x].push({
                            matchType: matchType,
                            id: uniqueId//matches.identical[i].id
                        });
                    }
                }
            }

            function areAllIdsTheSame(idList, idObject) {
                for (var i = 0; i < idList.length; ++i) {
                    if (!idObject.hasOwnProperty(idList[i].id)) return false;
                }
                return true;
            }

            function arraysEqual(arr1, arr2) {
                if (arr1.length !== arr2.length)
                    return false;
                for (var i = arr1.length; i--;) {
                    if (arr1[i] !== arr2[i])
                        return false;
                }

                return true;
            }

            function findDominantGroup(arr) {
                if (arr.length == 0)
                    return 0;
                else
                    return arr[0].matchType
            }

            function keepUniqueIds(ranges) {
                for (var i = 0; i < ranges.length; ++i) {
                    ranges[i].ids = underscore.uniq(ranges[i].ids);
                }
            }

            function mergeSimilarMatches(ranges) {
                var mergedRanges = [];
                if (ranges.length > 0)
                    mergedRanges.push(ranges[0]);

                for (var i = 1; i < ranges.length; ++i) {
                    var previous = ranges[i - 1];
                    var node = ranges[i];
                    var lastMergedRange = mergedRanges[mergedRanges.length - 1];
                    if (previous.matchType === node.matchType
                        && arraysEqual(previous.ids, node.ids)) {

                        if (previous.SoE === node.SoS) {
                            if (lastMergedRange.SoE !== node.SoS)
                                mergedRanges.push(previous); // Previous block is not sequential. Add the previous block.
                            //else
                            lastMergedRange.SoE = node.SoE;
                        } else if (previous.SoE > node.SoS && previous.SoE < node.SoE) {
                            lastMergedRange.SoE = node.SoE;
                        } else {
                            mergedRanges.push(node); // this block is not sequential. Add it.
                        }
                    } else {
                        mergedRanges.push(node); // this block is not sequential. Add it.
                    }
                }

                return mergedRanges;
            }


            function updateCurrentPageMatches(sources, pageIndex, excludedRangesPerPage, contentType) {
                var current_page_matches = {
                    identical: [],
                    similar: [],
                    relatedMeaning: [],
                    excluded: []
                };
                var settings = settingsService.instance;
                var sourcesToLookForMatches = settingsService.getMaxSourcesWithMatches(sources);
                var source;
                var length;
                var contentTypeProperty = contentType == 'html' ? 'splitMatchesHtml' : 'splitMatchesText';
                if (contentType == 'html')
                    pageIndex = 0; // HTML has only a single page

                for (var item in sourcesToLookForMatches) {
                    source = sourcesToLookForMatches[item];

                    if (!source.is_active
                        || source.status != DataService.eSourceStatus.completed
                        || !source[contentTypeProperty])
                        continue;



                    if (settings.showIdentical && source[contentTypeProperty].identical) {
                        length = source[contentTypeProperty].identical[pageIndex].groupId.length;
                        var pageMatches = source[contentTypeProperty].identical[pageIndex];
                        for (var i = 0; i < length; ++i) {
                            current_page_matches.identical.push(
                                {
                                    id: source.id,
                                    start: pageMatches.starts[i],
                                    length: pageMatches.lengths[i],
                                    gid: pageMatches.groupId[i]
                                }
                            );
                        }
                    }

                    if (settings.showSimilar && source[contentTypeProperty].similar) {
                        length = source[contentTypeProperty].similar[pageIndex].groupId.length;
                        var pageMatches = source[contentTypeProperty].similar[pageIndex];
                        for (var i = 0; i < length; ++i) {
                            current_page_matches.similar.push(
                                {
                                    id: source.id,
                                    start: pageMatches.starts[i],
                                    length: pageMatches.lengths[i],
                                    gid: pageMatches.groupId[i]
                                }
                            );
                        }
                    }

                    if (settings.showRelated && source[contentTypeProperty].relatedMeaning) {
                        length = source[contentTypeProperty].relatedMeaning[pageIndex].groupId.length;
                        var pageMatches = source[contentTypeProperty].relatedMeaning[pageIndex];
                        for (var i = 0; i < length; ++i) {
                            current_page_matches.relatedMeaning.push(
                                {
                                    id: source.id,
                                    start: pageMatches.starts[i],
                                    length: pageMatches.lengths[i],
                                    gid: pageMatches.groupId[i]
                                }
                            );
                        }
                    }
                }

                if (excludedRangesPerPage && excludedRangesPerPage.length > 0) {
                    var length;
                    if (excludedRangesPerPage[pageIndex].groupIds)
                        length = excludedRangesPerPage[pageIndex].groupId.length;
                    else
                        length = excludedRangesPerPage[pageIndex].starts.length;

                    for (var i = 0; i < length; ++i) {
                        current_page_matches.excluded.push(
                            {
                                id: -1,
                                start: excludedRangesPerPage[pageIndex].starts[i],
                                length: excludedRangesPerPage[pageIndex].lengths[i],
                                gid: excludedRangesPerPage[pageIndex].groupId[i],
                                reason: excludedRangesPerPage[pageIndex].reasons[i],
                            }
                        );
                    }
                }

                return current_page_matches;
            }

            function splitMatchesToPages(matches, pageRanges, mapType) {
                if (!pageRanges || pageRanges === null)
                    throw ('pageRanges cannot be null');


                var spliter = new PagesSpliter();
                var matches = {
                    identical: spliter.splitMatch(matches.identical, pageRanges, mapType),
                    similar: spliter.splitMatch(matches.minorChanges, pageRanges, mapType),
                    relatedMeaning: spliter.splitMatch(matches.relatedMeaning, pageRanges, mapType),
                };

                return matches;
            };

            function getColorForClassName(ids) {
                var matchType = ids[0].substr(0, 1);
                return getColorForMatchType(matchType);
            }


            function getColorForMatchType(matchType) {

                switch (matchType) {
                    case 'i':
                        return 'rgba(255, 102, 102, 0.9)';
                    case 's':
                        return 'rgba(255, 154, 154, 0.9)';
                    case 'r':
                        return 'rgba(255, 217, 176, 0.9)'
                }
            }

            return service;
        }])
}
