let w = getWidth()-20;
let h = getHeight()-20;
let h1 = 0;
let h2 = getHeight();
let svg, map, projection, path;
let stateValues;
let floatingDiv, floatingDiv2;
let running =false, chartType, timer, button, year, duration=2000;
let clearAnimator;
let color, color2, colorScaleType=0, diverging, diverging2;
let educationData;
let legendScale, legend, legendDomain;
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
let divergingRange = ["rgb(178,24,43)", "rgb(239,138,98)","rgb(253,219,199)","rgb(247,247,247)","rgb(209,229,240)","rgb(103,169,207)", "rgb(33,102,172)"];
let chartTypeVar = {
  1: "enroll",
  2: "revenue",
  4: "expend",
  3: "revenue_enroll",
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

  let scaleIndex = colorScaleType;
  if(chartTypeVar[chartType] === "expenditure_revenue")scaleIndex = colorScaleType==0? 2:3;
  let domainMin =scaleIndex%2==0?min:min2;
  let domainMax = scaleIndex%2==0?max:max2;
  if(scaleIndex>=2){
    domainMin =Math.abs(domainMin)>domainMax? domainMin: -domainMax;
    domainMax = Math.abs(domainMin)>domainMax? Math.abs(domainMin): domainMax;
  }
  legendScale.domain([domainMin, domainMax])
  legendScale.range(scaleIndex<2?colorRange: divergingRange)
  color.domain([min, max])
  color2.domain([min2, max2]);
  diverging.domain([min, max])
  diverging2.domain([min2, max2]);

  let colors = {
    0: color,
    1: color2,
    2: diverging,
    3: diverging2
  }

   //Bind data and create one path per GeoJSON feature
   map.selectAll(".state")
   .style("fill", d => {
      //If value is undefined…
      return colors[scaleIndex](educationData[year][d.properties.name.toLowerCase()][0][variable]);
   });

   legendDomain = [];
   for(let i=0; i< 7; i++){
     legendDomain.push(i*domainMax/7);
   }

   svg.select(".legendQuant")
   .call(legend);
}

const update1 = (d) => {
  if(chartType==1 && !running)return;
  chartType=1;
  let variable = "enroll";

  floatingDiv.innerHTML = `<h2>Enrollment</h2>The 1990s saw a rapid increase in the number of enrolled students in grades K-12. In general, the trend of enrollment increasing continued
    thoughout the years, but at a slower rate. Some states, particularly in the Northeastern, saw a small decrease in enrollment. California, Texas, and New York had the 
    highest enrollment in general, but as these states have a larger overall population, this is to be expected.`;
  floatingDiv.classList.remove('hidden')
  floatingDiv2.classList.add('hidden')

  updateColorScale(variable)
  }
  
  const update2 = (d) => {
    if(chartType==2 && !running)return;
    chartType=2;
    let variable = "revenue";
  
    floatingDiv2.innerHTML = `<h2>Total Revenue</h2>Along with enrollment, the total revenue recieved by schools generally increased over the years. Mosts states suffered a small cutback
    in funding around the year 2013 after a peak in the late 2000s, but quickly recovered in the following years. Yet again, the leaders are California, Texas, and New York. However, this graph does not take 
    into account the number of students enrolled.`;
    floatingDiv2.classList.remove('hidden')
    floatingDiv.classList.add('hidden')

    updateColorScale(variable)
  }
  
  const update3 = (d) => {
    if(chartType==3 && !running)return;
    chartType=3;
    let variable = "revenue_enroll";

    floatingDiv.innerHTML = `<h2>Revenue per Student</h2>Here we see the revenue in relation to the number of students enrolled. This tells a different story than the previous graph.
    While New York and other states in the Northeast are on the upper scale of revenue recieved per student, California and Texas are on the lower scale. Other trends stay the same. 
    Schools gained more revenue per student in later years than earlier. The exception to this is during the years in the early 2010s where most states recieved less revenue per student
    (aside from Alaska).`;
    floatingDiv.classList.remove('hidden')
    floatingDiv2.classList.add('hidden')
    
  updateColorScale(variable)
  }
  
