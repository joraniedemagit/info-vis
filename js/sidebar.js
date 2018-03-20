let countryOfOriginChart = null;
let terrorGroupsChart = null;
let targetTypesChart = null;
let attackTypesChart = null;

function updateSidebar(countryName, totalKilled, sumMigrations, targetTypes, attackTypes, terrorGroups, migrationFlows=null) {
    // console.log('🦖countryName', countryName);
    // console.log('totalKilled', totalKilled);
    // console.log('sumMigrations', sumMigrations);
    // console.log('targetTypes', targetTypes);
    // console.log('attackTypes', attackTypes);
    // console.log('terrorGroups', terrorGroups);

    const sidebarCountry = countryName
        ? countryName
        : "All countries";
    const formatComma = d3.format(",");
    d3.select("#sidebar-country").text(sidebarCountry);
    const totalImmigrants = !isNaN(sumMigrations) ? formatComma(sumMigrations) : '-';
    d3.select("#sidebar-migration").text("Total immigrants: " + totalImmigrants);

    // Country Of Origin Chart
    if (migrationFlows && !$.isEmptyObject(migrationFlows)) {
        const countryOfOriginChartData = getTopValues(migrationFlows, 3);
        d3.select("#countryOfOriginChart").style("display","inherit");
        if (countryOfOriginChart) {
            countryOfOriginChart.destroy();
        }
        countryOfOriginChart = createCountryOfOriginChart(countryOfOriginChartData.labels, countryOfOriginChartData.data);
    } else {
        d3.select("#countryOfOriginChart").style("display", "none");
    }

    // Terror Organisations Chart
    if (terrorGroups) {
        const terrorGroupsChartData = getTopValues(terrorGroups);
        if (terrorGroupsChart) {
            terrorGroupsChart.destroy();
        }
        terrorGroupsChart = createTerrorOrganisationsChart(terrorGroupsChartData.labels, terrorGroupsChartData.data);
    }
    else {
        d3.select("#terrorOrganisationsChart").style("display", "none");
    }

    // Target Types Chart
    if (targetTypes) {
        const targetTypesChartData = getTopValues(targetTypes, 3);
        if (targetTypesChart) {
            targetTypesChart.destroy();
        }
        targetTypesChart = createTargetTypesChart(targetTypesChartData.labels, targetTypesChartData.data);
    }
    else {
        d3.select("#targetTypesChart").style("display", "none");
    }

    // Attack Types Chart
    if (attackTypes) {
        const attackTypesChartData = getTopValues(attackTypes, 3);
        if (attackTypesChart) {
            attackTypesChart.destroy();
        }
        attackTypesChart = createAttackTypesChart(attackTypesChartData.labels, attackTypesChartData.data);
    }
    else {
        d3.select("#attackTypesChart").style("display", "none");
    }

    // show label if no records are found
    const noMigrationRecords = d3.select("#no-migration-records");
    if (!migrationFlows || $.isEmptyObject(migrationFlows)) {
        console.log('No migration flows');
        noMigrationRecords.style("display", "inherit");
    } else {
        noMigrationRecords.style("display", "none");
    }
    const noTerrorRecords = d3.select("#no-terror-records");
    if (!terrorGroups && !targetTypes && !attackTypes) {
        noTerrorRecords.style("display", "inherit");
    } else {
        noTerrorRecords.style("display", "none");
    }
};

function getTopValues(obj, n=5) {
    const keysSorted = Object.keys(obj).sort( (a, b) => obj[b]-obj[a]);
    const labels = keysSorted.slice(0, n);
    const data = labels.map(l => obj[l]);
    if (keysSorted.length > n) {
        const otherLabels = keysSorted.slice(n, keysSorted.length);
        const otherSum = d3.sum(otherLabels.map(l => obj[l]));
        labels.push('Other');
        data.push(otherSum);
    }
    return {
        labels,
        data
    }
}

function createCountryOfOriginChart(labels, data) {
    const ctx = document.getElementById("countryOfOriginChart");
    ctx.height = 150;
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: transparentColors,
                borderColor: opaqueColors,
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Immigrants'
            }
        }
    });
    return chart;
}

function createTerrorOrganisationsChart(labels, data) {
    const ctx = document.getElementById("terrorOrganisationsChart");
    ctx.height = 150;
    const horizontalBarChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels,
            datasets: [{
                label: 'Committed attacks',
                data,
                backgroundColor: transparentColors,
                borderColor: opaqueColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        callback: (value) => shortenString(value, 10)
                    }
                }]
            },
            tooltips: {
                enabled: true,
                mode: 'label',
                callbacks: {
                    title: (tooltipItems, data) => getTitleLabel(tooltipItems, data)
                }
            },
            title: {
                display: true,
                text: 'Amount of Attacks by Terror Organisations'
            }
        }
    });
    return horizontalBarChart;
}

function createAttackTypesChart(labels, data) {
    const ctx = document.getElementById("targetTypesChart");
    ctx.height = 220;
    const doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: transparentColors,
                borderColor: opaqueColors,
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'bottom'
            },
            title: {
                display: true,
                text: 'Type of Attacks'
            }
        }
    });
    return doughnutChart;
}

function createTargetTypesChart(labels, data) {
    const ctx = document.getElementById("attackTypesChart");
    ctx.height = 220;
    const polarChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: transparentColors,
                borderColor: opaqueColors,
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'bottom'
            },
            title: {
                display: true,
                text: 'Type of Targets'
            }
        }
    });
    return polarChart;
}


const transparentColors = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
];
const opaqueColors =  [
    'rgba(255,99,132,1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
];


function shortenString(value, size) {
    return (value.length > size) ? value.substr(0, size) + '...' : value;
}

function getTitleLabel(tooltipItems, data) {
    const idx = tooltipItems[0].index;
    return data.labels[idx];
}
