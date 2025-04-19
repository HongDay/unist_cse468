// svg의 width와 height를 고려하여 margin을 제외하여 새로운 높이, 너비 계산
const svg = d3.select("svg"),
      margin = {top: 50, right: 20, bottom: 50, left: 70},
      width = +svg.attr("width") - margin.left - margin.right,   // width가 svg에 스트링으로 정의되어있어서 +붙여서 숫자로 변환
      height = +svg.attr("height") - margin.top - margin.bottom;

// g 태그 추가, 여기에 그래프에 넣을 박스 요소들 그룹되어 들어갈 예정
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand().range([0, width]).padding(0.1); // 사이간격 0.1 = 10% 확보
const y = d3.scaleLinear().range([height, 0]);
const color = d3.scaleOrdinal(d3.schemeCategory10);  // 색 정의

// tooltip은 마우스 오버시 나타나는 박스 (filter랑 tooltip등은 div에 들어감)
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
    d3.group(data, d => d.month), // month기준 그룹화.
    ([key, values]) => { // 해당 그룹에 대해서 key value에 대해서 어떻게 그룹화할건지
      const grouped = d3.rollups(values, v => d3.sum(v, d => d.Amount), d => d.category); // 해당 월 안에서 category별로 묵고 amount의 합 계산
      const obj = {month: key}; // obj에 month key 기록
      grouped.forEach(([category, total]) => obj[category] = total); // { month: "2023-01", Dark: 3000, Milk: 2500, White: 1500 } 한줄 추가.
      return obj;
    }
  );

  const categories = Array.from(new Set(data.map(d => d.category))); // set으로 카테고리 중복없는 목록 추가.

  const stack = d3.stack().keys(categories); // 카테고리별로 누적할 예정.
  const series = stack(nested);

  x.domain(nested.map(d => d.month));
  y.domain([0, d3.max(nested, d => d3.sum(categories, k => d[k] || 0))]); // 하나의 달 d안에서 카테고리 k의 값 (없으면 0)을 다 더함
  color.domain(categories);

  // x축 추가
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // y축 추가
  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

  // 막대 그룹 추가 (막대하나하나)
  const layer = g.selectAll(".layer")
    .data(series)
    .join("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key));

  layer.selectAll("rect")
    .data(d => d) // series를 가져옴 (layer에서 정ㅇ의했던 데이터를 그대로 쓰겠다~ 뭐 이런..)
    .join("rect")
      .attr("x", d => x(d.data.month)) // 각 막대 fragement (여러 막대가 쌓이는것)의 시작 x값
      .attr("y", d => y(d[1]))         // y축의 시작점
      .attr("height", d => y(d[0]) - y(d[1])) // y축 얼만큼 키울건지 (아래로키움)
      .attr("width", x.bandwidth())          // x축 얼만큼 키울건지
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", .9); // motion종류
        tooltip.html(`Sales: $${(d[1]-d[0]).toFixed(2)}`)        // 띄울 정보
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));


  // Legend
  const legendsvg = d3.select("body").append("svg")
                      .attr("width", 200)
                      .attr("height", categories.length * 22)

  // 각각의 legend에 대해서 
  const legend = legendsvg.selectAll(".legend")
    .data(categories)
    .join("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${50+i * 17})`);

  legend.append("rect")
    .attr("x", 20)
    .attr("y", 10)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", color);

  legend.append("text")
    .attr("x", 45)
    .attr("y", 17)
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