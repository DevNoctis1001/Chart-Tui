/**
 * @fileoverview barTypeMixer is mixer of bar type chart(bar, column).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    rawDataHandler = require('../helpers/rawDataHandler'),
    predicate = require('../helpers/predicate');

/**
 * barTypeMixer is mixer of bar type chart(bar, column).
 * @mixin
 */
var barTypeMixer = {
    /**
     * Make minus values.
     * @param {Array.<number>} data number data
     * @returns {Array} minus values
     * @private
     */
    _makeMinusValues: function(data) {
        return tui.util.map(data, function(value) {
            return value < 0 ? 0 : -value;
        });
    },

    /**
     * Make plus values.
     * @param {Array.<number>} data number data
     * @returns {Array} plus values
     * @private
     */
    _makePlusValues: function(data) {
        return tui.util.map(data, function(value) {
            return value < 0 ? 0 : value;
        });
    },

    /**
     * Make normal diverging raw series data.
     * @param {{data: Array.<number>}} rawSeriesData raw series data
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeNormalDivergingRawSeriesData: function(rawSeriesData) {
        rawSeriesData.length = Math.min(rawSeriesData.length, 2);

        rawSeriesData[0].data = this._makeMinusValues(rawSeriesData[0].data);

        if (rawSeriesData[1]) {
            rawSeriesData[1].data = this._makePlusValues(rawSeriesData[1].data);
        }

        return rawSeriesData;
    },

    /**
     * Make stacked diverging raw series data.
     * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeStackedDivergingRawSeriesData: function(rawSeriesData) {
        var self = this,
            stacks = rawDataHandler.pickStacks(rawSeriesData),
            result = [],
            leftStack = stacks[0],
            rightStack = stacks[1];

        rawSeriesData = rawDataHandler.sortSeriesData(rawSeriesData, stacks);

        tui.util.forEachArray(rawSeriesData, function(seriesDatum) {
            var stack = seriesDatum.stack || chartConst.DEFAULT_STACK;
            if (stack === leftStack) {
                seriesDatum.data = self._makeMinusValues(seriesDatum.data);
                result.push(seriesDatum);
            } else if (stack === rightStack) {
                seriesDatum.data = self._makePlusValues(seriesDatum.data);
                result.push(seriesDatum);
            }
        });
        return result;
    },

    /**
     * Make raw series data for diverging.
     * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
     * @param {?string} stackedOption stacked option
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeRawSeriesDataForDiverging: function(rawSeriesData, stackedOption) {
        if (predicate.isValidStackedOption(stackedOption)) {
            rawSeriesData = this._makeStackedDivergingRawSeriesData(rawSeriesData);
        } else {
            rawSeriesData = this._makeNormalDivergingRawSeriesData(rawSeriesData);
        }

        return rawSeriesData;
    },

    _sortRawSeriesData: function(rawData) {
        var stacks = rawDataHandler.pickStacks(rawData.series);

        return rawDataHandler.sortSeriesData(rawData.series, stacks);
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = barTypeMixer;
