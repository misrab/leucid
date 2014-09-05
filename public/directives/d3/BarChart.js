var app = angular.module('d3Primitives');


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
				var legend_height = 50;

				var svg = d3.select(element[0])
		            .append('svg')
		            .style('width', '100%')
		            .style('height', height + legend_height);
		        var width = d3.select(element[0]).node().offsetWidth;
		        var margin = 20;
		        var color = d3.scale.category20();


		        var tooltip = drawTooltip();

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
					
					// put twice required padding on top
					// because yAxis was being cut.
					// d3.axis() quirk I believe...
					var yScale = d3.scale.linear()
						.domain([min, max])
						.range([margin/2, height - margin]);
					var yInvertedScale = d3.scale.linear()
						.domain([min, max])
						.range([height - margin/2, margin]);
					
					
					// draw axes
					drawAxes(yScale, yInvertedScale);

					// draw rects
					drawBars(data, yScale, numGroups, width);

					// draw legend
					drawLegend(data);
				};

				function drawTooltip() {
					var tooltip = d3.select("body")
						.append("div")
						.style("position", "absolute")
						.style("font-weight", "bold")
						.style("text-align", "center")
						.style("border", "1px solid grey")
						.style("background-color", "#eaeaea")
						.style("padding", "5px")
						.style("z-index", "10")
						.style("visibility", "hidden")
						.text("a simple tooltip");

					return tooltip;

				};

				function unhighlightSubgroup(name) {
					svg.selectAll('rect:not([data-subgroup="'+name+'"]), g:not([data-subgroup="'+name+'"])[data-type="legend"]')
						.style("opacity", 0.8);
				};
				function highlightSubgroup(name) {
					svg.selectAll('rect:not([data-subgroup="'+name+'"]), g:not([data-subgroup="'+name+'"])[data-type="legend"]')
						.style("opacity", 0.1);
				};

				function drawLegend(data) {
				 // find all subgroup names
				 var names = [];
				 for (k in data) {
				 	for (index in data[k]) {
				 		if (names.indexOf(data[k][index].name) == -1) names.push(data[k][index].name);
				 	}
				 }
				 if (names.length===0) return;

				 var legendWidth = width / names.length;
				 var boxDiameter = 10;

				 for (index in names) {
				 	var x = legendWidth * index + margin / 2;
				 	var name = names[index];
				 	var g = svg.append("g")
				 		.attr("data-subgroup", name)
				 		.attr("data-type", "legend")
					 	.attr("transform", function(d, i) {
					 		return "translate(" + x + "," + (height + margin/2) + ")";
					 	})
					 	.style("cursor", "pointer")
					 	.on('mouseover', function(d) {
							highlightSubgroup(d3.select(this).attr("data-subgroup"));

						})
						.on('mouseout', function(d) {
							unhighlightSubgroup(d3.select(this).attr("data-subgroup"));
						});

					g.append("rect")
						.attr("width", boxDiameter)
						.attr("data-subgroup", name)
						.attr("height", boxDiameter)
						.attr('fill', color(name));
					g.append("text")
						.text(name)
						.attr("x", boxDiameter + margin/2)
						.attr("dominant-baseline", "hanging");
				 }
				};

				function drawBars(data, yScale, numGroups, width) {
					// each group gets equal width, whether
					// stacked or not
					var numSpaces = 2*numGroups; // nodes - 1 + 2 outsides
					var groupWidth = (width - margin) / (numSpaces+1);
					var startX = 0;	

					for (k in data) {
						startX += groupWidth;
						var g = svg.append("g")
							.attr("data-group", k)
							.attr("transform", function(d) {
								return "translate(" + startX + "," + (height - yScale(0) - margin/2) + ")";
							})
							.attr("width", groupWidth)
							.on('mouseover', function(d) {
								d3.select(this).style("opacity", 0.7);
							})
							.on('mouseout', function(d) {
								d3.select(this).style("opacity", 0.8);
							});
							

						// append sub-groups
						var numSubgroups = data[k].length;
						var subgroupWidth = groupWidth/numSubgroups;
						var rectGroup = g.selectAll("g")
							.data(data[k]).enter()
							.append("g")
							.attr("transform", function(d, i) {
								var x = i * subgroupWidth;
								var y = d.score < 0 ?  1 : (-yScale(Math.abs(d.score))/2-1);
								return "translate(" + x + "," + y + ")";
							});

						rectGroup.append("rect")
							.attr("data-subgroup", function(d) {
								return d.name;
							})
							.attr("data-group", k)
							.attr("width", subgroupWidth)
							.attr("height", 0)
							.attr('fill', function(d) {
								return color(d.name);
							})
							.style("opacity", 0.8)
							.on("mouseover", function(d) {
								var group = d3.select(this).attr("data-group");
								var subgroup = d3.select(this).attr("data-subgroup");
								tooltip.html(group +  "<br />"+ subgroup + "<br />" + String(Math.round(d.score * 100) / 100));
								return tooltip.style("visibility", "visible");
							})
							.on("mousemove", function(){
								return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
							})
							.on("mouseout", function(){
								return tooltip.style("visibility", "hidden")
							})
							.on('click', function(d) {
								var c = d3.select(this).attr("fill") === "#FFE135" ? color(d.name) : "#FFE135";
								d3.select(this).attr("fill", c);
							})
							.transition()
								.duration(800)
							 	.ease("linear")
								.attr("height", function(d) {
									return yScale(Math.abs(d.score)) / 2;
								});

						startX += groupWidth;
					}
				};

				function drawAxes(yScale, yInvertedScale) {

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
						.attr("stroke", "lightgrey")
						.attr("stroke-width", 1);

				 	var yAxis = svg.append("g")
						.attr("class", "y-axis")
						.attr("fill", "none")
					    .attr("stroke", "grey")
					    .attr("stroke-width", 1)
					    //.style("shape-rendering", "crispEdges")
					    //.style("font-size", 10)
						.attr("transform", function(d) {
							return "translate(" + margin/2 + "," + -margin/2 + ")";
						})
						.call(d3.svg.axis()
					    	.scale(yInvertedScale)
					    	.orient("right")
					    	.ticks(5)
					    	.tickSize(5, 0)
					    );
				};
			});
		}
	};
});