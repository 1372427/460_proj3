let w = getWidth()-20;
let h = getHeight()-20;
let h1 = 20;
let h2 = getHeight() - 200;
let svg;
let floatingDiv;

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
    year:  d3.timeParse('%Y')(+d.YEAR), 
    state: d.STATE.toLowerCase()
}
}

const handleZoom = (e) => {
console.log(Math.log(d3.event.transform.k))
handleUpdate(Math.log(d3.event.transform.k))
}

const update1 = (d) => {
  floatingDiv.innerText = "1"
  }
  
  const update2 = (d) => {
  
    floatingDiv.innerText = "2"
  }
  
  const update3 = (d) => {
  
    floatingDiv.innerText = "3"
  }
  
  let update = {
    0: update1,
    1: update2,
    2:update3,
    3: update1
  }
  
const handleUpdate = (k) => {
  if(-k>4 || -k<0)return;
  console.log(parseInt(-k*7)%7)
  floatingDiv.style.top = `${(h2-h1)/7*(parseInt(-k*7)%7) + h1}px`;
  let index = parseInt(-k); //floors k 
  let color = {
    0: 'green',
    1: 'red',
    2: 'blue',
    3: 'orange'
  }
  svg.selectAll(".state").style('fill', color[index]);
  update[index]();
}

const createVisualization = (d) => {
    svg = d3.select("#main").append('svg')
    .attr('width', w)
    .attr('height', h);


    let zoom = d3.zoom().on('zoom', handleZoom)
    // 2. Define a map projection
    let projection = d3.geoAlbersUsa()
            .translate([w/2, h/2]) ;
            
    let projectionDefaultScale = projection.scale();

    // 3. Define a path generator using the projection
    let path = d3.geoPath()
    .projection(projection);
                    
    // 4. Create a color scale to use for the fill
    let color = d3.scaleQuantize()
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

    //Set input domain for color scale
    //let sValues = Array.from(stateValues.values()); // grab values from Map object and put into an array
    //color.domain(d3.extent(sValues));

    // 5. Draw the map using SVG path elements, styling with fill values
    // from our color scale

    let map = svg.append('g');

    //Bind data and create one path per GeoJSON feature
    map.selectAll(".state")
    .data(d.features)
    .enter()
    .append("path")
    .classed('state', true)
    .attr("d", path)
    .style('stroke', 'black')
    .style("fill", d => {
    //Get data value
    let value = d.properties.name;

    if (value) {
    //If value exists…
    return color(value);
    } else {
    //If value is undefined…
    return "#ccc";
    }
    });


    svg.call(zoom);
}


// load multiple json files and wait for all results using Promise.all()
// 
Promise.all([
    d3.json('us-states.json'),
    d3.csv('states_all_extended-csv.csv', rowConverter)
  ]).then((values) => {
    let [stateData, educationData] = values;

    educationData = d3.nest().key(d=>d.state).object(educationData);

    // Generate randomized state data for choropleth
    let states = stateData.features.map(d => { 
      return {
        state: d.properties.name, 
        value: educationData[d.properties.name.toLowerCase()]
      }
    });

    let stateValues = new Map(states.map(d => [d.state, d.value]));

    console.log(stateValues);
    floatingDiv= document.querySelector('#floatingBlock');
    floatingDiv.style.top = `${h -200}px`;

    createVisualization(stateData);

  }); 