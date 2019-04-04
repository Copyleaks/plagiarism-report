function attach_filters(app) {
    var removeProtocol = function () {
        return function (value) {
            return value && value.replace(/(^\w+:|^)\/\//, ''); // Remove the http/https prefix from URL.
        };
    };
    var prettyNumberWithK = function () {
        return function (value) {
            if (value > 1000)
                return parseInt(value / 1000).toLocaleString('en') + "k";
            else
                return value;
        };
    };
    var prettyNumber = function () {
        return function (value) {
            if (value >= 1000)
                return value.toLocaleString('en');
            else
                return value;
        };
    };

    app.filter('removeProtocol', removeProtocol)
        .filter('prettyNumberWithK', prettyNumberWithK)
        .filter('prettyNumber', prettyNumber);

}