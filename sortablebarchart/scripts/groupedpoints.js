var margin = {top: 30, right: 20, bottom: 36, left: 40},
    width = 500 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var y = d3.scale.ordinal()
    .rangeRoundPoints([0, height], .1);

var x = d3.scale.linear()
    .range([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(formatPercent);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>This Group:</strong> <span style='color:steelblue'>" + 
      d3.format('.1%')(d.frequency) + "</span>";
  });

var tipb = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>That Group:</strong> <span style='color:red'>" + 
      d3.format('.1%')(d.frequencyb) + "</span>";
  });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);
svg.call(tipb);

d3.csv("data.csv", function(error, data) {

  console.log("original data", data);

  var labelVar = 'letter';
  var varNames = d3.keys(data[0])
      .filter(function (key) { return key !== labelVar;});

  y.domain(data.map(function(d) { return d.letter; }));
  x.domain([0, d3.max(data, function(d) {return d3.max([d.frequency,d.frequencyb]); })]);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("text")
      .attr("class", "x label")
      .style("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + 32)
      .text("Frequency");

  svg.selectAll(".circle1")
      .data(data)
    .enter().append("circle")
      .attr("class", "circle1")
      .attr("r", 3.5)
      .attr("cy", function(d) { return y(d.letter); })
      .attr("cx", function(d) { return x(d.frequency); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  svg.selectAll(".circle2")
      .data(data)
    .enter().append("circle")
      .attr("class", "circle2")
      .attr("r", 3.5)
      .attr("cy", function(d) { return y(d.letter); })
      .attr("cx", function(d) { return x(d.frequencyb); })
      .on('mouseover', tipb.show)
      .on('mouseout', tipb.hide);

  d3.select("input").on("change", change);

  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var y0 = y.domain(data.sort(this.checked
        ? function(a, b) { return (b.frequency - b.frequencyb) - (a.frequency - a.frequencyb); } // Biggest difference a over b
        <!--? function(a, b) { return Math.abs(b.frequency - b.frequencyb) - Math.abs(a.frequency - a.frequencyb); }--> // Most conentious
        <!--? function(a, b) { return (b.frequencyb) - (a.frequencyb); }--> // Biggest b
        <!--? function(a, b) { return b.frequency - a.frequency; }--> //biggest a
        : function(a, b) { return d3.ascending(a.letter, b.letter); })
        .map(function(d) { return d.letter; }))
        .copy();

    svg.selectAll(".circle1")
        .sort(function(a, b) { return y0(a.letter) - y0(b.letter); });

    svg.selectAll(".circle2")
        .sort(function(a, b) { return y0(a.letter) - y0(b.letter); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".circle1")
        .delay(delay)
        .attr("cy", function(d) { return y0(d.letter); });

    transition.selectAll(".circle2")
        .delay(delay)
        .attr("cy", function(d) { return y0(d.letter); });

    transition.select(".y.axis")
        .call(yAxis)
      .selectAll("g")
        .delay(delay);
  }
});

