var migrations;

d3.json("data/migrations.json", function(error, data) {
    migrations = data;
});

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
