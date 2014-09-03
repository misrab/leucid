var app = angular.module('app');

var start = true; // for progressData() $scope.$apply();
var BAND = 10; // band size for time series...

app.controller('LandingController', function($scope, d3Service) {
	init();

  /*
    Function definitions
  */
  
	function init() {
    progressData();
    //setInterval(progressData, 4000);
    setInterval(progressTimeSeries, 1000);
  };

  function progressTimeSeries() {
    for (k in $scope.staticTimeSeriesData) {
      $scope.timeSeriesRecentData[k] = Math.random()*BAND;
    }
    $scope.$apply();
  };

  // channge data over time for pretty
  function progressData() {
    $scope.barGroupedData = {
      "Group 1": [
        { name: "Category 1", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 },
        { name: "Category 2", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 },
        { name: "Category 3", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 }
      ],
      "Group 2": [
        { name: "Category 1", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 }
      ],
      "Group 3": [
        { name: "Category 1", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 },
        { name: "Category 2", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 },
        { name: "Category 3", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 }
      ]
    };

    $scope.barBasicData = {
      "Title": [
        { name: "Category 1", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 },
        { name: "Category 2", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 },
        { name: "Category 3", score: Math.random() < 0.5 ? Math.random()*5 : -Math.random()*5 }
      ]
    };


    // scatter
    $scope.scatterData = [
      {label: "dunno", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND, score: 3},

      {label: "yes", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND, score: 12},
      {label: "yes", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND, score: 23},
      {label: "yes", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND},
      {label: "yes", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND},

      {label: "no", x:  -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND},
      {label: "no", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND},
      {label: "no", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND},
      {label: "no", x:  -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND},
      {label: "no", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND},

      {label: "maybe", x:  -BAND + Math.random()*2*BAND, y :  -BAND + Math.random()*2*BAND, score: 10},
      {label: "maybe", x: -BAND + Math.random()*2*BAND, y : -BAND + Math.random()*2*BAND, score: -5}
    ];



    // time series
    if (start === true) {
      $scope.timeSeriesRecentData = {};

      $scope.staticTimeSeriesData = {
        "cows": [],
        "chickens": []
      };
      for (k in $scope.staticTimeSeriesData) {
        for (var i=0; i<20; i++) {
          $scope.staticTimeSeriesData[k].push(-BAND + Math.random()*2*BAND);
        }
      }
    }

    // graph
    if (start === true) {
      $scope.graphData = {
          nodes: [
            { id: 1, label: "cow", score: 20 },
            { id: 2, label: "cow", score: 20 },
            { id: 3, label: "cow", score: 20 },

            { id: 4, label: "chicken", score: 10 },
            { id: 5, label: "chicken", score: 10 },
            { id: 6, label: "chicken", score: 10 },

            { id: 7, label: "chicken", score: 10 },
            { id: 8, label: "chicken", score: 10 },

            { id: 9, label: "chicken", score: 10 }
          ],
          edges : [
            { i: 0, j: 3 },
            { i: 0, j: 4 },
            { i: 0, j: 5 },

            { i: 1, j: 6 },
            { i: 1, j: 7 },

            { i: 2, j: 8 }
          ]
        };
    }

    // apply scope other than first time
    if (start===false) { $scope.$apply(); }
    else { start = false; }
  };
});

