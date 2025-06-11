class BubbleChart {

    initData(data) {
        try {

            var filteredData = data.filter(d => {
                return d.life_expectancy && d.gdp_per_capita && d.date && d.location && d.population && d.continent
            })

            // Parse data into D3 time format & calculate rate
            filteredData = filteredData.map(d => {
                return {
                    location: d.location,
                    date: d3.timeParse("%Y-%m-%d")(d.date),
                    life_expectancy: Number(d.life_expectancy),
                    gdp_per_capita: Number(d.gdp_per_capita),
                    continent: d.continent,
                    population: Number(d.population),
                }
            })

            // Sort by date (descending)
            filteredData = filteredData.sort((a, b) => b.date - a.date)

            // console.log(filteredData)

            // Get latest datum of each country
            var processedData = []
            var countryList = []
            for (var d of filteredData) {
                if (!countryList.includes(d.location)) {
                    processedData.push(d)
                    countryList.push(d.location)
                }
            }

            // Sort by life expectancy (descending)
            processedData = processedData.sort((a, b) => b.life_expectancy - a.life_expectancy)

            this.drawBubbleChart(processedData)

        }
        catch (error) {
            console.error(error);
        };

    }

    drawBubbleChart(data) {

        // Canvas Size
        const margin = { top: 5, right: 250, bottom: 50, left: 120 },
            width = 1000 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // Define the position of the chart 
        const svg = d3.select("#bubblechart")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set the visible area of bubbles
        const clip = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)

        // [Your Code Here]
        // Add brush event here
        const brush = d3.brush()                   // 브러쉬 설정 (마우스로 영역을 드래그하여 선택할 수 있게)
            .extent([[0, 0], [width, height]])     // 브러쉬 영역 설정
            .on("start brush end", updateChart);   // start : 마우스 누르는 순간, brush : 드래그하는 동안, end : 마우스 땔 때 -> 3가지 모두 같은함수 적용할 때

        svg.append("g")                            // 브러쉬 객체 추가.
            .attr("class", "brush")
            .call(brush);
        //[code end]

        // Scale for x-axis
        const xScale = d3.scaleLinear().domain([-20000, d3.max(data, function (d) { return d.gdp_per_capita }) * 1.1]).range([0, width])

        // Scale for y-axis
        const yScale = d3.scaleLinear().domain([d3.min(data, function (d) { return d.life_expectancy }) * 0.9, d3.max(data, function (d) { return d.life_expectancy }) * 1.1]).range([height, 0])

        const continentList = [...new Set(data.map(item => item.continent))];
        // console.log(continentList)

        // Scale for color
        const cScale = d3.scaleOrdinal().domain(continentList).range(["#cce1f2", "#a6f8c5", "#fbf7d5", "#e9cec7", "#f59dae", "#d2bef1"])

        // Scale for circle size
        const sScale = d3.scaleSqrt().domain(d3.extent(data, function (d) { return d.population })).range([5, 50])


        // Generate bubbles
        const circle = svg.append('g')
            .attr("clip-path", "url(#clip)")

        const circle_enter = circle.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "bubbles " + d.continent })
            .attr("cx", function (d) { return xScale(d.gdp_per_capita); })
            .attr("cy", function (d) { return yScale(d.life_expectancy); })
            .attr("r", function (d) { return sScale(d.population); })
            .style("fill", function (d) { return cScale(d.continent); })
            .attr("stroke", "black")
            // Add mouse over event
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)
        // [Your Code Here]
        // Add click event for line chart
            .on("click", function(event, d) {       
                line.manageLineChart(d.location);    // 얘는 data가 일반 배열이라서 그냥 d.location 으로 바로 접근 가능
            });

        // Draw axes 
        const xAxis = svg.append("g")
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        const yAxis = svg.append("g")
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale))

        // Indicate the x-axis label 
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .attr("font-size", 17)
            .text("GDP Per Capita")
            .style('fill', 'black');

        // Indicate the y-axis label 
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -60)
            .attr("font-size", 17)
            .text("Life Expectency")
            .style('fill', 'black')
            .attr("transform", "rotate(270)");

        // Add legend
        const size = 30
        svg.selectAll("legend")
            .data(continentList)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "legend " + d })
            .attr("cx", width + 100)
            .attr("cy", function (d, i) { return 10 + i * size })
            .attr("r", 10)
            .style("fill", function (d) { return cScale(d) })
            .attr("stroke", "black")
            .on("click", toggleContinent)

        // Add legend texts
        svg.selectAll("legend_label")
            .data(continentList)
            .enter()
            .append("text")
            .attr("class", function (d) { return "legendtext " + d })
            .attr("x", width + 100 + size)
            .attr("y", function (d, i) { return i * size + (size / 2) })
            .text(function (d) { return d })
            .attr("text-anchor", "start")
            .style('fill', 'black')
            .on("click", toggleContinent)


        // [Your Code Here]
        // 브러쉬 이벤트 발생 시, 차트를 업데이트 하는 함수
        function updateChart(event) {
            const extent = event.selection; // 사용자가 드래그 한 사각형 영역 (2차원 배열))
            
            if (!extent) {          // 브러시 영역이 없으면, 혹은 지워졌다면 
                circle_enter.classed("selected", false)
                    .attr("stroke-width", 1)
                    .attr("stroke", "black");
                //bar.filterBarDataBySelection(data); // Reset to all data if brush is cleared
                bar.drawOriginal();
                return;
            }
        
            // Define the brush area boundaries
            const [[x0, y0], [x1, y1]] = extent;
        
            // 모든 circle에 대해 다음을 수행
            circle_enter.classed("selected", d =>             // selected로 클래스를 정의해줬으니깐 그냥 css의 selected style의 디자인 정보를 넣어줘도 됨
                isBrushed(extent, xScale(d.gdp_per_capita), yScale(d.life_expectancy))   // xScale은 gdp_per_capita를 x좌표로 변환한 값임
            ).attr("stroke-width", d =>
                isBrushed(extent, xScale(d.gdp_per_capita), yScale(d.life_expectancy)) ? 3 : 1
            ).attr("stroke", d =>
                isBrushed(extent, xScale(d.gdp_per_capita), yScale(d.life_expectancy)) ? "blue" : "black"
            );

            // Filter the data based on the brush area
            const selectedData = data.filter(d => {
                const circleElem = d3.selectAll("circle").filter(c => c === d).node();

                const isInBursh = isBrushed(extent, xScale(d.gdp_per_capita), yScale(d.life_expectancy));
                const isVisible = d3.select(circleElem).style("opacity") !== "0";

                return isInBursh && isVisible;
            });
            /* 
            아니면 barChart처럼 this.hiddenContinents = new Set(); 를 아예 정의해버려도 됨.
            toggleContinent에서 숨겨져야되는 애들은 숨기는 거지 

            const currentOpacity = d3.selectAll(".bubbles." + className).style("opacity");

            const shouldHide = currentOpacity == 1;

            if (shouldHide) {
                this.hiddenContinents.add(d);
            } else {
                this.hiddenContinents.delete(d);
            }
            */
        
            if (selectedData.length === 0) {
                bar.drawOriginal();
            }
            else{
                // Update bar chart based on brushed data
                bar.filterBarDataBySelection(selectedData);
            }
        }

        // [Your Code Here]
        // Implement function checking if the circles are in the brush area
        function isBrushed(brushArea, cx, cy) {
            const [[x0, y0], [x1, y1]] = brushArea;
            return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // 각 원의 중심좌표가 burshArea 영역 내에 있는지 확인
        }

        // Define Tooltip Temlplate
        const tooltip = d3.select("#bubblechart")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")
            .style("display", "inline")
            .style("position", "fixed")
            .style("pointer-events", "none")

        // Tooltip functions
        function showTooltip(event, d) {
            tooltip
                .transition()
                .duration(10)
                .style("opacity", 1)
            tooltip
                .html("Country: " + d.location
                    + "<br>Population: " + d.population
                    + "<br>GDP per Capita: " + d.gdp_per_capita
                    + "<br>Life Expectancy: " + d.life_expectancy)
                .style("left", (d3.pointer(event)[0] + 138) + "px")
                .style("top", (d3.pointer(event)[1] + 35) + "px")
        }

        function moveTooltip(event, d) {
            tooltip
                .style("left", (d3.pointer(event)[0] + 138) + "px")
                .style("top", (d3.pointer(event)[1] + 35) + "px")
        }

        function hideTooltip(event, d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

        // Filter by clicking legend
        function toggleContinent(event, d) {
            // Parse continent into class name
            var continentSplit = d.split(' ')
            var className = continentSplit.join('.');

            // Get current opacity
            var currentOpacity = d3.selectAll(".bubbles." + className).style("opacity")

            // Change the opacity: from 0 to 1 or from 1 to 0
            d3.selectAll(".bubbles." + className)
                .transition()
                .duration(200)
                .style("opacity", currentOpacity == 1 ? 0 : 1)
                .style("pointer-events", currentOpacity == 1 ? "none" : "auto")  // "pointer_events" : 마우스 이벤트 (클릭, hover등) -> "none" : 차단, "auto" : 허용

            d3.select(".legend." + className)
                .transition()
                .duration(200)
                .style("opacity", currentOpacity == 1 ? 0.3 : 1)

            d3.select(".legendtext." + className)
                .transition()
                .duration(200)
                .style("opacity", currentOpacity == 1 ? 0.3 : 1)

            // Filter bar chart data
            bar.filterBarDataByContinent(d)
        }

    }

    // Highigting by hovering in bar chart
    enableHighlightBubble(event, d) {
        // console.log(d.data.location)
        d3.select("#bubblechart")
            .select("svg").selectAll("circle")
            .select(function (b) { return b.location === d.data.location ? this : null; })
            .clone()                               // 복사 후
            .raise()
            .attr("class", "bubbleHighlight")      // 이 속성을 부여한 듯
            .style('stroke', '#FF0000')
            .attr("stroke-width", "4px")
    }

    disableHighlightBubble(event, d) {
        // console.log(d.data.location)
        d3.select("#bubblechart")
            .select("svg").selectAll(".bubbleHighlight")
            .remove()
    }

}
