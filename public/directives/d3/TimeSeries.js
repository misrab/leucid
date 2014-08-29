var app = angular.module('app');


//var N = 40;
// custom margin based on left axis
var MARGIN_LEFT = 30;

//var first = true;

app.directive('timeSeries', function(d3Service) {
	return {
		restrict: 'E', // element tag only
		scope: {

			data: "=" // bi-directional data-binding
			, recentdata: "="
			//, recentdata: "="

		},
		link: function(scope, element, attrs) {
			//console.log(scope.data);
			// make a deep copy
			scope.isolatedData = {};
			scope.LOCKED = false;
			

			// d3 is the raw d3 object
			d3Service.d3().then(function(d3) {
				var svg = d3.select(element[0])
		            .append('svg')
		            .style('width', '100%');
		            //.style('height', '100%');

		        // Allow the user of our directive to define these
		        // ! do this after svg appended, in case we'd like to use 
		        // safe defaults...
				//var margin = parseInt(attrs.margin) || 20,
					//xLabel = attrs.xLabel || "x",
				var	yLabel = attrs.yLabel || "y",
					margin = 20,
					width = attrs.width || d3.select(element[0]).node().offsetWidth - MARGIN_LEFT,
					height = attrs.height || 200,
					smooth = attrs.smooth === 'false' ? false : true;

				// interpolation examples here:
				// http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html

		        scope.addDefinitions = function(svg, width, height) {
					// // add special definitions
					var defs = svg.append("defs");
						
					defs.append("marker")
					    .attr("id", "arrowHead")
					    .attr("refX", 6) /*must be smarter way to calculate shift*/
					    .attr("refY", 2)
					    .attr("markerWidth", 6)
					    .attr("markerHeight", 4)
					    .attr("orient", "auto")
					    .append("path")
					        .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
				

					defs.append("clipPath")
				    	.attr("id", "clip")
				  		.append("rect")
				  			.attr("x", MARGIN_LEFT)
				    	 	.attr("width", width - MARGIN_LEFT)
				    		.attr("height", height);
				};
				// !! not sure why timeout is needed...
		        setTimeout(function() {
		        	scope.addDefinitions(svg, width, height);
		        }, 500);


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

	          	// Watch for data changes
	          	scope.$watch('data', function(newVals, oldVals) {
	          		// make a deep copy
	          		for (k in scope.data) {
						scope.isolatedData[k] = scope.data[k].slice(0);
					}

					// render
	          		return scope.render(newVals);
	          	}, true);

	          	// update series
	          	scope.$watch('recentdata', function(newVals, oldVals) {
	          		if (scope.LOCKED == true) return;
	          		scope.update(newVals);
	          	}, true);



	          	/*
	          	 *	Custom d3 code
	          	 */
	          	scope.update = function(newVals) {

	          		// time steps based on data
					var N = 0;
					var l;
					for (var k in scope.isolatedData) {
						var l = scope.isolatedData[k].length;
						if (l > N) N = l;
					}
				    // showing n points at a time
				   	var xScale = d3.scale.linear()
					    .domain([0, N - 1])
					    .range([0, width]);
	          		var yScale = d3.scale.linear()
					    .domain([-1, 1])
					    .range([height - margin/2, margin/2]);

					var line = d3.svg.line()
    					.x(function(d, i) { return MARGIN_LEFT + xScale(i); })
    					.y(function(d, i) { return yScale(d); });

    				if (smooth !== false) { line.interpolate("basis");  }


    				for (k in newVals) {
    					scope.isolatedData[k].push(newVals[k]);
    					
    					var path = d3.select('path[data-category="'+k+'"]');
    					scope.LOCKED = true;
    					path
    						.attr("d", line)
    						.attr("transform", null)
    						.transition()
    							.duration(800)
    						 	.ease("linear")
					      		.attr("transform", "translate(" + xScale(-1) + ",0)")
					   			.each("end", function() {
					   				 scope.LOCKED = false;
					   			});
					   

    					scope.isolatedData[k].shift();

    				}
	          	};



	          	scope.render = function(data) {

	          		// remove all previous items before render
					svg.selectAll('*').remove();
					// If we don't pass any data, return out of the element
					if (!data) return;
					// set svg height
					svg.attr("height", height);
					
					var color = d3.scale.category20();

					// append legend
					var LEGEND_HEIGHT = height/5;
					var legend_group = svg.append("g")
						.attr("transform", function(d) {
							return "translate(0, " + (height) + ")";
						});
					legend_group.append("rect")
						.attr("height", LEGEND_HEIGHT)
						.attr("width", "100%")
						.attr("fill", "white");
					var numKeys = Object.keys(data).length;
					var bucket = width / numKeys;
					var i = 0;
					for (k in data) {
						var xLegend = i * bucket;
						var subG = legend_group.append("g")
							.attr("transform", function(d) {
								return "translate(" + xLegend + ", " + LEGEND_HEIGHT/2 + ")";
							});

						var padding = 5;
						subG.append("line")
							.attr("x1", padding)
							.attr("y1", 0)
							.attr("x2", bucket/3)
							.attr("y2", 0)
							.attr("stroke", color(k))
							.style("stroke-width", 2);
								
						subG.append("text")
							.text(function(d) {
								return k;
							})
							.attr("dominant-baseline", "central")
							.attr("x", bucket/3 + padding);

						i++;
					}

					// set overall svg height
					svg.attr("height", height + LEGEND_HEIGHT);

	      		 	// time steps based on data
					var N = 0;
					var l;
					for (var k in data) {
						var l = data[k].length;
						if (l > N) N = l;
					}

				    // showing n points at a time
				   	var xScale = d3.scale.linear()
					    .domain([0, N - 1])
					    .range([0, width]);
	          		var yScale = d3.scale.linear()
					    .domain([-1, 1])
					    .range([height - margin/2, margin/2]);

					var line = d3.svg.line()
    					.x(function(d, i) { return MARGIN_LEFT + xScale(i); })
    					.y(function(d, i) { return yScale(d); });

			

					// y-axis
	          		var yAxis = svg.append("g")
					    .attr("class", "y-axis")
					    .style("fill", "none")
					    .style("stroke", "black")
					    .style("shape-rendering", "crispEdges")
					    .style("font", "10px sans-serif")
					    .attr("transform", "translate("+ MARGIN_LEFT +","+0+")")
					    .call(d3.svg.axis()
					    	.scale(yScale)
					    	.orient("left")
					    	.ticks(5)
					    	.tickSize(5, 0)
					    );

					yAxis.append("text")
						.text(function(d) {
							return yLabel;
						})
						//.attr("text-anchor", "end")
						.attr("class", "label")
				      	.attr("x", margin)
				      	.attr("y", margin/2)
				     	//.style("font", "10px sans-serif");
				      	.style("font", String(margin*2/3) + "px sans-serif");

					// x-axis
					var xTicks = [];
					for (var i=10; i < N; i+=10) { xTicks.push(i); }
					var xAxis = svg.append("g")
					    .attr("class", "x-axis")
					    .style("stroke", "black")
					    .style("shape-rendering", "crispEdges")
					    .style("font", "10px sans-serif")
					    .attr("transform", "translate("+MARGIN_LEFT+","+ yScale(0) +")")
					    .call(d3.svg.axis()
					    	.scale(xScale)
					    	.orient("bottom")
					    	//.ticks(5)
					    	// don't want origin repeated
					    	.tickValues(xTicks)
					    	.tickSize(5, 0)
					    )
					    .attr("marker-end", "url(#arrowHead)");
					xAxis.append("text")
						.text("t")
						.attr("class", "label")
				      	.attr("x", width - margin/2)
				      	.attr("y", margin)
				      	.style("font-size", String(margin*2/3) + "px")
				      	.style("text-anchor", "end");


    				// draw path for each series of data
    				$.each(scope.isolatedData, function(k, _) {
    					svg.append("g")
					    	.attr("clip-path", "url(#clip)")
						  	.append("path")
						    	.datum(scope.isolatedData[k])
						    	.attr("data-category", k)
						    	.attr("class", "line")
						    	.attr("d", line)
						    	.style("fill", "none")
						    	.style("stroke-width", 2)
						    	.style("stroke", color(k));
    				});

	          	}; // end of scope.render()
			}); // end of d3 then()
		} // end of link function
	}; // end of returned object
});



