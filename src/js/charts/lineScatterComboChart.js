/**
 * @fileoverview Line and Scatter Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var axisTypeMixer = require('./axisTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');

var LineSeries = require('../components/series/lineChartSeries');
var ScatterSeries = require('../components/series/scatterChartSeries');
var CustomEvent = require('../components/customEvents/areaTypeCustomEvent');

var LineScatterComboChart = tui.util.defineClass(ChartBase, /** @lends LineScatterComboChart.prototype */ {
    /**
     * Line and Scatter Combo chart.
     * @constructs LineScatterComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     */
    init: function(rawData, theme, options) {
        /**
         * chart types map
         * @type {Object}
         */
        this.chartTypes = ['line', 'scatter'];

        /**
         * series names
         * @type {Object|Array.<T>}
         */
        this.seriesNames = ['line', 'scatter'];

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * Add components.
     * @private
     */
    _addComponents: function() {
        var optionsMap = this._makeOptionsMap(this.seriesNames);

        this._addPlotComponent(this.options.xAxis.type);
        this._addAxisComponents([
            {
                name: 'yAxis',
                seriesName: this.seriesNames[0],
                isVertical: true
            },
            {
                name: 'xAxis'
            }
        ], false);
        this._addLegendComponent({}, this.seriesNames);
        this._addSeriesComponents([
            {
                name: 'lineSeries',
                SeriesClass: LineSeries,
                data: {
                    allowNegativeTooltip: true,
                    chartType: 'line',
                    seriesName: 'line',
                    options: optionsMap.line
                }
            },
            {
                name: 'scatterSeries',
                SeriesClass: ScatterSeries,
                data: {
                    allowNegativeTooltip: true,
                    chartType: 'scatter',
                    seriesName: 'scatter',
                    options: optionsMap.scatter
                }
            }
        ], this.options);

        this.componentManager.register('customEvent', CustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            allowSelect: this.options.series.allowSelect
        });

        this._addTooltipComponent();
    },

    /**
     * Get scale option.
     * @returns {{
     *      yAxis: {valueType: string, additionalOptions: {isSingleYAxis: boolean}},
     *      xAxis: {valueType: string}
     * }}
     * @private
     * @override
     */
    _getScaleOption: function() {
        return {
            yAxis: {
                valueType: 'y'
            },
            xAxis: {
                valueType: 'x'
            }
        };
    }
});

tui.util.extend(LineScatterComboChart.prototype, axisTypeMixer, comboTypeMixer);

module.exports = LineScatterComboChart;
