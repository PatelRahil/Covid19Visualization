import React from 'react';
import logo from './logo.svg';
import './App.css';
import Plot from 'react-plotly.js';
import parse from 'html-react-parser'
import countries_json from './Figures/countries.json'
import states_json from './Figures/states.json'
//import counties_json from './Figures/counties.json'
import Papa from 'papaparse'
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
      <Map/>
    </div>
  );
}
const scopes = {
  COUNTIES: 'counties',
  STATES: 'states',
  GLOBAL: 'global'
}
class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {scope: scopes.GLOBAL, state_data: {}, global_data: {}, county_data: {}, county_geojson: {}}
    this.load_data = this.load_data.bind(this)
    this.testRender = this.testRender.bind(this)
  }
  componentDidMount() {
    this.load_data()
  }
  render() {
    return(
      <div>
        <button onClick={() => {
          console.log('States clicked')
          this.setState({scope: scopes.STATES})
        }}>
          US States
        </button>
        <button onClick={() => {
          console.log('Global clicked')
          this.setState({scope: scopes.GLOBAL})
        }}>
          World
        </button>
        <button onClick={() => {
          console.log('Global clicked')
          this.setState({scope: scopes.COUNTIES})
        }}>
          US Counties
        </button>
        { this.testRender() }
      </div>
    );
  }

  testRender() {
    var originalData = null
    var data = []
    var grouped = null
    switch(this.state.scope) {
        case scopes.COUNTIES:
          grouped = this.groupBy(this.state.county_data, 'date')
          originalData = this.state.county_data
          console.log('Counties')
          break;
        case scopes.STATES:
          console.log('States')
          grouped = this.groupBy(this.state.state_data, 'date')
          originalData = this.state.state_data
          break;
        case scopes.GLOBAL:
          console.log('Countries')
          grouped = this.groupBy(this.state.global_data, 'Date')
          originalData = this.state.global_data
          console.log('LOL', originalData)
          break;
    }
    
    for (var date in grouped) {
      // data.push({name: date, data: grouped[date].map(function(item) {
      //   return item['cases'] 
      // })})
      data.push({name: date, data: grouped[date]})
    }
    if (data.length != 0) {

      let stateLoc = function(item) { return abbrs[item['state']]}
      let globalLoc = function(item) { return item['Country'] }
      let countyLoc = function(item) { return item['fips']}
      let countyNameLoc = function(item) { return item['county']}
      let stateCases = 'cases'
      let globalCases = 'Confirmed'
      let countyCases = 'cases'
      var locFunc = null
      var hoverFunc = null
      var dataStr = null
      var locationmode = null

      switch(this.state.scope) {
        case scopes.COUNTIES:
          //json = counties_json
          console.log('Counties')
          locFunc = countyLoc
          hoverFunc = countyNameLoc
          dataStr = countyCases
          locationmode = 'USA-states'
          break;
        case scopes.STATES:
          console.log('States')
          locFunc = stateLoc
          hoverFunc = stateLoc
          dataStr = stateCases
          locationmode = 'USA-states'
          break;
        case scopes.GLOBAL:
          console.log('Countries')
          locFunc = globalLoc
          hoverFunc = globalLoc
          dataStr = globalCases
          locationmode = 'country names'
          break;
      }

      var cases = data[0]['data'].map(function(item) { return Math.log10(item[dataStr]) })
      var locs = data[0]['data'].map(locFunc)
      var mapData = [{
        type:'choropleth',
        locations: locs,
        z: cases,
        customdata: data[0]['data'].map(function(item) { return [item[dataStr]] }),
        geo:'geo',
        coloraxis:'coloraxis',
        hovertemplate: '<b>%{hovertext}</b><br><br>Confirmed: %{customdata[0]}<br>State: %{location}',
        hovertext: data[0]['data'].map(hoverFunc),
        hoverlabel: { namelength: 0 }
      }]
      if (this.state.scope == scopes.COUNTIES) {
          mapData[0].geojson = this.state.county_geojson
      } else {
          mapData[0].locationmode = locationmode
      }
      var maxLog = Math.log10(Math.max(...originalData.map(function(d) { return d[dataStr] })))
      var frames = []
      for (var i = 0; i < data.length; i++) {
        var d = [{
          type:'choropleth',
          locations: data[i]['data'].map(locFunc),
          z: data[i]['data'].map(function(item) {
            return Math.log10(item[dataStr])
          }),
          customdata: data[i]['data'].map(function(item) {
            return [item[dataStr]]
          }),
          geo:'geo',
          coloraxis:'coloraxis',
          hovertemplate: '<b>%{hovertext}</b><br><br>Confirmed: %{customdata[0]}<br>State: %{location}',
          hovertext: data[i]['data'].map(hoverFunc),
          hoverlabel: { namelength: 0 }
        }]
        if (this.state.scope == scopes.COUNTIES) {
          d[0].geojson = this.state.county_geojson
        } else {
          d[0].locationmode = locationmode
        }
        frames.push({data: d, name: data[i]['name']})
      }
      console.log('DATA: ', data)
      console.log('FRAMES: ', frames)
      var sliderSteps = data.map(function(item) {
        return {
          label: item['name'],
          method: 'animate',
          args: [[item['name']], {
            mode: 'immediate',
            transition: { duration: 0, easing: 'linear' },
            frame: { duration: 0, redraw: true },
            fromcurrent: true
          }]
        }
      })

      var layout = states_json.layout
      layout.coloraxis.cmax = maxLog
      layout.height = 900
      layout.width = 1800
      layout.coloraxis.colorbar.title.text = 'Cases'
      layout.sliders[0].steps = sliderSteps
      layout.coloraxis.cmax = maxLog
      console.log('MAX ', maxLog)
      layout.coloraxis.cmin = 1
      // layout config based on display selected
      switch(this.state.scope) {
        case scopes.COUNTIES:
          console.log('Counties')
          layout.geo.scope = 'usa'
          break;
        case scopes.STATES:
          console.log('States')
          layout.geo.scope = 'usa'
          break;
        case scopes.GLOBAL:
          console.log('Countries')
          layout.geo.scope = 'world'
          break;
      }
      console.log(sliderSteps)
      let plot = <Plot
          data={mapData}
          layout={layout}
          frames={frames}
        >
        </Plot>
        console.log(plot)
      return (
        plot
      )
    } else {
      return
    }
  }

  load_data() {
    var url = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv'
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function(res) {
        console.log('STATE RES: ', res, this)
        if (res.data[res.data.length - 1].date == '') {
          console.log("BLAH")
          this.setState({state_data: res.data.pop()})
        }
        this.setState({state_data: res.data})
      }.bind(this)
    })
    url = 'https://raw.githubusercontent.com/datasets/covid-19/master/data/countries-aggregated.csv'
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function(res) {
        console.log('GLOBAL RES: ', res, this)
        console.log(res.data[res.data.length - 1])
        if (res.data[res.data.length - 1].Date == '') {
          console.log("BLAH")
          this.setState({global_data: res.data.pop()})
        }
        this.setState({global_data: res.data})
      }.bind(this)
    })
    url = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function(res) {
        console.log('GLOBAL RES: ', res, this)
        console.log(res.data[res.data.length - 1])
        if (res.data[res.data.length - 1].date == '') {
          console.log("BLAH")
          this.setState({county_data: res.data.pop()})
        }
        this.setState({county_data: res.data})
      }.bind(this)
    })
    this.getJSON('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json',
      function(err, data) {
        if (err !== null) {
          console.log(err)
        } else {
          console.log('GeoJSON: ', data)
          this.setState({county_geojson: data})
        }
      }.bind(this)
    )
  }

  getJSON(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
  };

  groupBy(xs, prop) {
    var grouped = {};
    for (var i=0; i<xs.length; i++) {
      var p = xs[i][prop];
      if (!grouped[p]) { grouped[p] = []; }
      grouped[p].push(xs[i]);
    }
    return grouped;
  }
}

  const abbrs =  {
    'Arizona': 'AZ',
    'Alabama': 'AL',
    'Alaska':'AK',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
  }

export default App;