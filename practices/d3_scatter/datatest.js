let dataset = [];
let width = 900;
let height = 900;

let body = d3.select('body')

let svg = body.append('svg')
            .attr('width',width)
            .attr('height', height)

d3.csv('data.csv')
    .then(data => {
        dataset = data.map(d => ({person: d.Sales_Person,
                                        amount: +d.Amount.replace(/[\$,]/g, ''),
                                        boxes: +d.Boxes_Shipped}))
                            .slice(0,10)
        console.log('Data loading complete. Work with dataset.');
        console.log(dataset);
        //drawChart(dataset);
        interaction(dataset);
    })
    .catch(error => {
        console.error('Error loading the data');
    });

function drawChart(dataset){
    const xScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, d => d.boxes)])
                    .range([0,width]);

    const timeScale = d3.scaleTime()
                        .domain([new Date(2020, 0, 1), new Date(2020, 12, 31)])
                        .range([0,width]);

    // 그래프 틀만 만들기
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    // 그래프 틀에 막대 채워넣기
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 25)
        .attr("width", d => xScale(d.boxes))
        .attr("height", 20)
        .attr("fill", "steelblue");
}

function interaction(dataset){
    //let columns = ['amount', 'boxes'];
    let columns = Object.keys(dataset[0]);
    let size = 200;
    let padding = 20;

    const x = columns.map(col => d3.scaleLinear()  // columns의 각 구성요소 col에 대해 mapping
            .domain(d3.extent(dataset, d => d[col])) // dataset의 각 객체에서 col뽑아낸것끼리 최대,최소
            .range([padding / 2, size - padding / 2]) // 출력값의 범위 (화면상의 위치 지정)
    );
    const y = x.map(scale =>
        scale.copy().range([size - padding / 2, padding / 2])
    );

    const cell = svg
        .append("g")
        .selectAll("g")
        .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
        .enter()
        .append("g")
        .attr("transform", ([i,j]) => "translate(" + i * size + "," + j * size + ")");

    cell.append("rect")
        .attr("fill", "none")
        .attr("stroke","#aaa")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding)

    cell.each(function ([i, j]) {
        const g = d3.select(this);
        g.selectAll("circle")
        .data(dataset.filter(d =>
            !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])
        ))
        .join("circle")
        .attr("cx", d => x[i](d[columns[i]]))  // x 좌표
        .attr("cy", d => y[j](d[columns[j]]))  // y 좌표
        .attr("r", 3)
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.7);

        // grid 표시
        g.append("g")
            .attr("transform", `translate(0,${size - padding / 2})`)
            .call(d3.axisBottom(x[i]).ticks(4).tickSize(-size + padding))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("stroke", "#ccc"));

        g.append("g")
            .attr("transform", `translate(${padding / 2},0)`)
            .call(d3.axisLeft(y[j]).ticks(4).tickSize(-size + padding))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("stroke", "#ccc"));
        });

    // 2. 대각선 셀에 컬럼명 표시
    svg.append("g")
    .style("font", "bold 12px sans-serif")
    .style("pointer-events", "none")
    .selectAll("text")
    .data(columns)
    .join("text")
    .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
    .attr("x", padding)
    .attr("y", padding)
    .attr("dy", ".71em")
    .text(d => d);
 }