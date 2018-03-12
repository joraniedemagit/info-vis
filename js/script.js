/**
 * Visualizing the Relationship Between Migration and Global Terrorism
 * Tom van den Bogaart, Iason de Bondt, Kewin Dereniewicz, Joran Iedema and Tom de Jong
 * Information Visualization 2018, MSc Data Science
 * University of Amsterdam
 */

// Settings
const MIN_STROKE_WIDTH = 1;
const MAX_STROKE_WIDTH = 10;
const MIN_COLOR = "#EFEFFF";
const MAX_COLOR = "#02386F";
const MIN_YEAR = 1995;
const MAX_YEAR = 2015;
const STEP_YEAR = 5;

// Parameters
let currentYear = MIN_YEAR;
let headline = "Number of deaths caused by terrorism in ";

const makeVisualization = (error, terror, migrations) => {
    // if (error) throw error;

    /***************************
     * Preprocess Terrorism
     ***************************/
    console.log('Terror: ', terror);

    // Retrieve number of kills by terrorism for every country to visualize on the map
    const getTerrorData = (year) => {
        const terrorCurrentYear = terror.filter( t => t.Year == currentYear);
        console.log('Terror current year:', terrorCurrentYear);
        let data_map = {};
        terrorCurrentYear.forEach( t => {
          if (t.Killed) {
              data_map[t.CountryCode]
                  ? data_map[t.CountryCode]["numberOfKills"]
                    ? (data_map[t.CountryCode]["numberOfKills"] += t.Killed)
                    : (data_map[t.CountryCode]["numberOfKills"] = t.Killed)
                  : (data_map[t.CountryCode] = {
                        numberOfKills: t.Killed
                    });
          } else {
              // t.Killed == null (set to 0 in preprocessing?)
          }
        })
        const onlyValues = Object.keys(data_map).map( key => data_map[key]["numberOfKills"]);
        const minValue = Math.min.apply(null, onlyValues);
        const maxValue = Math.max.apply(null, onlyValues);

        const colorScale = d3.scale
          .linear()
          .domain([minValue, maxValue])
          .range([MIN_COLOR, MAX_COLOR]);

        Object.keys(data_map).forEach( key => {
          const value = data_map[key]["numberOfKills"];
          data_map[key]["fillColor"] = colorScale(value);
        })
        return data_map;
    }

    const data_map = getTerrorData(currentYear);

    /***************************
     * Preprocess Migrations
     ***************************/
     console.log('Migrations: ', migrations);
     /* migrations.json should have the following structure: */
     migrations = {
          1995: [
              {
                  destination: {
                      country: "Sudan",
                      latitude: 15.58807823,
                      longitude: 32.53417924,
                  },
                  immigrants: [
                      {
                          latitude: 14.60415895,
                          longitude: 120.98221720000001,
                          country: "Philippines",
                          nMigrants: 192423
                      },
                      {
                          latitude: 43.69997988,
                          longitude: -79.42002079,
                          country: "Canada",
                          nMigrants: 2034033
                      }
                  ]
              },
              {
                  destination: {
                      country: "India",
                      latitude: 22.4949693,
                      longitude: 88.32467566,
                  },
                  immigrants: [
                      {
                          latitude: 14.60415895,
                          longitude: 120.98221720000001,
                          country: "Philippines",
                          nMigrants: 192423
                      },
                      {
                          latitude: 43.69997988,
                          longitude: -79.42002079,
                          country: "Canada",
                          nMigrants: 234033
                      }
                  ]
              }
          ],
          2000: {
              destination: {
                  country: "Sudan",
                  latitude: 15.58807823,
                  longitude: 32.53417924,
              },
              immigrants: [
                  {
                      latitude: 14.60415895,
                      longitude: 120.98221720000001,
                      country: "Philippines",
                      nMigrants: 192423
                  },
                  {
                      latitude: 43.69997988,
                      longitude: -79.42002079,
                      country: "Canada",
                      nMigrants: 234033
                  }
              ]
          }
     };

     console.log("New migrations: ", migrations);
     const migrationsCurrentYear = migrations[currentYear] ? migrations[currentYear] : [];
     console.log("Migrations current year:", migrationsCurrentYear);
     const onlyMigrationValues = [].concat.apply([], migrationsCurrentYear.map( m => m.immigrants.map(i => i.nMigrants)));
     const minMigrationValue = Math.min.apply(null, onlyMigrationValues);
     const maxMigrationValue = Math.max.apply(null, onlyMigrationValues);
     const strokeWidthScale = d3.scale.linear()
        .domain([minMigrationValue, maxMigrationValue])
        .range([MIN_STROKE_WIDTH, MAX_STROKE_WIDTH]);

     /***************************
      * Visualize the data map
      ***************************/
    // Datamaps expect data in format:
    // { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
    //   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
    const map = new Datamap({
      element: document.getElementById("container"),
      data: data_map,
      fills: {
          defaultFill: "#EFEFFF"
      },
      geographyConfig: {
          highlightBorderColor: '#B7B7B7',
          highlightBorderWidth: 2,
          // don't change color on mouse hover
          highlightFillColor: function(geo) {
              return geo['fillColor'] || '#F5F5F5';
          },
          popupTemplate: (geography, data) => {
              return [
                  '<div class="hoverinfo">',
                  '<strong>', geography.properties.name, '</strong>',
                  '<br>Killed: <strong>', data.numberOfKills, '</strong>',
                  '</div>'
              ].join('');
          }
      },
      done: datamap => {
          datamap.svg.selectAll('.datamaps-subunit').on('click', geography => {
              drawMigrationArcs(geography.properties.name);
          });
      }
    });

    // Draw a legend for this map
    map.legend();

    // Make map responsive
    d3.select(window).on("resize", function() {
      map.resize();
    });

    // update map
    const updateVisualization = (year) => {
        currentYear = year;
        d3.select("#headline").text(headline + d3.select("#year").node().value);
        const data_map = getTerrorData(currentYear);
        map.updateChoropleth(data_map);
    }

    // slider
    d3.select('#container').insert("p", ":first-child").append("input")
        .attr("type", "range")
        .attr("min", MIN_YEAR)
        .attr("max", MAX_YEAR)
        .attr("step", STEP_YEAR)
        .attr("value", currentYear)
        .attr("id", "year");

    d3.select("#container").insert("h2", ":first-child").attr("id", "headline").text(headline + currentYear);

    d3.select("#year").on("input", function() {
        updateVisualization(+this.value);
    });

    const getMigrationFlows = country => {
        // get all origin coordinates corresponding to migration flows
        const migration = migrationsCurrentYear.filter(
            m => m.destination.country == country
        )[0];

        const flows = migration
            ? migration.immigrants.map(i => {
                  return {
                      origin: {
                          latitude: i.latitude,
                          longitude: i.longitude
                      },
                      destination: {
                          latitude: migration.destination.latitude,
                          longitude: migration.destination.longitude
                      },
                      strokeWidth: strokeWidthScale(i.nMigrants)
                  };
              })
            : [];

        console.log('Flows:', flows);
        return flows;
    };


    const drawMigrationArcs = country => {
      console.log('Clicked country:', country);
      const flows = getMigrationFlows(country);

      map.arc(flows, {
          strokeWidth: 2,
          greatArc: true,
          popupOnHover: true, // True to show the popup while hovering
          highlightOnHover: true,
      });
    }

    // test migration arcs
    drawMigrationArcs('India');

    // TODO: add legend

}


d3.queue()
    .defer(d3.json, "data/terror-min.json")
    .defer(d3.json, "data/migrations.json")
    .await(makeVisualization);
