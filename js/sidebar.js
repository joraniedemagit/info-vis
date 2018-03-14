const updateSidebar = (countryName, totalKilled, sumMigrations) => {
    const sidebarCountry = countryName
        ? countryName + " in " + currentYear
        : "All countries in " + currentYear;
    const formatComma = d3.format(",");
    d3.select("#sidebar-country").text(sidebarCountry);
    d3.select("#sidebar-migration").text("Total immigrants: " + formatComma(sumMigrations));
    d3.select("#sidebar-terror").text("Total killed: " + formatComma(totalKilled));
};
