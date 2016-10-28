tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_pieTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview pieTypeMixer is mixer of pie type chart.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar Legend = require('../components/legends/legend');\nvar Tooltip = require('../components/tooltips/tooltip');\nvar PieChartSeries = require('../components/series/pieChartSeries');\nvar SimpleCustomEvent = require('../components/customEvents/simpleCustomEvent');\n\n/**\n * pieTypeMixer is mixer of pie type chart.\n * @mixin\n */\nvar pieTypeMixer = {\n    /**\n     * Add legend component.\n     * @param {Array.&lt;string>} [seriesNames] - series names\n     * @private\n     */\n    _addLegendComponent: function(seriesNames) {\n        var legendOption = this.options.legend || {};\n\n        if (legendOption.visible) {\n            this.componentManager.register('legend', Legend, {\n                seriesNames: seriesNames,\n                chartType: this.chartType\n            });\n        }\n    },\n\n    /**\n     * Add tooltip component.\n     * @private\n     */\n    _addTooltipComponent: function() {\n        this.componentManager.register('tooltip', Tooltip, this._makeTooltipData());\n    },\n\n    /**\n     * Add series components.\n     * @param {Array.&lt;{name: string, additionalParams: ?object}>} seriesData - data for adding series component\n     * @private\n     */\n    _addSeriesComponents: function(seriesData) {\n        var componentManager = this.componentManager;\n        var seriesBaseParams = {\n            libType: this.options.libType,\n            componentType: 'series',\n            chartBackground: this.theme.chart.background\n        };\n\n        tui.util.forEach(seriesData, function(seriesDatum) {\n            var seriesParams = tui.util.extend(seriesBaseParams, seriesDatum.additionalParams);\n\n            componentManager.register(seriesDatum.name, PieChartSeries, seriesParams);\n        });\n    },\n\n    /**\n     * Add custom event component.\n     * @private\n     * @override\n     */\n    _addCustomEventComponent: function() {\n        this.componentManager.register('customEvent', SimpleCustomEvent, {\n            chartType: this.chartType\n        });\n    }\n};\n\nmodule.exports = pieTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"