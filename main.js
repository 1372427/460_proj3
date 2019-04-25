let w = getWidth()-20;
let h = getHeight()-20;
let h1 = 0;
let h2 = getHeight();
let svg, map, projection, path;
let stateValues;
let floatingDiv, floatingDiv2;
let running =false, chartType, timer, button, year;
let clearAnimator;
let color, color2, colorScaleType=0;
let educationData;
let legendScale, legend;
let stateCentroids;
let currTooltipState, tooltipData;
let inflation = {
  1993: 1,
  1994: 1.03,
  1995: 1.05,
  1996: 1.09,
  1997: 1.11,
  1998: 1.13,
  1999: 1.15,
  2000: 1.19,
  2001: 1.22,
  2002: 1.24,
  2003: 1.27,
  2004: 1.31,
  2005: 1.35,
  2006: 1.40,
  2007: 1.43,
  2008: 1.49,
  2009: 1.48,
  2010: 1.51,
  2011: 1.56,
  2012: 1.59,
  2013: 1.61,
  2014: 1.64,
  2015: 1.64
};
let colorRange = ["rgb(237,248,233)","rgb(199,233,192)","rgb(161,217,155)","rgb(116,196,118)","rgb(65,171,93)", "rgb(35,139,69)", "rgb(0,90,50)"];
let chartTypeVar = {
  1: "enroll",
  2: "revenue",
  3: "expend",
  4: "revenue_enroll",
  5: "expenditure_revenue"
}

document.querySelector("#animWrap").style.left = `${getWidth()/2-150}px`
console.log(getWidth());
console.log(getHeight())
//getWidth and getHeight from https://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function getHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}


const rowConverter = (d) => {
    return {
    year:  parseInt(+d.YEAR), 
    state: d.STATE.toLowerCase().replace(/_/g, ' '),
    enroll: parseInt(d.ENROLL),
    revenue: parseFloat(d.TOTAL_REVENUE)/inflation[d.YEAR],
    expend: parseFloat(d.TOTAL_EXPENDITURE)/inflation[d.YEAR],
    grade_all: parseInt(d.GRADES_ALL_G),
    revenue_enroll : parseFloat(d.TOTAL_REVENUE)/parseFloat(d.ENROLL)/inflation[d.YEAR],
    expenditure_revenue: (parseFloat(d.TOTAL_EXPENDITURE)-parseFloat(d.TOTAL_REVENUE))/inflation[d.YEAR]
}
}

const handleZoom = (e) => {
//console.log(Math.log(d3.event.transform.k))
handleUpdate(Math.log(d3.event.transform.k))
}

const updateColorScale = (variable) => {
  let min=1000000000,max=0;
  for(let key1 in educationData){
    for(let key in educationData[key1]){
      let entry = educationData[key1][key][0][variable];
      if(entry>max)max=entry;
      if(entry<min)min=entry;
    }

  }
  let min2 = 100000000; max2 =0;
  for(let key in educationData[year]){
    let entry = educationData[year][key][0][variable];
    if(entry>max2)max2=entry;
    if(entry<min2)min2=entry;
  }
  color.domain([min, max])
  legendScale.domain([colorScaleType==0?min:min2, colorScaleType==0?max:max2])
  color2.domain([min2, max2]);

  let colors = {
    0: color,
    1: color2
  }

   //Bind data and create one path per GeoJSON feature
   map.selectAll(".state")
   .style("fill", d => {
      //If value is undefined…
      return colors[colorScaleType](educationData[year][d.properties.name.toLowerCase()][0][variable]);
   });

   svg.select(".legendQuant")
   .call(legend);
}

const update1 = (d) => {
  if(chartType==1 && !running)return;
  chartType=1;
  let variable = "enroll";

  floatingDiv.innerText = variable;
  floatingDiv.classList.remove('hidden')
  floatingDiv2.classList.add('hidden')

  updateColorScale(variable)
  }
  
  const update2 = (d) => {
    if(chartType==2 && !running)return;
    chartType=2;
    let variable = "revenue";
  
    floatingDiv2.innerText = variable;
    floatingDiv2.classList.remove('hidden')
    floatingDiv.classList.add('hidden')

    updateColorScale(variable)
  }
  
  const update3 = (d) => {
    if(chartType==3 && !running)return;
    chartType=3;
    let variable = "expend";

    floatingDiv.innerText = variable;
    floatingDiv.classList.remove('hidden')
    floatingDiv2.classList.add('hidden')
    
  updateColorScale(variable)
  }
  
const update4 = (d) => {
  if(chartType==4 && !running)return;
  chartType=4;
  let variable = "revenue_enroll"

  floatingDiv2.innerText= variable;
  floatingDiv2.classList.remove('hidden')
  floatingDiv.classList.add('hidden')
  updateColorScale(variable)
}

