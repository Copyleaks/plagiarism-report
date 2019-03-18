function PagesSpliter() {

}

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

PagesSpliter.prototype.split = function (matches, pageRanges, mapType) {
    if (matches == null) return null;

    var fromStart, fromEnd;
    if (mapType == "sourceToSuspect") {
        fromStart = 'SoS';
        fromEnd = 'SoE';
    } else if (mapType == "suspectToSource") {
        fromStart = 'SuS';
        fromEnd = 'SuE';
    }

    var pagesVsMatches = [];
    if (pageRanges === null)
        pageRanges = [0];

    for (var i = 0; i < pageRanges.length; ++i) {
        pagesVsMatches.push([]);
    }

    for (var i = 0; i < pageRanges.length; ++i) {
        var startIndex = pageRanges[i];

        var endIndex;
        if (i + 1 === pageRanges.length)
            endIndex = 99999999;
        else
            endIndex = pageRanges[i + 1];

        for (var matchIndex = 0; matchIndex < matches.length; ++matchIndex) {
            var match = matches[matchIndex];
            if (startIndex <= match[fromStart] && match[fromStart] < endIndex) {
                if (endIndex > match[fromEnd]) {
                    pagesVsMatches[i].push(match);
                }
                else {
                    var partialObj = $.extend({}, match);
                    partialObj[fromEnd] = endIndex;
                    match[fromStart] = endIndex;
                    pagesVsMatches[i].push(partialObj);
                }
            }
        }
    }

    return this.makePageZeroBased(pagesVsMatches, pageRanges, mapType);
}

PagesSpliter.prototype.makePageZeroBased = function (pagesVsMatches, pageRanges, mapType) {
    var fromStart, fromEnd;
    if (mapType == "sourceToSuspect") {
        fromStart = 'SoS';
        fromEnd = 'SoE';
    } else if (mapType == "suspectToSource") {
        fromStart = 'SuS';
        fromEnd = 'SuE';
    }

    for (var pageIndex = 1; pageIndex < pageRanges.length; ++pageIndex) // Start from the next page.
    {
        for (var matchIndex = 0; matchIndex < pagesVsMatches[pageIndex].length; ++matchIndex) // Start from the next page.
        {
            pagesVsMatches[pageIndex][matchIndex][fromStart] -= pageRanges[pageIndex];
            pagesVsMatches[pageIndex][matchIndex][fromEnd] -= pageRanges[pageIndex];
        }
    }

    return pagesVsMatches;
}