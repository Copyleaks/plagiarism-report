/// <reference path="pages-spliter.js" />
"use strict";

function attachDataService(app) {
    app.service('DataService', [ 'contentTypeService',
        function (  contentTypeService) {
        this.eSourceStatus = Object.freeze({
            "completed": 0,
            "reportDownloaded": 1,
            "readyToSplit": 2,
            "readyToFullText": 3,
            switchingType: 4
        });

        this.splitDocument = function (docData) {
            var doc = {};
            doc.contentType = docData.contentType;

            if (!docData.info || !docData.info.ranges) return null;
            if (!doc.contentType || contentTypeService.isTextContentType(doc.contentType)) {
                var spliter = new PagesSpliter();
                doc.ranges = docData.info.ranges;
                doc.pages = spliter.splitText(docData.text, docData.info.ranges);
            } else {
                doc.ranges = [0];
                doc.pages = [docData.text];
            }
            doc.info = docData.info;
            doc.text = docData.text;
            return doc;
        }
        
        function initialize_result (result) {
            result.is_active = true; // By default, present all sources.
            result.status = this.eSourceStatus.reportDownloaded;
            if (result.URL == null)
                result.URL = "no public address";

            return result;
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
    }]);
}
