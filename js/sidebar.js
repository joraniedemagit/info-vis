const updateSidebar = (countryName, totalKilled, sumMigrations, targetTypes, attackTypes) => {
    const sidebarCountry = countryName
        ? countryName
        : "All countries";
    const formatComma = d3.format(",");
    d3.select("#sidebar-country").text(sidebarCountry);
    d3.select("#sidebar-migration").text("Total immigrants: " + formatComma(sumMigrations));
    d3.select("#sidebar-targettypes").text("Target Types");
    d3.select("#sidebar-attacktypes").text("Attack Types");
};
