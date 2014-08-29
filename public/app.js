var app = angular.module('app', [
	'ngRoute',
	'ngCookies',
  'd3',
  'hljs' // syntax highlighting in landing.html
  //'http-auth-interceptor',
	// 'angularFileUpload'
]);


// directive for ng-enter on enter button press
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
    	element.bind("keydown keypress", function (event) {
        //element.bind("keydown keypress", function (event) {
            if(event.which === 13) { 
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl:  '/views/basic/landing.html',
    controller:   "LandingController" 
  })


  .otherwise({
    templateUrl: '/views/basic/landing.html',
    controller:   "LandingController"
  });

  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);
});