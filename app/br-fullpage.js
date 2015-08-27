(function(){
    'use strict';

    angular
        .module('br.fullpage', [])
        .directive('fullpage', ['$window', FullPage])
        .directive('fullpageHref', ['$window', FullpageHref]);

    var nav,
        pageHeight,
        pageIndex,
        pages,
        scrolling;

    function FullpageHref(){
        function fullpageHref($scope, $element){
            $element.css('cursor', 'pointer');
            $element.on('click', function(){
                for (var i = 0; i < pages.length; i++) {
                    if (pages[i].id == $scope.scrollTo){
                        pageIndex = i;
                    }
                }
                angular.element(pages[0]).css(
                    'marginTop', '-' + pageHeight * pageIndex + 'px'
                );
                angular.element(document.getElementsByClassName('br-fullpage-nav-item')).removeClass('active');
                angular.element(document.getElementsByClassName('br-fullpage-nav-item')[pageIndex]).addClass('active');
                sessionStorage.setItem('br-fullpage-index', pageIndex);
            });
        }

        return {
            scope: {
                scrollTo: '@fullpageHref'
            },
            restrict: 'A',
            link: fullpageHref
        }
    }

    function FullPage($window){
        function fullPage($scope, $element, $attr){
            pages = document.getElementsByClassName($attr.pageClass);
            nav = document.getElementsByClassName('br-fullpage-nav')[0];
            pageHeight = $window.innerHeight;
            scrolling = false;

            //retrieve page index from session storage
            pageIndex = sessionStorage.getItem('br-fullpage-index');
            if (!pageIndex){
                pageIndex = 0;
            }

            //add fullpage class
            angular.element(pages).addClass('br-fullpage');

            //add menu items
            for (var i = 0; i<pages.length; i++){
                angular.element(nav).append('<li><i class="br-fullpage-nav-item"></i></li>');
            }

            //align menu in middle
            nav.style.marginTop = (0 - (pages.length * 17)) + 'px';
            angular.element(document.getElementsByClassName('br-fullpage-nav-item')[pageIndex]).addClass('active');
            angular.element(pages[0]).css(
                'marginTop', '-' + pageHeight * pageIndex + 'px'
            );

            //set height
            function setHeight(){
                angular.element(document.querySelectorAll('.br-fullpage-wrapper')).css({
                    'height': pageHeight + 'px',
                    'display': 'block'
                });
                angular.element(document.querySelectorAll('.br-fullpage')).css(
                    'height', pageHeight + 'px'
                );
            }
            setHeight();

            //paginate function
            function paginate(delta){
                if (!scrolling){
                    scrolling = true;
                    if (delta > 0) {
                        prevPage();
                    }
                    else {
                        nextPage();
                    }
                    angular.element(pages[0]).css(
                        'marginTop', '-' + pageHeight * pageIndex + 'px'
                    );
                    angular.element(document.getElementsByClassName('br-fullpage-nav-item')).removeClass('active');
                    angular.element(document.getElementsByClassName('br-fullpage-nav-item')[pageIndex]).addClass('active');
                    sessionStorage.setItem('br-fullpage-index', pageIndex);
                    // notify listeners about page scroll
                    $scope.$emit('br-fullpage:pageScrolled', pageIndex);

                    setTimeout(function () {
                        scrolling = false;
                    }, 1000);
                }
            }

            function prevPage() {
                if (pageIndex !== 0) {
                    pageIndex--;
                }
            }

            function nextPage() {
                if (pageIndex < (pages.length-1)){
                    pageIndex++;
                }
            }

            function getEvent(e) {
                return window.event || e.originalEvent || e;
            }

            function mouseScroll(e){
                var event = getEvent(e);
                event.preventDefault();
                var delta = event.detail? event.detail*(-120) : event.wheelDelta;
                paginate(delta);
            }

            var startTouchY,
                swiping = false;
            function startTouch(e){
                var event = getEvent(e);
                if (!swiping) {
                    swiping = true;
                    startTouchY = event.changedTouches[0].pageY;
                }
            }
            function endTouch(e){
                var event = getEvent(e);
                var endTouchY = event.changedTouches[0].pageY;
                if (swiping && endTouchY != startTouchY) {
                    event.preventDefault();
                    swiping = false;
                    var delta = endTouchY - startTouchY;
                    paginate(delta);
                }
            }

            function resize(){
                pageHeight = $window.innerHeight;
                angular.element(pages[0]).css(
                    'marginTop', '-' + pageHeight * pageIndex + 'px'
                );
                setHeight();
            }

            //Event Bindings
            angular.element(document).bind("mousewheel", mouseScroll); //IE9, Chrome, Safari, Opera
            angular.element(document).bind("onmousewheel", mouseScroll); //IE 6-8
            angular.element(document).bind("wheel", mouseScroll); //Firefox

            angular.element(document).bind("touchstart", startTouch); //Mobile
            angular.element(document).bind("pointerdown", startTouch); //Mobile
            angular.element(document).bind("MSPointerDown", startTouch); //Mobile

            angular.element(document).bind("touchmove", endTouch); //Mobile
            angular.element(document).bind("pointermove", endTouch); //Mobile
            angular.element(document).bind("MSPointerMove", endTouch); //Mobile

            angular.element($window).bind("resize", resize);

            //Event Destroy
            $scope.$on('$destroy', function(){
                angular.element(document).unbind("mousewheel", mouseScroll); //IE9, Chrome, Safari, Opera
                angular.element(document).unbind("onmousewheel", mouseScroll); //IE 6-8
                angular.element(document).unbind("wheel", mouseScroll); //Firefox
                angular.element(document).unbind("touchstart", startTouch); //Mobile
                angular.element(document).unbind("pointerdown", startTouch); //Mobile
                angular.element(document).unbind("MSPointerDown", startTouch); //Mobile
                angular.element(document).unbind("touchmove", endTouch); //Mobile
                angular.element(document).unbind("pointermove", endTouch); //Mobile
                angular.element(document).unbind("MSPointerMove", endTouch); //Mobile
                angular.element($window).unbind("resize", resize);
            });
        }

        return {
            template:   '<section class="br-fullpage-wrapper">' +
                            '<section ng-transclude>' +
                            '</section>' +
                            '<ul class="br-fullpage-nav"></ul>' +
                        '</section>',
            restrict: 'E',
            transclude: true,
            replace: true,
            link: fullPage
        }
    }
})();
