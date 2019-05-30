
function calendarHeatmap() {
  // defaults
  var width = 750;
  var height = 110;
  var legendWidth = 125;
  var selector = 'body';
  var SQUARE_LENGTH = 13;
  var SQUARE_PADDING = 1;
  var MONTH_LABEL_PADDING = 6;
  var now = moment().endOf('day').toDate();
  var yesterday = moment().endOf('day').subtract(1, 'days').toDate();
  var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
  var startDate = null;
  var counterMap= {};
  var data = [];
  var max = null;
  var colorRange = ['#bcd9d8', '#218380'];
  var tooltipEnabled = true;
  var tooltipUnit = 'contribution';
  var legendEnabled = true;
  var onClick = null;
  var weekStart = 0; //0 for Sunday, 1 for Monday
  var onMouseOver = null;
  var onMouseOut = null;
  var locale = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
  };
  var v = Number(d3.version.split('.')[0]);
  var dateRange;

  var blankColor = '#fbfcfc';
  var zeroColor = '#fbfcfc';
  var futureColor = '#f1f2f3';

  // setters and getters
  chart.dateRange = function(value) {
    if (!arguments.length) { return dateRange; }
    dateRange = value;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) { return width; }
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) { return height; }
    height = value;
    return chart;
  };

  chart.data = function (value) {
    if (!arguments.length) { return data; }
    data = value;
    counterMap= {};
    data.forEach(function (element, index) {
      var key= moment(element.date).format( 'YYYY-MM-DD' );
      var counter= counterMap[key] || 0;
      counterMap[key]= counter + element.count;
    });

    return chart;
  };

  chart.max = function (value) {
    if (!arguments.length) { return max; }
    max = value;
    return chart;
  };

  chart.selector = function (value) {
    if (!arguments.length) { return selector; }
    selector = value;
    return chart;
  };

  chart.startDate = function (value) {
    if (!arguments.length) { return startDate; }
    yearAgo = value;
    now = moment(value).endOf('day').add(1, 'year').toDate();
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) { return colorRange; }
    colorRange = value;
    return chart;
  };

  chart.tooltipEnabled = function (value) {
    if (!arguments.length) { return tooltipEnabled; }
    tooltipEnabled = value;
    return chart;
  };

  chart.tooltipUnit = function (value) {
    if (!arguments.length) { return tooltipUnit; }
    tooltipUnit = value;
    return chart;
  };

  chart.legendEnabled = function (value) {
    if (!arguments.length) { return legendEnabled; }
    legendEnabled = value;
    return chart;
  };

  chart.onClick = function (value) {
    if (!arguments.length) { return onClick(); }
    onClick = value;
    return chart;
  };

  chart.locale = function (value) {
    if (!arguments.length) { return locale; }
    locale = value;
    return chart;
  };

  chart.onMouseOver = function (value) {
    if (!arguments.length) { return onMouseOver; }
    onMouseOver = value;
    return chart;
  };

  chart.onMouseOut = function (value) {
    if (!arguments.length) { return onMouseOut; }
    onMouseOut = value;
    return chart;
  };

  function chart() {
    // remove the existing chart, if it exists
    d3.select(chart.selector()).selectAll('svg.calendar-heatmap').remove();
    if(!chart.dateRange()) {
      // generates an array of date objects within the specified range
      dateRange = d3.time.days(yearAgo, yesterday);
    }

    // remove data outside the date range
    var start = dateRange[0];
    var end = dateRange[dateRange.length - 1];

    data = data.filter(function(d) {
      return (d.date > start || d.date.getTime() === start.getTime()) &&
      (d.date < end || d.date.getTime() === end.getTime());
    });

    var monthRange = d3.time.months(moment(dateRange[0]).startOf('month').toDate(), dateRange[dateRange.length - 1]); // it ignores the first month if the 1st date is after the start of the month
    var firstDate = moment(dateRange[0]);
    if (chart.data().length == 0) {
      max = 10;
    } else if (max === null) {
      max = d3.max(chart.data(), function (d) { return d.count; }); // max data value
    }

    // color range
    var color = ((d3.scale && d3.scale.linear) || d3.scaleLinear)()
      .range(chart.colorRange())
      .domain([0, max]);

    var tooltip;
    var dayRects;

    drawChart();

    function drawChart() {
      var svg = d3.select(chart.selector())
        .style('position', 'relative')
        .append('svg')
        .attr('width', width)
        .attr('class', 'calendar-heatmap')
        .attr('height', height)
        .style('padding', '18px 36px');

      dayRects = svg.selectAll('.day-cell')
        .data(dateRange);  //  array of days for the last yr

      var enterSelection = dayRects.enter().append('rect')
        .attr('class', 'day-cell')
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('fill', blankColor)
        .attr('x', function (d, i) {
          var cellDate = moment(d);
          var result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return result * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr('y', function (d, i) {
          return MONTH_LABEL_PADDING + formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING);
        });

      if (typeof onClick === 'function') {
        (v === 3 ? enterSelection : enterSelection.merge(dayRects)).on('click', function(d) {
          onClick(dataForDate(d));
        });
      }

      if (typeof onMouseOver === 'function' && typeof onMouseOut === 'function') {
        (v === 3 ? enterSelection : enterSelection.merge(dayRects)).on('mouseover', function (d) {
          onMouseOver.call(this, dataForDate(d));
        })
        .on('mouseout', function (d) {
          onMouseOut.call(this, dataForDate(d));
        });
      } else if (chart.tooltipEnabled()) {
        (v === 3 ? enterSelection : enterSelection.merge(dayRects)).on('mouseover', function(d, i) {
          tooltip = d3.select(chart.selector())
            .append('div')
            .attr('class', 'day-cell-tooltip')
            .html(tooltipHTMLForDate(d))
            .style('left', function () { return Math.floor(i / 7) * SQUARE_LENGTH + 'px'; })
            .style('top', function () {
              return formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING) + MONTH_LABEL_PADDING * 2 + 'px';
            });
        })
        .on('mouseout', function (d, i) {
          tooltip.remove();
        });
      }

      if (chart.legendEnabled()) {
        var colorRange = [zeroColor, color(0)];
        for (var i = 3; i > 0; i--) {
          colorRange.push(color(max / i));
        }

        var legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-legend')
            .data(colorRange)
            .enter()
          .append('rect')
            .attr('class', 'calendar-heatmap-legend')
            .attr('width', SQUARE_LENGTH)
            .attr('height', SQUARE_LENGTH)
            .attr('x', function (d, i) { return (width - legendWidth) + (i + 1) * (SQUARE_LENGTH + 2); })
            .attr('y', height + SQUARE_PADDING)
            .attr('fill', function (d) { return d; });

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-less')
          .attr('x', width - legendWidth - 13)
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.Less);

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-more')
          .attr('x', (width - legendWidth + SQUARE_PADDING) + (colorRange.length + 1) * (SQUARE_LENGTH + 2))
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.More);
      }

      var daysOfChart = chart.data().map(function(day){
        return day.date.toDateString();
      });

      // color future dates with no data using light color and prevent user interactions on them
      dayRects.filter(function(d) {
          return d > yesterday && daysOfChart.indexOf(d.toDateString()) <= -1;
        })
        .attr('fill', futureColor)
        .on('mouseover', null)
        .on('mouseout', null)
        .classed('future', true)
        .style('pointer-events', 'none');

      dayRects.filter(function(d) {
        return daysOfChart.indexOf(d.toDateString()) > -1;
        })
        .attr('fill', function(d, i) {
          return countForDate(d) ? color(countForDate(d)) : zeroColor;
        });

      dayRects.exit().remove();
      var monthLabels = svg.selectAll('.month')
          .data(monthRange)
          .enter().append('text')
          .attr('class', 'month-name')
          .text(function (d) {
            return locale.months[d.getMonth()];
          })
          .attr('x', function (d, i) {
            var matchIndex = 0;
            dateRange.find(function (element, index) {
              matchIndex = index;
              return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
            });
            // center month label in month box
            var startPos = (matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING);
            return startPos + (SQUARE_LENGTH + SQUARE_PADDING) * 2.5;
          })
          .attr('y', 0);  // fix these to the top

      locale.days.forEach(function (day, index) {
        index = formatWeekday(index);
        if (index % 2) {
          svg.append('text')
            .attr('class', 'day-initial')
            .attr('transform', 'translate(-8,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
            .style('text-anchor', 'end')
            .attr('dy', '2')
            .text(day);
        }
      });

      // month border
      var year = dateRange[0].getFullYear();
      svg.append('g')
        .attr('transform', 'translate(-1,' + (MONTH_LABEL_PADDING-1) + ')')
        .selectAll('.monthpath')
        .data(d3.time.months(new Date(year, 0, 1), new Date(year + 1, 0, 1)))
        .enter().append('path')
        .attr('class', 'monthpath')
        .attr('d', monthPath);

    }

    function pluralizedTooltipUnit (count) {
      if ('string' === typeof tooltipUnit) {
        return (tooltipUnit + (count === 1 ? '' : 's'));
      }
      for (var i in tooltipUnit) {
        var _rule = tooltipUnit[i];
        var _min = _rule.min;
        var _max = _rule.max || _rule.min;
        _max = _max === 'Infinity' ? Infinity : _max;
        if (count >= _min && count <= _max) {
          return _rule.unit;
        }
      }
    }

    function tooltipHTMLForDate(d) {
      var dateStr = moment(d).format('ddd, MMM Do YYYY');
      var count = countForDate(d);
      return '<span><strong>' + (count ? count : locale.No) + ' ' + pluralizedTooltipUnit(count) + '</strong> ' + locale.on + ' ' + dateStr + '</span>';
    }

    function countForDate(d) {
        var key= moment(d).format( 'YYYY-MM-DD' );
        return counterMap[key] || 0;
    }

    function dataForDate(d) {
      var match = chart.data().find(function (element, index) {
        return moment(element.date).isSame(d, 'day');
      });
      if (match) {
        return match;
      }
      return {
        date: d,
        count: 0
      };
    }

    function formatWeekday(weekDay) {
      if (weekStart === 1) {
        if (weekDay === 0) {
          return 6;
        } else {
          return weekDay - 1;
        }
      }
      return weekDay;
    }

    // https://bl.ocks.org/mbostock/4063318 MAGIC
    function monthPath(t0) {
      var cellSize = SQUARE_LENGTH + SQUARE_PADDING;
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
          d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
      return 'M' + (w0 + 1) * cellSize + ',' + d0 * cellSize +
          'H' + w0 * cellSize + 'V' + 7 * cellSize +
          'H' + w1 * cellSize + 'V' + (d1 + 1) * cellSize +
          'H' + (w1 + 1) * cellSize + 'V' + 0 +
          'H' + (w0 + 1) * cellSize + 'Z';
    }
  }

  return chart;
}


// polyfill for Array.find() method
/* jshint ignore:start */
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
/* jshint ignore:end */
