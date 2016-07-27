/**
 * @fileoverview SeriesItem for treemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator');
var renderUtil = require('../helpers/renderUtil');

var SeriesItemForTreemap = tui.util.defineClass(/** @lends SeriesItemForTreemap.prototype */{
    /**
     * SeriesItem for treemap.
     * @constructs SeriesItemForTreemap
     * @param {object} rawSeriesDatum - value
     * @param {?Array.<function>} formatFunctions - format functions
     */
    init: function(rawSeriesDatum, formatFunctions) {
        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;
        this.id = rawSeriesDatum.id;
        this.parent = rawSeriesDatum.parent;
        this.value = rawSeriesDatum.value;
        this.colorValue = rawSeriesDatum.colorValue;
        this.depth = rawSeriesDatum.depth;
        this.label = rawSeriesDatum.label || '';
        this.group = rawSeriesDatum.group;
        this.hasChild = !!rawSeriesDatum.hasChild;
    },

    /**
     * Add ratio.
     * @param {number} divNumber - number for division
     * @param {?number} subNumber - number for subtraction
     */
    addRatio: function(divNumber, subNumber) {
        divNumber = divNumber || 1;
        subNumber = subNumber || 0;

        this.ratio = calculator.calculateRatio(this.colorValue, divNumber, subNumber, 1) || -1;
    },

    /**
     * Pick value map.
     * @returns {{value: number, label: string}}
     */
    pickValueMap: function() {
        var formattedValue = renderUtil.formatValue(this.value, this.formatFunctions, 'makingTooltipLabel');
        var label = (this.label ? this.label + ': ' : '') + formattedValue;

        return {
            value: this.value,
            label: label
        };
    }
});

module.exports = SeriesItemForTreemap;
