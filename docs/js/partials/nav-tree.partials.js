//HEAD 
(function(app) {
try { app = angular.module("nav-tree"); }
catch(err) { app = angular.module("nav-tree", []); }
app.run(["$templateCache", function($templateCache) {
"use strict";

$templateCache.put("partials/nav-tree/nav-tree-item","<!-- tree/item -->\n" +
    "<a class=\"nav-link\" href=\"#\" ng-href=\"{{item.$nav.href}}\" ng-bind=\"item.title\">-</a>\n" +
    "<ul class=\"nav nav-{{item.$nav.level}} flex-column\" ng-if=\"item.items\">\n" +
    "    <li class=\"nav-item\" ng-class=\"item.$nav.state\" tree-item=\"item\" ng-repeat=\"item in item.items track by $index\"></li>\n" +
    "</ul>")

$templateCache.put("partials/nav-tree/nav-tree","<!-- tree -->\n" +
    "<ul class=\"nav nav-{{item.$nav.level}} flex-column\" ng-if=\"item.items\">\n" +
    "    <li class=\"nav-item\" ng-class=\"item.$nav.state\" tree-item=\"item\" ng-repeat=\"item in item.items track by $index\"></li>\n" +
    "</ul>")
}]);
})();