var app = angular.module('d3Primitives');


app.directive('graph', function(d3Service) {
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


					var force = d3.layout.force()
					    .size([width, height])
					    .charge(-400)
					    .linkDistance(40)
					    .on("tick", tick);
					var drag = force.drag()
    					.on("dragstart", dragstart);
    				var link = svg.selectAll(".link");
    				var node = svg.selectAll(".node");

    				var graph = {
    					nodes: [],
    					links: []
    				};

    				// put data into required format
    				for (index in data.nodes) {
    					graph.nodes.push({
    						x: Math.random()*width,
    						y: Math.random()*height
    					});
    				}
    				for (index in data.edges) {
    					graph.links.push({
    						source: data.edges[index].i,
    						target: data.edges[index].j
    					})
    				}
    				
					force
				      .nodes(graph.nodes)
				      .links(graph.links)
				      .start();
				    link = link.data(graph.links)
						.enter().append("line")
					    .attr("class", "link")
					    .attr("stroke", "black")
    					.attr("stroke-width", 2);

					node = node.data(graph.nodes)
						.enter().append("circle")
					    .attr("class", "node")
					    .attr("r", 12)
					    .attr("fill", "grey")
					    .attr("stroke", "black")
					    .attr("stroke-width", 1)
					    .on("dblclick", dblclick)
					    .call(drag);

					function tick() {
					  link.attr("x1", function(d) { return d.source.x; })
					      .attr("y1", function(d) { return d.source.y; })
					      .attr("x2", function(d) { return d.target.x; })
					      .attr("y2", function(d) { return d.target.y; });

					  node.attr("cx", function(d) { return d.x; })
					      .attr("cy", function(d) { return d.y; });
					}

					function dblclick(d) {
					  d3.select(this).classed("fixed", d.fixed = false);
					  d3.select(this).attr("fill", "grey");
					}

					function dragstart(d) {
					  d3.select(this).classed("fixed", d.fixed = true);
					  d3.select(this).attr("fill", "orange");
					}


				};
			});
		}
	};
});