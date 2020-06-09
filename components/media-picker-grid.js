const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

class MediaPickerGrid extends D3Component {
  initialize(node, props) {
    const svg = (this.svg = d3.select(node).append('svg'));
    svg
      .style('width', '100%')
      .style('height', 'auto');

    const colorScale = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([1,100]);
    
    // dummy data
    const data = d3.csv('../data/dummy-data.csv', function(d) {
      // convert strings to numbers
      d.time0 = +d.time0;
      d.time1 = +d.time1;
      d.time2 = +d.time2;
      d.time3 = +d.time3;
      d.time4 = +d.time4;
      d.time5 = +d.time5;
      d.time6 = +d.time6;
      d.time7 = +d.time7;
    }).then(function(data) {
      data.forEach(function(d) {
        
      });
    });

    svg.selectAll()
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d) { return })
  }

  update(props, oldProps) {
  
  }

  processData() {
    // dummy data
    const data = d3.csv('../data/dummy-data.csv');
    return data;
  }
}

module.exports = MediaPickerGrid;
