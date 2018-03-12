/**
 * Visualizing the Relationship Between Migration and Global Terrorism
 * Tom van den Bogaart, Iason de Bondt, Kewin Dereniewicz, Joran Iedema and Tom de Jong
 * Information Visualization 2018, MSc Data Science
 * University of Amsterdam
 */

// Settings
let currentYear = 1995;


const makeVisualization = (error, terror, migrations) => {
    // if (error) throw error;

    /***************************
     * Preprocess Terrorism
     ***************************/
    console.log('Terror: ', terror);
    // Retrieve number of kills by terrorism for every country to visualize on the map
    const terrorCurrentYear = terror.filter( t => t.Year == currentYear);
    console.log('Terror current year:', terrorCurrentYear);
    data_map = {};
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
      .range(["#EFEFFF", "#02386F"]); // blue color

    Object.keys(data_map).forEach( key => {
      const value = data_map[key]["numberOfKills"];
      data_map[key]["fillColor"] = colorScale(value);
    })

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
                          nMigrants: 234033
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

    const presidentialTrips = [
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
              latitude: 54.597,
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
              latitude: 59.95,
              longitude: 30.3
          }
      }
    ];


    let arcs = map.arc( presidentialTrips, {
      strokeWidth: 2,
      greatArc: true,
      popupOnHover: true, // True to show the popup while hovering
      highlightOnHover: true,
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
                      }
                  };
              })
            : [];

        console.log('Flows:', flows);
        return flows;
    };


    const drawMigrationArcs = country => {
      console.log('Clicked country:', country);
      const flows = getMigrationFlows(country);

      map.arc(flows);
    }

    // TODO: add legend

}


d3.queue()
    .defer(d3.json, "data/terror-min.json")
    .defer(d3.json, "data/migrations.json")
    .await(makeVisualization);
