// 전역 변수 정의
let fullData = [];
let parsedTimeData = [];
let focusSvg, contextSvg, xFocus, xContext, yFocus, brush;
let updateAreaChart;

// 데이터 로드
d3.csv("data.csv", d => {
  return {
    Date: d3.timeParse("%d-%b-%y")(d["Date"]),
    Amount: +d["Amount"].replace(/[\$,]/g, '')
  };
}).then(data => {
  fullData = data;

  // 월별 판매 합산
  const monthlyData = d3.rollup(
    data,
    v => d3.sum(v, d => d.Amount),
    d => d3.timeMonth(d.Date)
  );

  parsedTimeData = Array.from(monthlyData, ([key, value]) => ({ Date: key, Amount: value }))
    .sort((a, b) => d3.ascending(a.Date, b.Date));

  drawCharts();
});

function drawCharts() {
  const margin = { top: 10, right: 30, bottom: 20, left: 50 };
  const focusWidth = 800 - margin.left - margin.right;
  const focusHeight = 250 - margin.top - margin.bottom;
  const contextHeight = 100 - margin.top - margin.bottom;

  focusSvg = d3.select("#focus-chart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  contextSvg = d3.select("#context-chart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  xFocus = d3.scaleTime()
    .domain(d3.extent(parsedTimeData, d => d.Date))
    .range([0, focusWidth]);

  xContext = d3.scaleTime()
    .domain(xFocus.domain())
    .range([0, focusWidth]);

  yFocus = d3.scaleLinear()
    .domain([0, d3.max(parsedTimeData, d => d.Amount)])
    .range([focusHeight, 0]);

  const yContext = d3.scaleLinear()
    .domain(yFocus.domain())
    .range([contextHeight, 0]);

  const focusArea = d3.area()
    .x(d => xFocus(d.Date))
    .y0(focusHeight)
    .y1(d => yFocus(d.Amount));

  const contextArea = d3.area()
    .x(d => xContext(d.Date))
    .y0(contextHeight)
    .y1(d => yContext(d.Amount));

  // Focus chart
  focusSvg.append("path")
    .datum(parsedTimeData)
    .attr("fill", "#88c")
    .attr("d", focusArea);

  focusSvg.append("g")
    .attr("transform", `translate(0,${focusHeight})`)
    .call(d3.axisBottom(xFocus));

  focusSvg.append("g")
    .call(d3.axisLeft(yFocus));

  // Context chart
  contextSvg.append("path")
    .datum(parsedTimeData)
    .attr("fill", "#cce")
    .attr("d", contextArea);

  contextSvg.append("g")
    .attr("transform", `translate(0,${contextHeight})`)
    .call(d3.axisBottom(xContext));

  // 브러시
  brush = d3.brushX()
    .extent([[0, 0], [focusWidth, contextHeight]])
    .on("brush end", handleBrush);

  contextSvg.append("g")
    .attr("class", "brush")
    .call(brush);
}

function handleBrush({ selection }) {
    if (!selection) return;
  
    const [x0, x1] = selection.map(xContext.invert);
    xFocus.domain([x0, x1]);
  
    focusSvg.select("path")
      .datum(parsedTimeData.filter(d => d.Date >= x0 && d.Date <= x1))
      .attr("d", d3.area()
        .x(d => xFocus(d.Date))
        .y0(focusSvg.attr("height") || 220)
        .y1(d => yFocus(d.Amount))
      );
  
    focusSvg.select("g").call(d3.axisBottom(xFocus));
  
    appState.updateTimeRange([x0, x1]); // 전역 상태 객체 호출
  }
  
updateAreaChart = function(appState) {
    let filteredData = parsedTimeData;
  
    if (appState.timeRange) {
      filteredData = parsedTimeData.filter(d =>
        d.Date >= appState.timeRange[0] && d.Date <= appState.timeRange[1]
      );
    }
  
    // Focus 영역 재계산
    xFocus.domain(d3.extent(filteredData, d => d.Date));
    yFocus.domain([0, d3.max(filteredData, d => d.Amount)]);
  
    const updatedArea = d3.area()
      .x(d => xFocus(d.Date))
      .y0(250 - 10 - 20) // focusHeight: 250 - marginTop - marginBottom
      .y1(d => yFocus(d.Amount));
  
    focusSvg.select("path")
      .datum(filteredData)
      .transition()
      .duration(500)
      .attr("d", updatedArea);
  
    focusSvg.select("g").call(d3.axisBottom(xFocus));
    focusSvg.select("g").call(d3.axisLeft(yFocus));
  };
  