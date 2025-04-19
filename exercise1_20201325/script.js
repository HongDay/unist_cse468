const svg = d3.select("svg"),
      margin = {top: 50, right: 20, bottom: 50, left: 70},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand().range([0, width]).padding(0.1);
const y = d3.scaleLinear().range([height, 0]);
const color = d3.scaleOrdinal(d3.schemeCategory10);

const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// Load and preprocess data
d3.csv("data.csv").then(data => {
  const parseDate = d3.timeParse("%d-%b-%y");
  const formatMonth = d3.timeFormat("%Y-%m");

  data.forEach(d => {
    d.Date = parseDate(d.Date);
    d.month = formatMonth(d.Date);
    d.Amount = +d.Amount.replace(/[$,\s]/g, "");
    d.Boxes = +d["Boxes Shipped"];
    d.category = d.Product.split(" ")[0]; // 간단한 카테고리 이름
  });

  const nested = Array.from(
    d3.group(data, d => d.month),
    ([key, values]) => {
      const grouped = d3.rollups(values, v => d3.sum(v, d => d.Amount), d => d.category);
      const obj = {month: key};
      grouped.forEach(([category, total]) => obj[category] = total);
      return obj;
    }
  );

  const categories = Array.from(new Set(data.map(d => d.category)));

  const stack = d3.stack().keys(categories);
  const series = stack(nested);

  x.domain(nested.map(d => d.month));
  y.domain([0, d3.max(nested, d => d3.sum(categories, k => d[k] || 0))]);
  color.domain(categories);

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

  const layer = g.selectAll(".layer")
    .data(series)
    .join("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key));

  layer.selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", d => x(d.data.month))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`Sales: $${(d[1]-d[0]).toFixed(2)}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

  // Legend
  const legend = svg.selectAll(".legend")
    .data(categories)
    .join("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend.append("rect")
    .attr("x", width + margin.left + 20)
    .attr("y", 10)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", width + margin.left + 45)
    .attr("y", 20)
    .attr("dy", ".35em")
    .text(d => d);

  // Filter checkboxes
  const filters = d3.select("#filters");
  categories.forEach(cat => {
    const label = filters.append("label");
    label.append("input")
      .attr("type", "checkbox")
      .attr("checked", true)
      .attr("value", cat)
      .on("change", update);
    label.append("span").text(` ${cat}`);
    filters.append("br");
  });

  function update() {
    const activeCats = [];
    d3.selectAll("#filters input:checked").each(function() {
      activeCats.push(this.value);
    });

    const newStack = d3.stack().keys(activeCats);
    const newSeries = newStack(nested);

    y.domain([0, d3.max(nested, d => d3.sum(activeCats, k => d[k] || 0))]);
    g.select(".y-axis").transition().call(d3.axisLeft(y));

    const updateLayer = g.selectAll(".layer").data(newSeries, d => d.key);

    updateLayer.join(
      enter => enter.append("g")
        .attr("class", "layer")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", d => x(d.data.month))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth()),
      update => update
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .transition()
          .attr("x", d => x(d.data.month))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth()),
      exit => exit.remove()
    );
  }
});