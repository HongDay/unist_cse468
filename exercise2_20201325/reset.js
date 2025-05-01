d3.select("#reset").on("click", () => {
    // 상태 초기화
    appState.updateTimeRange(null);
    appState.updateSelectedProduct(null);
    appState.updateSelectedRows([]);
  
    // 테이블 필터 UI 초기화
    d3.selectAll(".filter-input").each(function() {
      const input = d3.select(this);
      if (this.tagName === "SELECT") {
        input.property("value", ""); // dropdown
      } else {
        input.property("value", ""); // text input
      }
    });
  
    // bar chart 체크박스 초기화 (모두 체크)
    d3.selectAll("#filters input[type='checkbox']")
      .property("checked", true);
  
    // 선택된 행 초기화는 appState에 의해 자동 적용됨
  });
  