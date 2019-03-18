function attach_utilites(app) {
    app.service('utilitiesService', ['$timeout', function ($timeout) {
        this.clearObject = function (objectToClear) {
            for (var variableKey in objectToClear) {
                if (objectToClear.hasOwnProperty(variableKey)) {
                    delete objectToClear[variableKey];
                }
            }
        }


        this.throttleWithGuaranteedLastRun = function (func, limit) {
            var inThrottle;
            var lastFunc;
            var lastRan;
            return function () {
                var context = this
                var args = arguments
                if (!inThrottle) {
                    func.apply(context, args)
                    lastRan = Date.now()
                    inThrottle = true
                } else {
                    clearTimeout(lastFunc)
                    lastFunc = setTimeout(function () {
                        if ((Date.now() - lastRan) >= limit) {
                            func.apply(context, args)
                            lastRan = Date.now()
                        }
                    }, limit - (Date.now() - lastRan))
                }
            }
        };

        this.length = function (item) {
            if (item instanceof Array) {
                return item.length;
            } else if (item instanceof Object) {
                return Object.keys(item).length;
            }
            throw new Error('Unsupported type');
        }


        this.setControlToNoResultsState = function (control, emptyResults) {
            if (control.showEmpty) {
                control.showEmpty(emptyResults);
            } else {
                control.isEmpty = true;
                control.emptyResults = emptyResults;
            }
        }

        this.getMaxPaginationCount = function () {
            var width = $(window).width();
            if (width >= 768) return 10;
            if (width >= 400) return 5;
            return 1;
        }

        this.getMaxPaginationOneToOne = function () {
            var width = $(window).width();
            if (width >= 1300) return 10;
            if (width >= 1000) return 6;
            if (width >= 850) return 4;
            if (width >= 600) return 3;
            if (width >= 300) return 2;
            return 1;
        }

        var getAbsoluteUrl = (function() {
	        var a;

	        return function(url) {
		        if(!a) a = document.createElement('a');
		        a.href = url;

		        return a.href;
	        };
        })();

        this.getAbsoluteUrl = getAbsoluteUrl;

        this.initScopeForIframeZoom = function (scope) {
            scope.maxZoom = 3.75;
            scope.minZoom = 1;

            scope.zoom = 1;
            scope.zoomIn = function () {
                scope.zoom += 0.25;
                scope.iframeStyle = getIframeZoom(scope.zoom);
            }

            scope.zoomOut = function () {
                scope.zoom -= 0.25;
                scope.iframeStyle = getIframeZoom(scope.zoom);
            }
        }
        
        function getIframeZoom(scale) {
            return {
                "-ms-zoom": scale,
                "-moz-transform": "scale(" + scale + ")",
                "-moz-transform-origin": "0 0",
                "-o-transform": "scale(" + scale + ")",
                "-o-transform-origin": "0 0",
                "-webkit-transform": "scale(" + scale + ")",
                "-webkit-transform-origin": "0 0"
            }
        }
    }]);
}