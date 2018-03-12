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
const MAX_MIGRATIONS = 10;

// Parameters
let currentYear = MIN_YEAR;
let headline = "Number of deaths caused by terrorism in ";

// let minMigrationValue Math.min.apply(null, onlyMigrationValues);
// let maxMigrationValue = Math.max.apply(null, onlyMigrationValues);
let strokeWidthScale = d3.scale.linear();
    // .domain([minMigrationValue, maxMigrationValue])
    // .range([MIN_STROKE_WIDTH, MAX_STROKE_WIDTH]);

const makeVisualization = (error, terror, migrations) => {
    if (error) throw error;

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
     *  Migrations
     ***************************/
    const getMigrationData = (year) => {
        const migrationsCurrentYear = migrations[currentYear] ? migrations[currentYear] : [];
        console.log("Migrations current year:", migrationsCurrentYear);

        const onlyMigrationValues = [].concat.apply([], Object.keys(migrationsCurrentYear)
            .map(k => migrationsCurrentYear[k].map(m => m.migrants)));
        const minMigrationValue = Math.min.apply(null, onlyMigrationValues);
        const maxMigrationValue = Math.max.apply(null, onlyMigrationValues);
        strokeWidthScale
            .domain([minMigrationValue, maxMigrationValue])
            .range([MIN_STROKE_WIDTH, MAX_STROKE_WIDTH]);

        return migrationsCurrentYear;
    }
    let migrationsCurrentYear = getMigrationData(currentYear);

    const getMigrationFlows = country => {
        // get all origin coordinates corresponding to migration flows
        const migration = migrationsCurrentYear[country] || null;

        const flows = migration ? migration.map(i => {
            return {
                origin: {
                    latitude: i.origin.latitude,
                    longitude: i.origin.longitude
                },
                destination: {
                    latitude: i.destination.latitude,
                    longitude: i.destination.longitude
                },
                    strokeWidth: strokeWidthScale(i.migrants)
                };
            })
            : [];

        const sortMigrations = (a, b) => b.strokeWidth - a.strokeWidth;
        flows.sort(sortMigrations);

        return flows.slice(0, MAX_MIGRATIONS);
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

        map.arc([]);

        migrationsCurrentYear = getMigrationData(currentYear);


        // const flows_update = getMigrationFlows(country);
        //
        // map.arc(flows_update, {
        //     strokeWidth: 2,
        //     greatArc: true,
        //     popupOnHover: true, // True to show the popup while hovering
        //     highlightOnHover: true,
        // });
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




    // TODO: add legend

}


d3.queue()
    .defer(d3.json, "data/terror-min.json")
    .defer(d3.json, "data/migrations3.json")
    .await(makeVisualization);
