﻿/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.factory('Nav', function() {
        function Nav(options) {
            var nav = this;
            var defaults = {
                items: [],
            }
            angular.extend(nav, defaults);
            if (options) {
                angular.extend(nav, options);
            }
            nav.addNav(nav, null);
        }
        Nav.prototype = {
            addNav: function(item, parent) {
                var nav = this;
                var $nav = {
                    parent: parent || null,
                    level: parent ? parent.$nav.level + 1 : 0,
                    addItems: function(x) {
                        nav.addItems(x, item);
                    },
                    onNav: nav.onNav,
                };
                item.$nav = $nav;
                $nav.link = nav.getLink(item);
            },
            getLink: function(item) {
                var link = null;
                if (this.onLink) {
                    link = this.onLink(item, item.$nav);
                } else {
                    link = item.link;
                }
                link = link || '#';
                return link;
            },
            addItem: function(item, parent) {
                var nav = this,
                    onLink = nav.onLink,
                    onNav = nav.onNav;
                nav.addNav(item, parent);
                if (parent) {
                    parent.items = parent.items || [];
                    parent.items.push(item);
                }
            },
            addItems: function(itemOrItems, parent) {
                var nav = this;
                if (angular.isArray(itemOrItems)) {
                    angular.forEach(itemOrItems, function(item) {
                        nav.addItem(item, parent);
                    });
                } else {
                    nav.addItem(itemOrItems, parent);
                }
            },
            parse: function(items, parent) {
                var nav = this;
                if (items) {
                    angular.forEach(items, function(item) {
                        nav.addNav(item, parent);
                        nav.parse(item.items, item);
                    });
                }
            },
            setItems: function(items) {
                var nav = this;
                nav.items = items;
                nav.parse(items, nav);
            },
        };
        return Nav;
    });

    app.directive('nav', ['$parse', 'Nav', function($parse, Nav) {
        return {
            restrict: 'A',
            templateUrl: function(element, attributes) {
                return attributes.template || 'partials/nav/nav';
            },
            scope: {
                items: '=nav',
            },
            link: function(scope, element, attributes, model) {
                scope.$watch('items', function(value) {
                    // console.log(value instanceof Nav, value);
                    if (value) {
                        if (angular.isArray(value)) {
                            var onLink = $parse(attributes.onLink)(scope.$parent);
                            var onNav = $parse(attributes.onNav)(scope.$parent);
                            var nav = new Nav({
                                onLink: onLink,
                                onNav: onNav
                            });
                            nav.setItems(value);
                            scope.item = nav;

                        } else if (value instanceof Nav) {
                            scope.item = value;
                        }
                    }
                });
            }
        };
    }]);

    app.directive('navItem', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            templateUrl: function(element, attributes) {
                return attributes.template || 'partials/nav/nav-item';
            },
            scope: {
                item: '=navItem',
            },
            link: function(scope, element, attributes, model) {
                var navItem = angular.element(element[0].querySelector('.nav-link'));
                var state = {};
                scope.item.$nav.state = state;

                var output;

                function itemOpen(item, immediate) {
                    var state = item.$nav.state;
                    state.active = true;

                    $timeout(function() {
                        state.immediate = immediate;
                        state.closed = state.closing = false;
                        state.opening = true;
                        $timeout(function() {
                            state.opening = false;
                            state.opened = true;
                        });
                    });
                }

                function itemClose(item, immediate) {
                    var state = item.$nav.state;
                    state.active = false;
                    $timeout(function() {
                        state.immediate = immediate;
                        state.opened = state.opening = false;
                        state.closing = true;
                        $timeout(function() {
                            state.closing = false;
                            state.closed = true;
                        });
                    });
                    if (item.items) {
                        angular.forEach(item.items, function(o) {
                            itemClose(o, true);
                        });
                    }
                }

                function itemToggle(item) {
                    // console.log('itemToggle', item);
                    var state = item.$nav.state;
                    state.active = item.items ? !state.active : true;
                    if (state.active) {
                        if (item.$nav.parent) {
                            angular.forEach(item.$nav.parent.items, function(o) {
                                if (o !== item) {
                                    itemClose(o, true);
                                }
                            });
                        }
                        itemOpen(item);
                    } else {
                        itemClose(item);
                    }
                    // console.log(state);
                }

                function onTap(e) {
                    var item = scope.item;
                    // console.log('Item.onTap', item);
                    var state = item.$nav.state;
                    if (state.active) {
                        output = false;
                        trigger();
                    } else if (item.$nav.onNav) {
                        var promise = item.$nav.onNav(item, item.$nav);
                        if (promise && typeof promise.then === 'function') {
                            promise.then(function(resolved) {
                                // go on
                                trigger();
                            }, function(rejected) {
                                // do nothing
                            });
                            output = false;
                        } else {
                            output = promise;
                            trigger();
                        }
                    }

                    function trigger() {
                        $timeout(function() {
                            itemToggle(item);
                        });
                    }
                }

                function onTouchStart(e) {
                    // console.log('Item.onTouchStart', e);
                    onTap(e);
                    navItem
                        .off('mousedown', onMouseDown);
                    // return r || prevent(e);
                }

                function onMouseDown(e) {
                    // console.log('Item.onMouseDown', e);
                    onTap(e);
                    navItem
                        .off('touchstart', onTouchStart);
                    // return r || prevent(e);
                }

                function onClick(e) {
                    // console.log('Item.onClick', e);
                    return prevent(e);
                }

                function prevent(e) {
                    if (output === false) {
                        // console.log('Item.prevent', e);
                        e.preventDefault();
                        // e.stopPropagation();
                        return false;
                    }
                }

                function addListeners() {
                    navItem
                        .on('touchstart', onTouchStart)
                        .on('mousedown', onMouseDown)
                        .on('click', onClick);
                }

                function removeListeners() {
                    navItem
                        .off('touchstart', onTouchStart)
                        .off('mousedown', onMouseDown)
                        .off('click', onClick);
                }

                addListeners();

                scope.$on('$destroy', function() {
                    removeListeners();
                });
            }
        };
    }]);

}());