const update5 = (d) => {
  if(chartType==5 && !running)return;
  chartType=5;
  let variable = "expenditure_revenue"

  floatingDiv.innerText= variable;
  floatingDiv.classList.remove('hidden')
  floatingDiv2.classList.add('hidden')
  updateColorScale(variable)
}

  let update = {
    0: update1,
    1: update2,
    2:update3,
    3: update4,
    4: update5,
  }
  
const handleUpdate = (k) => {
  if(!k){
   update[chartType-1]();
   return updateTooltip();
  }
  if(-k>Object.keys(update).length || -k<0.2)return;
  floatingDiv.style.top = `${h2-(h2)/5*(parseInt(-k*7)%7)}px`;
  floatingDiv2.style.top = `${h2-(h2)/5*(parseInt(-k*7)%7)}px`;
  let index = parseInt(-k); //floors k 
  if(chartType-1 !== index){
    clearAnimator();
    update[index](); 
  }

  updateTooltip();
}

function updateTooltip(d) {
  let tooltip = document.querySelector("#tooltip");
  if(tooltip.classList.contains("hidden"))return;

  let name = currTooltipState;
  if(d){
    name = d.properties.name;
  }
  let data = educationData[year][name.toLowerCase()][0];
  let svgData = tooltipData[name.toLowerCase()];
  let toolH = 200;
  let toolW = 400;
  let toolP = 20;

  tooltip.querySelector('div').innerHTML = `
  State: ${name}<br/>
  Year: ${year}<br/>
  Students Enrolled: ${data.enroll}<br/>
  Revenue: ${data.revenue}<br/>
  Expenditure: ${data.expend}<br/>
  `

  d3.selectAll('#svg > *').remove();

  let toolXScale = d3.scaleLinear()
      .domain([0, Object.keys(inflation).length])
      .range([3*toolP, toolW-2*toolP]);
  let toolYScale = d3.scaleLinear()
      .domain(d3.extent(svgData.map(d=> d[chartTypeVar[chartType]])))
      .range([toolH-2*toolP, toolP]);

  let tooltipSvg = d3.select('#svg')
      .append('svg')
      .attr('height', toolH)
      .attr('width', toolW);

  let line = d3.line()
      .x((d,i) => toolXScale(i))
      .y(d => toolYScale(d[chartTypeVar[chartType]]));

  let xAxis = d3
      .axisBottom(toolXScale)
      .tickFormat((d) => 1993+ d);

  tooltipSvg
      .append("g")
      .attr("transform", `translate(0, ${toolH - 2*toolP})`)
      .call(xAxis);
  
  let yAxis = d3.axisLeft(toolYScale)
      .ticks(8)
      .tickFormat(d3.format(".2s"));
  tooltipSvg
      .append("g")
      .attr("transform", `translate(${3*toolP}, 0)`)
      .call(yAxis);

  tooltipSvg.append('path')
      .datum(svgData)
      .attr('class', 'line')
      .attr('d', line)
      .style('stroke', 'green')
      .style('stroke-width', '2px')
      .style("fill", 'none')

  tooltipSvg.append('text')
      .classed('axis-label', true)
      .attr('transform', 'rotate(-90)')
      .attr('x', -toolH/2)
      .attr('y', toolP)
      .attr('text-anchor', 'middle')
      .text(chartTypeVar[chartType])
    
  tooltipSvg.append('text')
      .classed('axis-label', true)
      .attr('x', toolW/2)
      .attr('y', toolH-toolP/2)
      .attr('text-anchor', 'middle')
      .text('Year')


  currTooltipState = name;
}

function handleMouseOver (d, i) {

  map.selectAll(".state")
  .style("stroke-width", "1px")
  //d3.select(this).style("fill", "black")
  let tooltip = document.querySelector("#tooltip");
  tooltip.classList.remove("hidden");
  tooltip.style.top = `${d3.event.y}px`
  tooltip.style.left = `${d3.event.x}px`;
  updateTooltip(d);
  d3.select(this).style("stroke-width", "2px");
  d3.event.preventDefault();
  return false;
}

function handleMouseOut (d, i) {

  let tooltip = document.querySelector("#tooltip");
  tooltip.classList.add("hidden");
  d3.select(this).style("stroke-width", "1px")
}


