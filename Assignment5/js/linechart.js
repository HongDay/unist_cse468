class lineChart {

    constructor() {
        this.data = null;
    }

    initData(data) {
        try {
            // Filter and prepare the data for the line chart
            this.data = data.map(d => ({
                location: d.location,
                date: d3.timeParse("%Y-%m-%d")(d.date),
                total_cases: Number(d.total_cases)
            }));

            /////////////////// 처음에는 Afghanistan의 데이터로 초기화 ///////////////////////
            this.drawLineChart('Afghanistan');
        } catch (error) {
            console.error(error);
        }
    }

    drawLineChart(selectedCountry) {
        if (!this.data) {
            console.error("Data is not initialized");
            return;
        }
    
        // Filter data for the selected country
        const countryData = this.data.filter(d => d.location === selectedCountry);
    
        if (countryData.length === 0) {
            console.error("No data found for the selected country");
            return;
        }
    
        // Set the dimensions and margins of the graph
        const container = d3.select("#linechart").node();
        const margin = { top: 20, right: 30, bottom: 50, left: 120 },
              width = 1800 - margin.left - margin.right, // Use the full width of the container
              height = 400 - margin.top - margin.bottom;
    
        // Remove any existing chart before drawing a new one
        ///////////////// 이게 아주 중요. 새로 추가하기전에 지우는 (#linechart 안에 있는 모든 요소를 지우는) ////////////////////
        d3.select("#linechart").selectAll("*").remove();
    
        // Append the svg object to the div with id="linechart"
        const svg = d3.select("#linechart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // X axis
        const x = d3.scaleTime()
            .domain([
                d3.timeDay.offset(d3.min(countryData, d => d.date), -1), // Adding one day of padding to the start
                d3.timeDay.offset(d3.max(countryData, d => d.date), 1)  // Adding one day of padding to the end
            ])
            .range([0, width]); // Use the full width of the container
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));
    
        // Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(countryData, d => d.total_cases)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));
    
        // Line generator
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.total_cases));
    
        // Add the line
        svg.append("path")
            .datum(countryData)
            .attr("fill", "none")
            .attr("stroke", "#8bc3a1")
            .attr("stroke-width", 2)
            .attr("d", line);
    
        // X-axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.bottom - 15)
            .text("Date")
            .attr("fill", "black");
    
        // Y-axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -margin.left + 35)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Cases")
            .attr("fill", "black");
    
        // Legend
        svg.append("circle")
            .attr("cx", 20)
            .attr("cy", 20)
            .attr("r", 6)
            .style("fill", "#8bc3a1");
        svg.append("text")
            .attr("x", 30)
            .attr("y", 20)
            .attr("dy", ".35em")
            .style("fill", "black")
            .text(selectedCountry);
    
        // Tooltip functions : 마우스이벤트 등에 따라 
        const tooltip = d3.select("#linechart")
            .append("div")              // div 요소로서 툴팁 추가
            .style("opacity", 0)        // 처음에는 툴팁이 안보이게 
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")
            .style("position", "fixed")
            .style("pointer-events", "none");
    
        // 예를 들면, 마우스가 plot위에있을때 마우스를 따라다니면서 무언가를 보여줌. (플롯 위에 정보를 보여주는 애)
        function showTooltip(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Total Cases: ${d.total_cases}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
    
        function moveTooltip(event, d) {
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
    
        function hideTooltip(event, d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }
    }
    
    

    manageLineChart(selectedCountry) {
        this.drawLineChart(selectedCountry);
    }
}
