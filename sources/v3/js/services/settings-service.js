function attach_settings_service(app) {
    app.service('settingsService', ["utilitiesService", "reportDataService", function (utilitiesService, reportDataService) {

        var maxResourcesToHandle = 100;

        this.getMaxSourcesNumber = function () {
            return this.instance.showOnlyTopResults ? maxResourcesToHandle : Infinity;
        }

        this.sortSourcesByNumberOfMatches = function (sources) {
            return underscore.sortBy(sources, 'matchedWords').reverse();
        }

        this.getMaxSourcesWithMatches = function (sources) {
            if (!sources || utilitiesService.length(sources) == 0) return [];
            var max = this.getMaxSourcesNumber();

            if (max == Infinity) max = utilitiesService.length(sources);

            return underscore.first(this.sortSourcesByNumberOfMatches(sources), max);
        }

        this.initSettings = function () {
            this.instance = this.get_settings();
            return this.instance;
        }

        this.get_settings = function () {
            if (getSettings() !== null) {
                return getSettings();
            }
            else if (getDefaultSettings() !== null) {
                return getDefaultSettings();
            }
            else {
                return getSettingsObject();
            }
        };

        function getSettingsObject() {
            return {
                showIdentical: true,
                showSimilar: true,
                showRelated: true,
                showPageSources: false,
                showOnlyTopResults: true,
                ui: {
                    fontSize: 18,
                    rtlMode: false
                },
                source: {
                    ui: {
                        fontSize: 18,
                        rtlMode: false
                    }
                },
                suspect: {
                    ui: {
                        fontSize: 18,
                        rtlMode: false
                    }
                }
            }; // Default settings.
        }

        // Store settings for specific process.
        this.set_settings = function (settings) {
            delete settings.make_default;

            try {
                localStorage["" + reportDataService.pid + ".settings"] = JSON.stringify(settings);
            } catch (err) {
            }
        };

        // Store default settings 
        this.set_default_settings = function (newSettings) {
            delete newSettings.make_default;

            try {
                localStorage["default-settings"] = JSON.stringify(settings);
            } catch (err) {
            }
        };

        function getSettings() {
            if ((reportDataService.pid + ".settings") in localStorage)
                return JSON.parse(localStorage[(reportDataService.pid + ".settings")]);
            else
                return null;
        };

        function getDefaultSettings() {
            if ("default-settings" in localStorage)
                return JSON.parse(localStorage["default-settings"]);
            else
                return null;
        };

    }]);
}
