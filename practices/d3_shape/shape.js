const width = 500;
const height = 500;

const svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("border", "1px solid black")
            .style("background-color", "#eee");

const geojson = {
    "type" : "Feature",
    "geometry" : {
        "type" : "Polygon",
        "coordinates" : [
            [
                [10, 10],
                [40, 10],
                [90, 100],
                [20, 100],
                [10, 10]
            ]
        ]
    },
    "properties" : {
        "name" : "Polygon",
        "color" : "red"
    }
};

const projection = d3.geoIdentity()
    .reflectY(true)
    .scale(2)
    .translate([0,250]);

const path = d3.geoPath().projection(projection);

svg.append("path")
    .datum(geojson)
    .attr("d", path)
    .attr("fill", geojson.properties.color)
    .attr("stroke", "black")
    .attr("stroke-width", 1)


svg.append("circle")
    .attr("cx", 250)
    .attr("cy", 250)
    .attr("r", 150)
    .attr("fill", "pink")
    .attr("stroke", "black")
    .attr("stroke-width", 10)