function PagesSpliter() { }

PagesSpliter.prototype.splitText = function (text, pageRanges) {
    var splitPages = [];
    for (var i = 0; i < pageRanges.length; i++) {
        var pageIndexStart = pageRanges[i];
        var pageText;
        if (i == pageRanges.length - 1) { // last page - take all text
            pageText = text.substr(pageIndexStart);
        } else {
            var pageIndexEnd = pageRanges[i + 1];
            pageText = text.substr(pageIndexStart, pageIndexEnd - pageIndexStart);
        }
        splitPages.push(pageText);
    }
    return splitPages;
}


//Split matches
PagesSpliter.prototype.splitMatch = function (matches, pageRanges, mapType) {

    if (matches == null) return null;

    var targetMatchProperty, otherMatchProperty;
    if (mapType == "sourceToSuspect") {
        targetMatchProperty = 'source';
        otherMatchProperty = 'suspected'
    } else if (mapType == "suspectToSource") {
        targetMatchProperty = 'suspected';
        otherMatchProperty = 'source'
    } else throw new Error('Unsupported map type: ' + mapType)

    var starts = angular.extend([], matches[targetMatchProperty].chars.starts);
    var lengths = angular.extend([], matches[targetMatchProperty].chars.lengths);
    var otherStarts = matches[otherMatchProperty].chars.starts;
    var otherLengths = matches[otherMatchProperty].chars.lengths;

    var pagesVsMatches = [];
    if (pageRanges === null)
        pageRanges = [0];

    for (var i = 0; i < pageRanges.length; ++i) {
        pagesVsMatches.push({
            groupId: [],
            starts: [],
            lengths: [],
            otherStarts: [],
            otherLengths: []
        });
    }
    var totalMatches = matches.source.chars.starts.length;
    //var startMatchIndex = 0; // We wanted to improve the run time by skipping already splited matches.
    //But, the matches are not ordered therefore we can't assume anything about the page a match is in

    var groupIds;
    if (matches.groupIds) {
        // HTML exluded sections has `groupIds`
        groupIds = matches.groupIds;
    }
    else {
        // Text excluded sections doesn't have `groupIds`
        groupIds = [];
        for (var groupIdIndex = 0; groupIdIndex < totalMatches; ++groupIdIndex)
            groupIds.push(groupIdIndex);
    }


    for (var i = 0; i < pageRanges.length; ++i) {
        var pageStartIndex = pageRanges[i];

        var pageEndIndex;
        if (i + 1 === pageRanges.length)
            pageEndIndex = 99999999999;
        else
            pageEndIndex = pageRanges[i + 1];

        for (var matchIndex = 0; matchIndex < totalMatches; ++matchIndex) {
            var matchStart = starts[matchIndex];
            var length = lengths[matchIndex];
            var otherStart = otherStarts[matchIndex];
            var otherLength = otherLengths[matchIndex];

            var matcheEnd = matchStart + length;
            if (pageStartIndex <= matchStart && matchStart < pageEndIndex) {
                if (pageEndIndex >= matcheEnd) {
                    pagesVsMatches[i].groupId.push(groupIds[matchIndex]);
                    pagesVsMatches[i].starts.push(matchStart);
                    pagesVsMatches[i].lengths.push(length);
                    pagesVsMatches[i].otherStarts.push(otherStart);
                    pagesVsMatches[i].otherLengths.push(otherLength);
                }
                else {
                    pagesVsMatches[i].groupId.push(groupIds[matchIndex]);
                    pagesVsMatches[i].starts.push(matchStart);
                    pagesVsMatches[i].lengths.push(pageEndIndex - matchStart);
                    pagesVsMatches[i].otherStarts.push(otherStart);
                    pagesVsMatches[i].otherLengths.push(otherLength);

                    starts[matchIndex] = pageEndIndex; //+ 1;
                    lengths[matchIndex] = matcheEnd - pageEndIndex; //pageEndIndex + 1;
                    break;
                }
            }
        }
    }

    return this.makePageZeroBased(pagesVsMatches, pageRanges, mapType);
}

