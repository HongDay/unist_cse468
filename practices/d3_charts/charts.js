const data = [
    { category: "A", value: 30 },
    { category: "B", value: 80 },
    { category: "C", value: 45 }
  ];


  const svg = d3.select("body").append("svg").attr("width", 400).attr("height", 300);

  const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([40, 380])
    .padding(0.1);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([250, 20]);
  
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.category))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => 250 - y(d.value))
    .attr("fill", "steelblue");
  