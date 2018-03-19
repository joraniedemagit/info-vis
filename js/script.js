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
const COLOR_BLUE = 'rgba(54, 162, 235, 0.8)';
const COLOR_RED = 'rgba(255, 99, 132, 0.8)';
const ARC_COLOR = 'rgba(255, 99, 132, 0.8)';
const MIN_YEAR = 1990;
const MAX_YEAR = 2015;
const STEP_YEAR = 5;
const MAX_MIGRATIONS = 10;

// Multi Line Chart settings
const MULTI_LINE_CHART_HEIGHT = 220;
const MULTI_LINE_CHART_PADDING = 50;
const MULTI_LINE_CHART_MARGINS = {top: 30, right: 30, bottom: 30, left: 70}
const MULTI_LINE_CHART_WIDTH = document.getElementById('bottom-box').offsetWidth;
const MULTI_LINE_CHART_MIGRATIONS_COLOR = COLOR_RED;
const MULTI_LINE_CHART_KILLS_COLOR = COLOR_BLUE;

// Parameters
let currentYear = MIN_YEAR;
// let headline = "Number of deaths caused by terrorism in ";
let activeCountry = null;
let strokeWidthScale = d3.scale.linear();

const countFrequency = list => {
    const counts = {};
    list.forEach(l => {
        counts[l] = counts[l] ? counts[l] + 1 : 1;
    });
    return counts;
};
countFrequency([5, 5, 5, 2, 2, 2, 2, 2, 9, 4]);

