function attach_educationReportService(app) {
    app.service('educationReportService', ['settingsService', 'DataService', '$q', '$interval', 'logService', '$timeout', '$window', 'reportDataService', 'utilitiesService', 'contentTypeService',
        function (settingsService, DataService, $q,  $interval, logService, $timeout, $window, reportDataService, utilitiesService, contentTypeService) {
            var service = {};
                        
            function extractReportTitleFromInfo() {
                
                reportDataService.sourceTitle = 'test1212.txt';
                reportDataService.sourceType = getSourceType(reportDataService.sourceTitle);
            }

            function getSourceType(title) {
                if (title == "Uploaded text")
                    return 'FreeText';
                if (isURL(title))
                    return 'Url';
                if (isImageFileName(title))
                    return 'Ocr';
                if (isTextFileName(title))
                    return 'Textual';
                $timeout(function () {
                    throw new Error('Could not extract source type from title. Title: ' + title);
                });
            }

            function isTextFileName(str) {
                var pattern = /.*\.(html|pdf|docx|doc|txt|rtf|xml|pptx|ppt|odt|chm|epub|odp|ppsx|pages|xlsx|xls|csv|LaTeX)$/i;
                return pattern.test(str);
            }

            function isImageFileName(str) {
                var pattern = /.*\.(gif|png|bmp|jpg|jpeg)$/i;
                return pattern.test(str);
            }

            function isURL(str) {
                var pattern = new RegExp('^(https?:\\/\\/)');
                return pattern.test(str);
            }

            function cb_process_info_error(response) {
                if (response.status === 404) {
                    $window.location.href = '/errors/filenotfound';
                } else if (response.status >= 500 || response.status === 401) {
                    reportDataService.setError(response.data && response.data.Message);
                    if (!reportDataService.ErrorMessage) {
                        reportDataService.setError(response.data);
                    }
                    if (!reportDataService.ErrorMessage) {
                        reportDataService.setError("Something went wrong. Please try again.");
                    }
                }
            }

            function findSource(sources, sourceId) {
                for (var i = 0; i < sources.length; i++) {
                    var source = sources[i];
                    if (source.id == sourceId)
                        return source;
                }
                throw new Error('required source not found');
            }


            return service;
        }]);
}
