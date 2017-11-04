/* global angular */

(function() {
    "use strict";

    var app = angular.module('app', ['ngRoute', 'jsonFormatter']);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['$httpProvider', function($httpProvider) {
        // $httpProvider.defaults.withCredentials = true;
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['$locationProvider', function($locationProvider) {

        // HTML5 MODE url writing method (false: #/anchor/use, true: /html5/url/use)
        $locationProvider.html5Mode(false);
        $locationProvider.hashPrefix('');

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.run(['$rootScope', function($rootScope) {

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.directive('navTree', ['$parse', function($parse) {
        return {
            restrict: 'A',
            templateUrl: 'partials/nav-tree/nav-tree',
            scope: {
                items: '=navTree',
            },
            link: function(scope, element, attributes, model) {
                var onLink = $parse(attributes.onLink)(scope.$parent);
                var onNav = $parse(attributes.onNav)(scope.$parent);

                var nav = {
                    level: 0,
                };

                var item = {
                    items: [],
                    $nav: nav,
                };

                function getHref(item) {
                    var url = item.url;
                    if (onLink) {
                        url = onLink(item);
                    }
                    url = url || '#';
                    return url;
                }

                function add(item, parent) {
                    item.$nav = {
                        parent: parent,
                        level: parent.$nav.level + 1,
                        href: getHref(item),
                        onNav: onNav,
                        add: function(obj) {
                            add(obj, item);
                            item.items.push(obj);
                        },
                    };
                }

                function parse(items, parent) {
                    if (items) {
                        angular.forEach(items, function(item) {
                            add(item, parent);
                            parse(item.items, item);
                        });
                    }
                }

                scope.$watch('items', function(items) {
                    if (items) {
                        item.items = items;
                        parse(item.items, item);
                    }
                });

                scope.item = item;

            }
        };
    }]);

    app.directive('navTreeItem', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            templateUrl: 'partials/nav-tree/nav-tree-item',
            scope: {
                item: '=navTreeItem',
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
                    // console.log('treeItem.onTap');
                    var item = scope.item;
                    var state = item.$nav.state;
                    if (state.active) {
                        output = false;
                        trigger();
                    } else if (item.$nav.onNav) {
                        var promise = item.$nav.onNav(item);
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
                    // console.log('treeItem.onTouchStart', e);
                    onTap(e);
                    navItem
                        .off('mousedown', onMouseDown);
                    // return r || prevent(e);
                }

                function onMouseDown(e) {
                    // console.log('treeItem.onMouseDown', e);
                    onTap(e);
                    navItem
                        .off('touchstart', onTouchStart);
                    // return r || prevent(e);
                }

                function onClick(e) {
                    // console.log('treeItem.onClick', e);
                    return prevent(e);
                }

                function prevent(e) {
                    if (output === false) {
                        // console.log('treeItem.prevent', e);
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
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('RootCtrl', ['$scope', '$q', '$http', '$timeout', function($scope, $q, $http, $timeout) {

        $http.get('https://supahfunk.github.io/rossini/json/menu-rossini.js').then(function(response) {
            $scope.items = response.data;

        }, function(error) {
            console.log('RootCtrl.error', error);
        });

        function onLink(item) {
            var url = item.url;
            url = url ? '#' + url : '#';
            /*
            if (item.years) {
                var key = String(item.years.to ? item.years.from + '-' + item.years.to : item.years.from); // da riattivare !!!
                url = '/years/' + key;
            }
            */
            console.log('RootCtrl.onLink', url);
            return url;
        }

        function onNav(item) {
            console.log('RootCtrl.onNav', item, item.$nav.level);
            return false; // disable default link behaviour;
        }

        function onNavPromise(item) {
            return $promise(function(promise) {
                console.log('RootCtrl.onNavPromise', item, item.$nav.level);
                $timeout(function() {
                    if (item.items) {
                        item.$nav.add({
                            title: "Azz",
                        });
                    }
                    promise.resolve();
                });
            }); // a promise always disable default link behaviour;
        }

        $scope.onLink = onLink;
        $scope.onNav = onNavPromise;

        function $promise(callback) {
            if (typeof callback !== 'function') {
                throw ('promise resolve callback missing');
            }
            var deferred = $q.defer();
            callback(deferred);
            return deferred.promise;
        }

    }]);

}());