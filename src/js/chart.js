/**
 * @fileoverview ne chart
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */
'use strict';

var chartFactory = require('./factories/chartFactory.js'),
    pluginFactory = require('./factories/pluginFactory.js');

var neChart = ne.util.defineNamespace('ne.application.chart');

require('./util.js');
require('./views/barChartView.js');

/**
 * Bar chart creator
 * @param {element} container chart container
 * @param {object} data chart data
 * @param {object} options chart options
 * @returns {object}
 */
neChart.barChart = function(container, data, options) {
    var chart;
    options.barType = 'bar';
    chart = chartFactory.get('Bar', data, options);
    container.appendChild(chart.render());
    return chart;
};

/**
 * Column chart creator
 * @param {element} container chart container
 * @param {object} data chart data
 * @param {object} options chart options
 * @returns {object}
 */
neChart.columnChart = function(container, data, options) {
    var chart;
    options.barType = 'column';
    chart = chartFactory.get('Bar', data, options);
    container.appendChild(chart.render());
    return chart;
};

neChart.registPlugin = pluginFactory.register;