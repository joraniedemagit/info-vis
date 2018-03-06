var countries = {};
var migrations = {'1990': [], '1995': [], '2000': [], '2005': [], '2010': [], '2015': [], '2017': []};

var MIGRATION_THRESHOLD = 500000; // min amount of migrants to include a migration

function loadCountriesData() {
  d3.csv("data/cities.csv", function(data) {
    for (var i = 0; i < data.length; i++) {
      var country = data[i].country;
      var city = data[i].city;
      var lat = data[i].lat;
      var lng = data[i].lng;

      var coords = {};

      coords.country = country;
      coords.city = city;
      coords.latitude = lat;
      coords.longitude = lng;

      countries[country] = coords;
    }
  });
}

function loadMigrationData() {
  d3.csv("data/unprocessedMigrations.csv", function(data) {
    for (var i = 0; i < data.length; i++) {
      var country = data[i]['Major area, region, country or area of destination'];
      var year = data[i].Year;
      var origin = countries[country];

      if (country in countries) {
        for (var destination in data[i]) {
          if (destination in countries && destination != country && data[i][destination] > MIGRATION_THRESHOLD) {
            var migrationData = {};

            migrationData.origin = countries[country];
            migrationData.destination = countries[destination];

            migrations[year].push(migrationData);
          }
        }
      }
    }
  });

/* SAVE TO FILE RATHER THAN DOING THE PROCESSING EVERY SINGLE TIME
  var jsonData = JSON.stringify(migrations);
  var fs = require('fs');

  fs.writeFile("migrations.json", jsonData, function(err) {
      if(err) {
          return console.log(err);
      }
  }); */

  console.log(migrations['2015']);
}

function drawMigrations() {
  var map = new Datamap({
      element: document.getElementById('container'),
      scope: 'world',
      geographyConfig: {
          popupOnHover: false,
          highlightOnHover: false
      },
      fills: {
          //node colour
          'Positive': '#007D1C',
          'Negative': '#A51000',
          //map colour
          defaultFill: '#9AAEBF',
      },
      arcConfig: {
          strokeColor: 'black',
          strokeWidth: 10,
          arcSharpness: 1,
          animationSpeed: 600
      },
  });

  map.arc(migrations['2015'],  {strokeWidth: 1, arcSharpness: 1.4});

  var blinks = d3.selectAll('.datamaps-arc');

  blinks.each(function(dl, il) {
      bnodes.each(function(d,i) {
          if (dl.origin.latitude == d.latitude) {
              dl.origin.holderID = d.holderID;
          } else if (dl.destination.longitude == d.longitude) {
              dl.destination.holderID = d.holderID;
          }
      })
  });

  blinks.classed('hide', false);
}

function drawArrows() {
  arcs.enter()
      .append('svg:path')
      .attr('class', 'datamaps-arc')
      .style('stroke-linecap', 'round')
      .style('stroke', function(datum) {
        return val(datum.strokeColor, options.strokeColor, datum);
      })
      .style('fill', 'none')
      .style('stroke-width', function(datum) {
          return val(datum.strokeWidth, options.strokeWidth, datum);
      })
      .attr('d', function(datum) {
          var originXY = self.latLngToXY(val(datum.origin.latitude, datum), val(datum.origin.longitude, datum))
          var destXY = self.latLngToXY(val(datum.destination.latitude, datum), val(datum.destination.longitude, datum));
          var midXY = [ (originXY[0] + destXY[0]) / 2, (originXY[1] + destXY[1]) / 2];
          if (options.greatArc) {
                // TODO: Move this to inside `if` clause when setting attr `d`
            var greatArc = d3.geo.greatArc()
                .source(function(d) { return [val(d.origin.longitude, d), val(d.origin.latitude, d)]; })
                .target(function(d) { return [val(d.destination.longitude, d), val(d.destination.latitude, d)]; });

            return path(greatArc(datum))
          }
          var sharpness = val(datum.arcSharpness, options.arcSharpness, datum);
          return "M" + originXY[0] + ',' + originXY[1] + "S" + (midXY[0] + (50 * sharpness)) + "," + (midXY[1] - (75 * sharpness)) + "," + destXY[0] + "," + destXY[1];
      })
      .transition()
        .delay(100)
        .style('fill', function(datum) {
          /*
            Thank you Jake Archibald, this is awesome.
            Source: http://jakearchibald.com/2013/animated-line-drawing-svg/
          */
          var length = this.getTotalLength();
          this.style.transition = this.style.WebkitTransition = 'none';
          this.style.strokeDasharray = length + ' ' + length;
          this.style.strokeDashoffset = length;
          this.getBoundingClientRect();
          this.style.transition = this.style.WebkitTransition = 'stroke-dashoffset ' + val(datum.animationSpeed, options.animationSpeed, datum) + 'ms ease-out';
          this.style.strokeDashoffset = '0';
          return 'none';
        })

  arcs.exit()
    .transition()
    .style('opacity', 0)
    .remove();
}
