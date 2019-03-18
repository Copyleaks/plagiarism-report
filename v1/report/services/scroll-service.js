function attach_scrollService(app) {
    app.service('scrollService', ['pageService',
        function (pageService) {
            var service = {
                scrollSource: scrollSource,
                scrollSuspect: scrollSuspect,
                setSourceMatchToScrollTo: setSourceMatchToScrollTo,
                setSuspectMatchToScrollTo: setSuspectMatchToScrollTo,

                recordSourcePageTopLocation: recordSourcePageTopLocation,
                recordSuspectPageTopLocation: recordSuspectPageTopLocation
            };

            var data = {};

            function scrollSource(control) {
                if (hasSourceMatchToScrollTo()) {
                    scrollToSourceMatch(control);
                } else if (hasSourcePageTopLocation()) {
                    scrollToSourcePageTopLocation();
                }
            }

            function scrollSuspect(pageControl) {
                if (hasSuspectMatchToScrollTo()) {
                    scrollToSuspectMatch(pageControl);
                } else if (hasSuspectPageTopLocation()) {
                    scrollToSuspectPageTopLocation();
                }
            }

            // #region locations

            // #region sources

            function hasSourcePageTopLocation() {
                return data.sourcePageLocation !== undefined;
            }

            function recordSourcePageTopLocation(top) {
                data.sourcePageLocation = $('.source-page').find('.panel-body').scrollTop();
            }

            function scrollToSourcePageTopLocation() {
                $('.source-page').find('.panel-body').scrollTop(data.sourcePageLocation)
                delete data.sourcePageLocation;
            }

            // #endregion
            
            // #region suspects

            function hasSuspectPageTopLocation() {
                return data.suspectPageLocation !== undefined;
            }

            function recordSuspectPageTopLocation(top) {
                data.suspectPageLocation = $('.suspect-page').find('.panel-body').scrollTop();
            }

            function scrollToSuspectPageTopLocation() {
                $('.suspect-page').find('.panel-body').scrollTop(data.suspectPageLocation)
                delete data.suspectPageLocation;
            }

            // #endregion
            // #endregion


            // #region Matches

            // #region sources

            function hasSourceMatchToScrollTo() {
                return data.SoS !== undefined;
            }

            function scrollToSourceMatch(control) {
                scrollToMatch('.' + data.SoS,control);
                delete data.SoS;
            }

            function setSourceMatchToScrollTo(SoS) {
                data.SoS= SoS;
            }

            // #endregion

            // #region suspect
            function hasSuspectMatchToScrollTo() {
                return data.SuS !== undefined;
            }

            function scrollToSuspectMatch(pageControl) {
                scrollToMatch('.' + data.SuS, pageControl);
                delete data.SuS;
            }

            function setSuspectMatchToScrollTo(SuS) {
                data.SuS = SuS;
            }

            // #endregion

            function getSelectorMatchTypeColorClassName(selector){
                var matchTpe = selector.substr(1, 1);
                return pageService.getColorForMatchType(matchTpe);
            }

            function scrollToMatch(selector, control,color) {

                var matchElemnt = control.findElement(selector);
                if (matchElemnt.length > 0) {
                    var matchPosition = matchElemnt.offset().top - matchElemnt.parent().offset().top;
                    var panelBody = matchElemnt.closest('.panel-body');

                    $('.selected-match').removeClass('selected-match');
                    matchElemnt.addClass('selected-match');

                    panelBody.animate({
                        scrollTop: matchPosition
                    }, 400);
                }
            }

            // #endregion   
            return service;
        }])
}
