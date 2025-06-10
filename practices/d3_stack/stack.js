d3.csv('data.csv')
    .then(data => {
        const seen = new Set();

        const filteredData = data.filter(d => {
            if (seen.has(d.Sales_Person)) {
                return false; // 이미 본 Sales_Person이면 제외
            } else {
                seen.add(d.Sales_Person);
                return true; // 처음 보는 Sales_Person이면 포함
            }
        });

        let dataset = filteredData.map(d => ({person: d.Sales_Person.slice(0,4),
                                        amount: +d.Amount.replace(/[\$,]/g, '') / 100,
                                        boxes: +d.Boxes_Shipped}))
                            .slice(0,10)
        console.log('Data loading complete. Work with dataset.');
        console.log(dataset);
        drawLines(dataset);
        //drawStack(dataset);
    })
    .catch(error => {
        console.error('Error loading the data');
    });

function drawLines(dataset){

    const width = 500;
    const height = 300;
    const margin = 30;

    const xScale = d3.scaleBand()
                    .domain(dataset.map(d => d.person))
                    .range([margin, margin+width])
                    .padding(0.1);

    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, d => d.amount)])
                    .range([margin+height, margin]);

    const svg = d3.select("body")
                .append("svg")
                .attr("width", width + 2*margin)
                .attr("height", height + 2*margin)

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width + 2*margin)
        .attr("height", height + 2*margin)
        .attr("fill", "#eee");

    const graph = svg.append("g")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", `translate(${margin}, ${0})`);

    const line = d3.line()
                .x(d => xScale(d.person))
                .y(d => yScale(d.amount));

    graph.append("g")
        .attr("transform", `translate(-${margin}, ${height+margin})`)
        .call(d3.axisBottom(xScale));

    graph.append("g")
        .attr("transform", `translate(0, 0)`)
        .call(d3.axisLeft(yScale));

    graph.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line); 
}

function drawStack(dataset){
    const stack = d3.stack().keys(["amount", "boxes"]);
    
    const stackedData = stack(dataset);
    
    const xScale = d3.scaleBand()
                    .domain(dataset.map(d => d.person))
                    .range([0, 300])
                    .padding(0.1);
    
    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
                    .range([200, 0]);

    const svg = d3.select("body")
                .append("svg")
                .attr("width", 400)
                .attr("height", 300);

    svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 400)
    .attr("height", 300)
    .attr("fill", "#eee");

    const groups = svg.selectAll("g")
                    .data(stackedData)
                    .join("g")
                    .attr("fill", (d, i) => `hsl(${i*40}, 70%, 50%)`)
                    .attr("transform", `translate(50, 50)`);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
                    .ticks(5)
                    .tickFormat(d => d.toFixed(1)); //소수점

    groups.selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", (d,i) => xScale(dataset[i].person))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())

    svg.append("g")
        .attr("transform", `translate(50, 250)`)
        .call(xAxis);
    
    svg.append("g")
        .attr("transform", `translate(50, 50)`)
        .call(yAxis);

    // label 추가
    groups.selectAll("text")
        .data(d => d)
        .join("text")
        .text((d, i) => {
            const value = d[1] - d[0];       // 스택별 실제 값
            return value.toFixed(1);         // 원하는 포맷
        })
        .attr("x", (d, i) => xScale(dataset[i].person) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d[1]) + 12)  // 막대 위에서 아래로 12px 내려서 중앙 정렬
        .attr("text-anchor", "middle")
        .attr("fill", "white")              // 혹은 contrast 색상
        .attr("font-size", "10px");
}
