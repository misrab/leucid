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

				function render(data) {
					//remove all previous items before render
					svg.selectAll('*').remove();
					// If we don't pass any data, return out of the element
					if (!data) return;

					// addDefinitions();



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
    						id: index, //data.nodes[index].id,
    						x: Math.random()*width,
    						y: Math.random()*height,
    						group: data.nodes[index].group,
    						color: data.nodes[index].color
    					});
    				}

    				for (index in data.edges) {
    					graph.links.push({
    						source: data.edges[index].source,
    						target: data.edges[index].target,
    						group: data.edges[index].group,
    						color: data.edges[index].color
    					})
    				}
    				
					force
				      .nodes(graph.nodes)
				      .links(graph.links)
				      .start();
				    link = link.data(graph.links)
						.enter().append("line")
					    .attr("class", "link")
					    .attr("stroke", function(d) {
					    	if (d.color) return d.color;
					    	if (d.group) return color(d.group);
					    	return "black";

					    })
    					.attr("stroke-width", 2)
    					// tooltip
					    .on("mouseover", function(d) {
					    	if (!d.group || d.group===undefined) return;
							tooltip.html(d.group);
							return tooltip.style("visibility", "visible");
						})
						.on("mousemove", function(){
							return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
						})
						.on("mouseout", function(){
							return tooltip.style("visibility", "hidden")
						});
    					//.attr("marker-end", "url(#arrowHead)");

					node = node.data(graph.nodes)
						.enter().append("circle")
					    .attr("class", "node")
					    .attr("r", 12)
					    .attr("fill", function(d) {
					    	if (d.color) return d.color;
					    	if (d.group) return color(d.group);
					    	return "grey";

					    })
					    .attr("stroke", "black")
					    .attr("stroke-width", 1)
					    .style("cursor", "pointer")
					    .on("dblclick", dblclick)
					    // tooltip
					    .on("mouseover", function(d) {
							tooltip.html(d.group +", id: "+d.id);
							return tooltip.style("visibility", "visible");
						})
						.on("mousemove", function(){
							return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
						})
						.on("mouseout", function(){
							return tooltip.style("visibility", "hidden")
						})
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
					  d3.select(this).attr("fill", "#FFE135");
					}


				};

				// function addDefinitions() {
				// 	var defs = svg.append("defs");
						
				// 	defs.append("marker")
				// 	    .attr("id", "arrowHead")
				// 	    .attr("refX", -6) /*must be smarter way to calculate shift*/
				// 	    .attr("refY", -2)
				// 	    .attr("markerWidth", 6)
				// 	    .attr("markerHeight", 4)
				// 	    //.attr("orient", "right")
				// 	    .append("path")
				// 	        .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
				// };
			});
		}
	};
});