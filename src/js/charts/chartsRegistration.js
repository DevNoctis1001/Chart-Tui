'use strict';

var chartConst = require('../const');
var chartFactory = require('../factories/chartFactory');
var BarChart = require('./barChart');
var ColumnChart = require('./columnChart');
var LineChart = require('./lineChart');
var AreaChart = require('./areaChart');
var ColumnLineComboChart = require('./columnLineComboChart');
var LineScatterComboChart = require('./lineScatterComboChart');
var LineAreaComboChart = require('./lineAreaComboChart');
var PieDonutComboChart = require('./pieDonutComboChart');
var PieChart = require('./pieChart');
var BubbleChart = require('./bubbleChart');
var ScatterChart = require('./scatterChart');
var HeatmapChart = require('./heatmapChart');
var TreemapChart = require('./treemapChart');
var MapChart = require('./mapChart');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN, ColumnChart);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChart);
chartFactory.register(chartConst.CHART_TYPE_AREA, AreaChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN_LINE_COMBO, ColumnLineComboChart);
chartFactory.register(chartConst.CHART_TYPE_LINE_SCATTER_COMBO, LineScatterComboChart);
chartFactory.register(chartConst.CHART_TYPE_LINE_AREA_COMBO, LineAreaComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE_DONUT_COMBO, PieDonutComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE, PieChart);
chartFactory.register(chartConst.CHART_TYPE_BUBBLE, BubbleChart);
chartFactory.register(chartConst.CHART_TYPE_SCATTER, ScatterChart);
chartFactory.register(chartConst.CHART_TYPE_HEATMAP, HeatmapChart);
chartFactory.register(chartConst.CHART_TYPE_TREEMAP, TreemapChart);
chartFactory.register(chartConst.CHART_TYPE_MAP, MapChart);
