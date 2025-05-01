const appState = {
    timeRange: null,
    selectedProduct: null,
    selectedRows: [],
    updateTimeRange(range) {
      this.timeRange = range;
      this.notifyVisualizations();
    },
    updateSelectedProduct(product) {
      this.selectedProduct = product;
      this.notifyVisualizations();
    },
    updateSelectedRows(rows) {
      this.selectedRows = rows;
      this.notifyVisualizations();
    },
    notifyVisualizations() {
      updateDataTable?.(this);
      updateAreaChart?.(this);
      updateBarChart?.(this);
    }
  };
  