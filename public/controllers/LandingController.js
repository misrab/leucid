var app = angular.module('app');

var start = true; // for progressData() $scope.$apply();

app.controller('LandingController', function($scope, d3Service) {
	init();

  /*
    Function definitions
  */
 
	function init() {
    progressData();
    //setInterval(progressData, 5000);
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

    if (start===false) { $scope.$apply(); }
    else { start = false; }
  };
});





// 		$scope.chartData = [
//         	{name: "Greg", score: 25},
//         	{name: "Ari", score: 43},
//         	{name: 'Q', score: 34},
//           {name: 'Harry Potter', score: 10},
//         	{name: "Loser", score: -20}
//       	];

//   	$scope.scatterData = [
//       {label: "dunno", x: 0, y : 0, score: 3},

//   		{label: "yes", x: 1, y : 200, score: 12},
//       {label: "yes", x: 4, y : 3, score: 23},
//       {label: "yes", x: 4, y : 5},
//       {label: "yes", x: 3, y : 1},

//   		{label: "no", x: 13, y : 17},
//       {label: "no", x: 7, y : 19},
//       {label: "no", x: 12, y : 23},
//       {label: "no", x: 11, y : 16},
//       {label: "no", x: 9, y : 24},

//       {label: "maybe", x: -4, y : -12, score: 10},
//       {label: "maybe", x: 4, y : 7, score: -5}
//   	];

//     d3Service.d3().then(function(d3) {
//       var N = 40;
//       var random = d3.random.normal(0, 0.3);
//       var data1 = d3.range(N).map(random);
//       var data2 = d3.range(N).map(random);
//       var data3 = d3.range(N).map(random);
//       var data4 = d3.range(N).map(random);
//       $scope.timeData = {
//         "cows":       data1,
//         // "chickens":   data2,
//         // "goats":      data3,
//         "sheep":      data4
//       };
//       $scope.recentData = {};

//       setInterval(function() {
//         $scope.recentData = {
//           "cows": random(),
//           // "chickens": random(),
//           // "goats": random(),
//           "sheep": random()
//         };
//         $scope.$apply();
//       }, 830);
       
//     }); // end d3 then
    

//     $scope.graphData = {
//       nodes: [
//         { id: 1, label: "cow", score: 20 },
//         { id: 2, label: "cow", score: 20 },
//         { id: 3, label: "cow", score: 20 },

//         { id: 4, label: "chicken", score: 10 },
//         { id: 5, label: "chicken", score: 10 },
//         { id: 6, label: "chicken", score: 10 },

//         { id: 7, label: "chicken", score: 10 },
//         { id: 8, label: "chicken", score: 10 },

//         { id: 9, label: "chicken", score: 10 }
//       ],
//       edges : [
//         //{ i: 1, j: 3, label: "friends" },


//         { i: 1, j: 4 },
//         { i: 1, j: 5 },
//         { i: 1, j: 6 },

//         { i: 2, j: 7 },
//         { i: 2, j: 8 },

//         { i: 3, j: 9 }
//       ]
//     };


//     // testing edge changes
//     // var set1 = [
//     // ];
//     // var set2 = [
//     //     { i: 1, j: 4 },
//     //     { i: 1, j: 5 },
//     //     { i: 1, j: 6 },

//     //     { i: 2, j: 7 },
//     //     { i: 2, j: 8 },

//     //     { i: 3, j: 9 }
//     // ];
//     // var set = -1;
//     // setInterval(function() {
//     //   set = -1 * set;
//     //   if (set < 0) {
//     //     $scope.graphData.edges = [];
//     //   } else {
//     //     $scope.graphData.edges = set2;
//     //   }
      
//     //   $scope.$apply();
//     // }, 1000);
   

//     // update scatter and chart for cool
//       setInterval(function() {
//        for (var i = 0; i < $scope.scatterData.length; i++) {
//          $scope.scatterData[i].x = parseInt(-50 + 100 * Math.random());
//          $scope.scatterData[i].y = parseInt(-50 + 100 * Math.random());
//        }
//        $scope.$apply();
//       }, 4000);

//   		setInterval(function() {
//   			for (var i = 0; i < $scope.chartData.length; i++) {
//   				$scope.chartData[i].score = parseInt(-50 + 100 * Math.random());
//   			}
//   			$scope.$apply();
//   		}, 4000);
// 	};

// });