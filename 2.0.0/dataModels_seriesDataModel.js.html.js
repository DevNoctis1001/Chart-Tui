tui.util.defineNamespace("fedoc.content", {});
fedoc.content["dataModels_seriesDataModel.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview SeriesDataModel is base model for drawing graph of chart series area,\n *                  and create from rawSeriesData by user,\n * SeriesDataModel.groups has SeriesGroups.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\n/**\n * Raw series datum.\n * @typedef {{name: ?string, data: Array.&lt;number>, stack: ?string}} rawSeriesDatum\n */\n\n/**\n * Raw series data.\n * @typedef {Array.&lt;rawSeriesDatum>} rawSeriesData\n */\n\n/**\n * Groups.\n * @typedef {Array.&lt;SeriesGroup>} groups\n */\n\n/**\n * SeriesGroup is a element of SeriesDataModel.groups.\n * SeriesGroup.items has SeriesItem.\n */\n\n/**\n * SeriesItem is a element of SeriesGroup.items.\n * SeriesItem has processed terminal data like value, ratio, etc.\n */\n\nvar SeriesGroup = require('./seriesGroup');\nvar SeriesItem = require('./seriesItem');\nvar SeriesItemForCoordinateType = require('./seriesItemForCoordinateType');\nvar predicate = require('../helpers/predicate');\nvar calculator = require('../helpers/calculator');\n\nvar concat = Array.prototype.concat;\n\nvar SeriesDataModel = tui.util.defineClass(/** @lends SeriesDataModel.prototype */{\n    /**\n     * SeriesDataModel is base model for drawing graph of chart series area,\n     *      and create from rawSeriesData by user.\n     * SeriesDataModel.groups has SeriesGroups.\n     * @constructs SeriesDataModel\n     * @param {rawSeriesData} rawSeriesData raw series data\n     * @param {string} chartType chart type\n     * @param {object} options options\n     * @param {Array.&lt;function>} formatFunctions format functions\n     */\n    init: function(rawSeriesData, chartType, options, formatFunctions) {\n        /**\n         * chart type\n         * @type {string}\n         */\n        this.chartType = chartType;\n\n        /**\n         * chart options\n         * @type {Object}\n         */\n        this.options = options || {};\n\n        /**\n         * functions for formatting\n         * @type {Array.&lt;function>}\n         */\n        this.formatFunctions = formatFunctions;\n\n        /**\n         * rawData.series\n         * @type {rawSeriesData}\n         */\n        this.rawSeriesData = rawSeriesData || [];\n\n        /**\n         * baseGroups is base data for making SeriesGroups.\n         * SeriesGroups is made by pivoted baseGroups, lf line type chart.\n         * @type {Array.Array&lt;SeriesItem>}\n         */\n        this.baseGroups = null;\n\n        /**\n         * groups has SeriesGroups.\n         * @type {Array.&lt;SeriesGroup>}\n         */\n        this.groups = null;\n\n        /**\n         * map of values by value type like value, x, y, r.\n         * @type {object.&lt;string, Array.&lt;number>>}\n         */\n        this.valuesMap = {};\n\n        this._removeRangeValue();\n    },\n\n    /**\n     * Remove range value of item, if has stackType option.\n     * @private\n     */\n    _removeRangeValue: function() {\n        var seriesOption = tui.util.pick(this.options, 'series') || {};\n\n        if (predicate.isAllowRangeData(this.chartType) &amp;&amp;\n            !predicate.isValidStackOption(seriesOption.stackType) &amp;&amp; !seriesOption.spline) {\n            return;\n        }\n\n        tui.util.forEachArray(this.rawSeriesData, function(rawItem) {\n            if (!tui.util.isArray(rawItem.data)) {\n                return;\n            }\n            tui.util.forEachArray(rawItem.data, function(value, index) {\n                rawItem.data[index] = concat.apply(value)[0];\n            });\n        });\n    },\n\n    /**\n     * Create base groups.\n     * Base groups is two-dimensional array by seriesItems.\n     * @returns {Array.&lt;Array.&lt;(SeriesItem | SeriesItemForCoordinateType)>>}\n     * @private\n     */\n    _createBaseGroups: function() {\n        var self = this;\n        var SeriesItemClass;\n\n        if (predicate.isCoordinateTypeChart(this.chartType)) {\n            SeriesItemClass = SeriesItemForCoordinateType;\n        } else {\n            SeriesItemClass = SeriesItem;\n        }\n\n        return tui.util.map(this.rawSeriesData, function(rawDatum) {\n            return tui.util.map(concat.apply(rawDatum.data), function(value) {\n                return new SeriesItemClass(value, rawDatum.stack, self.formatFunctions);\n            });\n        });\n    },\n\n    /**\n     * Get base groups.\n     * @returns {Array.Array.&lt;SeriesItem>}\n     */\n    getBaseGroups: function() {\n        if (!this.baseGroups) {\n            this.baseGroups = this._createBaseGroups();\n        }\n\n        return this.baseGroups;\n    },\n\n    /**\n     * Create SeriesGroups from rawData.series.\n     * @param {boolean} isPivot - whether pivot or not.\n     * @returns {Array.&lt;SeriesGroup>}\n     * @private\n     */\n    _createSeriesGroupsFromRawData: function(isPivot) {\n        var baseGroups = this.getBaseGroups();\n\n        if (isPivot) {\n            baseGroups = tui.util.pivot(baseGroups);\n        }\n\n        return tui.util.map(baseGroups, function(items) {\n            return new SeriesGroup(items);\n        });\n    },\n\n    /**\n     * Get SeriesGroups.\n     * @returns {(Array.&lt;SeriesGroup>|object)}\n     * @private\n     */\n    _getSeriesGroups: function() {\n        if (!this.groups) {\n            this.groups = this._createSeriesGroupsFromRawData(true);\n        }\n\n        return this.groups;\n    },\n\n    /**\n     * Get group count.\n     * @returns {Number}\n     */\n    getGroupCount: function() {\n        return this._getSeriesGroups().length;\n    },\n\n    /**\n     * Get pivot groups.\n     * @returns {(Array.&lt;SeriesGroup>|object)}\n     */\n    _getPivotGroups: function() {\n        if (!this.pivotGroups) {\n            this.pivotGroups = this._createSeriesGroupsFromRawData();\n        }\n\n        return this.pivotGroups;\n    },\n\n    /**\n     * Get SeriesGroup.\n     * @param {number} index - index\n     * @returns {SeriesGroup}\n     */\n    getSeriesGroup: function(index) {\n        return this._getSeriesGroups()[index];\n    },\n\n    /**\n     * Get first SeriesGroup.\n     * @returns {SeriesGroup}\n     */\n    getFirstSeriesGroup: function() {\n        return this.getSeriesGroup(0);\n    },\n\n    /**\n     * Get first label of SeriesItem.\n     * @returns {string} formatted value\n     */\n    getFirstItemLabel: function() {\n        return this.getFirstSeriesGroup().getFirstSeriesItem().label;\n    },\n\n    /**\n     * Get series item.\n     * @param {number} groupIndex - index of series groups\n     * @param {number} index - index of series items\n     * @returns {SeriesItem}\n     */\n    getSeriesItem: function(groupIndex, index) {\n        return this.getSeriesGroup(groupIndex).getSeriesItem(index);\n    },\n\n    /**\n     * Get first series item.\n     * @returns {SeriesItem}\n     */\n    getFirstSeriesItem: function() {\n        return this.getSeriesItem(0, 0);\n    },\n\n    /**\n     * Get value.\n     * @param {number} groupIndex - index of series groups\n     * @param {number} index - index of series items\n     * @returns {number} value\n     */\n    getValue: function(groupIndex, index) {\n        return this.getSeriesItem(groupIndex, index).value;\n    },\n\n    /**\n     * Get minimum value.\n     * @param {string} valueType - value type like value, x, y, r.\n     * @returns {number}\n     */\n    getMinValue: function(valueType) {\n        return tui.util.min(this.getValues(valueType));\n    },\n\n    /**\n     * Get maximum value.\n     * @param {string} valueType - value type like value, x, y, r.\n     * @returns {number}\n     */\n    getMaxValue: function(valueType) {\n        return tui.util.max(this.getValues(valueType));\n    },\n\n    /**\n     * Traverse seriesGroups, and returns to found SeriesItem by result of execution seriesGroup.find with condition.\n     * @param {function} condition - condition function\n     * @returns {SeriesItem}\n     * @private\n     */\n    _findSeriesItem: function(condition) {\n        var foundItem;\n\n        this.each(function(seriesGroup) {\n            foundItem = seriesGroup.find(condition);\n\n            return !foundItem;\n        });\n\n        return foundItem;\n    },\n\n    /**\n     * Find SeriesItem by value.\n     * @param {string} valueType - value type like value, x, y, r.\n     * @param {number} value - comparing value\n     * @param {function} condition - condition function\n     * @returns {SeriesItem}\n     * @private\n     */\n    _findSeriesItemByValue: function(valueType, value, condition) {\n        condition = condition || function() {\n            return;\n        };\n\n        return this._findSeriesItem(function(seriesItem) {\n            return seriesItem &amp;&amp; (seriesItem[valueType] === value) &amp;&amp; condition(seriesItem);\n        });\n    },\n\n    /**\n     * Find minimum SeriesItem.\n     * @param {string} valueType - value type like value, x, y, r.\n     * @param {function} condition - condition function\n     * @returns {SeriesItem}\n     */\n    findMinSeriesItem: function(valueType, condition) {\n        var minValue = this.getMinValue(valueType);\n\n        return this._findSeriesItemByValue(valueType, minValue, condition);\n    },\n\n    /**\n     * Find maximum SeriesItem.\n     * @param {string} valueType - value type like value, x, y, r.\n     * @param {function} condition - condition function\n     * @returns {*|SeriesItem}\n     */\n    findMaxSeriesItem: function(valueType, condition) {\n        var maxValue = this.getMaxValue(valueType);\n\n        return this._findSeriesItemByValue(valueType, maxValue, condition);\n    },\n\n    /**\n     * Create values that picked value from SeriesItems of SeriesGroups.\n     * @param {?string} valueType - type of value\n     * @returns {Array.&lt;number>}\n     * @private\n     */\n    _createValues: function(valueType) {\n        var values = this.map(function(seriesGroup) {\n            return seriesGroup.getValues(valueType);\n        });\n\n        return concat.apply([], values);\n    },\n\n    /**\n     * Get values form valuesMap.\n     * @param {?string} valueType - type of value\n     * @returns {Array.&lt;number>}\n     */\n    getValues: function(valueType) {\n        valueType = valueType || 'value';\n\n        if (!this.valuesMap[valueType]) {\n            this.valuesMap[valueType] = this._createValues(valueType);\n        }\n\n        return this.valuesMap[valueType];\n    },\n\n    /**\n     * Whether count of x values greater than count of y values.\n     * @returns {boolean}\n     */\n    isXCountGreaterThanYCount: function() {\n        return this.getValues('x').length > this.getValues('y').length;\n    },\n\n    /**\n     * Add ratios, when has normal stackType option.\n     * @param {{min: number, max: number}} limit - axis limit\n     * @private\n     */\n    _addRatiosWhenNormalStacked: function(limit) {\n        var distance = Math.abs(limit.max - limit.min);\n\n        this.each(function(seriesGroup) {\n            seriesGroup.addRatios(distance);\n        });\n    },\n\n    /**\n     * Calculate base ratio for calculating ratio of item.\n     * @returns {number}\n     * @private\n     */\n    _calculateBaseRatio: function() {\n        var values = this.getValues(),\n            plusSum = calculator.sumPlusValues(values),\n            minusSum = Math.abs(calculator.sumMinusValues(values)),\n            ratio = (plusSum > 0 &amp;&amp; minusSum > 0) ? 0.5 : 1;\n\n        return ratio;\n    },\n\n    /**\n     * Add ratios, when has percent stackType option.\n     * @private\n     */\n    _addRatiosWhenPercentStacked: function() {\n        var baseRatio = this._calculateBaseRatio();\n\n        this.each(function(seriesGroup) {\n            seriesGroup.addRatiosWhenPercentStacked(baseRatio);\n        });\n    },\n\n    /**\n     * Add ratios, when has diverging stackType option.\n     * @private\n     */\n    _addRatiosWhenDivergingStacked: function() {\n        this.each(function(seriesGroup) {\n            var values = seriesGroup.pluck('value'),\n                plusSum = calculator.sumPlusValues(values),\n                minusSum = Math.abs(calculator.sumMinusValues(values));\n\n            seriesGroup.addRatiosWhenDivergingStacked(plusSum, minusSum);\n        });\n    },\n\n    /**\n     * Make subtraction value for making ratio of no option chart.\n     * @param {{min: number, max: number}} limit - limit\n     * @returns {number}\n     * @private\n     */\n    _makeSubtractionValue: function(limit) {\n        var allowMinusPointRender = predicate.allowMinusPointRender(this.chartType),\n            subValue = 0;\n\n        if (!allowMinusPointRender &amp;&amp; predicate.isMinusLimit(limit)) {\n            subValue = limit.max;\n        } else if (allowMinusPointRender || limit.min >= 0) {\n            subValue = limit.min;\n        }\n\n        return subValue;\n    },\n\n    /**\n     * Add ratios, when has not option.\n     * @param {{min: number, max: number}} limit - axis limit\n     * @private\n     */\n    _addRatios: function(limit) {\n        var distance = Math.abs(limit.max - limit.min),\n            subValue = this._makeSubtractionValue(limit);\n\n        this.each(function(seriesGroup) {\n            seriesGroup.addRatios(distance, subValue);\n        });\n    },\n\n    /**\n     * Add data ratios.\n     * @param {{min: number, max: number}} limit - axis limit\n     * @param {string} stackType - stackType option\n     * @private\n     */\n    addDataRatios: function(limit, stackType) {\n        var isAllowedStackOption = predicate.isAllowedStackOption(this.chartType);\n\n        if (isAllowedStackOption &amp;&amp; predicate.isNormalStack(stackType)) {\n            this._addRatiosWhenNormalStacked(limit);\n        } else if (isAllowedStackOption &amp;&amp; predicate.isPercentStack(stackType)) {\n            if (this.divergingOption) {\n                this._addRatiosWhenDivergingStacked();\n            } else {\n                this._addRatiosWhenPercentStacked();\n            }\n        } else {\n            this._addRatios(limit);\n        }\n    },\n\n    /**\n     * Add data ratios of pie chart.\n     */\n    addDataRatiosOfPieChart: function() {\n        this.each(function(seriesGroup) {\n            var sum = tui.util.sum(seriesGroup.pluck('value'));\n\n            seriesGroup.addRatios(sum);\n        });\n    },\n\n    /**\n     * Add ratios of data for chart of coordinate type.\n     * @param {{x: {min: number, max: number}, y: {min: number, max: number}}} limitMap - limit map\n     * @param {boolean} [hasRadius] - whether has radius or not\n     */\n    addDataRatiosForCoordinateType: function(limitMap, hasRadius) {\n        var xLimit = limitMap.x;\n        var yLimit = limitMap.y;\n        var maxRadius = hasRadius ? tui.util.max(this.getValues('r')) : 0;\n        var xDistance, xSubValue, yDistance, ySubValue;\n\n        if (xLimit) {\n            xDistance = Math.abs(xLimit.max - xLimit.min);\n            xSubValue = this._makeSubtractionValue(xLimit);\n        }\n\n        if (yLimit) {\n            yDistance = Math.abs(yLimit.max - yLimit.min);\n            ySubValue = this._makeSubtractionValue(yLimit);\n        }\n\n        this.each(function(seriesGroup) {\n            seriesGroup.each(function(item) {\n                if (!item) {\n                    return;\n                }\n                item.addRatio('x', xDistance, xSubValue);\n                item.addRatio('y', yDistance, ySubValue);\n                item.addRatio('r', maxRadius, 0);\n            });\n        });\n    },\n\n    /**\n     * Add start to all series item.\n     * @param {number} start - start value\n     */\n    addStartValueToAllSeriesItem: function(start) {\n        this.each(function(seriesGroup) {\n            seriesGroup.addStartValueToAllSeriesItem(start);\n        });\n    },\n\n    /**\n     * Whether has range data or not.\n     * @returns {boolean}\n     */\n    hasRangeData: function() {\n        var hasRangeData = false;\n\n        this.each(function(seriesGroup) {\n            hasRangeData = seriesGroup.hasRangeData();\n            return !hasRangeData;\n        });\n\n        return hasRangeData;\n    },\n\n    /**\n     * Traverse groups, and executes iteratee function.\n     * @param {function} iteratee - iteratee function\n     * @param {boolean} isPivot - whether pivot or not\n     */\n    each: function(iteratee, isPivot) {\n        var groups = isPivot ? this._getPivotGroups() : this._getSeriesGroups();\n\n        tui.util.forEachArray(groups, function(seriesGroup, index) {\n            return iteratee(seriesGroup, index);\n        });\n    },\n\n    /**\n     * Traverse groups, and returns to result of execution about iteratee function.\n     * @param {function} iteratee - iteratee function\n     * @param {boolean} isPivot - whether pivot or not\n     * @returns {Array}\n     */\n    map: function(iteratee, isPivot) {\n        var results = [];\n\n        this.each(function(seriesGroup, index) {\n            results.push(iteratee(seriesGroup, index));\n        }, isPivot);\n\n        return results;\n    }\n});\n\nmodule.exports = SeriesDataModel;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"