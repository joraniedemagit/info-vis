let countryOfOriginChart = null;
let terrorGroupsChart = null;
let targetTypesChart = null;
let attackTypesChart = null;

function updateSidebar(countryName, totalKilled, sumMigrations, targetTypes, attackTypes, terrorGroups, migrationFlows=null) {
    // console.log('🦖', countryName, totalKilled, sumMigrations, targetTypes, attackTypes, terrorGroups);
    const sidebarCountry = countryName
        ? countryName
        : "All countries";
    const formatComma = d3.format(",");
    d3.select("#sidebar-country").text(sidebarCountry);
    const totalImmigrants = !isNaN(sumMigrations) ? formatComma(sumMigrations) : '-';
    d3.select("#sidebar-migration").text("Total immigrants: " + totalImmigrants);

    // Country Of Origin Chart
    if (migrationFlows) {
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
    const terrorGroupsChartData = getTopValues(terrorGroups);
    if (terrorGroupsChart) {
        terrorGroupsChart.destroy();
    }
    terrorGroupsChart = createTerrorOrganisationsChart(terrorGroupsChartData.labels, terrorGroupsChartData.data);

    // Target Types Chart
    const targetTypesChartData = getTopValues(targetTypes, 3);
    if (targetTypesChart) {
        targetTypesChart.destroy();
    }
    targetTypesChart = createTargetTypesChart(targetTypesChartData.labels, targetTypesChartData.data);

    // Attack Types Chart
    const attackTypesChartData = getTopValues(attackTypes, 3);
    if (attackTypesChart) {
        attackTypesChart.destroy();
    }
    attackTypesChart = createAttackTypesChart(attackTypesChartData.labels, attackTypesChartData.data);
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
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: borderColor,
                borderColor,
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'right'
            }
        }
    });
    return chart;
}

function createTerrorOrganisationsChart(labels, data) {
    const ctx = document.getElementById("terrorOrganisationsChart");
    // ctx.height = 300;
    const horizontalBarChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels,
            datasets: [{
                label: '# of committed attacks',
                data,
                backgroundColor,
                borderColor,
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
                        beginAtZero:true
                    }
                }]
            }
        }
    });
    return horizontalBarChart;
}

function createTargetTypesChart(labels, data) {
    const ctx = document.getElementById("attackTypesChart");
    const polarChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: borderColor,
                borderColor,
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: false
            }
        }
    });
    return polarChart;
}

function createAttackTypesChart(labels, data) {
    const ctx = document.getElementById("targetTypesChart");
    const doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: borderColor,
                borderColor,
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'right'
            }
        }
    });
    return doughnutChart;
}


const backgroundColor = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
];
const borderColor =  [
    'rgba(255,99,132,1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
];
