// Draw Kirby here!

const svg = d3.select("body")
                .append("svg")
                .attr("width",700)
                .attr("height",700)
                .style("border","1px solid black")

var arm1 = svg.append("ellipse")
    .attr("cx",180)
    .attr("cy",250)
    .attr("rx",80)
    .attr("ry",130)
    .attr("fill","pink")
    .attr("stroke","black")
    .attr("stroke-width",7)
    .attr("transform", "rotate(-20,180,250)")

var arm2 = svg.append("ellipse")
    .attr("cx",520)
    .attr("cy",400)
    .attr("rx",130)
    .attr("ry",80)
    .attr("fill","pink")
    .attr("stroke","black")
    .attr("stroke-width",7)
    .attr("transform","rotate(50, 520, 400)")

var foot1 = svg.append("ellipse")
    .attr("class", "foot-shape")
    .attr("cx",410)
    .attr("cy",535)
    .attr("rx",110)
    .attr("ry",60)
    .attr("transform","rotate(25, 450, 550)")

var foot2 = svg.append("ellipse")
.attr("class", "foot-shape")
    .attr("cx",290)
    .attr("cy",525)
    .attr("rx",110)
    .attr("ry",60)
    .attr("transform","rotate(-25, 290, 540)")


var center = svg.append("circle")
    .attr("cx", 350)
    .attr("cy", 350)
    .attr("r", 200)
    .attr("fill", "pink")
    .attr("stroke", "black")
    .attr("stroke-width", 7)

var eye1 = svg.append("ellipse")
                .attr("cx", 300)
                .attr("cy", 300)    
                .attr("rx",10)
                .attr("ry",40)
            
          svg.append("ellipse")
            .attr("cx", 300)
            .attr("cy", 290)    
            .attr("rx",6)
            .attr("ry",16)
            .attr("fill", "white")

var eye2 = svg.append("ellipse")
                .attr("cx", 400)
                .attr("cy", 300)    
                .attr("rx",10)
                .attr("ry",40)

                svg.append("ellipse")
                .attr("cx", 400)
                .attr("cy", 290)    
                .attr("rx",6)
                .attr("ry",16)
                .attr("fill", "white")

var mouth = svg.append("path")
.attr("d", "M330,370 L370,370 L350,400 Z")
.attr("fill", "red")
.attr("stroke", "black")
.attr("stroke-width", 5)

d3.xml("starrod.svg").then(function(data) {
    const group = svg.append("g")
                    .attr("transform", "translate(200, -100) scale(0.5) rotate(45)")
    group.node().appendChild(data.documentElement);
    // group (D3 객체)를 DOM 객체로 변환 .node() 후 data documnet (외부 .svg파일) 추가하기 
  });
  