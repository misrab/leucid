var app = angular.module('app');


app.directive('barChart', function(d3Service) {
	return {
		restrict: 'E', // element tag only

		scope: {
			data: "=" // bi-directional data-binding
		},

		link: function(scope, element, attrs) {
			// d3 is the raw d3 object
			d3Service.d3().then(function(d3) {
				// the action is here...
				
				// set global variables and create svg
				var height = attrs.height || 300;
				var svg = d3.select(element[0])
		            .append('svg')
		            .style('width', '100%')
		            .style('height', height);
		        var width = d3.select(element[0]).node().offsetWidth;
		        var margin = 20;
		        var color = d3.scale.category20();


		        // set listeners
		        listeners();


				/*
					Function definitions
				*/
				function listeners() {
			        window.onresize = function() {
		            	scope.$apply();
		          	};

		          	// Watch for resize event
		          	scope.$watch(function() {
		           		return angular.element(window)[0].innerWidth;
		          	}, function() {
		            	render(scope.data);
		          	});

		          	// Watch for data changes and re-render
					scope.$watch('data', function(newVals, oldVals) {
					  return render(newVals);
					}, true); // true for actual object equality, not pointers
				};
			

				function render(data) {
					//remove all previous items before render
					svg.selectAll('*').remove();
					// If we don't pass any data, return out of the element
					if (!data) return;


					// set scale
					var min = 0, // min 0 regardless
						max = 0;
					var numGroups = 0;
					for (k in data) {
						numGroups++;
						for (index in data[k]) {
							var score = data[k][index].score;
							if (score > max) max = score;
							if (score < min) min = score;
						}
					}
					// var xScale = d3.scale.linear()
					// 	.domain([minScore, maxScore])
					// 	.range([0, width]);
					var yScale = d3.scale.linear()
						.domain([min, max])
						.range([margin/2, height - margin/2]);
					
					// draw axes
					drawAxes(yScale);

					// draw rects
					drawBars(data, yScale, numGroups, width);
				};


				function drawBars(data, yScale, numGroups, width) {
					// each group gets equal width, whether
					// stacked or not
					var numSpaces = numGroups + 1; // nodes - 1 + 2 outsides
					var groupWidth = (width - margin) / numSpaces;

					var startX = 0;
					for (var group=0; group < numGroups; group++) {
						startX += groupWidth;

						var g = svg.append("g")
							.attr("transform", function(d) {
								return "translate(" + startX + "," + (height - yScale(0) - margin/2) + ")";
							});
						g.append("rect").attr("width", 20).attr("height", 20).attr('fill', "blue");

						startX += groupWidth; 
					}
				};

				function drawAxes(yScale) {

					var xAxis = svg.append("g")
						.attr("class", "x-axis")
						.attr("transform", function(d) {
							// ! don't forget to flip y coordinate
							return "translate(" + margin/2 + "," + (height - yScale(0) - margin/2) + ")";
						});
					xAxis.append("line")
						.attr("x1", 0)
						.attr("y1", 0)
						.attr("x2", width-margin/2)
						.attr("y2", 0)
						.attr("stroke", "black")
						.attr("stroke-width", 1);
						//.attr("marker-end", "url(#arrowHead)");
					// xAxis.append("text")
					// 	.text(function(d) {
					// 		return xLabel;
					// 	})
					// 	.attr("class", "label")
				 //      	.attr("x", width - margin)
				 //      	.attr("y", 2)
				 //      	.attr("dominant-baseline", "hanging")
				 //      	.style("font-size", 12 + "px")
				 //      	.style("text-anchor", "end");

				 	var yAxis = svg.append("g")
						.attr("class", "y-axis")
						.attr("transform", function(d) {
							return "translate(" + margin/2 + "," + (height) + ")";
						});
					yAxis.append("line")
						.attr("x1", 0)
						.attr("y1", 0)
						.attr("x2", 0)
						.attr("y2", -(height - margin/2))
						.attr("stroke", "black");
						//.attr("marker-end", "url(#arrowHead)");
					// yAxis.append("text")
					// 	.text(function(d) {
					// 		return yLabel;
					// 	})
					// 	.attr("class", "label")
				 //      	.attr("x", 0)
				 //      	.attr("y", -(height))
				 //      	.style("font-size", 12 + "px");
				};
			});
		}
	};
});


// 	          	// our custom d3 code
// 	          	scope.render = function(data) {
// 					// remove all previous items before render
// 					svg.selectAll('*').remove();

// 					// If we don't pass any data, return out of the element
// 					if (!data) return;

// 					// setup variables
// 					// DOM-dancing to get parent width
// 					var width = d3.select(element[0]).node().offsetWidth - margin,
// 						// calculate the height
// 						//attrs.height || 
// 						height = scope.data.length * (barHeight + barPadding);


// 					var minScore = d3.min(data, function(d) {
// 						return d.score;
// 					});
// 					var maxScore = d3.max(data, function(d) {
// 						return d.score;
// 					});



// 					var totalScale = d3.scale.linear()
// 						.domain([minScore, maxScore])
// 						.range([margin/2, width - margin]);

// 					// console.log(minScore + ", " + maxScore);
// 					// console.log(totalScale(0));


// 					// set the height based on the calculations above
// 					svg.attr('height', height + margin);

// 					// draw the center line if exist negatives
// 					if (minScore < 0) {
// 						svg.append("line")
// 							.attr("x1", totalScale(0))
// 							.attr("y1", -margin/2)
// 							.attr("x2", totalScale(0))
// 							.attr("y2", height + margin/2)
// 							.style("stroke", "black")
// 							.style("stroke-width", 2);
// 							//.style("stroke-dasharray", "2,2");
// 							//.style('opacity', 0);
// 					}
					

// 					//create the rectangles for the bar chart
// 					var group = svg.selectAll('g')
// 						.data(data).enter()
// 						.append("g")
// 						.attr("transform", function(d, i) {
// 							var x;
// 							if (d.score < 0) {
// 								var width = totalScale(0) - totalScale(d.score);
// 								x = totalScale(0) - width - 2; // styling: just off of 0 line
// 							} else {
// 								x = minScore < 0 ? totalScale(0) : totalScale(minScore);
// 							}

// 							//var x = d.score < 0 ? totalScale(0) - totalScale(d.score) : totalScale(0);
// 							var y = margin/2 + i * (barHeight + barPadding);
// 							return "translate(" + x + "," + y + ")";
// 						});

// 					group.append('rect')
// 						.attr('height', barHeight)
// 						.attr('width', 0)
// 						.attr('x', 2) // styling: just off of 0 line
// 						.attr('fill', function(d) { return color(d.name); })
// 						.transition()
// 							.duration(1000)
// 							.attr('width', function(d) {
// 								var width;
// 								if (d.score < 0) {
// 									width = totalScale(0) - totalScale(d.score);
// 								} else {
// 									width = totalScale(d.score);// - totalScale(0);
// 								}
// 								return width;
// 							});

// 					var fontSize = barHeight/2; // - 2*barPadding;
// 					group.append("text")
// 						.text(function(d) {
// 							return d.name + " (" + d.score + ")";
// 						})
// 						.attr("x", margin/2)
// 						.attr("y", barHeight/2)
// 						//.style("text-anchor", "middle")
// 						.attr("fill", "white")
// 						.attr("dominant-baseline", "central")
// 						.attr("font-family", "sans-serif")
// 						.style("font-weight", "bold")
// 						.attr("font-size", function(d) {
// 							return fontSize;
// 						});
// 	          	}; // end of scope.render()
// 			}); // end of d3 then()
// 		} // end of link function
// 	}; // end of returned object
// });