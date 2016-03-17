/**
 * @fileoverview Axis range.
 * @auth NHN Ent.
 *       FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('./predicate'),
    calculator = require('./calculator'),
    renderUtil = require('./renderUtil');

var abs = Math.abs,
    concat = Array.prototype.concat;

var AxisRange = tui.util.defineClass(/** @lends AxisRange.prototype */{
    /**
     * Axis range.
     * @param {object} params parameters
     * @constructs AxisRange
     */
    init: function(params) {
        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Whether vertical type or not.
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * Whether single yAxis or not.
         * @type {boolean}
         */
        this.isSingleYAxis = !!params.isSingleYAxis;
        /**
         * Count of range values.
         * @type {number}
         */
        this.valueCounts = params.valueCount ? [params.valueCount] : null;

        /**
         * Axis range
         * @type {{limit: {min: number, max: number}, step: number}}
         */
        this.range = null;

        /**
         * Formatted range values.
         * @type {Array.<string | number>}
         */
        this.formattedValues = null;
    },

    /**
     * Get range.
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _getRange: function() {
        if (!this.range) {
            this.range = this._makeRange();
        }

        return this.range;
    },

    /**
     * Get limit.
     * @returns {{min: number, max: number}}
     */
    getLimit: function() {
        return this._getRange().limit;
    },

    /**
     * Whether percent stacked chart or not.
     * @returns {boolean}
     * @private
     */
    _isPercentStackedChart: function() {
        var isAllowedStackedOption = predicate.isAllowedStackedOption(this.chartType),
            isPercentStacked = predicate.isPercentStacked(this.options.stacked);

        return isAllowedStackedOption && isPercentStacked;
    },

    /**
     * Whether normal stacked chart or not.
     * @returns {boolean}
     * @private
     */
    _isNormalStackedChart: function() {
        var isAllowedStackedOption = predicate.isAllowedStackedOption(this.chartType),
            isNormalStacked = predicate.isNormalStacked(this.options.stacked);

        return isAllowedStackedOption && isNormalStacked;
    },

    /**
     * Whether diverging chart or not.
     * @returns {boolean|*}
     * @private
     */
    _isDivergingChart: function() {
        return this.options.diverging && predicate.isBarTypeChart(this.chartType);
    },

    /**
     * Get functions for formatting value.
     * @returns {Array.<function>}
     * @private
     */
    _getFormatFunctions: function() {
        var formatFunctions;

        if (this._isPercentStackedChart()) {
            formatFunctions = [function(value) {
                return value + '%';
            }];
        } else {
            formatFunctions = this.dataProcessor.getFormatFunctions();
        }

        return formatFunctions;
    },

    /**
     * Get range values.
     * @returns {Array.<number>}
     * @private
     */
    _getRangeValues: function() {
        var range = this._getRange(),
            values = calculator.makeLabelsFromLimit(range.limit, range.step);

        return this._isDivergingChart() ? tui.util.map(values, abs) : values;
    },

    /**
     * Get formatted range values.
     * @returns {Array.<string|number>|*}
     */
    getFormattedRangeValues: function() {
        var values, formatFunctions;

        if (!this.formattedValues) {
            values = this._getRangeValues();
            formatFunctions = this._getFormatFunctions();
            this.formattedValues = renderUtil.formatValues(values, formatFunctions);
        }

        return this.formattedValues;
    },

    /**
     * Make base values.
     * @returns {Array.<number>} base values
     * @private
     */
    _makeBaseValues: function() {
        var baseValues;

        if (predicate.isMapChart(this.chartType)) {
            baseValues = this.dataProcessor.getValues();
        } else if (this.isSingleYAxis) {
            baseValues = this.dataProcessor.getWholeGroupValues();
        } else {
            baseValues = this.dataProcessor.getGroupValues(this.chartType);
        }

        if (this._isNormalStackedChart()) {
            baseValues = tui.util.map(baseValues, function(values) {
                var plusSum = calculator.sumPlusValues(values),
                    minusSum = calculator.sumMinusValues(values);
                return [plusSum, minusSum];
            }, this);
        }

        return concat.apply([], baseValues);
    },

    /**
     * Get base size for calculation candidate value counts.
     * @returns {number} base size
     * @private
     */
    _getBaseSize: function() {
        var baseSize;

        if (this.isVertical) {
            baseSize = this.boundsMaker.makeSeriesHeight();
        } else {
            baseSize = this.boundsMaker.makeSeriesWidth();
        }

        return baseSize;
    },

    /**
     * Get candidate value counts.
     * @memberOf module:axisDataMaker
     * @returns {Array.<number>} value counts
     * @private
     */
    _getCandidateValueCounts: function() {
        var minStart = 3,
            valueCounts, baseSize, start, end;

        baseSize = this._getBaseSize();
        start = tui.util.max([minStart, parseInt(baseSize / chartConst.MAX_PIXEL_TYPE_STEP_SIZE, 10)]);
        end = tui.util.max([start, parseInt(baseSize / chartConst.MIN_PIXEL_TYPE_STEP_SIZE, 10)]) + 1;
        valueCounts = tui.util.range(start, end);

        return valueCounts;
    },

    /**
     * Make limit for diverging option.
     * @param {{min: number, max: number}} limit limit
     * @returns {{min: number, max: number}} changed limit
     * @private
     */
    _makeLimitForDivergingOption: function(limit) {
        var newMax = Math.max(abs(limit.min), abs(limit.max));

        return {
            min: -newMax,
            max: newMax
        };
    },

    /**
     * Make integer type info
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit limit
     * @returns {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divideNum: number
     * }} integer type info
     * @private
     */
    _makeIntegerTypeRange: function(limit) {
        var options = this.options.limit || {},
            min = limit.min,
            max = limit.max,
            multipleNum, changedOptions;

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                limit: limit,
                options: options,
                divideNum: 1
            };
        }

        multipleNum = tui.util.findMultipleNum(min, max);
        changedOptions = {};

        if (!tui.util.isUndefined(options.min)) {
            changedOptions.min = options.min * multipleNum;
        }

        if (!tui.util.isUndefined(options.max)) {
            changedOptions.max = options.max * multipleNum;
        }

        return {
            limit: {
                min: min * multipleNum,
                max: max * multipleNum
            },
            options: changedOptions,
            divideNum: multipleNum
        };
    },

    /**
     * Make limit if equal min and max.
     * @param {{min: number, max: number}} limit limit
     * @returns {{min: number, max: number}} changed limit
     * @private
     */
    _makeLimitIfEqualMinMax: function(limit) {
        var min = limit.min,
            max = limit.max;

        if (min > 0) {
            min = 0;
        } else if (min < 0) {
            max = 0;
        }

        return {
            min: min,
            max: max
        };
    },

    /**
     * Make base limit
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} dataLimit user limit
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number}} base limit
     * @private
     */
    _makeBaseLimit: function(dataLimit, options) {
        var isMinus = false,
            min = dataLimit.min,
            max = dataLimit.max,
            baseLimit, tmpMin;

        if (min === max) {
            baseLimit = this._makeLimitIfEqualMinMax(dataLimit);
        } else {
            if (min < 0 && max <= 0) {
                isMinus = true;
                tmpMin = min;
                min = -max;
                max = -tmpMin;
            }

            baseLimit = calculator.calculateLimit(min, max);

            if (isMinus) {
                tmpMin = baseLimit.min;
                baseLimit.min = -baseLimit.max;
                baseLimit.max = -tmpMin;
            }

            baseLimit.min = !tui.util.isUndefined(options.min) ? options.min : baseLimit.min;
            baseLimit.max = !tui.util.isUndefined(options.max) ? options.max : baseLimit.max;
        }

        return baseLimit;
    },

    /**
     * Normalize min.
     * @memberOf module:axisDataMaker
     * @param {number} min original min
     * @param {number} step range step
     * @returns {number} normalized min
     * @private
     */
    _normalizeMin: function(min, step) {
        var mod = tui.util.mod(min, step),
            normalized;

        if (mod === 0) {
            normalized = min;
        } else {
            normalized = tui.util.subtraction(min, (min >= 0 ? mod : step + mod));
        }
        return normalized;
    },

    /**
     * Make normalized max.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} limit limit
     * @param {number} step range step
     * @param {number} valueCount value count
     * @returns {number} normalized max
     * @private
     */
    _makeNormalizedMax: function(limit, step, valueCount) {
        var minMaxDiff = tui.util.multiplication(step, valueCount - 1),
            normalizedMax = tui.util.addition(limit.min, minMaxDiff),
            maxDiff = limit.max - normalizedMax,
            modDiff, divideDiff;
        // normalize된 max값이 원래의 max값 보다 작을 경우 step을 증가시켜 큰 값으로 만들기
        if (maxDiff > 0) {
            modDiff = maxDiff % step;
            divideDiff = Math.floor(maxDiff / step);
            normalizedMax += step * (modDiff > 0 ? divideDiff + 1 : divideDiff);
        }
        return normalizedMax;
    },

    /**
     * Normalize limit.
     * @param {{min: number, max: number}} limit base limit
     * @param {number} step range step
     * @param {number} valueCount value count
     * @returns {{min: number, max: number}} normalized limit
     * @private
     */
    _normalizeLimit: function(limit, step, valueCount) {
        limit.min = this._normalizeMin(limit.min, step);
        limit.max = this._makeNormalizedMax(limit, step, valueCount);
        return limit;
    },

    /**
     * Decrease minimum value by step value,
     *  when chart type is line or dataMin is minus, options is undefined, minimum values(min, dataMin) are same.
     * Add limit min padding.
     * @param {number} min base min
     * @param {number} dataMin minimum value of user data
     * @param {number} step range step
     * @param {?number} optionMin min option
     * @returns {number} changed min
     * @private
     */
    _decreaseMinByStep: function(min, dataMin, step, optionMin) {
        var isLineChart = predicate.isLineChart(this.chartType),
            isMinusDataMin = dataMin < 0,
            isUndefinedMinOption = tui.util.isUndefined(optionMin),
            isSame = (min === dataMin);

        if ((isLineChart || isMinusDataMin) && isUndefinedMinOption && isSame) {
            min -= step;
        }

        return min;
    },

    /**
     * Increase maximum value by step value,
     *  when chart type is line or dataMin is plus, options is undefined, maximum values(max, dataMax) are same.
     * @param {number} max base max
     * @param {number} dataMax maximum value of user data
     * @param {number} step range step
     * @param {?number} optionMax max option
     * @returns {number} changed max
     * @private
     */
    _increaseMaxByStep: function(max, dataMax, step, optionMax) {
        var isLineChart = predicate.isLineChart(this.chartType),
            isPlusDataMax = dataMax > 0,
            isUndefinedMaxOption = tui.util.isUndefined(optionMax),
            isSame = (max === dataMax);

        if ((isLineChart || isPlusDataMax) && isUndefinedMaxOption && isSame) {
            max += step;
        }

        return max;
    },

    /**
     * Divide range step.
     * @param {{min: number, max: number}} limit limit
     * @param {number} step step
     * @param {number} candidateValueCount candidate valueCount
     * @returns {number} range step
     * @private
     */
    _divideRangeStep: function(limit, step, candidateValueCount) {
        var isEvenStep = ((step % 2) === 0),
            valueCount = calculator.makeLabelsFromLimit(limit, step).length,
            twiceValueCount = (valueCount * 2) - 1,
            diffOrg = abs(candidateValueCount - valueCount),
            diffTwice = abs(candidateValueCount - twiceValueCount);

        // step을 반으로 나누었을 때의 valueCount가 후보로 계산된 candidateValueCount와 인접하면 step을 반으로 나누어 반환합니다.
        if (isEvenStep && diffTwice <= diffOrg) {
            step = step / 2;
        }
        return step;
    },

    /**
     * Minimize range limit.
     * @param {{min: number, max: number}} limit base limit
     * @param {{min: number, max: number}} dataLimit limit of user data
     * @param {number} step range step
     * @param {number} valueCount value count
     * @param {{min: number, max:number}} options limit options of axis
     * @returns {{min: number, max: number}} minimized limit
     * @private
     */
    _minimizeRangeLimit: function(limit, dataLimit, step, valueCount, options) {
        var min = limit.max,
            max = limit.min,
            comparisonMin = tui.util.isUndefined(options.min) ? dataLimit.min - 1 : options.min,
            comparisonMax = tui.util.isUndefined(options.max) ? dataLimit.max + 1 : options.max;

        tui.util.forEachArray(tui.util.range(1, valueCount), function(valueIndex) {
            var changingStep = (step * valueIndex),
                changedMin = max + changingStep,
                changedMax = min - changingStep;

            // limit이 dataLimit 범위를 넘어갈 것으로 예상되는 경우에 변경을 중단함
            if (dataLimit.min <= changedMin && dataLimit.max >= changedMax) {
                return false;
            }

            if (comparisonMin >= changedMin) {
                limit.min = changedMin;
            }

            if (comparisonMax <= changedMax) {
                limit.max = changedMax;
            }

            return true;
        });

        return limit;
    },

    /**
     * Make candidate axis range.
     * @param {{min: number, max: number}} baseLimit base limit
     * @param {{min: number, max: number}} dataLimit limit of user data
     * @param {number} valueCount value count
     * @param {{min: number, max:number}} options limit options of axis
     * @returns {{
     *      limit: {min: number, max: number},
     *      step: number
     * }} range
     * @private
     */
    _makeCandidateRange: function(baseLimit, dataLimit, valueCount, options) {
        var limit = tui.util.extend({}, baseLimit),
            step;

        // 01. 기본 limit 정보로 step 얻기
        step = calculator.calculateStepFromLimit(limit, valueCount);

        // 02. step 정규화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = calculator.normalizeAxisNumber(step);

        // 03. limit 정규화 시키기
        limit = this._normalizeLimit(limit, step, valueCount);

        // 04. line차트의 경우 사용자의 min값이 limit의 min값과 같을 경우, min값을 1 step 감소 시킴
        limit.min = this._decreaseMinByStep(limit.min, dataLimit.min, step, options.min);

        // 04. 사용자의 max값이 scael max와 같을 경우, max값을 1 step 증가 시킴
        limit.max = this._increaseMaxByStep(limit.max, dataLimit.max, step, options.max);

        // 05. axis limit이 사용자 min, max와 거리가 멀 경우 조절
        limit = this._minimizeRangeLimit(limit, dataLimit, step, valueCount, options);

        // 06. 조건에 따라 step값을 반으로 나눔
        step = this._divideRangeStep(limit, step, valueCount);

        return {
            limit: limit,
            step: step
        };
    },

    /**
     * Make candidates about axis range.
     * @param {{
     *      limit: {min: number, max: number},
     *      options: {min: number, max: number},
     *      divideNum: number
     * }} integerTypeRange integer type axis range
     * @param {Array.<number>} valueCounts value counts
     * @returns {Array.<{limit:{min: number, max: number}, stpe: number}>} candidates range
     * @private
     */
    _makeCandidateRanges: function(integerTypeRange, valueCounts) {
        var self = this,
            dataLimit = integerTypeRange.limit,
            options = integerTypeRange.options,
            baseLimit = this._makeBaseLimit(dataLimit, options);

        return tui.util.map(valueCounts, function(valueCount) {
            return self._makeCandidateRange(baseLimit, dataLimit, valueCount, options);
        });
    },

    /**
     * Get comparing value for selecting axis range.
     * @param {{min: number, max: number}} baseLimit limit
     * @param {{limit: {min: number, max: number}, step: number}} candidateRange range
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(baseLimit, candidateRange) {
        var diffMax = abs(candidateRange.limit.max - baseLimit.max),
            diffMin = abs(baseLimit.min - candidateRange.limit.min),
            // 소수점 이하 길이가 길 수록 가중치가 증가됨 (가중치가 크면 후보에서 제외될 가능성이 높음)
            weight = Math.pow(10, tui.util.lengthAfterPoint(candidateRange.step));

        return (diffMax + diffMin) * weight;
    },

    /**
     * Select axis range.
     * @param {{min: number, max: number}} baseLimit limit
     * @param {Array.<{limit: {min: number, max: number}, step: number}>} candidates range candidates
     * @returns {{limit: {min: number, max: number}, step: number}} selected range
     * @private
     */
    _selectAxisRange: function(baseLimit, candidates) {
        var getComparingValue = tui.util.bind(this._getComparingValue, this, baseLimit),
            // 비교값이 가장 작은 후보가 선정됨
            axisRange = tui.util.min(candidates, getComparingValue);
        return axisRange;
    },

    /**
     * Restore number state of range.
     * @memberOf module:axisDataMaker
     * @param {{limit: {min: number, max: number}, step: number}} range range
     * @param {number} divideNum divide num
     * @returns {{limit: {min: number, max: number}, step: number}} restored range
     * @private
     */
    _restoreNumberState: function(range, divideNum) {
        if (divideNum === 1) {
            return range;
        }

        range.step = tui.util.division(range.step, divideNum);
        range.limit.min = tui.util.division(range.limit.min, divideNum);
        range.limit.max = tui.util.division(range.limit.max, divideNum);

        return range;
    },

    /**
     * Calculate range.
     * @returns {{limit: {min: number, max: number}, step: number}}
     * @private
     */
    _calculateRange: function() {
        var baseValues = this._makeBaseValues(),
            dataLimit = {
                min: tui.util.min(baseValues),
                max: tui.util.max(baseValues)
            },
            integerTypeRange, valueCounts, candidates, range;

        if (dataLimit.min === 0 && dataLimit.max === 0) {
            dataLimit.max = 5;
        }

        if (this._isDivergingChart()) {
            dataLimit = this._makeLimitForDivergingOption(dataLimit);
        }

        // 01. limit, options 정보를 정수형으로 변경
        integerTypeRange = this._makeIntegerTypeRange(dataLimit);

        // 02. value count 후보군 얻기
        valueCounts = this.valueCounts || this._getCandidateValueCounts();

        // 03. axis range 후보군 얻기
        candidates = this._makeCandidateRanges(integerTypeRange, valueCounts);

        // 04. axis range 후보군 중 하나 선택
        range = this._selectAxisRange(integerTypeRange.limit, candidates);

        // 05. 정수형으로 변경했던 range를 원래 형태로 변경
        range = this._restoreNumberState(range, integerTypeRange.divideNum);

        return range;
    },

    /**
     * Calculate minus sum about group values.
     * @returns {number}
     * @private
     */
    _calculateMinusSum: function() {
        var groupValues;

        if (this.isSingleYAxis) {
            groupValues = this.dataProcessor.getWholeGroupValues();
        } else {
            groupValues = this.dataProcessor.getGroupValues(this.chartType);
        }

        return calculator.sumMinusValues(concat.apply([], groupValues));
    },

    /**
     * Get percent stacked range.
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _getPercentStackedRange: function() {
        var minusSum = this._calculateMinusSum(),
            range;

        if (minusSum === 0) {
            range = chartConst.PERCENT_STACKED_AXIS_RANGE;
        } else if (this._isDivergingChart()) {
            range = chartConst.DIVERGING_PERCENT_STACKED_AXIS_RANGE;
        } else {
            range = chartConst.NEGATIVE_PERCENT_STACKED_AXIS_RANGE;
        }

        return range;
    },

    /**
     * Make range.
     * @returns {{limit: {min:number, max:number}, step: number}}
     * @private
     */
    _makeRange: function() {
        var range;

        if (this._isPercentStackedChart()) {
            range = this._getPercentStackedRange();
        } else {
            range = this._calculateRange();
        }

        return range;
    }
});

module.exports = AxisRange;
