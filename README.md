## This project is not actively maintained

# D3 Calendar Heatmap

This repo is forked from [calendar-heatmap](https://github.com/DKirwan/calendar-heatmap), with a few additional features and modificaitons:

* Support custom mouseover and mouseout event handlers
* Support custom date range (using start and end dates)
* UI and color scheme changes

A [d3.js](https://d3js.org/) heatmap representing time series data. Inspired by Github's contribution chart

![Reusable D3.js Calendar Heatmap chart](https://raw.githubusercontent.com/DKirwan/calendar-heatmap/develop/example/thumbnail.png)

## TODO

* ~~Enable/disable tooltip~~
* ~~Editing of tooltip text~~
* ~~Editing of the cell gradient colours~~
* ~~Configuration of the start/end dates~~
* ~~Add optional callback for click events on the day cells~~
* ~~Add project to bower~~
* Remove example and vendor folders to separate `gh-pages` branch

## Configuration

|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Chart data | none | yes |
| dateRange | Array of continuous dates from start to end (see example below) | a year ago to now | no |
| selector | DOM selector to attach the chart to | body | no |
| selector | DOM selector to attach the chart to | body | no |
| max | Maximum count | max found in data | no |
| startDate | Date to start heatmap at | 1 year ago | no |
| colorRange | Minimum and maximum chart gradient colors | ['#D8E6E7', '#218380'] | no |
| tooltipEnabled | Option to render a tooltip | true | no |
| tooltipUnit | Unit to render on the tooltip, can be object for pluralization control | 'contributions' | no |
| legendEnabled | Option to render a legend | true | no |
| onClick | callback function on day click events (see example below) | null | no |
| onMouseOver | callback function on day mouseover events (see example below) | null | no |
| onMouseOut | callback function on day mouseout events (see example below) | null | no |
| locale | Object to translate every word used, except for tooltipUnit | see below | no |

### Default locale object

```javascript
{
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
}
```

## Dependencies

* [d3.js](https://d3js.org/)
* [moment.js](http://momentjs.com/)

## Usage

1: Add d3.js and moment.js

2: Include calendar-heatmap.js and calendar-heatmap.css
`<link rel="stylesheet" type="text/css" href="path/tocalendar-heatmap.css">`
`<script src="path/to/calendar-heatmap.js"></script>`

3: Format the data so each array item has a `date` and `count` property.
As long as `new Date()` can parse the date string it's ok. Note - there all data should be rolled up into daily bucket granularity.

4: Configure the chart and render it
```javascript
// chart data example
var chartData = [{
  date: valid Javascript date object,
  count: Number
}];
var chart1 = calendarHeatmap()
              .data(chartData)
              .dateRange(d3.time.days(new Date(2016, 0, 1), new Date(2017, 0, 1))
              .selector('#chart-one')
              .colorRange(['#D8E6E7', '#218380'])
              .tooltipEnabled(true)
              .onClick(function (data) {
                console.log('onClick callback. Data:', data);
              })
              .onMouseOver(function(data) {
                // you can access the element via this
                console.log('onMouseOver callback. Data:', data);
              })
              .onMouseOut(function(data) {
                // you can access the element via this
                console.log('onMouseOut callback. Data:', data);
              });
chart1();  // render the chart
```

### control unit pluralization

```javascript
var chart1 = calendarHeatmap()
              .data(chartData)
              .tooltipUnit(
                [
                  {min: 0, unit: 'contribution'},
                  {min: 1, max: 1, unit: 'contribution'},
                  {min: 2, max: 'Infinity', unit: 'contributions'}
                ]
              );
chart1();  // render the chart
```

## Pull Requests and issues

...are very welcome!
