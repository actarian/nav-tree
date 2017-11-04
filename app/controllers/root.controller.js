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