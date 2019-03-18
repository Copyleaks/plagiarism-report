function attach_affixService(app) {
    app.service('affixService', ['$q', function ($q) {
        var service = {
            init: init,

        };

        function init($scope, targetElementSelector, affixElementId) {
            var valWhenStartedScrolling = -1;
            var type = 'html';
            $scope.$on('registerAffix', function (event, params) {
                type = params.type;
                $scope.registerAffix();
            });

            function onAffixOff() {
                //$('#my-affix').css('width', '');
            }
            $scope.registerAffix = function () {
                $scope.removeAffix = function () {
                    var element = document.getElementById(affixElementId);

                    var $element = $(element);
                    $element.removeClass('my-affix-active');
                    var parent = $element.parent();
                    parent.css('flex-direction', 'row');
                }

                $scope.deregisterAffix = function () {
                    window.removeEventListener('scroll', handleScroll);
                };

                window.removeEventListener('scroll', handleScroll);
                window.addEventListener('scroll', handleScroll);

                $(window).resize(function () {
                    var window$ = $(window);

                    if (window$.width() < 768) return;

                    var element = document.getElementById(affixElementId);
                    var $element = $(element);
                    if ($element.hasClass('my-affix-active')) {
                    }
                })
            }

            var originalPosition = -1;

            function handleScroll() {
                handleHtmlScroll();
            }

            function handleHtmlScroll() {
                var window$ = $(window);

                var target = $(targetElementSelector)
                // Show affix on scroll.
                var element = document.getElementById(affixElementId);

                var $element = $(element);

                if (window$.width() < 768) {
                    onAffixOff();
                    return;
                }
                if (!$scope.okToAffix) {
                    //onAffixOff();
                    return;
                }
                var windowInnerHeight = window.innerHeight;
                var targetOffsetTop = target.offset().top;
                var bottomOfTargetPosition = targetOffsetTop - windowInnerHeight + target.height();
                var elementOffsetTop = $element.offset().top;
                var elementHeight = $element.height()
                var windowScrollTopHeight = window$.scrollTop();
                var resultColumnHeight = $('.actual-results-height').height();

                if (windowScrollTopHeight < valWhenStartedScrolling) {
                    removeAffix($element);
                    valWhenStartedScrolling = -1;

                } else if (windowScrollTopHeight < originalPosition) {
                    removeAffix($element);
                    valWhenStartedScrolling = -1;
                }
                else if (valWhenStartedScrolling == -1 && windowScrollTopHeight >= bottomOfTargetPosition) {
                    
                    var siblingWidth = $('.result-div').width();
                    var affixWidth = $('#my-affix').width();
                    var parent = $element.parent();
                    var parentwidth = parent.width();
                    if (windowScrollTopHeight <= elementOffsetTop) {
                        return;
                    }

                    if (resultColumnHeight < $element.find('md-card').height()) return;

                    originalPosition = elementOffsetTop;
                    var mdCardHeight = $element.find('md-card').height();
                    $element.addClass('my-affix-active');
                    valWhenStartedScrolling = bottomOfTargetPosition;

                    if (elementHeight < windowInnerHeight) {
                        $element.css('top', 0);
                        $element.css('bottom', 'auto');
                    } else {
                        $element.css('bottom', 62);
                        $element.css('top', 'auto');
                    }

                    parent.css('flex-direction', 'row-reverse');

                    
                    var percentage = siblingWidth / parentwidth * 100;

                    $element.find('md-card').css('margin-top', 0);
                    //var newWidth = '' + ((parentwidth - siblingWidth - 16) / parentwidth * 100) + '%';
                    var newWidth = '' + ((affixWidth / parentwidth) * 100) + '%';

                    console.log('=' + percentage + (affixWidth / parentwidth) * 100)
                    $('#my-affix').css('width', newWidth);
                  //  $('#my-affix').css('flex-basis', newWidth);
                    //$('.result-div').css('flex', '0 0 ' + percentage + '%');
                }
            }

            function removeAffix($element) {
                var parent = $element.parent();
                parent.css('flex-direction', '');

                $element.removeClass('my-affix-active');
                valWhenStartedScrolling = -1;
                $element.css('top', 'auto');
                $element.css('bottom', 'auto');
                onAffixOff();
                $element.css('width', 'auto');
                $element.find('md-card').css('margin-top', '');
                //$('.result-div').css('flex', '1 0 0');
            }

        }

        return service;

    }]);
}