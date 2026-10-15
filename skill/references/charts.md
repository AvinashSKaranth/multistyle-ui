# Charts

Needs Chart.js (CDN). Declarative: `<div class="chart" style="--ms-chart-h:260px"><canvas data-ms-chart="bar" data-ms-chart-data='{"labels":["A","B"],"datasets":[{"label":"x","data":[1,2]}]}' role="img" aria-label="..."></canvas></div>`, or `MS.chart(canvas,{type,data,options})`. Types: bar line pie doughnut radar polarArea scatter bubble stacked-bar stacked-line combo. Re-themed on `ms:change`. Update with `Chart.getChart(canvas)`.
