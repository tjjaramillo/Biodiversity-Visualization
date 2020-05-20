//setInterval(location.reload(),2000)
url = "data/samples.json"
//parameter that consideres plotting new charts or restyling already existing ones
var firstLoad = true;
var dataSource
// get data
d3.json(url).then(data => {
    dataSource = data

    //initial chart display
    var id = "940"
    populateMetadata(id, data.metadata)

    firstLoad = plotCharts(id, data, firstLoad)

    idList = data.names
    
    dropDownList(idList)
})

// Plot the bar chart
function plotCharts(id, inputData, load){
    samplesData = inputData.samples
    //return the data corresponding to the id
    var idData = []
    samplesData.forEach(row => {
        if (row.id === id) {
            row.otu_ids.forEach((otu_id, i) => {
                idData[i] = {otu_id : String(otu_id), otu_label: row.otu_labels[i], sample_value : row.sample_values[i]}
            })
        }
    })


    //sort by sample values
    idData.sort(function (firstEl, secondEl){
        return secondEl.sample_value - firstEl.sample_value
    })

    // //select just first 10 values
    // var dataToPlot = []
    // for (let i = 0; i < 10; i++) {
    //     dataToPlot[i] = idData[i]
    // }

    //select just first 10 values
    var dataToPlot = []
    let i = 0
    while (i < 10 && idData[i] != undefined) {
        dataToPlot[i] = idData[i]
        i+=1
    }
    // sort data to plot in descending order
    dataToPlot.sort(function (firstEl, secondEl){
        return firstEl.sample_value - secondEl.sample_value
    })
    // Plot Bar Chart
    if (load === true) {
        
        var trace1 = {
            x: dataToPlot.map(item => item.sample_value),
            y: dataToPlot.map(item => "OTU ".concat(item.otu_id)),
            text: dataToPlot.map(item => item.otu_label),
            type: "bar",
            orientation: 'h'
        };
        let dataBar = [trace1];
        let layoutBar = {
            //title: "'Bar' Chart",
            xaxis: { 
                title: "sample values",
            },
        };  

        Plotly.newPlot("bar", dataBar, layoutBar);
    }
    else {
        x = dataToPlot.map(item => item.sample_value);
        y = dataToPlot.map(item => "OTU ".concat(item.otu_id));
        Plotly.restyle("bar","x",[x]);
        Plotly.restyle("bar","y",[y]);
    }

    
    //plot bubble chart
    if (load === true) {
        var trace1 = {
            y: idData.map(item => item.sample_value),
            x: idData.map(item => item.otu_id),
            text: dataToPlot.map(item => item.otu_label),
            mode: 'markers',
            marker: {
            size: idData.map(item => item.sample_value),
            color: idData.map(item => item.otu_id)
            }
        };
        
        let dataBubble = [trace1];
        
        let layoutBubble = {
            //title: 'Marker Size',
            showlegend: false,
            xaxis: { 
                title: "OTU ID",
            },
        };
        Plotly.newPlot('bubble', dataBubble, layoutBubble);
    }
    else{
        x = idData.map(item => item.otu_id)
        y = idData.map(item => item.sample_value)
        Plotly.restyle("bubble","x",[x]);
        Plotly.restyle("bubble","y",[y]);
    }

    //Plot gauge (source: https://codepen.io/plotly/pen/rxeZME)
    //Get scrubs per week
    var bellyBtnFreq = 0
    inputData.metadata.forEach(row=>{
        if (row.id == id){bellyBtnFreq = row.wfreq}
    })

    // Display the level on the chart
    var level = bellyBtnFreq/9*180;

    // Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var dataGauge = [{ type: 'scatter',
    x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'frequency',
        text: bellyBtnFreq,
        hoverinfo: 'text+name'},
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
    rotation: 90,
    text: ['8-9', '7-8', '6-7', '5-6',
                '4-5', '3-4', '2-3', '1-2', '0-1',''],
    textinfo: 'text',
    textposition:'inside',	  
    marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
        'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
        'rgba(210, 206, 145, .5)', 'rgba(239, 226, 202, .5)',
        'rgba(241, 220, 190, .5)', 'rgba(245, 216, 180, .5)', 
        'rgba(249, 215, 170, .5)', 'rgba(255, 255, 255, 0)']},
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
    }];

    var layoutGauge = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
            color: '850000'
        }
        }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    height: 500,
    width: 500,
    xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', dataGauge, layoutGauge, {showSendToCloud:true});

    return false
}

//populate dropdown list
function dropDownList(list) {
    var selection = d3.select("#selDataset")
        .selectAll("option")
        .data(list)
    selection.enter()       
        .append("option")
        .text(function(d) {
            return d;
        });
  }

function populateMetadata(id, metadata){
    
    idMetadata = {}
    metadata.forEach(row =>{
        if(row.id == id){
            Object.keys(row).forEach(key => {
                idMetadata[key] = row[key]
            })
        }
    })

    var selection = d3.select("#sample-metadata")
        .selectAll("div")
        .data(Object.entries(idMetadata))
    selection.enter()       
        .append("div")
        .merge(selection)
        .text(function(d) {
            return `${d[0]}: ${d[1]}`;
        });
    selection.exit().remove();
}


//Ai ramas aici
//return value from dropdown
d3.select("#selDataset").on("change", function(){
    populateMetadata(this.value, dataSource.metadata)
    plotCharts(this.value, dataSource, firstLoad)
})