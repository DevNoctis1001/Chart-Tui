tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_scatterChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates\n *                  to display values for typically two variables for a set of data.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase');\nvar chartConst = require('../const');\nvar Series = require('../series/scatterChartSeries');\nvar axisTypeMixer = require('./axisTypeMixer');\nvar SimpleCustomEvent = require('../customEvents/simpleCustomEvent');\n\nvar ScatterChart = tui.util.defineClass(ChartBase, /** @lends ScatterChart.prototype */ {\n    /**\n     * className\n     * @type {string}\n     */\n    className: 'tui-scatter-chart',\n    /**\n     * Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates\n     *  to display values for typically two variables for a set of data.\n     * @constructs ScatterChart\n     * @extends ChartBase\n     * @mixes axisTypeMixer\n     * @param {Array.&lt;Array>} rawData raw data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     */\n    init: function(rawData, theme, options) {\n        options.tooltip = options.tooltip || {};\n\n        this.axisScaleMakerMap = null;\n\n        if (!options.tooltip.align) {\n            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;\n        }\n\n        ChartBase.call(this, {\n            rawData: rawData,\n            theme: theme,\n            options: options,\n            hasAxes: true\n        });\n\n        this._addComponents(options.chartType);\n    },\n\n    /**\n     * Make map for AxisScaleMaker of axes(xAxis, yAxis).\n     * @returns {Object.&lt;string, AxisScaleMaker>}\n     * @private\n     */\n    _makeAxisScaleMakerMap: function() {\n        var options = this.options;\n\n        return {\n            xAxis: this._createAxisScaleMaker(options.xAxis, 'xAxis', 'x'),\n            yAxis: this._createAxisScaleMaker(options.yAxis, 'yAxis', 'y')\n        };\n    },\n\n    /**\n     * Add components\n     * @param {string} chartType chart type\n     * @private\n     */\n    _addComponents: function(chartType) {\n        this._addComponentsForAxisType({\n            chartType: chartType,\n            axis: [\n                {\n                    name: 'yAxis',\n                    isVertical: true\n                },\n                {\n                    name: 'xAxis'\n                }\n            ],\n            series: [\n                {\n                    name: 'scatterSeries',\n                    SeriesClass: Series\n                }\n            ],\n            plot: true\n        });\n    }\n});\n\ntui.util.extend(ScatterChart.prototype, axisTypeMixer);\n\n/**\n * Add data ratios.\n * @private\n * @override\n */\nScatterChart.prototype._addDataRatios = function() {\n    var scaleMakerMap = this._getAxisScaleMakerMap();\n\n    this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, {\n        x: scaleMakerMap.xAxis.getLimit(),\n        y: scaleMakerMap.yAxis.getLimit()\n    }, false);\n};\n\n/**\n * Add custom event component for normal tooltip.\n * @private\n */\nScatterChart.prototype._attachCustomEvent = function() {\n    var componentManager = this.componentManager;\n    var customEvent = componentManager.get('customEvent');\n    var scatterSeries = componentManager.get('scatterSeries');\n    var tooltip = componentManager.get('tooltip');\n\n    axisTypeMixer._attachCustomEvent.call(this);\n\n    customEvent.on({\n        clickScatterSeries: scatterSeries.onClickSeries,\n        moveScatterSeries: scatterSeries.onMoveSeries\n    }, scatterSeries);\n\n    scatterSeries.on({\n        showTooltip: tooltip.onShow,\n        hideTooltip: tooltip.onHide,\n        showTooltipContainer: tooltip.onShowTooltipContainer,\n        hideTooltipContainer: tooltip.onHideTooltipContainer\n    }, tooltip);\n};\n\n/**\n * Add custom event component.\n * @private\n */\nScatterChart.prototype._addCustomEventComponent = function() {\n    this.componentManager.register('customEvent', SimpleCustomEvent, {\n        chartType: this.chartType\n    });\n};\n\nmodule.exports = ScatterChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"