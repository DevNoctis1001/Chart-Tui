ne.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_lineTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview lineTypeMixer is mixer of line type chart(line, area).\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase'),\n    AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');\n\n/**\n * lineTypeMixer is mixer of line type chart(line, area).\n * @mixin\n */\nvar lineTypeMixer = {\n    /**\n     * Initialize line type chart.\n     * @param {array.&lt;array>} userData chart data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     * @param {object} initedData initialized data from combo chart\n     * @private\n     */\n    _lineTypeInit: function(userData, theme, options) {\n        ChartBase.call(this, {\n            userData: userData,\n            theme: theme,\n            options: options,\n            hasAxes: true,\n            isVertical: true\n        });\n\n        this._addComponents(this.convertedData, options.chartType);\n    },\n\n    _addCustomEventComponentForNormalTooltip: function() {\n        this._addComponent('customEvent', AreaTypeCustomEvent, {\n            chartType: this.chartType,\n            isVertical: this.isVertical\n        });\n    },\n\n    /**\n     * Add components\n     * @param {object} convertedData converted data\n     * @param {string} chartType chart type\n     * @private\n     */\n    _addComponents: function(convertedData, chartType) {\n        var seriesData = {\n            data: {\n                values: tui.util.pivot(convertedData.values),\n                formattedValues: tui.util.pivot(convertedData.formattedValues),\n                formatFunctions: convertedData.formatFunctions,\n                joinLegendLabels: convertedData.joinLegendLabels\n            }\n        };\n        this._addComponentsForAxisType({\n            convertedData: convertedData,\n            axes: ['yAxis', 'xAxis'],\n            chartType: chartType,\n            serieses: [\n                {\n                    name: 'series',\n                    SeriesClass: this.Series,\n                    data: seriesData\n                }\n            ]\n        });\n    },\n\n    /**\n     * Render\n     * @returns {HTMLElement} chart element\n     */\n    render: function() {\n        return ChartBase.prototype.render.apply(this, arguments);\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = lineTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"