PagesSpliter.prototype.splitExcluded = function (matches, pageRanges) {
    if (matches == null) return null;

    var pagesVsMatches = [];
    if (pageRanges === null)
        pageRanges = [0];

    for (var i = 0; i < pageRanges.length; ++i) {
        pagesVsMatches.push({
            groupId: [],
            reasons: [],
            lengths: [],
            starts: []
        });
    }

    var groupIds;
    if (matches.groupIds) {
        // HTML exluded sections has `groupIds`
        groupIds = matches.groupIds;
    }
    else {
        // Text excluded sections doesn't have `groupIds`
        groupIds = [];
        for (var groupIdIndex = 0; groupIdIndex < matches.reasons.length; ++groupIdIndex)
            groupIds.push(groupIdIndex);
    }

    for (var i = 0; i < pageRanges.length; ++i) {
        var startIndex = pageRanges[i];

        var endIndex;
        if (i + 1 === pageRanges.length)
            endIndex = 9999999999;
        else
            endIndex = pageRanges[i + 1];


        for (var matchIndex = 0; matchIndex < groupIds.length; ++matchIndex) {
            var start = matches.value[matchIndex];
            var end = start + matches.lengths[matchIndex];
            if (startIndex <= start && start < endIndex) {
                if (endIndex >= end - 1) {
                    pagesVsMatches[i].groupId.push(groupIds[matchIndex]);
                    pagesVsMatches[i].reasons.push(matches.reasons[matchIndex]);
                    pagesVsMatches[i].lengths.push(matches.lengths[matchIndex]);
                    pagesVsMatches[i].starts.push(matches.value[matchIndex]);
                }
                else {
                    var subtract = end - endIndex;
                    pagesVsMatches[i].groupId.push(groupIds[matchIndex]);
                    pagesVsMatches[i].reasons.push(matches.reasons[matchIndex]);
                    pagesVsMatches[i].lengths.push(subtract);
                    pagesVsMatches[i].starts.push(matches.value[matchIndex]);

                    matches.value[matchIndex] = endIndex + 1;
                    matches.lengths[matchIndex] = matches.lengths[matchIndex] - subtract;
                }
            }
        }
    }

    return this.makeExcludePageZeroBased(pagesVsMatches, pageRanges);
}

PagesSpliter.prototype.makeExcludePageZeroBased = function (pagesVsMatches, pageRanges) {
    for (var pageIndex = 1; pageIndex < pageRanges.length; ++pageIndex) // Start from the next page.
    {
        if (pagesVsMatches[pageIndex].starts.length == 0) continue;

        var matchesInPage = pagesVsMatches[pageIndex].starts.length;

        for (var matchIndex = 0; matchIndex < matchesInPage; ++matchIndex) // Start from the next page.
        {
            pagesVsMatches[pageIndex].starts[matchIndex] -= pageRanges[pageIndex];
        }
    }

    return pagesVsMatches;
}

PagesSpliter.prototype.makePageZeroBased = function (pagesVsMatches, pageRanges, mapType) {
    var fromStart, fromEnd;
    //if (mapType == "sourceToSuspect") {
    //    fromStart = 'SoS';
    //    fromEnd = 'SoE';
    //} else if (mapType == "suspectToSource") {
    //    fromStart = 'SuS';
    //    fromEnd = 'SuE';
    //}
    for (var pageIndex = 1; pageIndex < pageRanges.length; ++pageIndex) // Start from the next page.
    {
        var matchesInPageCount = pagesVsMatches[pageIndex].groupId.length;
        for (var matchIndex = 0; matchIndex < matchesInPageCount; ++matchIndex) // Start from the next page.
        {
            pagesVsMatches[pageIndex].starts[matchIndex] -= pageRanges[pageIndex];
        }
    }

    return pagesVsMatches;
}