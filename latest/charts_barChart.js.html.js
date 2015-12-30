tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_barChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Bar chart.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase'),\n    axisTypeMixer = require('./axisTypeMixer'),\n    axisDataMaker = require('../helpers/axisDataMaker'),\n    Series = require('../series/barChartSeries');\n\nvar BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {\n    /**\n     * Bar chart.\n     * @constructs BarChart\n     * @extends ChartBase\n     * @mixes axisTypeMixer\n     * @param {array.&lt;array>} rawData raw data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     */\n    init: function(rawData, theme, options) {\n        /**\n         * className\n         * @type {string}\n         */\n        this.className = 'tui-bar-chart';\n\n        ChartBase.call(this, {\n            rawData: rawData,\n            theme: theme,\n            options: options,\n            hasAxes: true\n        });\n\n        this._addComponents(options.chartType);\n    },\n\n    /**\n     * Make axes data\n     * @param {object} bounds chart bounds\n     * @returns {object} axes data\n     * @private\n     */\n    _makeAxesData: function(bounds) {\n        var options = this.options,\n            xAxisData = axisDataMaker.makeValueAxisData({\n                values: this.dataProcessor.getGroupValues(),\n                seriesDimension: bounds.series.dimension,\n                stacked: options.series &amp;&amp; options.series.stacked || '',\n                chartType: options.chartType,\n                formatFunctions: this.dataProcessor.getFormatFunctions(),\n                options: options.xAxis\n            }),\n            yAxisData = axisDataMaker.makeLabelAxisData({\n                labels: this.dataProcessor.getCategories(),\n                isVertical: true\n            });\n\n        return {\n            xAxis: xAxisData,\n            yAxis: yAxisData\n        };\n    },\n\n    /**\n     * Add components\n     * @param {string} chartType chart type\n     * @private\n     */\n    _addComponents: function(chartType) {\n        this._addComponentsForAxisType({\n            axes: ['yAxis', 'xAxis'],\n            chartType: chartType,\n            serieses: [\n                {\n                    name: 'barSeries',\n                    SeriesClass: Series\n                }\n            ]\n        });\n    }\n});\n\naxisTypeMixer.mixin(BarChart);\n\nmodule.exports = BarChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"