function attach_log_service(app) {
    app.service('logService', function () {
        this.debug = false;
        this.printStack = false;
        
        this.log = function (message) {
            if (this.debug) {
                if (this.printStack) {
                    var stack = new Error().stack;
                    message = message + stack.substr(5)
                }
                console.log(message);
            }
        }
    });
}