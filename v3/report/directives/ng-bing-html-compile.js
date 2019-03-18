function attachBindHtmlCompile(app) {
    app.directive('ngBindHtmlCompile', ['$compile', '$parse', function ($compile, $parse) {
        return {
            link: function (scope, element, attr) {
                var parsed = $parse(attr.ngBindHtmlCompile);
                function getStringValue() { return (parsed(scope) || '').toString(); }
                scope.$watch(getStringValue, function (val) {
                    element.html(val);
                    if (attr.compileTags) {
                        $compile(element[0].querySelectorAll(attr.compileTags))(scope);
                    } else {
                        $compile(element, null, -9999)(scope);
                    }
                });
            }
        }
    }]);

    app.filter('unsafe', ["$sce", function ($sce) { return $sce.trustAsHtml; }]);
}
