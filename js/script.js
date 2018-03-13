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
const COLOR_BLUE = "#0D47A1";
const COLOR_RED= "#B71C1C";
// const ACTIVE_COLOR = 'red';
const MIN_YEAR = 1995;
const MAX_YEAR = 2015;
const STEP_YEAR = 5;
const MAX_MIGRATIONS = 10;

// Multi Line Chart settings
const MULTI_LINE_CHART_WIDTH = 600;
const MULTI_LINE_CHART_HEIGHT = 300;
const MULTI_LINE_CHART_PADDING = 50;
const MULTI_LINE_CHART_MARGINS = {top: 30, right: 30, bottom: 30, left: 50}
const MULTI_LINE_CHART_MIGRATIONS_COLOR = COLOR_BLUE;
const MULTI_LINE_CHART_TERROR_COLOR = COLOR_RED;

// Parameters
let currentYear = MIN_YEAR;
let headline = "Number of deaths caused by terrorism in ";
let activeCountry = null;

let strokeWidthScale = d3.scale.linear();

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
            popupOnHover: true, // True to show the popup while hovering
            highlightOnHover: true,
            arcSharpness: 0.5,
            animationSpeed: 1000
        });
    }

     /***************************
      * Visualize the data map
      ***************************/
    // Datamaps expect data in format:
    // { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
    //   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
    const map = new Datamap({
        element: document.getElementById("viz-container"),
        data: data_map,
        fills: {
            defaultFill: "#EFEFFF"
        },
        geographyConfig: {
            highlightBorderColor: "#B7B7B7",
            highlightBorderWidth: 2,
            highlightOnHover: true,
            // don't change color on mouse hover
            highlightFillColor: function(geo) {
                return geo["fillColor"] || "#F5F5F5";
            },
            popupTemplate: (geography, data) => {
                return [
                    '<div class="hoverinfo">',
                    "<strong>",
                    geography.properties.name,
                    "</strong>",
                    "<br>Killed: <strong>",
                    data.numberOfKills,
                    "</strong>",
                    "</div>"
                ].join("");
            }
        },
        done: datamap => {
            // action when country is clicked
            datamap.svg.selectAll(".datamaps-subunit").on("click", geography => {
                const clickedCountry = geography.properties.name;
                activeCountry = activeCountry !== clickedCountry ? clickedCountry : null;
                if (activeCountry) {
                    // draw arcs to active country
                    drawMigrationArcs(geography.properties.name);
                    // draw multi line chart of active country
                    drawMultiLineChart(geography.properties.name);
                }
                else {
                    // hide arcs
                    map.arc([]);
                }
                // selectedCountry = geography.properties.name;

                // active color to clicked country
                /*
                const data_map = getTerrorData(currentYear);
                const countryId = geography.id;
                const newDataMap = {
                    ...data_map,
                    [countryId]: {
                        ...data_map[countryId],
                        fillColor: ACTIVE_COLOR
                    }
                };
                console.log("newDataMap:", newDataMap);
                map.updateChoropleth(newDataMap);
                */
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
    }

    // slider
    d3.select('#viz-container').insert("p", ":first-child").append("input")
        .attr("type", "range")
        .attr("min", MIN_YEAR)
        .attr("max", MAX_YEAR)
        .attr("step", STEP_YEAR)
        .attr("value", currentYear)
        .attr("id", "year");

    d3.select("#viz-container").insert("h2", ":first-child").attr("id", "headline").text(headline + currentYear);

    d3.select("#year").on("input", function() {
        updateVisualization(+this.value);
    });


    /******************************************************
     * Draw Migrations/Terrorism multi line chart
     ******************************************************/

     const dummy_data = [
         { "year": 1990, "migrants": 3005, "terror": 100},
         { "year": 1995, "migrants": 4005, "terror": 200},
         { "year": 2000, "migrants": 6005, "terror": 700},
         { "year": 2005, "migrants": 5505, "terror": 200},
         { "year": 2010, "migrants": 8005, "terror": 300},
         { "year": 2015, "migrants": 9885, "terror": 600}
     ];

    const getCountryData = country => {
        data = [];

        Object.keys(migrations).map(y => {

            const sum_migrants = d3.sum(migrations[y][country].map(m => m.migrants));

            data.push({'year': y, 'migrants': sum_migrants, 'terror': 3000});

        });

        return data;
    }

    const drawMultiLineChart = country => {

        data = getCountryData(country);

        // define canvas
        const svg = d3.select("#bottom-box").append("svg")
            .attr("id", "multiLineChart")
            .attr("width", MULTI_LINE_CHART_WIDTH)
            .attr("height", MULTI_LINE_CHART_HEIGHT);

        // x/y scales
        const xScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_MARGINS.left, MULTI_LINE_CHART_WIDTH - MULTI_LINE_CHART_MARGINS.right])
            .domain([data[0].year, data[data.length-1].year]);

        const yScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.top, MULTI_LINE_CHART_MARGINS.bottom])
            .domain([0, d3.max(data.map(i => i.migrants))]);

        // x/y axis
        const xAxis = d3.svg.axis()
            .scale(xScale)
            .ticks(5)
            .tickFormat(d3.format("d"));

        const yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(5)
            .tickFormat(d3.format("d"));

        svg.append("svg:g")
            .attr("class","axis")
            .attr("transform", "translate(0," + (MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.bottom) + ")")
            .call(xAxis);

        svg.append("svg:g")
            .attr("class","axis")
            .attr("transform", "translate(" + (MULTI_LINE_CHART_MARGINS.left) + ",0)")
            .call(yAxis);

        // draw graph lines
        const getMigrationsLine = d3.svg.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.migrants))
            .interpolate("cardinal");

        const getTerrorLine = d3.svg.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.terror))
            .interpolate("cardinal");

        const lineGraphMigrations = svg.append("path")
            .attr("d", getMigrationsLine(data))
            .attr("stroke", MULTI_LINE_CHART_MIGRATIONS_COLOR)
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const lineGraphMigrationsLength = lineGraphMigrations.node().getTotalLength();
        lineGraphMigrations
             .attr("stroke-dasharray", lineGraphMigrationsLength + " " + lineGraphMigrationsLength)
             .attr("stroke-dashoffset", lineGraphMigrationsLength)
             .transition()
             .duration(1000)
             .ease("cubic")
             .attr("stroke-dashoffset", 0);

        const lineGraphTerror = svg.append("path")
            .attr("d", getTerrorLine(data))
            .attr("stroke", MULTI_LINE_CHART_TERROR_COLOR)
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const lineGraphTerrorLength = lineGraphTerror.node().getTotalLength();
        lineGraphTerror
             .attr("stroke-dasharray", lineGraphTerrorLength + " " + lineGraphTerrorLength)
             .attr("stroke-dashoffset", lineGraphTerrorLength)
             .transition()
             .duration(1000)
             .ease("cubic")
             .attr("stroke-dashoffset", 0);

    }

    drawMultiLineChart('Sri Lanka');

    // TODO: add legend

}


d3.queue()
    .defer(d3.json, "data/terror-min.json")
    .defer(d3.json, "data/migrations3.json")
    .await(makeVisualization);