const createVisualization = (d) => {
  chartType=0;
    svg = d3.select("#main").append('svg')
    .attr('width', w)
    .attr('height', h);

  let height = getHeight();
  let width = getWidth();
  let mapScale = height*2;
  if(width/height<2) mapScale = width;

    let zoom = d3.zoom().on('zoom', handleZoom)
    // 2. Define a map projection
     projection = d3.geoAlbersUsa()
            .translate([w/2, h/2])
            .scale(mapScale) ;
            
    let projectionDefaultScale = projection.scale();

    // 3. Define a path generator using the projection
    path = d3.geoPath()
    .projection(projection);
                    
    // 4. Create a color scale to use for the fill
   // color = d3.scaleLinear()
   // .range(["rgb(237,248,233)","rgb(0,109,44)"]);

   color = d3.scaleQuantize()
   .range(colorRange);

    color2 = d3.scaleQuantize()
    .range(colorRange);

    // 5. Draw the map using SVG path elements
    map = svg.append('g');

    //Bind data and create one path per GeoJSON feature
    map.selectAll(".state")
    .data(d.features)
    .enter()
    .append("path")
    .classed('state', true)
    .attr("id", (d) => d.properties.name)
    .attr("d", path)
    .style('stroke', 'black')
    .on("click", handleMouseOver);


    // LEGEND - built using Susie Lu's d3.svg.legend package
    legendScale = d3.scaleQuantize()
    .range(colorRange);

    svg.append("g")
    .attr("class", "legendQuant")
    .attr("transform", `translate(${w-250}, ${h-300})`);

    // see https://github.com/d3/d3-shape#symbols for information about d3 symbol shapes
    legend = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolSquare).size(60)())
    .shapePadding(10)
    .scale(legendScale);

    svg.select(".legendQuant")
    .call(legend);
    
    document.body.addEventListener("click", function(e){
      if(e.target!==document.querySelector("svg"))return false;
      map.selectAll(".state")
      .style("stroke-width", "1px")
      let tooltip = document.querySelector("#tooltip");
      tooltip.classList.add("hidden");
    })

    svg.call(zoom);

    handleUpdate(-0.2);
  }


// load multiple json files and wait for all results using Promise.all()
// 
Promise.all([
    d3.json('us-states.json'),
    d3.csv('states_all_extended-csv.csv', rowConverter)
  ]).then((values) => {
    let [stateData, eData] = values;
    educationData = eData;
    educationData = d3.nest().key(d=>d.year).key(d=>d.state).object(educationData);
    tooltipData = d3.nest().key(d=>d.state).object(eData)
    console.log(educationData)
    // Generate randomized state data for choropleth
    
    let centroids = stateData.features.map(d3.geoCentroid);
    
    stateCentroids = stateData.features.map((d,i) => { 
      return {
        id: d.properties.name, 
        value: d3.geoCentroid(d)
      }
    });

    //https://medium.com/dailyjs/rewriting-javascript-converting-an-array-of-objects-to-an-object-ec579cafbfc7
    const arrayToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item.id] = item.value
     return obj
   }, {})

   stateCentroids = arrayToObject(stateCentroids);

    floatingDiv= document.querySelector('#floatingBlock');
    floatingDiv.style.top = `${h -200}px`;
    floatingDiv2= document.querySelector('#floatingBlock2');
    floatingDiv2.style.top = `${h -200}px`;

    document.querySelector("#legendUpdate").addEventListener("change", (e) => {
      console.log(e)
      let prevRun = running;
      if(e.target.checked){
        colorScaleType = 1;
      }else{
        colorScaleType =0;
      }
      running=true;
      handleUpdate();
      running = prevRun;
    })


    //animation for a slider from http://bl.ocks.org/darrenjaworski/5544599
    button = document.querySelector("button");
    let slider = document.querySelector("#slider")
    button.addEventListener("click", () => {
      let duration = 2000;
      let max = 2015;
      let min = 1993;

      if(running){
        button.innerHTML = "Play";
        running = false;
        clearInterval(timer);
      }else{
        button.innerHTML = "Pause";
        year = slider.value;
        timer = setInterval(() => {
          if(year <max){
            year++;
          }else{
            button.innerHTML = "Play";
            year = min;
            handleUpdate();
            running = false;
            clearInterval(timer);
          }
          document.querySelector("#range").innerHTML = year;
          slider.value = year;
          handleUpdate();

        }, duration);
        running= true;
      }
    })

    slider.addEventListener("change", () =>{
      year = slider.value;
      running=true;
      handleUpdate();
      document.querySelector("#range").innerHTML = slider.value;
      running=false;
      button.innerHTML="Play"
      clearInterval(timer);
    })

    clearAnimator = () => {
      
      button.innerHTML = "Play";
      running = false;
      year = 1993;
      clearInterval(timer);
      document.querySelector("#range").innerHTML = year;
      slider.value = year;
    }

console.log(stateData)

    createVisualization(stateData);

  }); 