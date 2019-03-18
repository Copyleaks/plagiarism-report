function attach_reportOnResize(app) {
    app.directive('cpOnResize', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (typeof ResizeSensor == 'undefined') return;

                $timeout(function () {
                    var sensor = new ResizeSensor(element[0], function () {
                        $timeout(function () {
                            $rootScope.$broadcast('on-element-resized');
                        });

                    });

                    scope.$on('$destroy', function () {
                        sensor.detach();
                    });
                }, 500)

            }
        }
    }]);
}
