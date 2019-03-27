function attach_iFrameService(app) {
    app.service('iframeService', [ 'pageService',
        function (pageService) {
            var service = {
                getIframeText: getIframeText
            };

            
            function cpyc(rangeIds, pageType) {

                var message = {
                    rangeIds: rangeIds,
                    type: 'copyleaksMatchClicked',
                    pageType: pageType
                };

                window["removeCss"]();
                
                var messageText = JSON.stringify(message);

                parent.postMessage(messageText, "*");

                var combinedClasses = '.' + rangeIds.join('.');
                //var clickedItems = document.querySelectorAll('.i_5620889_0.i_5620882_0.i_5620884_0.i_5620885_0');

                var style = window.copyleaksSelectedStyle = document.createElement('style');
                style.type = 'text/css';

                var matchType = rangeIds[0].substr(0, 1);
                var color = window["getColorForMatchType"](matchType);

                style.innerHTML = combinedClasses + '{border-bottom: 2px solid ' + color + '}';
                document.getElementsByTagName('head')[0].appendChild(style);

            }

            function removeCss() {
                if (window.copyleaksSelectedStyle) {
                    window.copyleaksSelectedStyle.remove();
                    window.copyleaksSelectedStyle = null;
                }
            }

            function listenToMatchScrollRequest(){
                window.addEventListener("message", receiveMessage, false);

                function receiveMessage(event) {
                    
                    if (!event || !event.data) return;

                    var eventData = null;
                    try {
                        eventData = JSON.parse(event.data)
                    } catch (ex) {
                        return;
                    }
                    

                    if (eventData.type !== "copyleaksMatchScrollRequest") return;
                    var className = eventData.matchId;
                    var elementToScrollTo = document.getElementsByClassName(className)[0];

                    var viewportOffset = elementToScrollTo.getBoundingClientRect();
                    // these are relative to the viewport, i.e. the window
                    var top = viewportOffset.top + window.scrollY;
                    if (top < 0) top = 0;
                    var left = viewportOffset.left;
                    window["removeCss"]();

                    var matchType = className[0].substr(0, 1);
                    var color = window["getColorForMatchType"](matchType);

                    var style = window.copyleaksSelectedStyle = document.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = '.' + className + '{border-bottom: 2px solid '+ color + '}';
                    document.getElementsByTagName('head')[0].appendChild(style);
                    
                    function isInPdfDocument() {
                        var metas = document.getElementsByTagName('meta');

                        for (var i = 0; i < metas.length; i++) {
                            if (metas[i].getAttribute("name") == "generator" && metas[i].getAttribute("content") == "pdf2htmlEX") {
                                return true;
                            }
                        }

                        return false;
                    }

                    function findAncestor(el, sel) {
                        while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el, sel)));
                        return el;
                    }

                    if (isInPdfDocument()) {
                        
                        var pageContainingElement = findAncestor(elementToScrollTo, '[data-page-no]');
                        window.testElement = pageContainingElement;
                        var pageOffset = pageContainingElement.getBoundingClientRect();
                        var pageTop = pageOffset.top;;
                        var scrollingParent = document.getElementById('page-container');
                        
                        scrollingParent.scrollTop = scrollingParent.scrollTop + pageTop;

                        setTimeout(function () {
                            var offset = elementToScrollTo.getBoundingClientRect();
                            scrollingParent.scrollTop = scrollingParent.scrollTop + offset.top;
                            scrollingParent.scrollLeft = offset.left;
                            
                        },100)
                    }
                    else {
                        window.scrollTo(left, top);
                    }
                }
            }

            String.prototype.replaceAll = function (search, replacement) {
                var target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };

            function getIframeText(pageText) {
                var el = document.createElement('html');
                //pageText = pageText.replaceAll('https://sandbox.copyleaks.com/?', 'https://sandbox.copyleaks.com?');
                //pageText = pageText.replaceAll('https://sandbox.copyleaks.com??', 'https://sandbox.copyleaks.com?');
                try {
                    el.innerHTML = pageText;
                } catch (err) {
                    
                }
                var body = el.getElementsByTagName('body')[0];
                body.classList.add('identical-on', 'similar-on', 'related-on');

                var head = el.getElementsByTagName('head')[0];

                // Insert matches colors
                var style = document.createElement("style");
                style.innerHTML = ".identical-on .highlight-1{background:rgba(255,102,102,.6);cursor:pointer}.similar-on .highlight-2{background:rgba(255,154,154,.6);cursor:pointer}.related-on .highlight-3{background:rgba(255,217,176,.6);cursor:pointer}.highlight-4{opacity:.5;font-style:italic}";
                head.appendChild(style);

                var script = document.createElement('script');
                script.type = 'text/javascript';

                var scriptContent = document.createTextNode(
                    "var cpyc = " + cpyc.toString() + ";" +
                    "var listenToMatchScrollRequest = " + listenToMatchScrollRequest.toString() + ";" +
                    "var removeCss = " + removeCss.toString() + ";" +
                    "var getColorForMatchType= " + pageService.getColorForMatchType + ";" +
                    "listenToMatchScrollRequest();");
                script.appendChild(scriptContent);
                head.appendChild(script);

                pageText = el.outerHTML;
                return pageText;
            }

            return service;
        }])
}
