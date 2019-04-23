let w = getWidth()-20;
let h = getHeight()-20;
let h1 = 0;
let h2 = getHeight();
let svg, map;
let stateValues;
let floatingDiv, floatingDiv2;
let running =false, chartType, timer, button, year;
let clearAnimator;
let color;
let educationData;
let legendScale, legend;

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
    revenue: parseFloat(d.TOTAL_REVENUE),
    expend: parseFloat(d.TOTAL_EXPENDITURE),
    grade_all: parseInt(d.GRADES_ALL_G),
    revenue_enroll : parseFloat(d.TOTAL_REVENUE)/parseFloat(d.ENROLL),
    expenditure_revenue: parseFloat(d.TOTAL_EXPENDITURE)-parseFloat(d.TOTAL_REVENUE)
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
  color.domain([min, max])
  legendScale.domain([min, max])

   //Bind data and create one path per GeoJSON feature
   map.selectAll(".state")
   .style('stroke', 'black')
   .style("fill", d => {
      //If value is undefined…
      return color(educationData[year][d.properties.name.toLowerCase()][0][variable]);
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
  if(!k)return update[chartType-1]();
  if(-k>Object.keys(update).length || -k<0.2)return;
  floatingDiv.style.top = `${h2-(h2)/5*(parseInt(-k*7)%7)}px`;
  floatingDiv2.style.top = `${h2-(h2)/5*(parseInt(-k*7)%7)}px`;
  let index = parseInt(-k); //floors k 
  if(chartType-1 !== index){
    clearAnimator();
    update[index](); 
  }
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
    let projection = d3.geoAlbersUsa()
            .translate([w/2, h/2])
            .scale(mapScale) ;
            
    let projectionDefaultScale = projection.scale();

    // 3. Define a path generator using the projection
    let path = d3.geoPath()
    .projection(projection);
                    
    // 4. Create a color scale to use for the fill
    color = d3.scaleQuantize()
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

    // 5. Draw the map using SVG path elements
    map = svg.append('g');

    //Bind data and create one path per GeoJSON feature
    map.selectAll(".state")
    .data(d.features)
    .enter()
    .append("path")
    .classed('state', true)
    .attr("d", path)
    .style('stroke', 'black');


    // LEGEND - built using Susie Lu's d3.svg.legend package
    legendScale = d3.scaleQuantize()
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

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
    console.log(educationData)
    // Generate randomized state data for choropleth
    let states = stateData.features.map(d => { 
      return {
        state: d.properties.name, 
        value: educationData[d.properties.name.toLowerCase()]
      }
    });

    stateValues = new Map(states.map(d => [d.state, d.value]));

    console.log(stateData);
    floatingDiv= document.querySelector('#floatingBlock');
    floatingDiv.style.top = `${h -200}px`;
    floatingDiv2= document.querySelector('#floatingBlock2');
    floatingDiv2.style.top = `${h -200}px`;


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
            running = false;
            year = min;
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
    createVisualization(stateData);

  }); 