const makeVisualization = (error, terror, migrations) => {
    if (error) throw error;
    /***************************
     * Preprocess Terrorism
     ***************************/
    const newTerror = d3.nest()
        .key(d => d.Year)
        .key(d => d.CountryCode)
        .rollup(v => {
            const attackTypes = countFrequency(v.map( d => d.AttackType));
            const targetTypes = countFrequency(v.map( d => d.Target_type));
            const terrorGroups = countFrequency(v.map( d => d.Group));
            const listKilled = v.map(m => ({
                killed: m.Killed !== null ? m.Killed : 0
            }));
            const totalKilled = d3.sum(listKilled, d => d.killed);
            return {
                attackTypes,
                targetTypes,
                totalKilled,
                terrorGroups
            };
        })
        .map(terror);

    const globalTerror = d3.nest()
        .key(d => d.Year)
        .rollup( leaves => {
            const attackTypes = countFrequency(leaves.map(d => d.AttackType));
            const targetTypes = countFrequency(leaves.map(d => d.Target_type));
            const terrorGroups = countFrequency(leaves.map( d => d.Group));
            const totalKilled = d3.sum(leaves, d => d.Killed);
            return {
                attackTypes,
                targetTypes,
                terrorGroups,
                totalKilled
            }
        })
        .map(terror);

    console.log('newTerror', newTerror);
    const globalTotalKilled = Object.keys(newTerror).map(year => Object.keys(newTerror[year]).map(countryCode => newTerror[year][countryCode]['totalKilled']));
    console.log('globalTotalKilled', globalTotalKilled);

    const getTerrorData = (year) => {
        const terrorCurrentYear = newTerror[year];
        // console.log('Terror current year:', terrorCurrentYear);
        return terrorCurrentYear;
    }

    let terrorCurrentYear = getTerrorData(currentYear);

    const createDataMap = (terrorCurrentYear) => {
        let data_map = {};
        Object.keys(terrorCurrentYear).forEach( countryCode => {
            data_map[countryCode] = {
                totalKilled: terrorCurrentYear[countryCode]["totalKilled"]
            }
        });
        const onlyValues = Object.keys(terrorCurrentYear).map( key => terrorCurrentYear[key]["totalKilled"]);
        const minValue = Math.min.apply(null, onlyValues);
        const maxValue = Math.max.apply(null, onlyValues);

        const colorScale = d3.scale
          .linear()
          .domain([minValue, maxValue])
          .range([MIN_COLOR, MAX_COLOR]);

        Object.keys(data_map).forEach( key => {
          const value = data_map[key]["totalKilled"];
          data_map[key]["fillColor"] = colorScale(value);
        })
        return data_map;
    }

    const data_map = createDataMap(terrorCurrentYear);

    /***************************
     *  Migrations
     ***************************/
    console.log('Migrations: ', migrations);

    const globalMigrations = {};
    Object.keys(migrations).forEach(yearKey => {
        Object.keys(migrations[yearKey]).forEach( countryKey => {
            const leaves = migrations[yearKey][countryKey];
            const totalMigrants = d3.sum(leaves, leaves => +leaves.migrants);
            if (globalMigrations[yearKey]) {
                globalMigrations[yearKey] += totalMigrants;
            }
            else {
                globalMigrations[yearKey] = totalMigrants;
            }
        })
    });
    console.log('globalMigrations', globalMigrations);

    const getMigrationData = (year) => {
        const migrationsCurrentYear = migrations[currentYear] ? migrations[currentYear] : [];
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
    const getGlobalDataYear = (year) => {
        const totalKilled = globalTerror[year]["totalKilled"];
        const attackTypes = globalTerror[year]["attackTypes"];
        const targetTypes = globalTerror[year]["targetTypes"];
        const terrorGroups = globalTerror[year]["terrorGroups"];
        const sumMigrations = globalMigrations[year];
        return ({
            year,
            totalKilled,
            sumMigrations,
            attackTypes,
            targetTypes,
            terrorGroups
        })
    };

    const getCountryDataYear = (year, countryCode, countryName) => {
        const totalKilled = newTerror[year][countryCode]
            ? newTerror[year][countryCode]["totalKilled"]
            : 0;
        const attackTypes = newTerror[year][countryCode]
            ? newTerror[year][countryCode]["attackTypes"]
            : {};
        const targetTypes = newTerror[year][countryCode]
            ? newTerror[year][countryCode]["targetTypes"]
            : {};
        const terrorGroups = newTerror[year][countryCode]
            ? newTerror[year][countryCode]["terrorGroups"]
            : {};
        const migrationsCountry = migrations[year][countryName];
        const sumMigrations = migrationsCountry
            ? migrationsCountry.reduce( (sum, obj) => (sum += parseInt(obj["migrants"])), 0 )
            : 0;
        return ({
            year,
            totalKilled,
            sumMigrations,
            attackTypes,
            targetTypes,
            terrorGroups
        });
    };

    const onCountryClick = (geography) => {
        const countryName = geography.properties.name;
        const countryCode = geography.id;
        const clickedCountry = {
            countryName,
            countryCode
        };
        activeCountry = (JSON.stringify(activeCountry) !== JSON.stringify(clickedCountry)) ? clickedCountry : null;
        if (activeCountry) {
            // draw arcs to active country
            console.log('New active country:', countryName, countryCode);
            drawMigrationArcs(countryName);
            const countryData = getCountryDataYear(currentYear, countryCode, countryName);
            console.log('getCountryDataYear', countryData);
            updateSidebar(
                countryName,
                countryData["totalKilled"],
                countryData["sumMigrations"],
                countryData["targetTypes"],
                countryData["attackTypes"],
                countryData["terrorGroups"]
            );
            updateMultiLineChart(countryCode, countryName);
        }
        else {
            // hide arcs
            map.arc([]);
            const globalData = getGlobalDataYear(currentYear);
            updateSidebar(
                "All countries",
                globalData["totalKilled"],
                globalData["sumMigrations"],
                globalData["targetTypes"],
                globalData["attackTypes"],
                globalData["terrorGroups"]
            );
            updateMultiLineChart();
        }
    }

    const map = new Datamap({
        element: document.getElementById("viz-container"),
        data: data_map,
        fills: {
            defaultFill: MIN_COLOR
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
                    data.totalKilled,
                    "</strong>",
                    "</div>"
                ].join("");
            }
        },
        done: datamap => {
            // action when country is clicked
            datamap.svg.selectAll(".datamaps-subunit").on("click", onCountryClick);
        }
    });

    // TODO: add legend
    map.legend();

    // Make map responsive
    d3.select(window).on("resize", function() {
      map.resize();
    });

    // update map
    const updateVisualization = (year) => {
        currentYear = year;
        d3.select("#bigYearLabel").text(d3.select("#year").node().value);
        terrorCurrentYear = getTerrorData(currentYear);
        const data_map = createDataMap(terrorCurrentYear);
        map.updateChoropleth(data_map);
        map.arc([]);
        migrationsCurrentYear = getMigrationData(currentYear);
        activeCountry
            ? updateMultiLineChartDot(
                  activeCountry.countryCode,
                  activeCountry.countryName
              )
            : updateMultiLineChartDot();
    }

    // slider
    d3.select('#sidebar').insert("p", ":first-child").append("input")
        .attr("type", "range")
        .attr("min", MIN_YEAR)
        .attr("max", MAX_YEAR)
        .attr("step", STEP_YEAR)
        .attr("value", currentYear)
        .attr("id", "year");

    d3.select("#viz-container").insert("div", ":first-child").attr("id", "bigYearLabelContainer").insert("span").attr("id", "bigYearLabel").text(currentYear);

    // action when slider changes
    d3.select("#year").on("input", () => {
        const year = +d3.event.target.value;
        updateVisualization(year);
        if(activeCountry) {
            const countryData = getCountryDataYear(year, activeCountry["countryCode"], activeCountry["countryName"]);
            updateSidebar(
                activeCountry["countryName"],
                countryData["totalKilled"],
                countryData["sumMigrations"],
                countryData["targetTypes"],
                countryData["attackTypes"],
                countryData["terrorGroups"]
            );
        } else {
            const globalData = getGlobalDataYear(currentYear);
            updateSidebar(
                "All countries",
                globalData["totalKilled"],
                globalData["sumMigrations"],
                globalData["targetTypes"],
                globalData["attackTypes"],
                globalData["terrorGroups"]
            );
        }
    });

    // update Sidebar
    const globalData = getGlobalDataYear(currentYear);
    updateSidebar(
        "All countries",
        globalData["totalKilled"],
        globalData["sumMigrations"],
        globalData["targetTypes"],
        globalData["attackTypes"],
        globalData["terrorGroups"]
    );
    /******************************************************
     * Draw Migrations/Terrorism multi line chart
     ******************************************************/
    const getCountryData = (countryCode, countryName) => {
        const years = d3.range(MIN_YEAR, MAX_YEAR+1, STEP_YEAR);
        return years.map( year => getCountryDataYear(year, countryCode, countryName));
    }

    const drawMultiLineChart = (countryCode, countryName) => {
        const data = getCountryData(countryCode, countryName);
        console.log('data', data);
        // define canvas
        const svg = d3.select("#bottom-box").append("svg")
            .attr("id", "multiLineChart")
            .attr("height", MULTI_LINE_CHART_HEIGHT);

        // x/y scales
        const xScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_MARGINS.left, MULTI_LINE_CHART_WIDTH - MULTI_LINE_CHART_MARGINS.right])
            .domain([data[0].year, data[data.length-1].year]);

        const yScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.top, MULTI_LINE_CHART_MARGINS.bottom])
            .domain([0, d3.max(data.map(i => i.sumMigrations))]);

        const yScaleKills = d3.scale.linear()
            .range([MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.top, MULTI_LINE_CHART_MARGINS.bottom])
            .domain([0, d3.max(data.map(i => i.totalKilled))]);

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

        const yAxisKills = d3.svg.axis()
            .scale(yScaleKills)
            .orient("right")
            .ticks(5)
            .tickFormat(d3.format("d"));

        svg.append("svg:g")
            .attr("class","axis x-axis")
            .attr("transform", "translate(0," + (MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.bottom) + ")")
            .call(xAxis);

        svg.append("svg:g")
            .attr("class","axis y-axis")
            .attr("transform", "translate(" + (MULTI_LINE_CHART_MARGINS.left) + ",0)")
            .call(yAxis);

        svg.append("svg:g")
            .attr("class","axis y-axis-kills")
            .attr("transform", "translate(" + (MULTI_LINE_CHART_WIDTH - MULTI_LINE_CHART_MARGINS.right) + ",0)")
            .call(yAxisKills);

        // draw graph lines
        const getMigrationsLine = d3.svg.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.sumMigrations))
            .interpolate("monotone");

        const getKillsLine = d3.svg.line()
            .x(d => xScale(d.year))
            .y(d => yScaleKills(d.totalKilled))
            .interpolate("monotone");

        const lineGraphMigrations = svg.append("path")
            .attr("class", "migrations-line")
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

        const lineGraphKills = svg.append("path")
            .attr("class", "kills-line")
            .attr("d", getKillsLine(data))
            .attr("stroke", MULTI_LINE_CHART_KILLS_COLOR)
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const lineGraphKillsLength = lineGraphKills.node().getTotalLength();
        lineGraphKills
             .attr("stroke-dasharray", lineGraphKillsLength + " " + lineGraphKillsLength)
             .attr("stroke-dashoffset", lineGraphKillsLength)
             .transition()
             .duration(1000)
             .ease("cubic")
             .attr("stroke-dashoffset", 0);

        // legend
        const legendContainer = svg.append("g");

        legendContainer.append("rect")
            .attr("class", "legend-background-migrations")
            .attr("x", MULTI_LINE_CHART_WIDTH * (9/12))
            .attr("y", MULTI_LINE_CHART_MARGINS.top - 14)
            .attr("width", "70")
            .attr("height", "20");
        legendContainer.append("text")
            .attr("class", "legend migrations-legend")
            .attr("text-anchor", "middle")
            .attr("x", MULTI_LINE_CHART_WIDTH * (9/12) + 35)
            .attr("y", MULTI_LINE_CHART_MARGINS.top)
            .text("Migrations");

        legendContainer.append("rect")
            .attr("class", "legend-background-kills")
            .attr("x", MULTI_LINE_CHART_WIDTH * (9/12) + 80)
            .attr("y", MULTI_LINE_CHART_MARGINS.top - 14)
            .attr("width", "70")
            .attr("height", "20");
        legendContainer.append("text")
            .attr("class", "legend kills-legend")
            .attr("text-anchor", "middle")
            .attr("x", MULTI_LINE_CHART_WIDTH * (9/12) + 115)
            .attr("y", MULTI_LINE_CHART_MARGINS.top)
            .text("Total Kills");

        const yearIndex = (-1 * MIN_YEAR + currentYear) / STEP_YEAR;
        // dots
        svg.append("circle")
            .attr("id", "multiline-chart-migration-dot")
            .attr("cx", xScale(data[yearIndex].year))
            .attr("cy", yScale(data[yearIndex].sumMigrations))
            .attr("r", 4);
        svg.append("circle")
            .attr("id", "multiline-chart-kills-dot")
            .attr("cx", xScale(data[yearIndex].year))
            .attr("cy", yScaleKills(data[yearIndex].totalKilled))
            .attr("r", 4);

    }

    const updateMultiLineChartDot = (countryCode, countryName) => {
        const yearIndex = (-1 * MIN_YEAR + currentYear) / STEP_YEAR;
        const data = getCountryData(countryCode, countryName);

        // x/y scales
        const xScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_MARGINS.left, MULTI_LINE_CHART_WIDTH - MULTI_LINE_CHART_MARGINS.right])
            .domain([data[0].year, data[data.length-1].year]);

        const yScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.top, MULTI_LINE_CHART_MARGINS.bottom])
            .domain([0, d3.max(data.map(i => i.sumMigrations))]);

        const yScaleKills = d3.scale.linear()
            .range([MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.top, MULTI_LINE_CHART_MARGINS.bottom])
            .domain([0, d3.max(data.map(i => i.totalKilled))]);

        const svg = d3.select("#multiLineChart");
        svg.select("#multiline-chart-migration-dot")
            .attr("cx", xScale(data[yearIndex].year))
            .attr("cy", yScale(data[yearIndex].sumMigrations));
        svg.select("#multiline-chart-kills-dot")
            .attr("cx", xScale(data[yearIndex].year))
            .attr("cy", yScaleKills(data[yearIndex].totalKilled));
    }

    const updateMultiLineChart = (countryCode, countryName) => {
        const data = getCountryData(countryCode, countryName);

        // define canvas
        const svg = d3.select("#multiLineChart");

        // x/y scales
        const xScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_MARGINS.left, MULTI_LINE_CHART_WIDTH - MULTI_LINE_CHART_MARGINS.right])
            .domain([data[0].year, data[data.length-1].year]);

        const yScale = d3.scale.linear()
            .range([MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.top, MULTI_LINE_CHART_MARGINS.bottom])
            .domain([0, d3.max(data.map(i => i.sumMigrations))]);

        const yScaleKills = d3.scale.linear()
            .range([MULTI_LINE_CHART_HEIGHT - MULTI_LINE_CHART_MARGINS.top, MULTI_LINE_CHART_MARGINS.bottom])
            .domain([0, d3.max(data.map(i => i.totalKilled))]);

        const xAxis = d3.svg.axis()
            .scale(xScale)
            .ticks(5)
            .tickFormat(d3.format("d"));

        const yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(5)
            .tickFormat(d3.format("d"));

        const yAxisKills = d3.svg.axis()
            .scale(yScaleKills)
            .orient("right")
            .ticks(5)
            .tickFormat(d3.format("d"));

        // x/y axis
        svg.select(".x-axis")
            .call(xAxis);

        svg.select(".y-axis")
            .call(yAxis);

        svg.select(".y-axis-kills")
            .call(yAxisKills);

        const getMigrationsLine = d3.svg.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.sumMigrations))
            .interpolate("monotone");

        const getKillsLine = d3.svg.line()
            .x(d => xScale(d.year))
            .y(d => yScaleKills(d.totalKilled))
            .interpolate("monotone");

        const lineGraphMigrations = svg.select(".migrations-line")
            .attr("d", getMigrationsLine(data))
            .attr("stroke", MULTI_LINE_CHART_MIGRATIONS_COLOR)
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const lineGraphMigrationsLength = lineGraphMigrations.node().getTotalLength();
        lineGraphMigrations
             .attr("class", "migrations-line")
             .attr("stroke-dasharray", lineGraphMigrationsLength + " " + lineGraphMigrationsLength)
             .attr("stroke-dashoffset", lineGraphMigrationsLength)
             .transition()
             .duration(1000)
             .ease("cubic")
             .attr("stroke-dashoffset", 0);

         const lineGraphKills = svg.select(".kills-line")
             .attr("d", getKillsLine(data))
             .attr("stroke", MULTI_LINE_CHART_KILLS_COLOR)
             .attr("stroke-width", 2)
             .attr("fill", "none");

         const lineGraphKillsLength = lineGraphKills.node().getTotalLength();
         lineGraphKills
              .attr("stroke-dasharray", lineGraphKillsLength + " " + lineGraphKillsLength)
              .attr("stroke-dashoffset", lineGraphKillsLength)
              .transition()
              .duration(1000)
              .ease("cubic")
              .attr("stroke-dashoffset", 0);

          // dots
          updateMultiLineChartDot(countryCode, countryName);
    }

    // drawMultiLineChart(activeCountry);
    drawMultiLineChart('DZA', 'Algeria');


    // TODO: add legend
}


/******************************
 *	INFO MODAL	 			  *
 ******************************/
$("#modalTrigger").click(function() {
    $("#modal-wrap").css("display", "block");
    console.log("KLIK");
});
$("#close-modal").click(function() {
    $("#modal-wrap").css("display", "none");
});
// close pop up if clicked outside
var specifiedElement = document.getElementById('modal');
var offerteTrigger = document.getElementById("modalTrigger");
if (specifiedElement) {
    document.addEventListener('click', function(event) {
        var isClickInside = specifiedElement.contains(event.target) || offerteTrigger.contains(event.target);

        if (!isClickInside) {
            $("#modal-wrap").css("display", "none");
        }
    });
}

d3.queue()
    .defer(d3.json, "data/terror-min.json")
    .defer(d3.json, "data/migrations3.json")
    .await(makeVisualization);
