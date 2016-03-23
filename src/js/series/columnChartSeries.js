/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil'),
    calculator = require('../helpers/calculator');

var ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
    /**
     * Column chart series component.
     * @constructs ColumnChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make bound of column chart.
     * @param {number} width width
     * @param {number} height height
     * @param {number} left top position value
     * @param {number} startTop start top position value
     * @param {number} endTop end top position value
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBound: function(width, height, left, startTop, endTop) {
        return {
            start: {
                top: startTop,
                left: left,
                width: width,
                height: 0
            },
            end: {
                top: endTop,
                left: left,
                width: width,
                height: height
            }
        };
    },

    /**
     * Make column chart bound.
     * @param {{
     *      baseSize: number,
     *      basePosition: number,
     *      step: number,
     *      additionalPosition: ?number,
     *      barSize: number
     * }} baseData base data for making bound
     * @param {{
     *      baseLeft: number,
     *      left: number,
     *      plusTop: number,
     *      minusTop: number,
     *      prevStack: ?string
     * }} iterationData iteration data
     * @param {?boolean} isStacked whether stacked option or not.
     * @param {{value: number, ratio: number, stack: string}} item item
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }}
     * @private
     */
    _makeColumnChartBound: function(baseData, iterationData, isStacked, item, index) {
        var barHeight = Math.abs(baseData.baseBarSize * item.ratio),
            startTop = baseData.basePosition + chartConst.SERIES_EXPAND_SIZE,
            changedStack = (item.stack !== iterationData.prevStack),
            stackIndex, endTop, bound;

        if (!isStacked || (!this.options.diverging && changedStack)) {
            stackIndex = isStacked ? this.dataProcessor.findStackIndex(item.stack) : index;

            iterationData.left = (stackIndex * baseData.step) + iterationData.baseLeft + baseData.additionalPosition;
            iterationData.plusTop = 0;
            iterationData.minusTop = 0;
        }

        if (item.value >= 0) {
            iterationData.plusTop -= barHeight;
            endTop = startTop + iterationData.plusTop;
        } else {
            endTop = startTop + iterationData.minusTop;
            iterationData.minusTop += barHeight;
        }

        iterationData.prevStack = item.stack;
        bound = this._makeBound(baseData.barSize, barHeight, iterationData.left, startTop, endTop);

        return bound;
    },

    /**
     * Make bounds of column chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        var self = this,
            groupItems = this.dataProcessor.getGroupItems(this.chartType),
            isStacked = predicate.isValidStackedOption(this.options.stacked),
            dimension = this.boundsMaker.getDimension('series'),
            baseData = this._makeBaseDataForMakingBound(dimension.width, dimension.height);

        return tui.util.map(groupItems, function(items, groupIndex) {
            var baseLeft = (groupIndex * baseData.groupSize) + baseData.groupPosition
                        + baseData.additionalPosition + chartConst.SERIES_EXPAND_SIZE,
                iterationData = {
                    baseLeft: baseLeft,
                    left: baseLeft,
                    plusTop: 0,
                    minusTop: 0,
                    prevStack: null
                },
                iteratee = tui.util.bind(self._makeColumnChartBound, self, baseData, iterationData, isStacked);

            return tui.util.map(items, iteratee);
        });
    },

    /**
     * Make series rendering position
     * @param {obeject} params parameters
     *      @param {number} params.value value
     *      @param {{left: number, top: number, width:number, width:number, height: number}} params.bound bound
     *      @param {string} params.formattedValue formatted value
     *      @param {number} params.labelHeight label height
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),
            bound = params.bound,
            top = bound.top,
            left = bound.left + (bound.width - labelWidth) / 2;

        if (params.value >= 0) {
            top -= params.labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * Calculate sum label left position.
     * @param {{left: number, top: number}} bound bound
     * @param {string} formattedSum formatted sum.
     * @returns {number} left position value
     * @private
     */
    _calculateSumLabelLeftPosition: function(bound, formattedSum) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);
        return bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
    },

    /**
     * Make plus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus sum label html
     * @private
     */
    _makePlusSumLabelHtml: function(values, bound, labelHeight) {
        var sum, formattedSum,
            html = '';

        if (bound) {
            sum = calculator.sumPlusValues(values);
            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
            html = this._makeSeriesLabelHtml({
                left: this._calculateSumLabelLeftPosition(bound, formattedSum),
                top: bound.top - labelHeight - chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound) {
        var sum, formattedSum,
            html = '';

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
            html = this._makeSeriesLabelHtml({
                left: this._calculateSumLabelLeftPosition(bound, formattedSum),
                top: bound.top + bound.height + chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1, -1);
        }

        return html;
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

module.exports = ColumnChartSeries;
