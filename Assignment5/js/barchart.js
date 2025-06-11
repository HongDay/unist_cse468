class barChart {

    constructor() {
        this.data = null;
        this.original = null;
        this.currentContinentList = null;
    }

    initData(data) {
        try {
            var filteredData = data.filter(d => {
                return d.people_vaccinated_per_hundred && d.people_fully_vaccinated_per_hundred && d.date && d.location && d.population && d.continent
            })

            // Parse data into D3 time format & calculate rate
            filteredData = filteredData.map(d => {
                return {
                    location: d.location,
                    date: d3.timeParse("%Y-%m-%d")(d.date),
                    people_vaccinated: Number(d.people_vaccinated_per_hundred),
                    people_fully_vaccinated: Number(d.people_fully_vaccinated_per_hundred),
                    people_partially_vaccinated: Number(d.people_vaccinated_per_hundred) - Number(d.people_fully_vaccinated_per_hundred),
                    population: d.population,
                    continent: d.continent
                }
            })

            // console.log(filteredData)

            // Exclude data where the total rate is over 100%
            filteredData = filteredData.filter(d => {
                return (d.people_fully_vaccinated + d.people_partially_vaccinated) <= 100
            })

            // console.log(filteredData)

            // Get latest datum of each country
            filteredData = filteredData.sort((a, b) => b.date - a.date)
            var processedData = []
            var countryList = []
            for (var d of filteredData) {
                if (!countryList.includes(d.location)) {
                    processedData.push(d)
                    countryList.push(d.location)
                }
            }

            // Sort by total rate and slice Top 15 elements
            var finalData = processedData.sort((a, b) => (b.people_fully_vaccinated + b.people_partially_vaccinated) - (a.people_fully_vaccinated + a.people_partially_vaccinated)).slice(0, 15)
            // console.log(processedData)

            // draw the stacked bar chart
            this.data = processedData;
            this.original = finalData;
            this.currentContinentList = [...new Set(filteredData.map(item => item.continent))];
            // console.log(this.currentContinentList)
            this.drawBarChart(finalData, countryList);

        }
        catch (error) {
            console.error(error);
        };
    }

    drawBarChart(data) {

        // Map the data for stack
        const filteredData = data.map(d => {
            return {
                location: d.location,
                people_fully_vaccinated: d.people_fully_vaccinated,
                people_partially_vaccinated: d.people_partially_vaccinated
            }
        })
        // Get keys for stack
        const keys = ["people_fully_vaccinated", "people_partially_vaccinated"]

        // Get location list
        var locations = d3.map(data, function (d) { return (d.location) })
        // console.log(locations)


        const margin = { top: 5, right: 30, bottom: 50, left: 120 },
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // Define the position of the chart 
        const svg = d3.select("#barchart")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scale for x-axis
        const xScale = d3.scaleLinear().domain([0, 100]).range([0, width])

        // Scale for y-axis
        const yScale = d3.scaleBand().domain(locations).range([0, height]).padding(0.2)

        // Scale for color
        const cScale = d3.scaleOrdinal().domain(keys).range(["#7bccc4", "#2b8cbe"])

        //Stack data
        const stackedData = d3.stack().keys(keys)(filteredData)
        // console.log(stackedData)

        // Draw the bars
        var bar = svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
            .attr("fill", d => cScale(d))

        var bar_enter = bar.selectAll("rect") // 바 하나하나를 따로접근하기 위해 var로 저장
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function (d) { return d; })       // stackedData (stack레이아웃으로 위에서 이미 처리한 데이터라서 d.data를 해야 location 접근가능)
            .enter()

        bar_enter.append("rect")
            .attr("x", function (d) { return xScale(d[0]); })
            .attr("y", function (d, i) { return yScale(locations[i]); })
            .attr("width", function (d) { return xScale(d[1]) - xScale(d[0]); })
            .attr("height", yScale.bandwidth())
            .on("mouseover", bubble.enableHighlightBubble)
            .on("mouseout", bubble.disableHighlightBubble)
        // [Your Code Here]
        // Add click event for line chart
            .on("click", function(event, d) { 
                const location = d.data.location; // 그 bar의 데이터에 접근하는 방법
                line.manageLineChart(location);
                bubble.filterDataByLocation(location); 
            });


        // Draw the labels for bars
        bar_enter.append("text")
            .text(d => { return Math.round((d[1] - d[0])) + "%" })
            .attr("x", d => xScale(d[1] + (d[0] == 0 ? -5 : 1)))
            .attr("y", function (d, i) { return yScale(locations[i]) + yScale.bandwidth() * 0.55; })
            .attr("font-size", 10)
            .style("fill", '#000000');


        // Define the position of each axis
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Draw axes 
        svg.append("g")
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        svg.append("g")
            .attr('class', 'y-axis')
            .call(yAxis)

        // Indicate the x-axis label 
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .attr("font-size", 17)
            .text("Share of people (%)");

        // Draw Legend
        const legend = d3.select("#barlegend")
            .append("svg")
            .attr('width', width)
            .attr('height', 70)
            .append("g")
            .attr("transform", `translate(${margin.left},${0})`);

        legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
        legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")
        legend.append("text").attr("x", 18).attr("y", 18).text("The rate of fully vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
        legend.append("text").attr("x", 18).attr("y", 36).text("The rate of partially vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');

    }
    
    filterBarDataByContinent(continent) {

        // Check target continent is in the list
        const index = this.currentContinentList.indexOf(continent)
        // If it's in, delete it
        if (index > -1) {
            this.currentContinentList.splice(index, 1)
        }
        // If not, append it
        else {
            this.currentContinentList.push(continent)
        }

        var processedData = this.data.filter(d => {
            return this.currentContinentList.includes(d.continent)
        })

        // // Get latest datum of each country
        // var processedData = []
        // var countryList = []
        // for (var d of filteredData) {
        //     if (!countryList.includes(d.location)) {
        //         processedData.push(d)
        //         countryList.push(d.location)
        //     }
        // }

        // Sort by total rate and slice Top 15 elements
        processedData = processedData.sort((a, b) => (b.people_fully_vaccinated + b.people_partially_vaccinated) - (a.people_fully_vaccinated + a.people_partially_vaccinated)).slice(0, 15)
        // console.log(processedData)

        // Delete data first
        d3.select("#barchart").select("svg").remove();
        d3.select("#barlegend").select("svg").remove();

        // draw the stacked bar chart
        bar.drawBarChart(processedData);
    }

    filterBarDataBySelection(selectionList) {

        const selectedLocations = selectionList.map(d => d.location);
    
        var processedData = this.data.filter(d => selectedLocations.includes(d.location));
    
        processedData = processedData.sort((a, b) => (b.people_fully_vaccinated + b.people_partially_vaccinated) - (a.people_fully_vaccinated + a.people_partially_vaccinated)).slice(0, 15);
    
        d3.select("#barchart").select("svg").remove();
        d3.select("#barlegend").select("svg").remove();
    
        this.drawBarChart(processedData);
    }

    drawOriginal() {
        d3.select("#barchart").select("svg").remove();
        d3.select("#barlegend").select("svg").remove();
        this.drawBarChart(this.original);
    }
    
    


}
