/**
 * @fileoverview VerticalTypeBase is base class of vertical type chart(column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisDataMaker = require('../helpers/axisDataMaker'),
    state = require('../helpers/state');

/**
 * @classdesc VerticalTypeBase is base class of vertical type chart(column, line, area).
 * @class VerticalTypeBase
 * @mixin
 */
var VerticalTypeBase = ne.util.defineClass(/** @lends VerticalTypeBase.prototype */ {
    /**
     * To make axes data
     * @param {object} convertData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertData, bounds, options, initedData) {
        var axesData = {};
        if (initedData) {
            axesData = initedData.axes;
        } else {
            axesData.yAxis = axisDataMaker.makeValueAxisData({
                values: convertData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertData.formatFunctions,
                options: options.yAxis,
                isVertical: true
            });
            axesData.xAxis = axisDataMaker.makeLabelAxisData({
                labels: convertData.labels,
                aligned: state.isLineTypeChart(this.options.chartType),
                options: options.xAxis
            });
        }
        return axesData;
    }
});

VerticalTypeBase.mixin = function(func) {
    ne.util.extend(func.prototype, VerticalTypeBase.prototype);
};

module.exports = VerticalTypeBase;
