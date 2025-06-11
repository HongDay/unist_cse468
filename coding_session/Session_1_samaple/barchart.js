const secondData = [
    { "Date": "2022-01-01", "Value": 105 },
    { "Date": "2022-01-02", "Value": 12 },
    { "Date": "2022-01-03", "Value": 167 },
    { "Date": "2022-01-04", "Value": 45 },
    { "Date": "2022-01-05", "Value": 82 },
    { "Date": "2022-01-06", "Value": 32 },
    { "Date": "2022-01-07", "Value": 190 },
    { "Date": "2022-01-08", "Value": 55 },
    { "Date": "2022-01-09", "Value": 88 },
    { "Date": "2022-01-10", "Value": 130 },
    { "Date": "2022-01-11", "Value": 175 },
    { "Date": "2022-01-12", "Value": 60 },
    { "Date": "2022-01-13", "Value": 100 },
    { "Date": "2022-01-14", "Value": 25 },
    { "Date": "2022-01-15", "Value": 140 },
    { "Date": "2022-01-16", "Value": 185 },
    { "Date": "2022-01-17", "Value": 72 },
    { "Date": "2022-01-18", "Value": 95 },
    { "Date": "2022-01-19", "Value": 150 },
    { "Date": "2022-01-20", "Value": 40 }
];



var margin = { top: 20, right: 30, bottom: 30, left: 60 },
    barChartWidth = 800 - margin.left - margin.right,
    barChartHeight = 400 - margin.top - margin.bottom,
    barWidth = 25;

// define SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", barChartWidth + margin.left + margin.right)
    .attr("height", barChartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


parsedData = secondData.map(d => {
    return { Date: d3.timeParse("%Y-%m-%d")(d.Date), Value: d.Value }
})

// Set time offset at the end one day
var extent = d3.extent(parsedData, function (d) { return d.Date });
extent[1] = d3.timeDay.offset(extent[1], 1); // Add one day to the end date

// Set x,y scale
var x = d3.scaleTime().domain(extent).range([0, barChartWidth]);
var y = d3.scaleLinear().domain([0, d3.max(parsedData, function (d) { return d.Value })]).range([barChartHeight, 0]);



// Add the x Axis
svg.append("g")
    .attr("transform", "translate(0," + barChartHeight + ")")
    .call(d3.axisBottom(x))
    .append('text')
    .attr('text-anchor', 'middle')
    .text('Date');

// Add the y Axis
svg.append("g")
    .call(d3.axisLeft(y));



//Draw Bars
var g = svg.append("g")

g.selectAll(".bar")
    .data(parsedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => { return x(d.Date) })
    .attr("y", d => { return y(d.Value) })
    .attr("width", barWidth)
    .attr("height", function (d) {
        return barChartHeight - y(d.Value);
    })
    .attr("fill", "#88AADD")

