tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_comboTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview comboTypeMixer is mixer of combo type chart.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar defaultTheme = require('../themes/defaultTheme');\n\n/**\n * comboTypeMixer is mixer of combo type chart.\n * @mixin\n */\nvar comboTypeMixer = {\n    /**\n     * Make options map\n     * @param {object} chartTypes chart types\n     * @returns {object} options map\n     * @private\n     */\n    _makeOptionsMap: function(chartTypes) {\n        var seriesOptions = this.options.series || {};\n        var optionsMap = {};\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            optionsMap[chartType] = seriesOptions[chartType] || seriesOptions;\n        });\n\n        return optionsMap;\n    },\n\n    /**\n     * Make theme map\n     * @param {object} chartTypes chart types\n     * @returns {object} theme map\n     * @private\n     */\n    _makeThemeMap: function(chartTypes) {\n        var dataProcessor = this.dataProcessor;\n        var theme = this.theme;\n        var themeMap = {};\n        var colorCount = 0;\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            var chartTheme = JSON.parse(JSON.stringify(theme));\n            var removedColors;\n\n            if (chartTheme.series[chartType]) {\n                themeMap[chartType] = chartTheme.series[chartType];\n            } else if (!chartTheme.series.colors) {\n                themeMap[chartType] = JSON.parse(JSON.stringify(defaultTheme.series));\n                themeMap[chartType].label.fontFamily = chartTheme.chart.fontFamily;\n            } else {\n                removedColors = chartTheme.series.colors.splice(0, colorCount);\n                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);\n                themeMap[chartType] = chartTheme.series;\n                colorCount += dataProcessor.getLegendLabels(chartType).length;\n            }\n        });\n\n        return themeMap;\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = comboTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"