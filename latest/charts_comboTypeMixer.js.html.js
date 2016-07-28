tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_comboTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview comboTypeMixer is mixer of combo type chart.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar defaultTheme = require('../themes/defaultTheme');\n\n/**\n * comboTypeMixer is mixer of combo type chart.\n * @mixin\n */\nvar comboTypeMixer = {\n    /**\n     * Get base series options.\n     * @param {object.&lt;string, object>} seriesOptions - series options\n     * @param {Array.&lt;string>} chartTypes - chart types\n     * @returns {object}\n     * @private\n     */\n    _getBaseSeriesOptions: function(seriesOptions, chartTypes) {\n        var baseSeriesOptions = tui.util.extend({}, seriesOptions);\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            delete baseSeriesOptions[chartType];\n        });\n\n        return baseSeriesOptions;\n    },\n\n    /**\n     * Make options map\n     * @param {Array.&lt;string>} chartTypes - chart types\n     * @returns {object}\n     * @private\n     */\n    _makeOptionsMap: function(chartTypes) {\n        var seriesOptions = this.options.series;\n        var baseSeriesOptions = this._getBaseSeriesOptions(seriesOptions, chartTypes);\n        var optionsMap = {};\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            optionsMap[chartType] = tui.util.extend({}, baseSeriesOptions, seriesOptions[chartType]);\n        });\n\n        return optionsMap;\n    },\n\n    /**\n     * Make theme map\n     * @param {object} seriesNames - series names\n     * @returns {object} theme map\n     * @private\n     */\n    _makeThemeMap: function(seriesNames) {\n        var dataProcessor = this.dataProcessor;\n        var theme = this.theme;\n        var themeMap = {};\n        var colorCount = 0;\n\n        tui.util.forEachArray(seriesNames, function(chartType) {\n            var chartTheme = JSON.parse(JSON.stringify(theme));\n            var removedColors;\n\n            if (chartTheme.series[chartType]) {\n                themeMap[chartType] = chartTheme.series[chartType];\n            } else if (!chartTheme.series.colors) {\n                themeMap[chartType] = JSON.parse(JSON.stringify(defaultTheme.series));\n                themeMap[chartType].label.fontFamily = chartTheme.chart.fontFamily;\n            } else {\n                removedColors = chartTheme.series.colors.splice(0, colorCount);\n                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);\n                themeMap[chartType] = chartTheme.series;\n                colorCount += dataProcessor.getLegendLabels(chartType).length;\n            }\n        });\n\n        return themeMap;\n    }\n};\n\nmodule.exports = comboTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"