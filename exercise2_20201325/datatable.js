let updateDataTable; // 전역 함수 등록

d3.csv("data.csv", d => ({
  "Sales Person": d["Sales Person"],
  "Country": d["Country"],
  "Product": d["Product"],
  "Date": d["Date"],
  "Amount": +d["Amount"].replace(/[\$,]/g, ''),
  "Boxes Shipped": +d["Boxes Shipped"]
})).then(data => {
  let filteredData = [...data];
  let sortAscending = true;
  let selectedRowIndex = null;

  let currentPage = 0;
  const rowsPerPage = 20;

  const table = d3.select("#datatable");
  const headerRow = d3.select("#header-row");
  const filterRow = d3.select("#filter-row");
  const tbody = table.select("tbody");

  const columns = Object.keys(data[0]);
  const dropdownCols = ["Sales Person", "Country", "Product"];

  const pagination = d3.select("body").append("div").attr("id", "pagination");
  pagination.append("button").attr("id", "prev").text("Previous");
  pagination.append("span").attr("id", "page-info").style("margin", "0 10px");
  pagination.append("button").attr("id", "next").text("Next");

  filterRow.selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .each(function (col) {
      const cell = d3.select(this);
      if (dropdownCols.includes(col)) {
        const uniqueValues = Array.from(new Set(data.map(d => d[col]))).sort();
        const select = cell.append("select")
          .attr("class", "filter-input")
          .on("change", () => {
            currentPage = 0;
            filterTable();
          });

        select.append("option").attr("value", "").text("All");
        uniqueValues.forEach(val => {
          select.append("option").attr("value", val).text(val);
        });
      } else {
        cell.append("input")
          .attr("type", "text")
          .attr("placeholder", "Filter")
          .attr("class", "filter-input")
          .on("input", () => {
            currentPage = 0;
            filterTable();
          });
      }
    });

  headerRow.selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(d => d)
    .on("click", function (event, col) {
      filteredData.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        return sortAscending
          ? d3.ascending(valA, valB)
          : d3.descending(valA, valB);
      });
      sortAscending = !sortAscending;
      renderRows(appState);
    });

  function filterTable() {
    const inputs = filterRow.selectAll("th").nodes();

    filteredData = data.filter(row => {
      return columns.every((col, i) => {
        const cell = d3.select(inputs[i]);
        if (dropdownCols.includes(col)) {
          const val = cell.select("select").property("value");
          return !val || row[col] === val;
        } else {
          const val = cell.select("input").property("value").toLowerCase();
          return row[col].toString().toLowerCase().includes(val);
        }
      });
    });

    renderRows(appState);
  }

  function renderRows(appState) {
    tbody.selectAll("tr").remove();
  
    // ⏱️ 시간 필터 적용
    const filteredByTime = appState?.timeRange
      ? filteredData.filter(d => {
          const date = d3.timeParse("%d-%b-%y")(d.Date);
          return date >= appState.timeRange[0] && date <= appState.timeRange[1];
        })
      : filteredData;
  
    // 🎯 카테고리 필터 적용 (선택된 product 기준)
    const filteredByProduct = appState?.selectedProduct
      ? filteredByTime.filter(d => d.Product.startsWith(appState.selectedProduct))
      : filteredByTime;
  
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredByProduct.slice(start, end);
  
    const rows = tbody.selectAll("tr")
      .data(pageData)
      .enter()
      .append("tr")
      .attr("class", (d, i) => {
        const globalIndex = filteredData.indexOf(d);
        return globalIndex === selectedRowIndex ? "selected" : null;
      })
      .on("click", function (event, d) {
        selectedRowIndex = filteredData.indexOf(d);
        renderRows(appState);
        appState.updateSelectedRows([d]);
      });
  
    rows.selectAll("td")
      .data(row => columns.map(c => row[c]))
      .enter()
      .append("td")
      .text(d => d);
  
    updatePaginationControls(filteredByProduct);
  }
  

  function updatePaginationControls(filteredList) {
    const totalPages = Math.ceil(filteredList.length / rowsPerPage);
    d3.select("#page-info").text(`Page ${currentPage + 1} of ${totalPages}`);

    d3.select("#prev").attr("disabled", currentPage === 0 ? true : null);
    d3.select("#next").attr("disabled", currentPage >= totalPages - 1 ? true : null);
  }

  d3.select("#prev").on("click", () => {
    if (currentPage > 0) {
      currentPage--;
      renderRows(appState);
    }
  });

  d3.select("#next").on("click", () => {
    currentPage++;
    renderRows(appState);
  });

  renderRows(appState);

  // 외부에서 접근 가능하게
  updateDataTable = function (appState) {
    currentPage = 0;
    selectedRowIndex = null; // reset selection
    renderRows(appState);
  };
});
