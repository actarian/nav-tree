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
            /*
            link = link ? '#' + link : '#';
            if (item.years) {
                var key = String(item.years.to ? item.years.from + '-' + item.years.to : item.years.from); // da riattivare !!!
                link = '/years/' + key;
            }
            */
            console.log('RootCtrl.onLink', item.$nav.level, link);
            return link;
        }

        function onNav(item) {
            console.log('RootCtrl.onNav', item.$nav.level, item.$nav.link);
            return false; // disable default link behaviour;
        }

        function onNavPromise(item) {
            $scope.selected = item;
            return $promise(function(promise) {
                console.log('RootCtrl.onNavPromise', item.$nav.level, item.$nav.link);
                $timeout(function() {
                    if (item.items) {
                        item.$nav.addItems({
                            title: "Item",
                        });
                    }
                    promise.resolve();
                });
            }); // a promise always disable default link behaviour;
        }

        /*
        $scope.onLink = onLink;
        $scope.onNav = onNavPromise;
        */

        $scope.nav = nav;

    }]);

}());