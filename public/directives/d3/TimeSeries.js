var app = angular.module('d3Primitives');

// interpolation examples here:
// http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html

app.directive('timeSeries', function(d3Service) {
	return {
		restrict: 'E', // element tag only
		scope: {

			data: "=" // bi-directional data-binding
			, recentdata: "="
			//, recentdata: "="

		},
		link: function(scope, element, attrs) {
			// make a deep copy
			scope.isolatedData = {};
			scope.LOCKED = false;
			scope.lastUpated = Date.now();

			// d3 is the raw d3 object
			d3Service.d3().then(function(d3) {
				// set global variables and create svg
				var height = attrs.height || 300;
				var	yLabel = attrs.yLabel || "";
				var legend_height = 50;

				var svg = d3.select(element[0])
		            .append('svg')
		            .style('width', '100%')
		            .style('height', height + legend_height);
		        var width = d3.select(element[0]).node().offsetWidth;
		        var margin = 20;
		        var color = d3.scale.category20();
		        scope.smooth = attrs.smooth === 'true' ? true : false;


		        // NOT sure why this is required!!
		        // setTimeout(addDefinitions, 1500);


		        // set listeners
		        listeners();


				/*
					Function definitions
				*/

				function addDefinitions() {
					var defs = svg.append("defs");
						
					// defs.append("marker")
					//     .attr("id", "arrowHead")
					//     .attr("refX", 6) /*must be smarter way to calculate shift*/
					//     .attr("refY", 2)
					//     .attr("markerWidth", 6)
					//     .attr("markerHeight", 4)
					//     .attr("orient", "right")
					//     .append("path")
					//         .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
				

					defs.append("clipPath")
				    	.attr("id", "clip")
				  		.append("rect")
				  			.attr("x", margin/2)
				    	 	.attr("width", width - margin)
				    		.attr("height", height);
				};

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

		          	// Watch for data changes
		          	scope.$watch('data', function(newVals, oldVals) {
		          		// make a deep copy
		          		for (k in scope.data) {
							scope.isolatedData[k] = scope.data[k].slice(0);
						}

						// render
		          		return render(newVals);
		          	}, true);

		          	// update series
		          	scope.$watch('recentdata', function(newVals, oldVals) {
		          		if (scope.LOCKED === true) return;
		          		update(newVals);
		          	}, true);
				};


	          	function update(newVals) {

	          		// need to scale down a bit: if transition takes longer
	          		// than data update, we start accumulating
	          		var dt = Math.min(1000, (Date.now() - scope.lastUpated)*0.9);
	          		scope.lastUpated = Date.now();



	          		// time steps based on data
					var N = scope.N;
		
				    // showing n points at a time
				   	var xScale = d3.scale.linear()
					    .domain([0, N - 1])
					    .range([0, width]);
	          		var yScale = d3.scale.linear()
					    .domain([scope.min, scope.max])
					    .range([margin/2, height - margin/2]);


    				for (k in newVals) {
    					scope.isolatedData[k].push(newVals[k]);
    					
    					var path = svg.select('path[data-category="'+k+'"]');
    					scope.LOCKED = true;
    					path
    						.attr("d", scope.line)
    						.attr("transform", null)
    						.transition()
    							.duration(dt)
    						 	.ease("linear")
					      		.attr("transform", "translate(" + xScale(-1) + ",0)")
					   			.each("end", function() {
					   				 scope.LOCKED = false;
					   			});
					   

    					scope.isolatedData[k].shift();

    				}
    				console.log(scope.isolatedData);

    				scope.LOCKED = false;
	          	};

	          	function render(data) {
	          		// remove all previous items before render
					svg.selectAll('*').remove();
					// If we don't pass any data, return out of the element
					if (!data) return;

					addDefinitions();

					// set scales
					// time steps based on data
					var N = 0;
					var l;
					for (var k in data) {
						var l = data[k].length;
						if (l > N) N = l;
					}
					scope.N = N;

					var min = 0; var max = 0;
					var v = 0;
					for (k in data) {
						for (var i=0; i<data[k].length; i++) {
							v = data[k][i];
							if (v < min) min = v;
							if (v > max) max = v;
						}
					}
					// increase band for better presentation
					max = max*4/3;
					min = min === 0 ? -max/3 : min*4/3;

					// allow user to set max and min
					if (attrs.max) max = attrs.max;
					if (attrs.min) min = attrs.min;

					// set scope for efficiency
					scope.max = max;
					scope.min = min;

					var xScale = d3.scale.linear()
					    .domain([0, N - 1])
					    .range([margin/2, width-margin/2]);
	          		var yScale = d3.scale.linear()
					    .domain([min, max])
					    .range([margin/2, height - margin/2]);
					var yInvertedScale = d3.scale.linear()
					    .domain([min, max])
					    .range([height - margin/2, margin/2]);


					// draw legend and axes
					drawLegend(data);
					drawAxes(xScale, yScale, yInvertedScale);
					// finally, draw the line
					drawLine(xScale, yScale);
	          	}; // end of scope.render()


	          	function drawLine(xScale, yScale) {
	          		scope.line = d3.svg.line()
    					.x(function(d, i) { return margin/2 + xScale(i); })
    					.y(function(d, i) { return yScale(d); });

    				if (scope.smooth !== false) { scope.line.interpolate("basis");  }

    				// draw path for each series of data
    				$.each(scope.isolatedData, function(k, _) {
    					svg.append("g")
					    	.attr("clip-path", "url(#clip)")
					    	.attr("data-category", k)
						    .attr("data-type", "path")
						  	.append("path")
						    	.datum(scope.isolatedData[k])
						    	//.attr("data-category", k)
						    	.attr("data-type", "path")
						    	.attr("class", "line")
						    	.attr("d", scope.line)
						    	.style("fill", "none")
						    	.style("stroke-width", 2)
						    	.style("stroke", color(k));
    				});
	          	};

	          	function drawAxes(xScale, yScale, yInvertedScale) {
	          		var xAxis = svg.append("g")
						.attr("class", "x-axis")
						.attr("fill", "none")
					    .attr("stroke", "grey")
					    .attr("stroke-width", 1)
					    //.style("shape-rendering", "crispEdges")
					    //.style("font-size", 10)
						.attr("transform", function(d) {
							return "translate(" + 0 + "," + (height - yScale(0)) + ")";
						})
						.call(d3.svg.axis()
					    	.scale(xScale)
					    	.orient("bottom")
					    	.ticks(0)
					    	//.tickSize(5, 0)
					    );
					    // .attr("marker-end", "url(#arrowHead)");

					var yAxis = svg.append("g")
						.attr("class", "y-axis")
						.attr("fill", "none")
					    .attr("stroke", "grey")
					    .attr("stroke-width", 1)
					    //.style("shape-rendering", "crispEdges")
					    //.style("font-size", 10)
						.attr("transform", function(d) {
							return "translate(" + margin/2 + "," + 0 + ")";
						})
						.call(d3.svg.axis()
					    	.scale(yInvertedScale)
					    	.orient("right")
					    	.ticks(5)
					    	.tickSize(5, 0)
					    );

					if (yLabel !== "") {
						yAxis.append("text")
						    .attr("text-anchor", "start")
						    .attr("dominant-baseline", "hanging")
						    .attr("x", margin/2)
						    .attr("y", 5) // naughty padding
						    .text(yLabel);
					}
					
	          	};

	          	function unhighlightSubgroup(name) {
					svg.selectAll('g:not([data-category="'+name+'"])[data-type="path"], g:not([data-category="'+name+'"])[data-type="legend"]')
						.style("opacity", 1);
				};
				function highlightSubgroup(name) {
					svg.selectAll('g:not([data-category="'+name+'"])[data-type="path"], g:not([data-category="'+name+'"])[data-type="legend"]')
						.style("opacity", 0.1);
				};

	          	function drawLegend(data) {
				 // find all subgroup names
				 var names = [];
				 for (k in data) {
				 	names.push(k);
				 }
				 if (names.length===0) return;

				 var legendWidth = width / names.length;
				 var boxDiameter = 10;

				 for (index in names) {
				 	var x = legendWidth * index + margin / 2;
				 	var name = names[index];
				 	var g = svg.append("g")
				 		.attr("data-category", name)
				 		.attr("data-type", "legend")
					 	.attr("transform", function(d, i) {
					 		return "translate(" + x + "," + (height + margin/2) + ")";
					 	})
					 	.style("cursor", "pointer")
					 	.on('mouseover', function(d) {
							highlightSubgroup(d3.select(this).attr("data-category"));
						})
						.on('mouseout', function(d) {
							unhighlightSubgroup(d3.select(this).attr("data-category"));
						});

					g.append("rect")
						.attr("width", boxDiameter)
						.attr("data-category", name)
						.attr("height", boxDiameter)
						.attr('fill', color(name));
					g.append("text")
						.text(name)
						.attr("x", boxDiameter + margin/2)
						.attr("dominant-baseline", "hanging");
				 }
				};
			}); // end of d3 then()
		} // end of link function
	}; // end of returned object
});



