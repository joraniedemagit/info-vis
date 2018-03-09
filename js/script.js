

// Visualize global terrorism
d3.json("data/terror-test.json", (error, terror) => {
    console.log('Terror: ', terror);
    // colorScale.domain(terror.map( d => d.Country ));
    dict = {};
    terror.forEach( t => {
        console.log( typeof(t.Killed), t.Killed);
        dict[t.CountryCode] ?
            dict[t.CountryCode] = 0 :
            dict[t.CountryCode] = 1; //dict[t.CountryCode] = dict[t.CountryCode] + 1;//t.Killed;
        // dict[t.CountryCode] = 0
    })
    console.log(dict);
});

// example data from server
const series = [
    ["BLR",75],["BLZ",43],["RUS",50],["RWA",88],["SRB",21],["TLS",43],
    ["REU",21],["TKM",19],["TJK",60],["ROU",4],["TKL",44],["GNB",38],
    ["GUM",67],["GTM",2],["SGS",95],["GRC",60],["GNQ",57],["GLP",53],
    ["JPN",59],["GUY",24],["GGY",4],["GUF",21],["GEO",42],["GRD",65],
    ["GBR",14],["GAB",47],["SLV",15],["GIN",19],["GMB",63],["GRL",56],
    ["ERI",57],["MNE",93],["MDA",39],["MDG",71],["MAF",16],["MAR",8],
    ["MCO",25],["UZB",81],["MMR",21],["MLI",95],["MAC",33],["MNG",93],
    ["MHL",15],["MKD",52],["MUS",19],["MLT",69],["MWI",37],["MDV",44],
    ["MTQ",13],["MNP",21],["MSR",89],["MRT",20],["IMN",72],["UGA",59],
    ["TZA",62],["MYS",75],["MEX",80],["ISR",77],["FRA",54],["IOT",56],
    ["SHN",91],["FIN",51],["FJI",22],["FLK",4],["FSM",69],["FRO",70],
    ["NIC",66],["NLD",53],["NOR",7],["NAM",63],["VUT",15],["NCL",66],
    ["NER",34],["NFK",33],["NGA",45],["NZL",96],["NPL",21],["NRU",13],
    ["NIU",6],["COK",19],["XKX",32],["CIV",27],["CHE",65],["COL",64],
    ["CHN",16],["CMR",70],["CHL",15],["CCK",85],["CAN",76],["COG",20],
    ["CAF",93],["COD",36],["CZE",77],["CYP",65],["CXR",14],["CRI",31],
    ["CUW",67],["CPV",63],["CUB",40],["SWZ",58],["SYR",96],["SXM",31]];

const onlyValues = series.map(function(obj){ return obj[1]; });
const minValue = Math.min.apply(null, onlyValues);
const maxValue = Math.max.apply(null, onlyValues);

const paletteScale = d3.scale
    .linear()
    .domain([minValue, maxValue])
    .range(["#EFEFFF", "#02386F"]); // blue color

// Datamaps expect data in format:
// { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
//   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
var dataset = {};

// fill dataset in appropriate format
series.forEach(function(item){ //
    // item example value ["USA", 70]
    var iso = item[0],
    value = item[1];
    dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value) };
});

const map = new Datamap({
    element: document.getElementById("container"),
    data: dataset
});

// Draw a legend for this map
map.legend();

// Make map responsive
d3.select(window).on("resize", function() {
    map.resize();
});

var presidentialTrips = [
  {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 32.066667,
          longitude: 34.783333
      }
  },
  {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 19.433333,
          longitude: -99.133333
      }
  },
  {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 9.933333,
          longitude: -84.083333
      }
  },
  {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 54.597 ,
          longitude: -5.93
      }
  },
  {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 52.516667,
          longitude: 13.383333
      }
  },
  {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 14.692778,
          longitude: -17.446667
      }
  },
  {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: -26.204444,
          longitude: 28.045556
      }
  },
          {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: -6.8,
          longitude: 39.283333
      }
  },
          {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 59.329444,
          longitude: 18.068611
      }
  },
          {
      origin: {
          latitude: 38.895111,
          longitude: -77.036667
      },
      destination: {
          latitude: 59.95 ,
          longitude: 30.3
      }
  }
];

map.arc( presidentialTrips, {
    strokeWidth: 2,
    strokeColor: "rgba(255,255,0,0.7)",
    greatArc: true,
    popupOnHover: true, // True to show the popup while hovering
    highlightOnHover: true,
    popupTemplate: (geography, data) => { // This function should just return a string
        return '<div class="hoverinfo">Test test test</div>';
        // Case with latitude and longitude
        if ( ( data.origin && data.destination ) && data.origin.latitude && data.origin.longitude && data.destination.latitude && data.destination.longitude ) {
          return '<div class="hoverinfo"><strong>Arc</strong><br>Origin: ' + JSON.stringify(data.origin) + '<br>Destination: ' + JSON.stringify(data.destination) + '</div>';
        }
        // Case with only country name
        else if ( data.origin && data.destination ) {
          return '<div class="hoverinfo"><strong>Arc</strong><br>' + data.origin + ' -> ' + data.destination + '</div>';
        }
        // Missing information
        else {
          return '';
        }
    }
});
