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

    app.controller('RootCtrl', ['$scope', '$http', '$timeout', '$promise', 'Nav', function($scope, $http, $timeout, $promise, Nav) {

        var nav = new Nav({
            onLink: onLink,
            onNav: onNav,
        });

        $http.get('json/menu.js').then(function(response) {
            // $scope.items = response.data;
            nav.setItems(response.data);

        }, function(error) {
            console.log('RootCtrl.error', error);

        });

        function onLink(item) {
            var link = item.url;
            console.log('RootCtrl.onLink', item.$nav.level, link);
            return link;
        }

        function onNav(item) {
            console.log('RootCtrl.onNav', item.$nav.level, item.$nav.link);
            Nav.silent(item.$nav.link);
            return false; // returning false disable default link behaviour;
        }

        function onNavPromise(item) {
            $scope.selected = item;
            return $promise(function(promise) {
                console.log('RootCtrl.onNavPromise', item.$nav.level, item.$nav.link);
                $timeout(function() {
                    if (item.items) {
                        item.$nav.addItems({
                            name: "Item",
                        });
                    }
                    promise.resolve();
                });
            }); // a promise always disable default link behaviour;
        }

        $scope.nav = nav;

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

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
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.factory('Nav', ['$silent', function($silent) {
        function Nav(options) {
            var nav = this;
            var defaults = {
                items: [],
            }
            angular.extend(nav, defaults);
            if (options) {
                angular.extend(nav, options);
            }
            nav.setNav(nav, null);
        }
        Nav.prototype = {
            setItems: function(items) {
                var nav = this;
                nav.path = $silent.path();
                nav.items = items;
                nav.setNavs(items, nav);
            },
            setNavs: function(items, parent) {
                var nav = this;
                if (items) {
                    angular.forEach(items, function(item) {
                        nav.setNav(item, parent);
                        nav.setNavs(item.items, item);
                    });
                }
            },
            setNav: function(item, parent) {
                var nav = this;
                var $nav = {
                    parent: parent || null,
                    level: parent ? parent.$nav.level + 1 : 0,
                    state: {},
                    addItems: function(x) {
                        nav.addItems(x, item);
                    },
                    onNav: nav.onNav,
                };
                item.$nav = $nav;
                $nav.link = nav.getLink(item);
                if ($nav.link === nav.path) {
                    $nav.state.active = true;
                    $nav.state.opened = true;
                    while ($nav.parent) {
                        $nav = $nav.parent.$nav;
                        $nav.state.active = true;
                        $nav.state.opened = true;
                    }
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
            addItem: function(item, parent) {
                var nav = this,
                    onLink = nav.onLink,
                    onNav = nav.onNav;
                nav.setNav(item, parent);
                if (parent) {
                    parent.items = parent.items || [];
                    parent.items.push(item);
                }
            },
            getLink: function(item) {
                var link = null;
                if (this.onLink) {
                    link = this.onLink(item, item.$nav);
                } else {
                    link = item.link;
                }
                return link;
            },
        };
        var statics = {
            silent: function(path) {
                $silent.silent(path);
            },
            path: function(path) {
                $silent.path(path);
            },
        };
        angular.extend(Nav, statics);
        return Nav;
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.factory('$promise', ['$q', function($q) {
        function $promise(callback) {
            if (typeof callback !== 'function') {
                throw ('promise resolve callback missing');
            }
            var deferred = $q.defer();
            callback(deferred);
            return deferred.promise;
        }
        var statics = {
            all: function(promises) {
                return $q.all(promises);
            },
        };
        angular.extend($promise, statics);
        return $promise;
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.factory('$silent', ['$rootScope', '$location', function($rootScope, $location) {
        function $silent() {}

        var $path;

        function unlink() {
            var listeners = $rootScope.$$listeners.$locationChangeSuccess;
            angular.forEach(listeners, function(value, name) {
                if (value === listener) {
                    return;
                }

                function relink() {
                    listeners[name] = value;
                }
                listeners[name] = relink; // temporary unlinking
            });
        }

        function listener(e) {
            // console.log('onLocationChangeSuccess', e);
            if ($path === $location.path()) {
                unlink();
            }
            $path = null;
        }

        var statics = {
            silent: function(path, replace) {
                // this.prev = $location.path(); ???
                var location = $location.url(path);
                if (replace) {
                    location.replace();
                }
                $path = $location.path();
            },
            path: function(path) {
                return $location.path(path);
            },
        };

        angular.extend($silent, statics);
        $rootScope.$$listeners.$locationChangeSuccess.unshift(listener);
        // console.log('$rootScope.$$listeners.$locationChangeSuccess', $rootScope.$$listeners.$locationChangeSuccess);
        return $silent;
    }]);

}());