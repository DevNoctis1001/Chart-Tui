tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_pieTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview pieTypeMixer is mixer of pie type chart.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar renderUtil = require('../helpers/renderUtil');\nvar Legend = require('../legends/legend');\nvar Tooltip = require('../tooltips/tooltip');\nvar PieChartSeries = require('../series/pieChartSeries');\nvar SimpleCustomEvent = require('../customEvents/simpleCustomEvent');\n\n/**\n * pieTypeMixer is mixer of pie type chart.\n * @mixin\n */\nvar pieTypeMixer = {\n    /**\n     * Add legend component.\n     * @param {Array.&lt;string>} [chartTypes] - chart types\n     * @private\n     */\n    _addLegendComponent: function(chartTypes) {\n        var legendOption = this.options.legend || {};\n\n        if (legendOption.visible) {\n            this.componentManager.register('legend', Legend, {\n                chartTypes: chartTypes,\n                chartType: this.chartType,\n                userEvent: this.userEvent\n            });\n        }\n    },\n\n    /**\n     * Add tooltip component.\n     * @private\n     */\n    _addTooltipComponent: function() {\n        this.componentManager.register('tooltip', Tooltip, this._makeTooltipData());\n    },\n\n    /**\n     * Add series components.\n     * @param {Array.&lt;{name: string, additionalParams: ?object}>} seriesData - data for adding series component\n     * @private\n     */\n    _addSeriesComponents: function(seriesData) {\n        var componentManager = this.componentManager;\n        var seriesBaseParams = {\n            libType: this.options.libType,\n            componentType: 'series',\n            chartBackground: this.theme.chart.background,\n            userEvent: this.userEvent\n        };\n\n        tui.util.forEach(seriesData, function(seriesDatum) {\n            var seriesParams = tui.util.extend(seriesBaseParams, seriesDatum.additionalParams);\n\n            componentManager.register(seriesDatum.name, PieChartSeries, seriesParams);\n        });\n    },\n\n    /**\n     * Add custom event component.\n     * @private\n     * @override\n     */\n    _addCustomEventComponent: function() {\n        this.componentManager.register('customEvent', SimpleCustomEvent, {\n            chartType: this.chartType\n        });\n    },\n\n    /**\n     * Add custom event.\n     * @param {Array.&lt;object>} seriesComponents - series components\n     * @private\n     */\n    _attachCustomEventForPieTypeChart: function(seriesComponents) {\n        var clickEventName = renderUtil.makeCustomEventName('click', this.chartType, 'series');\n        var moveEventName = renderUtil.makeCustomEventName('move', this.chartType, 'series');\n        var customEvent = this.componentManager.get('customEvent');\n        var tooltip = this.componentManager.get('tooltip');\n        var eventMap = {};\n\n        tui.util.forEachArray(seriesComponents, function(series) {\n            eventMap[clickEventName] = series.onClickSeries;\n            eventMap[moveEventName] = series.onMoveSeries;\n            customEvent.on(eventMap, series);\n\n            series.on({\n                showTooltip: tooltip.onShow,\n                hideTooltip: tooltip.onHide,\n                showTooltipContainer: tooltip.onShowTooltipContainer,\n                hideTooltipContainer: tooltip.onHideTooltipContainer\n            }, tooltip);\n        });\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = pieTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"