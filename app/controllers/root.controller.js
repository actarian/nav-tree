/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('RootCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

        $http.get('https://supahfunk.github.io/rossini/json/menu-rossini.js').then(function(response) {
            $scope.items = response.data;
        }, function(error) {
            console.log('RootCtrl.error', error);
        });

        function onMenuTapped(item, level) {
            console.log('RootCtrl.onMenuTapped', item, level);
        }

        $scope.onMenuTapped = onMenuTapped;

    }]);

    app.directive('tree', ['$parse', function($parse) {
        return {
            restrict: 'A',
            templateUrl: 'partials/tree',
            scope: {
                items: '=tree',
            },
            link: function(scope, element, attributes, model) {
                var callback = $parse(attributes.action)(scope.$parent);
                console.log('callback', attributes.action, callback);

                var menu = {
                    items: [],
                }

                function parse(items, $parent, $level) {
                    $level = $level || 0;
                    if (items) {
                        angular.forEach(items, function(item) {
                            item.$parent = $parent;
                            item.$callback = callback;
                            item.$level = $level;
                            if (item.years) {
                                item.years.key = String(item.years.to ? item.years.from + '-' + item.years.to : item.years.from); // da riattivare !!!
                                item.url = '/years/' + item.years.key;
                                // item.detailUrl = item.url + '/detail';
                            }
                            parse(item.items, item, $level + 1);
                        });
                    }
                }

                scope.$watch('items', function(items) {
                    if (items) {
                        menu.items = items;
                        parse(menu.items, menu);
                    }
                });

                scope.item = menu;

            }
        };
    }]);

    app.directive('treeItem', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            templateUrl: 'partials/tree/item',
            scope: {
                item: '=treeItem',
            },
            link: function(scope, element, attributes, model) {
                var navItem = angular.element(element[0].querySelector('.nav-item'));
                var state = {};
                scope.item.$state = state;

                function itemOpen(item, immediate) {
                    var state = item.$state;
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
                    var state = item.$state;
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
                    var state = item.$state;
                    state.active = !state.active;
                    if (state.active) {
                        if (item.$parent) {
                            angular.forEach(item.$parent.items, function(o) {
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
                    // console.log('treeItem.onTap');        
                    $timeout(function() {
                        var item = scope.item;
                        if (item.$callback) {
                            item.$callback(item, item.$level);
                        }
                        itemToggle(item);
                    });
                }

                function onTouchStart(e) {
                    onTap();
                    navItem
                        .off('mousedown', onMouseDown);
                    return prevent(e);
                }

                function onMouseDown(e) {
                    onTap();
                    navItem
                        .off('touchstart', onTouchStart);
                    return prevent(e);
                }

                function prevent(e) {
                    e.preventDefault();
                    return false;
                }

                function addListeners() {
                    navItem
                        .on('touchstart', onTouchStart)
                        .on('mousedown', onMouseDown);
                }

                function removeListeners() {
                    navItem
                        .off('touchstart', onTouchStart)
                        .off('mousedown', onMouseDown);
                }

                addListeners();

                scope.$on('$destroy', function() {
                    removeListeners();
                });

            }
        };
    }]);

}());