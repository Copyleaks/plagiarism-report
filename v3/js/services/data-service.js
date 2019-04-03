/// <reference path="pages-spliter.js" />
"use strict";

function attachDataService(app) {
    app.service('DataService', ["$http", "logService", "reportDataService", 'contentTypeService',
        function ($http, logService, reportDataService, contentTypeService) {
        this.eSourceStatus = Object.freeze({
            "completed": 0,
            "reportDownloaded": 1,
            "readyToSplit": 2,
            "readyToFullText": 3,
            switchingType: 4
        });
      
        this.splitTextDocument = function (docData) {
            if (!docData.pages) return null;

            var spliter = new PagesSpliter();
            docData.splitValue = spliter.splitText(docData.value, docData.pages.startPosition);
        }

    }]);
}
