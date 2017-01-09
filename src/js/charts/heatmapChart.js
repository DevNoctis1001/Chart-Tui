/**
 * @fileoverview Heatmap chart is a graphical representation of data where the individual values contained
 *                      in a matrix are represented as colors.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var ColorSpectrum = require('./colorSpectrum');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');

var HeatmapChart = tui.util.defineClass(ChartBase, /** @lends HeatmapChart.prototype */ {
    /**
     *
     * className
     * @type {string}
     */
    className: 'tui-heatmap-chart',
    /**
     * Heatmap chart is a graphical representation of data where the individual values contained
     *      in a matrix are represented as colors.
     * @constructs HeatmapChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        options.tooltip.grouped = false;

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
     * @override
     */
    addComponents: function() {
        var seriesTheme = this.theme.series[this.chartType];
        var colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

        this._addComponentsForAxisType({
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            legend: {
                classType: 'spectrumLegend',
                additionalParams: {
                    colorSpectrum: colorSpectrum
                }
            },
            series: [
                {
                    name: 'heatmapSeries',
                    data: {
                        colorSpectrum: colorSpectrum
                    }
                }
            ],
            tooltip: true,
            mouseEventDetector: true
        });
    },

    /**
     * Get scale option.
     * @returns {{legend: boolean}}
     * @override
     */
    getScaleOption: function() {
        return {
            legend: true
        };
    },
    _addComponentsForAxisType: axisTypeMixer._addComponentsForAxisType,
    _addPlotComponent: axisTypeMixer._addPlotComponent,
    _addLegendComponent: axisTypeMixer._addLegendComponent,
    _addAxisComponents: axisTypeMixer._addAxisComponents,
    _addChartExportMenuComponent: axisTypeMixer._addChartExportMenuComponent,
    _addSeriesComponents: axisTypeMixer._addSeriesComponents,
    _addTooltipComponent: axisTypeMixer._addTooltipComponent,
    _addMouseEventDetectorComponent: axisTypeMixer._addMouseEventDetectorComponent,

    _addMouseEventDetectorComponentForNormalTooltip: axisTypeMixer._addMouseEventDetectorComponentForNormalTooltip
});

/**
 * Add data ratios for rendering graph.
 * @private
 * @override
 */
HeatmapChart.prototype.addDataRatios = function(limitMap) {
    this.dataProcessor.addDataRatios(limitMap.legend, null, this.chartType);
};

module.exports = HeatmapChart;
