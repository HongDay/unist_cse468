// Don't edit code here!
const bubble = new BubbleChart();
const bar = new barChart();
const line = new lineChart();


d3.csv('data/owid-covid-data.csv').then(data => {
    bubble.initData(data);
    bar.initData(data);
    line.initData(data);
})
    .catch(error => {
        console.error(error);
    });
