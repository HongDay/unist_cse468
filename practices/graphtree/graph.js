const width = 500;
const height = 300;

const data = {
    name: "Root",
    children: [
      { name: "Child 1" },
      { name: "Child 2", children: [ { name: "Grandchild" }, {name: "grandchild"} ] }
    ]
  };

const root = d3.hierarchy(data);

const treeLayout = d3.tree().size([width-50, height-50]);
treeLayout(root);

const svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

svg.selectAll("line")
  .data(root.links())
  .join("line")
  .attr("x1", d => d.source.x)
  .attr("y1", d => d.source.y)
  .attr("x2", d => d.target.x)
  .attr("y2", d => d.target.y)
  .attr("stroke", "black");

svg.selectAll("circle")
  .data(root.descendants())
  .join("circle")
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("r", 4)
  .text(d => d.data.name);


// 더 자세한 그래프 만들기는 여기
// https://clamwell.github.io/blog/draw-network-chart-with-d3.js/