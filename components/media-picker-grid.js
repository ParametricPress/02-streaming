const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

class MediaPickerGrid extends D3Component {
  initialize(node, props) {
    console.log(props);
    const svg = (this.svg = d3.select(node).append('svg'));
    svg
      .style('width', '100%')
      .style('height', 'auto');

    const colorScale = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([0, 1.0]);

    const margin = {top: 30, right: 30, bottom: 30, left: 30};
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .range([ 0, width ])
      .domain(['time0','time1','time2','time3','time4','time5','time6','time7'])
      .padding(0.02);
    const y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(['movie trailer', 'animation', 'slideshow', 'song 1', 'song 2', 'song 3', 'website 1', 'website 2'])
      .padding(0.02);
    
    svg.selectAll()
      .data(props.data)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(d.time) })
      .attr("y", function(d) { return y(d.media) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return colorScale(d.value)} )
  }

  update(props, oldProps) {
    // TODO
  }
}

module.exports = MediaPickerGrid;
