function SampleFunction() {
    document.getElementById("target").innerHTML = "Text Changed!";
}


// const svgWidth = 450;
// const svgHeight = 300;
// const svg = d3.select("body").append("svg")
//     .attr("width", svgWidth)
//     .attr("height", svgHeight);

// // Draw Rectangle
// svg.append("rect")
//     .attr("x", 10)
//     .attr("y", 200)
//     .attr("width", 50)
//     .attr("height", 50)
//     .attr("fill", "red")
//     .attr("stroke", "black")
//     .attr("stroke-width", "3px");

d3.selectAll("li").style("color", "#0000FF");

d3.select("body").append("p").text("D3 appended me!");

d3.select("body").insert("p", "ul").text("And D3 insterted me before list!");


const sampleData = [1, 2, 3, 4, 5, 6];

const li = d3.select("ul").selectAll("li").data(sampleData).text(function (d) { return d; });

li.enter().append("li").text(function (d) { return d; });



const data = [
    { "Category": "Apples", "Value": 10 },
    { "Category": "Bananas", "Value": 40 },
    { "Category": "Oranges", "Value": 30 },
    { "Category": "Grapes", "Value": 35 },
    { "Category": "Mangoes", "Value": 50 }
];


// modified code from https://www.tutorialsteacher.com/d3js/create-svg-chart-in-d3js
const width = 700,
    scaleFactor = 10,
    barHeight = 25;



const graph = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", barHeight * data.length);

const bar = graph.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
        return "translate(0," + i * barHeight + ")";
    });

bar.append("rect")
    .attr("width", function (d) {
        return d.Value * scaleFactor;
    })
    .attr("height", barHeight - 1)
    .attr("fill", "#88AADD");

bar.append("text")
    .attr("x", function (d) { return (d.Value * scaleFactor + 5); })
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function (d) { return d.Category; });
