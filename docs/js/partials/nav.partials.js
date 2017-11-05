//HEAD 
(function(app) {
try { app = angular.module("app"); }
catch(err) { app = angular.module("app", []); }
app.run(["$templateCache", function($templateCache) {
"use strict";

$templateCache.put("partials/nav/nav-item","<!-- nav/item -->\n" +
    "<a class=\"nav-link\" href=\"#\" ng-href=\"{{item.$nav.link}}\" ng-bind=\"item.title\">-</a>\n" +
    "<ul class=\"nav nav-{{item.$nav.level}} flex-column\" ng-if=\"item.items\">\n" +
    "    <li class=\"nav-item\" ng-class=\"item.$nav.state\" nav-item=\"item\" ng-repeat=\"item in item.items track by $index\"></li>\n" +
    "</ul>")

$templateCache.put("partials/nav/nav","<!-- nav -->\n" +
    "<ul class=\"nav nav-{{item.$nav.level}} flex-column\" ng-if=\"item.items\">\n" +
    "    <li class=\"nav-item\" ng-class=\"item.$nav.state\" nav-item=\"item\" ng-repeat=\"item in item.items track by $index\"></li>\n" +
    "</ul>")
}]);
})();