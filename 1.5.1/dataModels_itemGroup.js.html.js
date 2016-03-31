tui.util.defineNamespace("fedoc.content", {});
fedoc.content["dataModels_itemGroup.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Item group has itemses(Items instance).\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\n/**\n * Raw series datum.\n * @typedef {{name: ?string, data: Array.&lt;number>, stack: ?string}} rawSeriesDatum\n */\n\n/**\n * Raw series data.\n * @typedef {Array.&lt;rawSeriesDatum>} rawSeriesData\n */\n\n/**\n * Groups.\n * @typedef {Array.&lt;Items>} groups\n */\n\nvar Items = require('./items'),\n    Item = require('./item'),\n    chartConst = require('../const'),\n    predicate = require('../helpers/predicate'),\n    calculator = require('../helpers/calculator');\n\nvar concat = Array.prototype.concat;\n\nvar ItemGroup = tui.util.defineClass(/** @lends ItemGroup.prototype */{\n    /**\n     * Item group.\n     * @constructs ItemGroup\n     * @param {rawSeriesData} rawSeriesData raw series data\n     * @param {object} options options\n     * @param {Array.&lt;string>} seriesChartTypes chart types\n     * @param {Array.&lt;function>} formatFunctions format functions\n     */\n    init: function(rawSeriesData, options, seriesChartTypes, formatFunctions) {\n        /**\n         * chart options\n         * @type {Object}\n         */\n        this.options = options || {};\n\n        /**\n         * series chart types\n         * @type {Array.&lt;string>}\n         */\n        this.seriesChartTypes = seriesChartTypes;\n\n        /**\n         * functions for formatting\n         * @type {Array.&lt;function>}\n         */\n        this.formatFunctions = formatFunctions;\n\n        /**\n         * rawData.series\n         * @type {rawSeriesData}\n         */\n        this.rawSeriesData = rawSeriesData;\n\n        /**\n         * base groups\n         * @type {object}\n         */\n        this.baseGroups = {};\n\n        /**\n         * groups\n         * @type {groups}\n         */\n        this.groups = null;\n\n        /**\n         * all values of groups\n         * @type {object}\n         */\n        this.values = {};\n\n        this._updateRawSeriesData();\n    },\n\n    /**\n     * Remove range value of item.\n     * @param {rawSeriesData} rawSeriesData - rawData.series\n     * @private\n     */\n    _removeRangeValue: function(rawSeriesData) {\n        tui.util.forEachArray(rawSeriesData, function(seriesDatum) {\n            if (!tui.util.isArray(seriesDatum.data)) {\n                return;\n            }\n            tui.util.forEachArray(seriesDatum.data, function(value, index) {\n                seriesDatum.data[index] = concat.apply(value)[0];\n            });\n        });\n    },\n\n    /**\n     * Update data of rawData.series.\n     * @private\n     */\n    _updateRawSeriesData: function() {\n        var self = this,\n            rawSeriesData = this.rawSeriesData;\n\n        if (!tui.util.pick(this.options, 'series', 'stacked')) {\n            return;\n        }\n\n        if (tui.util.isArray(rawSeriesData)) {\n            this._removeRangeValue(rawSeriesData);\n        } else {\n            tui.util.forEach(rawSeriesData, function(groupData) {\n                self._removeRangeValue(groupData);\n            });\n        }\n    },\n\n    /**\n     * Create base groups.\n     * @param {rawSeriesData} rawSeriesData - rawData.series\n     * @returns {Array.&lt;Array.&lt;Item>>}\n     * @private\n     */\n    _createBaseGroups: function(rawSeriesData) {\n        var self = this;\n\n        return tui.util.map(rawSeriesData, function(rawDatum) {\n            return tui.util.map(concat.apply(rawDatum.data), function(value) {\n                return new Item(value, rawDatum.stack, self.formatFunctions);\n            });\n        });\n    },\n\n    /**\n     * Get base groups.\n     * @param {rawSeriesData} rawSeriesData - rawData.series\n     * @param {string} chartType - chartType\n     * @returns {Array.&lt;Array.&lt;Item>>}\n     */\n    getBaseGroups: function(rawSeriesData, chartType) {\n        if (!this.baseGroups[chartType]) {\n            this.baseGroups[chartType] = this._createBaseGroups(rawSeriesData);\n        }\n\n        return this.baseGroups[chartType];\n    },\n\n    /**\n     * Create array type groups from rawData.series.\n     * @param {rawSeriesData} rawSeriesData - rawData.series\n     * @param {string} chartType - chart type\n     * @param {boolean} isPivot - whether pivot or not\n     * @returns {Array.&lt;Items>}\n     * @private\n     */\n    createArrayTypeGroupsFromRawData: function(rawSeriesData, chartType, isPivot) {\n        var groups = this.getBaseGroups(rawSeriesData, chartType);\n\n        if (isPivot) {\n            groups = tui.util.pivot(groups);\n        }\n\n        return tui.util.map(groups, function(items) {\n            return new Items(items);\n        });\n    },\n\n    /**\n     * Create groups from rawData.series.\n     * @param {boolean} isPivot - whether pivot or not.\n     * @returns {Array.&lt;Items>}\n     * @private\n     */\n    _createGroupsFromRawData: function(isPivot) {\n        var self = this,\n            rawSeriesData = this.rawSeriesData,\n            groups;\n\n        if (tui.util.isArray(rawSeriesData)) {\n            groups = this.createArrayTypeGroupsFromRawData(rawSeriesData, chartConst.DUMMY_KEY, isPivot);\n        } else {\n            groups = {};\n            tui.util.forEach(rawSeriesData, function(groupData, type) {\n                groups[type] = self.createArrayTypeGroupsFromRawData(groupData, type, isPivot);\n            });\n        }\n\n        return groups;\n    },\n\n    /**\n     * Get groups.\n     * @param {?string} chartType - chart type\n     * @returns {(Array.&lt;Items>|object)}\n     */\n    getGroups: function(chartType) {\n        if (!this.groups) {\n            this.groups = this._createGroupsFromRawData(true);\n        }\n\n        return this.groups[chartType] || this.groups;\n    },\n\n    /**\n     * Get group count.\n     * @param {string} chartType - chart type\n     * @returns {Number}\n     */\n    getGroupCount: function(chartType) {\n        return this.getGroups(chartType).length;\n    },\n\n    /**\n     * Whether valid all group or not.\n     * @returns {boolean}\n     */\n    isValidAllGroup: function() {\n        var groupMap = this.getGroups(),\n            isValid = true;\n\n        if (!tui.util.isArray(groupMap)) {\n            tui.util.forEach(groupMap, function(groups) {\n                isValid = !!groups.length;\n                return isValid;\n            });\n        }\n\n        return isValid;\n    },\n\n    /**\n     * Get pivot groups.\n     * @param {string} chartType - chart type\n     * @returns {(Array.&lt;Items>|object)}\n     */\n    getPivotGroups: function(chartType) {\n        if (!this.pivotGroups) {\n            this.pivotGroups = this._createGroupsFromRawData();\n        }\n\n        return this.pivotGroups[chartType] || this.pivotGroups;\n    },\n\n    /**\n     * Get items.\n     * @param {number} index - index\n     * @param {string} chartType - chart type\n     * @returns {Items}\n     */\n    getItems: function(index, chartType) {\n        return this.getGroups(chartType)[index];\n    },\n\n    /**\n     * Get first items.\n     * @param {string} chartType - chart type\n     * @returns {Items}\n     */\n    getFirstItems: function(chartType) {\n        return this.getItems(0, chartType);\n    },\n\n    /**\n     * Get item.\n     * @param {number} groupIndex - index of groups\n     * @param {number} index - index of items\n     * @param {string} chartType - chart type\n     * @returns {Item}\n     */\n    getItem: function(groupIndex, index, chartType) {\n        return this.getItems(groupIndex, chartType).getItem(index);\n    },\n\n    /**\n     * Get first item.\n     * @param {string} chartType - chart type\n     * @returns {Item}\n     */\n    getFirstItem: function(chartType) {\n        return this.getItem(0, 0, chartType);\n    },\n\n    /**\n     * Get value.\n     * @param {number} groupIndex - index of groups\n     * @param {number} index - index of items\n     * @param {?string} chartType - chart type\n     * @returns {number} value\n     */\n    getValue: function(groupIndex, index, chartType) {\n        return this.getItem(groupIndex, index, chartType).value;\n    },\n\n    /**\n     * Make flattening values.\n     * @param {?string} chartType - chart type\n     * @returns {Array.&lt;number>}\n     * @private\n     */\n    _makeValues: function(chartType) {\n        var values = this.map(function(items) {\n            return items.getValues();\n        }, chartType);\n\n        return concat.apply([], values);\n    },\n\n    /**\n     * Get flattening values.\n     * @param {?string} chartType - chart type\n     * @returns {Array.&lt;number>}\n     */\n    getValues: function(chartType) {\n        if (!this.values[chartType]) {\n            this.values[chartType] = this._makeValues(chartType);\n        }\n\n        return this.values[chartType];\n    },\n\n    /**\n     * Make whole groups.\n     * @returns {groups}\n     * @private\n     */\n    _makeWholeGroups: function() {\n        var wholeGroups = [];\n\n        this.each(function(items, index) {\n            if (!wholeGroups[index]) {\n                wholeGroups[index] = [];\n            }\n            wholeGroups[index] = wholeGroups[index].concat(items.items);\n        });\n\n        wholeGroups = tui.util.map(wholeGroups, function(items) {\n            return new Items(items);\n        });\n\n        return wholeGroups;\n    },\n\n    /**\n     * Get whole groups.\n     * @returns {groups}\n     */\n    getWholeGroups: function() {\n        if (!this.wholeGroups) {\n            this.wholeGroups = this._makeWholeGroups();\n        }\n\n        return this.wholeGroups;\n    },\n\n    /**\n     * Make whole items.\n     * @returns {Items}\n     * @private\n     */\n    _makeWholeItems: function() {\n        var wholeItems = [];\n\n        this.each(function(items) {\n            wholeItems = wholeItems.concat(items.items);\n        });\n\n        return new Items(wholeItems);\n    },\n\n    /**\n     * Get whole items\n     * @returns {Items}\n     */\n    getWholeItems: function() {\n        if (!this.wholeItems) {\n            this.wholeItems = this._makeWholeItems();\n        }\n\n        return this.wholeItems;\n    },\n\n    /**\n     * Get whole values.\n     * @returns {Array.&lt;number>}\n     */\n    getWholeValues: function() {\n        if (!this.wholeValues) {\n            this.wholeValues = this.getWholeItems().pluck('value');\n        }\n\n        return this.wholeValues;\n    },\n\n    /**\n     * Add ratios, when has normal stacked option.\n     * @param {string} chartType - chart type\n     * @param {{min: number, max: number}} limit - axis limit\n     * @private\n     */\n    _addRatiosWhenNormalStacked: function(chartType, limit) {\n        var distance = Math.abs(limit.max - limit.min);\n\n        this.each(function(items) {\n            items.addRatios(distance);\n        }, chartType);\n    },\n\n    /**\n     * Calculate base ratio for calculating ratio of item.\n     * @param {string} chartType - chart type\n     * @returns {number}\n     * @private\n     */\n    _calculateBaseRatio: function(chartType) {\n        var values = this.getValues(chartType),\n            plusSum = calculator.sumPlusValues(values),\n            minusSum = Math.abs(calculator.sumMinusValues(values)),\n            ratio = (plusSum > 0 &amp;&amp; minusSum > 0) ? 0.5 : 1;\n\n        return ratio;\n    },\n\n    /**\n     * Add ratios, when has percent stacked option.\n     * @param {string} chartType - chart type\n     * @private\n     */\n    _addRatiosWhenPercentStacked: function(chartType) {\n        var baseRatio = this._calculateBaseRatio(chartType);\n\n        this.each(function(items) {\n            items.addRatiosWhenPercentStacked(baseRatio);\n        }, chartType);\n    },\n\n    /**\n     * Add ratios, when has diverging stacked option.\n     * @param {string} chartType - chart type\n     * @private\n     */\n    _addRatiosWhenDivergingStacked: function(chartType) {\n        this.each(function(items) {\n            var values = items.pluck('value'),\n                plusSum = calculator.sumPlusValues(values),\n                minusSum = Math.abs(calculator.sumMinusValues(values));\n\n            items.addRatiosWhenDivergingStacked(plusSum, minusSum);\n        }, chartType);\n    },\n\n    /**\n     * Make subtraction value for making ratio of no option chart.\n     * @param {string} chartType - chartType\n     * @param {{min: number, max: number}} limit - limit\n     * @returns {number}\n     * @private\n     */\n    _makeSubtractionValue: function(chartType, limit) {\n        var isLineTypeChart = predicate.isLineTypeChart(chartType),\n            subValue = 0;\n\n        if (!isLineTypeChart &amp;&amp; predicate.isMinusLimit(limit)) {\n            subValue = limit.max;\n        } else if (isLineTypeChart || limit.min >= 0) {\n            subValue = limit.min;\n        }\n\n        return subValue;\n    },\n\n    /**\n     * Add ratios, when has not option.\n     * @param {string} chartType - chart type\n     * @param {{min: number, max: number}} limit - axis limit\n     * @private\n     */\n    _addRatios: function(chartType, limit) {\n        var distance = Math.abs(limit.max - limit.min),\n            subValue = this._makeSubtractionValue(chartType, limit);\n\n        this.each(function(items) {\n            items.addRatios(distance, subValue);\n        }, chartType);\n    },\n\n    /**\n     * Add data ratios.\n     * @param {{min: number, max: number}} limit - axis limit\n     * @param {string} stacked - stacked option\n     * @param {string} chartType - chart type\n     * @private\n     */\n    addDataRatios: function(limit, stacked, chartType) {\n        var isAllowedStackedOption = predicate.isAllowedStackedOption(chartType);\n\n        if (isAllowedStackedOption &amp;&amp; predicate.isNormalStacked(stacked)) {\n            this._addRatiosWhenNormalStacked(chartType, limit);\n        } else if (isAllowedStackedOption &amp;&amp; predicate.isPercentStacked(stacked)) {\n            if (this.divergingOption) {\n                this._addRatiosWhenDivergingStacked(chartType);\n            } else {\n                this._addRatiosWhenPercentStacked(chartType);\n            }\n        } else {\n            this._addRatios(chartType, limit);\n        }\n    },\n\n    /**\n     * Add data ratios of pie chart.\n     */\n    addDataRatiosOfPieChart: function() {\n        var chartType = chartConst.CHART_TYPE_PIE;\n\n        this.each(function(items) {\n            var sum = tui.util.sum(items.pluck('value'));\n\n            items.addRatios(sum);\n        }, chartType);\n    },\n\n    /**\n     * Update start value of item.\n     * @param {number} start - start value\n     * @param {string} chartType - chart type\n     */\n    updateItemStart: function(start, chartType) {\n        this.each(function(items) {\n            items.addStartToAllItem(start);\n        }, chartType);\n    },\n\n    /**\n     * Traverse groups and executes iteratee function.\n     * @param {function} iteratee - iteratee function\n     * @param {string} chartType - chart type\n     * @param {boolean} isPivot - whether pivot or not\n     */\n    each: function(iteratee, chartType, isPivot) {\n        var groups = isPivot ? this.getPivotGroups(chartType) : this.getGroups(chartType),\n            groupMap = {};\n\n        if (tui.util.isArray(groups)) {\n            groupMap[chartConst.DUMMY_KEY] = groups;\n        } else {\n            groupMap = groups;\n        }\n\n\n        tui.util.forEach(groupMap, function(_groups, key) {\n            key = (key === chartConst.DUMMY_KEY) ? null : key;\n\n            tui.util.forEachArray(_groups, function(items, index) {\n                iteratee(items, index, key);\n            });\n        });\n    },\n\n    /**\n     * Traverse groups and returns to result of execution about iteratee function.\n     * @param {function} iteratee - iteratee function\n     * @param {string} chartType - chart type\n     * @param {boolean} isPivot - whether pivot or not\n     * @returns {Array}\n     */\n    map: function(iteratee, chartType, isPivot) {\n        var results = [];\n        this.each(function(items, index, key) {\n            results.push(iteratee(items, index, key));\n        }, chartType, isPivot);\n\n        return results;\n    }\n});\n\nmodule.exports = ItemGroup;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"