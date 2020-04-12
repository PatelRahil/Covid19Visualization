import React from 'react';
import logo from './logo.svg';
import './App.css';
import Page from './Figures/states.html';
import Plot from 'react-plotly.js';
import parse from 'html-react-parser'
import countries_json from './Figures/countries.json'
import states_json from './Figures/states.json'
import counties_json from './Figures/counties.json'
/*
let JsonReader = require('big-json-reader')
let reader = new JsonReader(require.resolve('./Figures/counties.json'));
reader.read(json => {
  console.log(json)
}, totalObjects => {
  console.log("totalObjects", totalObjects);
  reader.printUsage();
})
*/

// console.log('Counties:', counties_json)
// function fetchJSONFile(path, callback) {
//     var httpRequest = new XMLHttpRequest();
//     httpRequest.onreadystatechange = function() {
//         if (httpRequest.readyState === 4) {
//             if (httpRequest.status === 200) {
//               console.log('TEST:', httpRequest.responseText)
//                 var data = JSON.parse(httpRequest.responseText);
//                 if (callback) callback(data);
//             }
//         }
//     };
//     httpRequest.open('GET', path);
//     httpRequest.send(); 
// }

// this requests the file and executes a callback with the parsed result once
//   it is available
// fetchJSONFile('counties.json', function(data){
//     // do something with your data
//     console.log('DATA:')
//     console.log(data);
// });


function App() {
  return (
    <div className="App">
      { renderMap(countries_json) }
      { renderMap(states_json) }
      { renderMap(counties_json) }
    </div>
  );
}
function renderHTML() {
  console.log('Rendering HTML:')
  console.log(Page.substring(Page.length - 7))
  console.log(Page.substring(0, 6))
  // return Page
  return Page.substring(7, Page.length - 8)
}
function renderMap(json) {
  console.log(json)
  console.log(json.data)
  // var figure = JSON.parse(json)
  //var plot = Plotly.newPlot('graph-div', figure.data, figure.layout);
  return (
      <Plot
        data={json.data}
        layout={json.layout}
        frames={json.frames}
      />
    )
}
export default App;