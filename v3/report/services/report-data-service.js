function attach_ReportDataService(app) {
    app.service('reportDataService', ['contentTypeService',
        function (contentTypeService) {
            var service = {};

            service.showStatisticControls = true;
            service.working = true;

            function clear() {
                service.sources = {};
                service.scanProgressPercents = 0;
                service.excludedRangesPerPage = null;
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

            service.resultType = {
                batch: 0,
                internet: 1,
                database: 2
            }
            
            service.splitExcludedRanges = function () {
                var spliter = new PagesSpliter();
                this.excludedTextRangesPerPage = null;
                this.excludedHtmlRangesPerPage = null;
                if (this.scanned_document.text.exclude.value == null) {
                    return;
                }
                this.excludedTextRangesPerPage = spliter.splitExcluded(this.scanned_document.text.exclude, this.scanned_document.text.pages.startPosition);
                if (this.scanned_document.html && this.scanned_document.html.exclude)
                    this.excludedHtmlRangesPerPage = spliter.splitExcluded(this.scanned_document.html.exclude, [0]);
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

            service.clear = function () {
                delete service.isErrored;
                delete service.noMatches;
                delete service.excludedRangesPerPage;
                delete service.scanProgressPercents;
                clear();
                delete service.sourceType;
                delete service.sourceTitle;
                delete service.sourceCount;
                delete service.resultTitle;
                delete service.scannedDocumentMeta;
                delete service.reportTitle;
                delete service.reportIcon;
                delete service.scanned_document;
            }
            
            return service;
        }]);
}
