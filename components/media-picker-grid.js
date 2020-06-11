const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

class MediaPickerGrid extends D3Component {
  initialize(node, props) {
    const svg = (this.svg = d3.select(node).append('svg'));
    const g = (this.g = svg.append('g'));

    svg
      .style('width', '100%')
      .style('height', '600px');

    const colorScale = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([0, 1.0]);

    const margin = {top: 70, right: 70, bottom: 70, left: 70};
    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const xValues = ['time0','time1','time2','time3','time4','time5','time6','time7'];
    const yValues = ['movie trailer', 'animation', 'slideshow', 'song 1', 'song 2', 'song 3', 'website 1', 'website 2'];
    const x = d3.scaleBand()
      .range([ 0, width ])
      .domain(xValues)
      .padding(0.02);
    const y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(yValues)
      .padding(0.02);

    // Add the y Axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(y))
      .style("color", "#333333")
      .style("font-family", "Graphik");

    yAxis.select(".domain").remove();
    
    g.selectAll()
      .data(props.data)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(d.time) })
      .attr("y", function(d) { return y(d.media) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return colorScale(d.value)} );

  }

  update(props, oldProps) {
    console.log('updating media picker grid properties');
    // TODO
  }
}

module.exports = MediaPickerGrid;
