let w = 800;
let h = 600;

const rowConverter = (d) => {
    return {
    year:  d3.timeParse('%Y')(+d.YEAR), 
    state: d.STATE.toLowerCase()
}
}


const createVisualization = (d) => {
    let svg = d3.select("#main").append('svg')
    .attr('width', w)
    .attr('height', h);

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
    map.selectAll("path")
    .data(d.features)
    .enter()
    .append("path")
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

    createVisualization(stateData);

  }); 