tui.util.defineNamespace("fedoc.content", {});
fedoc.content["series_columnChartSeries.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Column chart series component.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar Series = require('./series');\nvar BarTypeSeriesBase = require('./barTypeSeriesBase');\nvar chartConst = require('../const');\nvar predicate = require('../helpers/predicate');\nvar renderUtil = require('../helpers/renderUtil');\nvar calculator = require('../helpers/calculator');\n\nvar ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {\n    /**\n     * Column chart series component.\n     * @constructs ColumnChartSeries\n     * @extends Series\n     * @param {object} params parameters\n     *      @param {object} params.model series model\n     *      @param {object} params.options series options\n     *      @param {object} params.theme series theme\n     */\n    init: function() {\n        Series.apply(this, arguments);\n    },\n\n    /**\n     * Make bound of column chart.\n     * @param {number} width width\n     * @param {number} height height\n     * @param {number} left top position value\n     * @param {number} startTop start top position value\n     * @param {number} endTop end top position value\n     * @returns {{\n     *      start: {left: number, top: number, width: number, height: number},\n     *      end: {left: number, top: number, width: number, height: number}\n     * }} column chart bound\n     * @private\n     */\n    _makeBound: function(width, height, left, startTop, endTop) {\n        return {\n            start: {\n                top: startTop,\n                left: left,\n                width: width,\n                height: 0\n            },\n            end: {\n                top: endTop,\n                left: left,\n                width: width,\n                height: height\n            }\n        };\n    },\n\n    /**\n     * Make column chart bound.\n     * @param {{\n     *      baseSize: number,\n     *      basePosition: number,\n     *      step: number,\n     *      additionalPosition: ?number,\n     *      barSize: number\n     * }} baseData base data for making bound\n     * @param {{\n     *      baseLeft: number,\n     *      left: number,\n     *      plusTop: number,\n     *      minusTop: number,\n     *      prevStack: ?string\n     * }} iterationData iteration data\n     * @param {?boolean} isStackType whether stackType option or not.\n     * @param {SeriesItem} seriesItem series item\n     * @param {number} index index\n     * @returns {{\n     *      start: {left: number, top: number, width: number, height: number},\n     *      end: {left: number, top: number, width: number, height: number}\n     * }}\n     * @private\n     */\n    _makeColumnChartBound: function(baseData, iterationData, isStackType, seriesItem, index) {\n        var barHeight = Math.abs(baseData.baseBarSize * seriesItem.ratioDistance),\n            barStartTop = baseData.baseBarSize * seriesItem.startRatio,\n            startTop = baseData.basePosition - barStartTop + chartConst.SERIES_EXPAND_SIZE,\n            changedStack = (seriesItem.stack !== iterationData.prevStack),\n            stepCount, endTop, bound;\n\n        if (!isStackType || (!this.options.diverging &amp;&amp; changedStack)) {\n            stepCount = isStackType ? this.dataProcessor.findStackIndex(seriesItem.stack) : index;\n            iterationData.left = (baseData.step * stepCount) + iterationData.baseLeft + baseData.additionalPosition;\n            iterationData.plusTop = 0;\n            iterationData.minusTop = 0;\n        }\n\n        if (seriesItem.value >= 0) {\n            iterationData.plusTop -= barHeight;\n            endTop = startTop + iterationData.plusTop;\n        } else {\n            endTop = startTop + iterationData.minusTop;\n            iterationData.minusTop += barHeight;\n        }\n\n        iterationData.prevStack = seriesItem.stack;\n        bound = this._makeBound(baseData.barSize, barHeight, iterationData.left, startTop, endTop);\n\n        return bound;\n    },\n\n    /**\n     * Make bounds of column chart.\n     * @returns {Array.&lt;Array.&lt;object>>} bounds\n     * @private\n     */\n    _makeBounds: function() {\n        var self = this;\n        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.seriesName);\n        var isStackType = predicate.isValidStackOption(this.options.stackType);\n        var dimension = this.boundsMaker.getDimension('series');\n        var baseData = this._makeBaseDataForMakingBound(dimension.width, dimension.height);\n\n        return seriesDataModel.map(function(seriesGroup, groupIndex) {\n            var baseLeft = (groupIndex * baseData.groupSize) + baseData.firstAdditionalPosition\n                        + chartConst.SERIES_EXPAND_SIZE,\n                iterationData = {\n                    baseLeft: baseLeft,\n                    left: baseLeft,\n                    plusTop: 0,\n                    minusTop: 0,\n                    prevStack: null\n                },\n                iteratee = tui.util.bind(self._makeColumnChartBound, self, baseData, iterationData, isStackType);\n\n            return seriesGroup.map(iteratee);\n        });\n    },\n\n    /**\n     * Calculate left position of sum label.\n     * @param {{left: number, top: number}} bound bound\n     * @param {string} formattedSum formatted sum.\n     * @returns {number} left position value\n     * @private\n     */\n    _calculateLeftPositionOfSumLabel: function(bound, formattedSum) {\n        var labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);\n        return bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);\n    },\n\n    /**\n     * Make plus sum label html.\n     * @param {Array.&lt;number>} values values\n     * @param {{left: number, top: number}} bound bound\n     * @param {number} labelHeight label height\n     * @returns {string} plus sum label html\n     * @private\n     */\n    _makePlusSumLabelHtml: function(values, bound, labelHeight) {\n        var sum, formattedSum,\n            html = '';\n\n        if (bound) {\n            sum = calculator.sumPlusValues(values);\n            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions(), 'series');\n            html = this._makeSeriesLabelHtml({\n                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),\n                top: bound.top - labelHeight - chartConst.SERIES_LABEL_PADDING\n            }, formattedSum, -1);\n        }\n\n        return html;\n    },\n\n    /**\n     * Make minus sum label html.\n     * @param {Array.&lt;number>} values values\n     * @param {{left: number, top: number}} bound bound\n     * @returns {string} plus minus label html\n     * @private\n     */\n    _makeMinusSumLabelHtml: function(values, bound) {\n        var sum, formattedSum,\n            html = '';\n\n        if (bound) {\n            sum = calculator.sumMinusValues(values);\n\n            if (this.options.diverging) {\n                sum = Math.abs(sum);\n            }\n\n            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions(), 'series');\n            html = this._makeSeriesLabelHtml({\n                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),\n                top: bound.top + bound.height + chartConst.SERIES_LABEL_PADDING\n            }, formattedSum, -1);\n        }\n\n        return html;\n    }\n});\n\nBarTypeSeriesBase.mixin(ColumnChartSeries);\n\nmodule.exports = ColumnChartSeries;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"