var app = angular.module('app');

app.directive('scatterPlot', function(d3Service) {
	return {
		restrict: 'E', // element tag only
		scope: {
			data: "=" // bi-directional data-binding

		},
		link: function(scope, element, attrs) {
			// d3 is the raw d3 object
			d3Service.d3().then(function(d3) {
				var svg = d3.select(element[0])
		            .append('svg')
		            .style('width', '100%');
		            //.style('height', '100%');


		        // Allow the user of our directive to define these
		        // ! do this after svg appended, in case we'd like to use 
		        // safe defaults...
				var margin = parseInt(attrs.margin) || 20,
					yLabel = attrs.labelY || "y",
					xLabel = attrs.labelX || "x",
					width = attrs.width || d3.select(element[0]).node().offsetWidth - margin,
					height = attrs.height || 200,
					radius = attrs.radius || 5;

					

		          // Browser onresize event
		        window.onresize = function() {
	            	scope.$apply();
	          	};

	          	// Watch for resize event
	          	scope.$watch(function() {
	           		return angular.element(window)[0].innerWidth;
	          	}, function() {
	            	scope.render(scope.data);
	          	});

	          	// Watch for data changes and re-render
				scope.$watch('data', function(newVals, oldVals) {
				  return scope.render(newVals);
				}, true); // true for actual object equality, not pointers




	          	/*
	          	 *	Custom d3 code
	          	 */ 
	          	scope.render = function(data) {
					// remove all previous items before render
					svg.selectAll('*').remove();

					// If we don't pass any data, return out of the element
					if (!data) return;

					// set color and scales
					var minX = d3.min(data, function(d) {
						return d.x;
					});
					var maxX = d3.max(data, function(d) {
						return d.x;
					});
					var minY = d3.min(data, function(d) {
						return d.y;
					});
					var maxY = d3.max(data, function(d) {
						return d.y;
					});

					var anchorX = Math.min(0, minX);
					var anchorY = Math.min(0, minY);

					var color = d3.scale.category20(),
						xScale = d3.scale.linear()
							.domain([anchorX, maxX])
							.range([margin/2, width - margin]),
						yScale = d3.scale.linear()
							.domain([anchorY, maxY])
							.range([margin/2, height - margin])
						scoreScale = d3.scale.linear()
							.domain([d3.min(data, function(d) {
								return d.score;
							}), d3.max(data, function(d) {
								return d.score;
							})])
							// scale up to a constant * radius
							.range([radius, 5*radius]);

					// set svg height
					svg.attr("height", height);

					// calculate the origin's x, y
					var origin = {
						x: xScale(0),
						y: yScale(0)
					};

					// add custom definitions e.g. arrowHead for axes
					scope.addDefinitions(svg);

					scope.drawAxes(svg, width, height, margin, xLabel, yLabel, origin);
					

					scope.plotData(svg, data, scoreScale, xScale, yScale, margin, radius, color, origin, height);

	          	}; // end of scope.render()


	          	scope.addDefinitions = function(svg) {
					// add special definitions
					svg.append("defs").append("marker")
					    .attr("id", "arrowHead")
					    .attr("refX", 6) /*must be smarter way to calculate shift*/
					    .attr("refY", 2)
					    .attr("markerWidth", 6)
					    .attr("markerHeight", 4)
					    .attr("orient", "auto")
					    .append("path")
					        .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
				};

				scope.plotData = function(svg, data, scoreScale, xScale, yScale, margin, radius, color, origin, height) {
					// time for point to grow
					var TRANSITIONDT = 200;

					// line traces to axes
					// x1,y1 is point; x2,y2 is axis
					var xTrace = svg.append("line")
									.attr("y2", height - origin.y - 2) // -2 axis stroke
									.style("stroke", "lightgrey")
									.style("stroke-width", 3)
									.style("stroke-dasharray", "4,4")
									.style('opacity', 0);

					var yTrace = svg.append("line")
									.attr("x2", origin.x + 2) // 2 axis stroke
									.style("stroke", "lightgrey")
									.style("stroke-width", 3)
									.style("stroke-dasharray", "4,4")
									.style('opacity', 0);

					// stuff for when we hover on a point
					var tooltip = svg.append("text")
						.style('text-anchor', 'middle')
						.style("font-weight", "bold")
						.style('opacity', 0);

					// axis tooptips
					var tooltipX = svg.append("text")
						.attr("y", height - origin.y + 5) // naughty padding
						.style('text-anchor', 'middle')
						.attr("dominant-baseline", "hanging")
						.style("font-size", 10)
						.style('opacity', 0);

					var tooltipY = svg.append("text")
						.attr("x", origin.x - 5) // naughty padding
						.style('text-anchor', 'end')
						.attr("dominant-baseline", "central")
						.style("font-size", 10)
						.style('opacity', 0);

					svg.selectAll("circle")
						.data(data).enter()
						.append("circle")
						.attr("cx", function(d) { return xScale(d.x); })
						.attr("cy", function(d) { return height - yScale(d.y); })
						.attr('fill', function(d) { return color(d.label); })
						.attr('r', 0)
						// opacity to see overlaps
						.style('opacity', 0.6)
						.on('mouseover', function(d) {
							var x = xScale(d.x);
							var y = yScale(d.y);
							var r = d3.select(this).attr("r");
							var realY = height - y - r - 2;

							// tooltips
							tooltip.text(d.label)
								.attr("x", function(d) {
									// not precise but generally ensures
									// text not cut off left...
									//return x <= margin/2 ? x + margin : x;

									// left cut off
									if (x <= margin/2) return x + margin;

									//if (xScale(0) - x <= margin/2) return x - margin;

									return x;
								})
								.attr("y", function(d) {
									// not too close to top
									return Math.max(margin/2, realY);
								}) // naughty 2px padding
								.transition()
									.duration(TRANSITIONDT)
									.style('opacity', 1);

							tooltipX.text(Math.round(d.x))
								.attr("x", x)
								.transition()
									.duration(TRANSITIONDT)
									.style('opacity', 1);
							tooltipY.text(Math.round(d.y))
								.attr("y", height - y)
								// origin.x - 5 ==> tooltipY's x position. -2 ==> move it a bit left.
								.attr("transform", "rotate(-90 "+ (origin.x - 5 - 2) +","+ (height-y) +")")
								.transition()
									.duration(TRANSITIONDT)
									.style('opacity', 1);

							// traces
							xTrace.attr("x1", x)
								.attr("y1", height - y)
								.attr("x2", x)
								.transition()
									.duration(TRANSITIONDT)
									.style('opacity', 1);
							yTrace.attr("x1", x)
								.attr("y1", height - y)
								.attr("y2", height - y)
								.transition()
									.duration(TRANSITIONDT)
									.style('opacity', 1);
						})
						.on("mouseout", function(d) {
							// tooltips
				          	tooltip.transition()
				          		.duration(TRANSITIONDT)
				          		.style("opacity", 0);
				          	tooltipX.transition()
				          		.duration(TRANSITIONDT)
				          		.style("opacity", 0);
				          	tooltipY.transition()
				          		.duration(TRANSITIONDT)
				          		.style("opacity", 0);

				          	// traces
				          	xTrace.transition()
				          		.duration(TRANSITIONDT)
				          		.style("opacity", 0);
				          	yTrace.transition()
				          		.duration(TRANSITIONDT)
				          		.style("opacity", 0);
				      	})
						.transition()
							.duration(1000)
							.attr('r', function(d) {
								var r = d.score != undefined ? scoreScale(d.score) : radius;
								return r;
							});
				};


				scope.drawAxes = function(svg, width, height, margin, xLabel, yLabel, origin) {
					var xAxis = svg.append("g")
						.attr("class", "x-axis")
						.attr("transform", function(d) {
							// ! don't forget to flip y coordinate
							return "translate(" + margin/2 + "," + (height - origin.y) + ")";
						});
					xAxis.append("line")
						.attr("x1", 0)
						.attr("y1", 0)
						.attr("x2", width - margin)
						.attr("y2", 0)
						.attr("stroke", "black")
						.attr("marker-end", "url(#arrowHead)");
					xAxis.append("text")
						.text(function(d) {
							return xLabel;
						})
						.attr("class", "label")
				      	.attr("x", width - margin)
				      	.attr("y", 2)
				      	.attr("dominant-baseline", "hanging")
				      	.style("font-size", 12 + "px")
				      	.style("text-anchor", "end");


				    var yAxis = svg.append("g")
						.attr("class", "y-axis")
						.attr("transform", function(d) {
							return "translate(" + origin.x + "," + (height-margin/2) + ")";
						});
					yAxis.append("line")
						.attr("x1", 0)
						.attr("y1", 0)
						.attr("x2", 0)
						.attr("y2", -(height - margin))
						.attr("stroke", "black")
						.attr("marker-end", "url(#arrowHead)");
					yAxis.append("text")
						.text(function(d) {
							return yLabel;
						})
						.attr("class", "label")
				      	.attr("x", -margin/2)
				      	.attr("y", -(height - margin + 2))
				      	.style("font-size", 12 + "px");
				};


			}); // end of d3 then()
		} // end of link function
	}; // end of returned object
});