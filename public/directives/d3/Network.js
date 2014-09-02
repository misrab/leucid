var app = angular.module('d3Primitives');


app.directive('network', function(d3Service) {
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

		        var color = d3.scale.category20();

		        var //margin = parseInt(attrs.margin) || 20,
					width = attrs.width || d3.select(element[0]).node().offsetWidth, // - margin,
					height = attrs.height || width,
					//radius = attrs.radius || 5,
					directed = attrs.directed == 'true' ? true : false;

				svg.style('height', height);

		          // Browser onresize event
		        window.onresize = function() {
	            	scope.$apply();
	          	};

	          	// Watch for resize event
	          	scope.$watch(function() {
	           		return angular.element(window)[0].innerWidth;
	          	}, function() {
	            	return scope.renderNodes(scope.data.nodes, function() {
	            		scope.renderEdges(scope.data.edges);
	            	});
	          	});

	          	// Watch for data changes and re-render
				scope.$watch('data.edges', function(newVals, oldVals) {
					return scope.renderEdges(newVals);
				}, true);

	          	// Watch for data changes and re-render
				scope.$watch('data.nodes', function(newVals, oldVals) {
				  	return scope.renderNodes(scope.data.nodes, function() {
	            		scope.renderEdges(scope.data.edges);
	            	});
				}, true); // true for actual object equality, not pointers

				scope.renderNodes = function(nodes, callback) {
					// remove all previous items before render
					svg.selectAll('*').remove();
					// If we don't pass any data, return out of the element
					if (!nodes) return;
					// set svg height
					svg.attr("height", height);

					// set scales
					var minScore = d3.min(nodes, function(d) {
						return d.score;
					});
					var maxScore = d3.max(nodes, function(d) {
						return d.score;
					});
					if (isNaN(minScore) || isNaN(maxScore)) minScore = maxScore = 1;
					// we'll scale radius by up to 2
					var scoreScale = d3.scale.linear()
						.domain([minScore, maxScore])
						.range([1, 2]);

					drawNodes(nodes, scoreScale);

					if (callback) callback();
				};

				scope.renderEdges = function(edges) {
					svg.selectAll('line').remove();
					drawEdges(edges);
				};


				// Draw  a node then its connected nodes, and so on.
				// We'll first draw all with bound data, then place them 
				// iteratively.
				function drawNodes(nodes, scoreScale) {
					// choose a reasonable baseline radius
					var N = nodes.length;
					var r = Math.max(5, Math.min(height, width) / (4 * N));


					// tooltip
					var tooltip = svg.append("text")
						.style('text-anchor', 'middle')
						.style("font-weight", "bold")
						.style('opacity', 0);

					// update old nodes
					svg.selectAll("circle")
						.data(nodes)
						.attr("r", function(d) {
							return d.score === undefined ? r : scoreScale(d.score) * r;
						})
						.attr("fill", function(d) {
							return d.color === undefined ? color(d.label) : d.color;
						});

					// draw new nodes
					svg.selectAll("circle")
						.data(nodes).enter()
						.append("circle")
							.attr("data-id", function(d) {
								return d.id;
							})
							.attr("r", function(d) {
								return d.score === undefined ? r : scoreScale(d.score) * r;
							})
							// place randomly for now, better than 0, 0
							.attr("cx", function(d) {
								var radius = d.score === undefined ? r : scoreScale(d.score) * r;
								return radius + Math.random() * (width - radius);
							})
							.attr("cy", function(d) {
								var radius = d.score === undefined ? r : scoreScale(d.score) * r;
								return radius + Math.random() * (height - radius);
							})
							.attr("stroke", "grey")
							.attr("stroke-width", 1)
							.attr("opacity", 0.7)
							.attr("fill", function(d) {
								return d.color === undefined ? color(d.label) : d.color;
							})
							// tooltip stuff
							.on('mouseover', function(d) {
								var circle = d3.select('circle[data-id="'+d.id+'"]');
								var x = parseInt(circle.attr("cx"));
								var y = parseInt(circle.attr("cy"));
								var r = parseInt(circle.attr("r"));

								tooltip.text(JSON.stringify(d))
									.attr("x", x)
									.attr("y", Math.max(r, y - r - 5)) // padding
									.transition()
										.duration(200)
										.style('opacity', 1);
							})
							.on("mouseout", function(d) {
								tooltip.transition()
										.duration(200)
										.style('opacity', 0);
							});

					// now place the nodes iteratively
					// var placedNodes = {};
					// var center = {
					// 	x: width/2,
					// 	y: height/2
					// };
					// for (var i=0; i < N; i++) {
					// 	var node = nodes[i];
					// 	// if already drawn TODO just draw new edges
					// 	if (placedNodes[node.id] != undefined) continue;

					// 	// find and place svg element
					// 	var circle = d3.select('circle[data-id="'+node.id+'"]');
					// 	circle.attr("cx", center.x)
					// 		.attr("cy", center.y);

					// 	// refresh center
					// 	center.x = r + Math.random()*(width - 2*r);
					// 	center.y = r + Math.random()*(height - 2*r);						
						
					// 	// now draw adjacent circles
					// 	drawAdjacent(nodes, circle, placedNodes);

					// 	// add to map
					// 	placedNodes[node.id] = true;
					// }

					// now draw edges
					//drawEdges(data.edges);
				};


				// draws given edges. duplication based on 'directed' boolean.
				function drawEdges(edges) {
					//var drawnEdges = {};

					for (index in edges) {
						var e = edges[index];

						// check if drawn forward direction
						// if (e.i in drawnEdges && e.j in drawnEdges[e.i]) continue;
						// // check if drawn other direction (undirected case)
						// if (directed === false && e.j in drawnEdges && e.i in drawnEdges[e.j]) continue;

						// draw the edge
						drawEdge(e);

						// // list as marked
						// if (e.i in drawnEdges) { drawnEdges[e.i][e.j] = true; }
						// else { drawnEdges[e.i] = {}; drawnEdges[e.i][e.j] = true; }
					}
				};

				// edge: { i: int, j: int }
				function drawEdge(e) {
					// get start and end circles
					var start = d3.select('circle[data-id="'+e.i+'"]');
					var end = d3.select('circle[data-id="'+e.j+'"]');

					// ! not sure why this is needed
					if (end.node()===null || start.node()===null) return;

					svg.append("line")
						.attr("x1", start.attr("cx"))
						.attr("y1", start.attr("cy"))
						.attr("x2", end.attr("cx"))
						.attr("y2", end.attr("cy"))
						.attr("stroke", function(d) {
							if (e.color !== undefined) return e.color;
							if (e.label !== undefined) return color(e.label);
							return "lightgrey";
						})
						.attr("stroke-width", 2)
						.style("opacity", 0.7);
				};

				function drawAdjacent(nodes, circle, placedNodes) {
					var id = parseInt(circle.attr("data-id"));
					var x = parseInt(circle.attr("cx"));
					var y = parseInt(circle.attr("cy"));
					var r = parseInt(circle.attr("r"));
				
					// find adjacent circle ids
					var adjacent = findAdjacent(id);
					var numAdj = adjacent.length;
					for (index in adjacent) {
						// ignore if already placed
						// TODO may want to move to center or gravity
						if (placedNodes[adjacent[index]] != undefined) continue;

						// place it. we'll put it in orbit at the min radius
						// distance of the two.
						var n = d3.select('circle[data-id="'+adjacent[index]+'"]')
						var nr = parseInt(n.attr("r"));
						var distance = Math.min(r, nr) + r + nr;
						n
							.attr("cx", x + distance * Math.cos(2*Math.PI * index/numAdj))
							.attr("cy", y + distance * Math.sin(2*Math.PI * index/numAdj));
							

						// mark as placed
						placedNodes[adjacent[index]] = true;
					}
				};

				function findAdjacent(id) {
					var adjacent = {}; // map
					var result = []; // list
					var edges = scope.data.edges;
					for (index in edges) {
						var e = edges[index];
						if (e.i == id) {
							adjacent[e.j] = true;
						}
						if (e.j == id) {
							adjacent[e.i] = true;
						}
					};

					// push unique integer ids
					for (k in adjacent) {
						result.push(parseInt(k));
					}
					return result;
				};

			}); // end d3 scope
		} // end link
	}; // end return object
}); // end directive scope