const update4 = (d) => {
  if(chartType==4 && !running)return;
  chartType=4;
  let variable = "expend"

  floatingDiv2.innerHTML= `<h2>Total Expenditure</h2>Continuing from money gained to money lost, this graph shows the total expenditure of schools. Compared to the definite increase 
  in enrollment and revenue over time, the trend here is not as clear. Generally, expendiutre also increased over time, but much more gradually, and with more fluctuation. Similar 
  to what was seen with revenue, there was a peak in expenditure in the late 2000s (2009-2010), followed by a decrease in expenditure around 2013. `;
  floatingDiv2.classList.remove('hidden')
  floatingDiv.classList.add('hidden')
  updateColorScale(variable)
}

const update5 = (d) => {
  if(chartType==5 && !running)return;
  chartType=5;
  let variable = "expenditure_revenue"
  floatingDiv.innerHTML= `<h2>Net Profit/Loss</h2>We've seen the revenue and the expenditure of schools. Now it is time to compare the two. Here, the revenue is subtracted from the revenue.
  Most years, schools spend slightly more than they recieve. No state shows a continued strong trend to over or under spend over a long period of time, with most states which experience major 
  net loss only suffering for a year. States which experienced major losses include California, Texas, Ohio, Indiana, and North Carolina. Similarly, no state experiences several long periods of 
  net profit. California, Texas, and New York all had profitable years, with New York being the one state with a consistently positive net. `;
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
  let leftBound = 0;
  let rightBound = w -600;
  let topBound=0;
  let bottomBound = h -400;
  let top = d3.event.y > bottomBound? bottomBound : d3.event.y;

  tooltip.style.top = `${Math.min(bottomBound, d3.event.y)}px`
  tooltip.style.left = `${Math.min(rightBound, d3.event.x)}px`;
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
  let mapScale = height+500;
  if(1.0*width/height<2.5) mapScale = width;

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

    diverging = d3.scaleQuantize()
    .range(divergingRange);

    diverging2 = d3.scaleQuantize()
    .range(divergingRange);
    
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
    .attr("transform", `translate(${w/2}, ${h-150})`);

    // see https://github.com/d3/d3-shape#symbols for information about d3 symbol shapes
    legend = d3.legendColor()
    .labelFormat(d3.format(".2f"))
    .labels(({i, genLength, generatedLabels, labelDelimiter})=> {
      console.log(generatedLabels)
      if (i === 0) {
        const values = generatedLabels[i].split(` ${labelDelimiter} `)
        return `${values[0]}`
      } else if (i === genLength - 1) {
        const values = generatedLabels[i].split(` ${labelDelimiter} `)
        return `${values[1]}`
      }
      return ""
    })
    //if want to continue work on legend
    .on("cellover", function(d){
      let index = colorRange.indexOf(d);
      if(index<0) index = divergingRange.indexOf(d);
      //console.log(legendDomain[index])
    })
    .shapeWidth(30)
    .orient('horizontal')
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


  let playAnimation = () => {
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


    document.querySelector("#faster").addEventListener("click", () => {
      duration= duration>200? duration-200 : 200
      clearAnimator();
      playAnimation();
    });
    document.querySelector("#slower").addEventListener("click", () => {
      duration= duration<3000? duration+200 : 3000
      clearAnimator();
      playAnimation();
    });

    //animation for a slider from http://bl.ocks.org/darrenjaworski/5544599
    button = document.querySelector("button");
    let slider = document.querySelector("#slider")
    button.addEventListener("click", playAnimation)

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

    document.querySelector("#intro").addEventListener("click", (e) => document.querySelector("#intro").classList.add("hidden"))

    createVisualization(stateData);

  }); 