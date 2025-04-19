console.log("hello world!") // You can see this in the browser console if you run the server correctly
// Don't edit skeleton code!!


d3.csv('data/owid-covid-data.csv')
    .then(data => {

        /*
        -------------------------------------------
        YOUR CODE STARTS HERE

        TASK 1 - Data Processing 

        TO-DO-LIST
        1. Exclude data which contain missing values on columns you need
        2. Exclude data all data except the data where the continent is Asia 
        3. Calculate the rate of fully vaccinated people, partially vaccinated people, and total rate of vaccinated people
        4. Exclude data where total rate of vaccinated people is over 100%
        5. Exclude all data except the latest data for each country
        6. Sort the data with descending order by total reat of vaccinated people
        7. Extract Top 15 countries 
        -------------------------------------------
        */
        const parseDate = d3.timeParse("%Y-%m-%d");

        let filteredData = data.map(d => ({code: d["iso_code"],
                                           continent: d["continent"],
                                           location: d["location"],
                                           date: parseDate(d["date"]),
                                           population: +d["population"],
                                           full: +d["people_fully_vaccinated"],
                                           vacc: +d["people_vaccinated"]}));

        // 1. Exclude data which contain missing values on columns you need
        filteredData = filteredData.filter(d => d.continent && d.location && d.date && d.population && d.full && d.vacc);

        // 2. Exclude data all data except the data where the continent is Asia
        filteredData = filteredData.filter(d => d.continent === "Asia");

        // 3. Calculate the rate of fully vaccinated people, partially vaccinated people, and total rate of vaccinated people
        filteredData = filteredData.map(d => ({
            code : d.code,
            continent : d.continent,
            location : d.location,
            date : d.date,
            fullrate : (d.full/d.population) * 100,
            partrate : ((d.vacc - d.full)/d.population) * 100,
            totrate : (d.vacc/d.population) * 100
        }));

        // 4. Exclude data where total rate of vaccinated people is over 100%
        filteredData = filteredData.filter(d => d.totrate < 100);

        // 5. Exclude all data except the latest data for each country
        filteredData = Array.from(
            d3.group(filteredData, d => d.code), // code기준 그룹화. code(key) : [{배열들}, {배열들}, ...](value) 이런식임.
            ([code, values]) => {
                const latest = d3.max(values, d => d.date); // 날짜 기준으로 최대값
                const obj = values.find(d => d.date === latest); // 해당 날짜에 맞는 값 찾기
                return obj;
            }
          );

        // 6. Sort the data with descending order by total rate of vaccinated people
        filteredData = d3.sort(filteredData, d => d.totrate).reverse();

        // 7. Extract Top 15 countries
        const processedData = filteredData.slice(0, 15).reverse();

        console.log(processedData);

        /*
        -------------------------------------------
        YOUR CODE ENDS HERE
        -------------------------------------------
        */

        drawBarChart(processedData);

    })
    .catch(error => {
        console.error(error);
    });

function drawBarChart(data) {

    // Define the screen
    const margin = { top: 5, right: 30, bottom: 50, left: 120 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    /*
    -------------------------------------------
    YOUR CODE STARTS HERE

    TASK 2 - Data processing 

    TO-DO-LIST
    1. Create a scale named xScale for x-axis
    2. Create a scale named yScale for x-axis
    3. Define a scale named cScale for color
    4. Process the data for a stacked bar chart 
    5. Draw Stacked bars
    6. Draw the labels for bars
    -------------------------------------------
    */

    // 1. Create a scale for x-axis
    const xScale = d3.scaleLinear().range([0, width])
                                 .domain([0, 100]);

    // 2. Create a scale for y-axis
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1)
                                .domain(data.map(d => d.location));

    // 3. Define a scale for color
    const cScale = d3.scaleOrdinal()
        .domain(["fullrate", "partrate"])
        .range(["#7bccc4", "#2b8cbe"]);

    // 4. Process the data for a stacked bar chart
    // * Hint - Try to utilze d3.stack()
    const stack = d3.stack().keys(["fullrate", "partrate"]);
    const stackedData = stack(data);

    // 5.  Draw Stacked bars
    const layer = svg.selectAll("g")
                .data(stackedData)
                .join("g")
                .attr("fill", d => cScale(d.key));
    
    layer.selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d.data.location))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d[1]) - xScale(d[0]))

    // 6. Draw the labels for bars
    layer.append("text")
        .data(data)
        .join("text")
        .text(d => d3.format(".0f")(d.fullrate) + "%")
        .attr("x", d => xScale(d.fullrate) - 22)
        .attr("y", d => yScale(d.location) + yScale.bandwidth() / 2)
        .attr("fill", "black")
        .attr("font-size", "10px")

    layer.append("text")
        .data(data)
        .join("text")
        .text(d => d3.format(".0f")(d.partrate) + "%")
        .attr("x", d => xScale(d.totrate) + 5)
        .attr("y", d => yScale(d.location) + yScale.bandwidth() / 2)
        .attr("fill", "black")
        .attr("font-size", "10px")


    /*
    -------------------------------------------
    YOUR CODE ENDS HERE
    -------------------------------------------
    */

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
    const legend = d3.select("#legend")
        .append("svg")
        .attr('width', width)
        .attr('height', 70)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")
    legend.append("text").attr("x", 18).attr("y", 18).text("The rate of fully vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
    legend.append("text").attr("x", 18).attr("y", 36).text("The rate of partially vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');

}
