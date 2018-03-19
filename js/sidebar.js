function updateSidebar(countryName, totalKilled, sumMigrations, targetTypes, attackTypes, terrorGroups) {
    // console.log('🦖', countryName, totalKilled, sumMigrations, targetTypes, attackTypes);
    const sidebarCountry = countryName
        ? countryName
        : "All countries";
    const formatComma = d3.format(",");
    d3.select("#sidebar-country").text(sidebarCountry);
    const totalImmigrants = !isNaN(sumMigrations) ? formatComma(sumMigrations) : '-';
    d3.select("#sidebar-migration").text("Total immigrants: " + totalImmigrants);

    const dummyCountryOfOrigin = {
        'Colombia': 123456,
        'Canada': 234567,
        'Mexico': 345678
    }
    const countryOfOriginChartData = getTopValues(dummyCountryOfOrigin);
    updateCountryOfOriginChart(countryOfOriginChartData.labels, countryOfOriginChartData.data);

    const terrorGroupsChartData = getTopValues(terrorGroups);
    updateTerrorOrganisationsChart(terrorGroupsChartData.labels, terrorGroupsChartData.data);

    const targetTypesChartData = getTopValues(targetTypes);
    updateTargetTypesChart(targetTypesChartData.labels, targetTypesChartData.data);

    const attackTypesChartData = getTopValues(attackTypes);
    updateAttackTypesChart(attackTypesChartData.labels, attackTypesChartData.data);
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

function updateCountryOfOriginChart(labels, data) {
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
            responsive: true
        }
    });
}

function updateTerrorOrganisationsChart(labels, data) {
    const ctx = document.getElementById("terrorOrganisationsChart");
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
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

function updateTargetTypesChart(labels, data) {
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
            responsive: true
        }
    });
}

function updateAttackTypesChart(labels, data) {
    const ctx = document.getElementById("targetTypesChart");
    const myDoughnutChart = new Chart(ctx, {
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
            responsive: true
        }
    });
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
