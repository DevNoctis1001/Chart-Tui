tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_axisTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview axisTypeMixer is mixer of axis type chart(bar, column, line, area).\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar renderUtil = require('../helpers/renderUtil'),\n    ChartBase = require('./chartBase'),\n    Axis = require('../axes/axis'),\n    Plot = require('../plots/plot'),\n    Legend = require('../legends/legend'),\n    GroupTypeCustomEvent = require('../customEvents/groupTypeCustomEvent'),\n    BoundsTypeCustomEvent = require('../customEvents/boundsTypeCustomEvent'),\n    Tooltip = require('../tooltips/tooltip'),\n    GroupTooltip = require('../tooltips/groupTooltip');\n\n\n/**\n * Axis limit value.\n * @typedef {{min: number, max: number}} axisLimit\n */\n\n/**\n * axisTypeMixer is base class of axis type chart(bar, column, line, area).\n * @mixin\n */\nvar axisTypeMixer = {\n    /**\n     * Add axis components.\n     * @param {Array.&lt;object>} axes axes option\n     * @param {boolean} aligned whether aligned or not\n     * @private\n     */\n    _addAxisComponents: function(axes, aligned) {\n        var self = this;\n        tui.util.forEach(axes, function(axis) {\n            var axisParams = {\n                aligned: aligned,\n                isLabel: !!axis.isLabel,\n                chartType: axis.chartType\n            };\n\n            if (axis.name === 'rightYAxis') {\n                axisParams.componentType = 'yAxis';\n                axisParams.index = 1;\n            }\n\n            self.componentManager.register(axis.name, Axis, axisParams);\n        });\n    },\n\n    /**\n     * Add series components\n     * @param {Array&lt;object>} serieses serieses\n     * @param {object} options options\n     * @param {boolean} aligned whether aligned or not\n     * @private\n     */\n    _addSeriesComponents: function(serieses, options) {\n        var self = this,\n            seriesBaseParams = {\n                libType: options.libType,\n                chartType: options.chartType,\n                userEvent: this.userEvent,\n                componentType: 'series'\n            };\n\n        tui.util.forEach(serieses, function(series) {\n            var seriesParams = tui.util.extend(seriesBaseParams, series.data);\n            self.componentManager.register(series.name, series.SeriesClass, seriesParams);\n        });\n    },\n\n    /**\n     * Add tooltip component\n     * @private\n     */\n    _addTooltipComponent: function() {\n        var TooltipClass = this.hasGroupTooltip ? GroupTooltip : Tooltip;\n        this.componentManager.register('tooltip', TooltipClass, this._makeTooltipData());\n    },\n\n    /**\n     * Add legend component.\n     * @param {Array.&lt;string>} chartTypes series chart types\n     * @param {string} chartType chartType\n     * @param {object} legendOptions legend options\n     * @private\n     */\n    _addLegendComponent: function(chartTypes, chartType, legendOptions) {\n        if (!legendOptions || !legendOptions.hidden) {\n            this.componentManager.register('legend', Legend, {\n                chartTypes: chartTypes,\n                chartType: chartType,\n                userEvent: this.userEvent\n            });\n        }\n    },\n\n    /**\n     * Add components for axis type chart.\n     * @param {object} params parameters\n     *      @param {object} params.axes axes data\n     *      @param {object} params.plotData plot data\n     *      @param {function} params.serieses serieses\n     * @private\n     */\n    _addComponentsForAxisType: function(params) {\n        var options = this.options,\n            aligned = !!params.aligned;\n\n        this.componentManager.register('plot', Plot);\n        this._addAxisComponents(params.axes, aligned);\n        this._addLegendComponent(params.seriesChartTypes, params.chartType, this.options.legend);\n        this._addSeriesComponents(params.serieses, options);\n        this._addTooltipComponent(options.chartType);\n    },\n\n    /**\n     * Get limit map.\n     * @param {{yAxis: object, xAxis: object}} axesData axes data\n     * @param {Array.&lt;string>} chartTypes chart types\n     * @returns {{column: ?axisLimit, line: ?axisLimit}} limit map\n     * @private\n     */\n    _getLimitMap: function(axesData, chartTypes) {\n        var limitMap = {},\n            yAxisLimit = axesData.yAxis ? axesData.yAxis.limit : axesData.rightYAxis.limit;\n\n        limitMap[chartTypes[0]] = this.isVertical ? yAxisLimit : axesData.xAxis.limit;\n\n        if (chartTypes.length > 1) {\n            limitMap[chartTypes[1]] = axesData.rightYAxis ? axesData.rightYAxis.limit : yAxisLimit;\n        }\n\n        return limitMap;\n    },\n\n    /**\n     * Make series data for rendering.\n     * @param {{yAxis: object, xAxis: object}} axesData axes data\n     * @param {Array.&lt;string>} chartTypes chart types\n     * @param {boolean} isVertical whether vertical or not\n     * @returns {object} series data\n     * @private\n     */\n    _makeSeriesDataForRendering: function(axesData, chartTypes) {\n        var limitMap = this._getLimitMap(axesData, chartTypes),\n            aligned = axesData.xAxis.aligned,\n            seriesData = {};\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            seriesData[chartType + 'Series'] = {\n                limit: limitMap[chartType],\n                aligned: aligned,\n                hasAxes: true\n            };\n        });\n\n        return seriesData;\n    },\n\n    /**\n     * Add data ratios.\n     * @private\n     * @override\n     */\n    _addDataRatios: function() {\n        var self = this;\n        var axesData = this.boundsMaker.getAxesData();\n        var chartTypes = this.chartTypes || [this.chartType];\n        var limitMap = this._getLimitMap(axesData, chartTypes);\n        var stackedOption = this.options.series &amp;&amp; this.options.series.stacked;\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            self.dataProcessor.addDataRatios(limitMap[chartType], stackedOption, chartType);\n        });\n    },\n\n    /**\n     * Make rendering data for axis type chart.\n     * @returns {object} data for rendering\n     * @private\n     * @override\n     */\n    _makeRenderingData: function() {\n        var axesData = this.boundsMaker.getAxesData();\n        var optionChartTypes = this.chartTypes || [this.chartType];\n        var seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical);\n        var yAxis = axesData.yAxis ? axesData.yAxis : axesData.rightYAxis;\n\n        return tui.util.extend({\n            plot: {\n                vTickCount: yAxis.validTickCount,\n                hTickCount: axesData.xAxis.validTickCount\n            },\n            customEvent: {\n                tickCount: this.isVertical ? axesData.xAxis.tickCount : yAxis.tickCount\n            }\n        }, seriesData, axesData);\n    },\n\n    /**\n     * Add grouped event handler layer.\n     * @private\n     * @override\n     */\n    _addCustomEventComponentForGroupTooltip: function() {\n        this.componentManager.register('customEvent', GroupTypeCustomEvent, {\n            chartType: this.chartType,\n            isVertical: this.isVertical\n        });\n    },\n\n    /**\n     * Add custom event component for normal tooltip.\n     * @private\n     */\n    _addCustomEventComponentForNormalTooltip: function() {\n        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {\n            chartType: this.chartType,\n            isVertical: this.isVertical\n        });\n    },\n\n    /**\n     * Add custom event component.\n     * @private\n     */\n    _addCustomEventComponent: function() {\n        if (this.hasGroupTooltip) {\n            this._addCustomEventComponentForGroupTooltip();\n        } else {\n            this._addCustomEventComponentForNormalTooltip();\n        }\n    },\n\n    /**\n     * Attach coordinate event.\n     * @param {CustomEvent} customEvent custom event component\n     * @param {Tooltip} tooltip tooltip component\n     * @param {Array.&lt;Series>} serieses series components\n     * @private\n     */\n    _attachCustomEventForGroupTooltip: function(customEvent, tooltip, serieses) {\n        customEvent.on('showGroupTooltip', tooltip.onShow, tooltip);\n        customEvent.on('hideGroupTooltip', tooltip.onHide, tooltip);\n\n        tui.util.forEach(serieses, function(series) {\n            if (series.onShowGroupTooltipLine) {\n                tooltip.on('showGroupTooltipLine', series.onShowGroupTooltipLine, series);\n                tooltip.on('hideGroupTooltipLine', series.onHideGroupTooltipLine, series);\n            }\n            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);\n            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);\n        });\n    },\n\n    /**\n     * Attach custom event for normal tooltip.\n     * @param {CustomEvent} customEvent custom event component\n     * @param {Tooltip} tooltip tooltip component\n     * @param {Array.&lt;Series>} serieses series components\n     * @private\n     */\n    _attachCustomEventForNormalTooltip: function(customEvent, tooltip, serieses) {\n        customEvent.on('showTooltip', tooltip.onShow, tooltip);\n        customEvent.on('hideTooltip', tooltip.onHide, tooltip);\n\n        tui.util.forEach(serieses, function(series) {\n            var showAnimationEventName, hideAnimationEventName;\n\n            if (series.onShowAnimation) {\n                showAnimationEventName = renderUtil.makeCustomEventName('show', series.chartType, 'animation');\n                hideAnimationEventName = renderUtil.makeCustomEventName('hide', series.chartType, 'animation');\n                tooltip.on(showAnimationEventName, series.onShowAnimation, series);\n                tooltip.on(hideAnimationEventName, series.onHideAnimation, series);\n            }\n        });\n    },\n\n    /**\n     * Attach custom event for series selection.\n     * @param {CustomEvent} customEvent custom event component\n     * @param {Array.&lt;Series>} serieses series components\n     * @private\n     */\n    _attachCustomEventForSeriesSelection: function(customEvent, serieses) {\n        tui.util.forEach(serieses, function(series) {\n            var selectSeriesEventName = renderUtil.makeCustomEventName('select', series.chartType, 'series'),\n                unselectSeriesEventName = renderUtil.makeCustomEventName('unselect', series.chartType, 'series');\n\n            customEvent.on(selectSeriesEventName, series.onSelectSeries, series);\n            customEvent.on(unselectSeriesEventName, series.onUnselectSeries, series);\n        });\n    },\n\n    /**\n     * Attach custom event.\n     * @private\n     * @override\n     */\n    _attachCustomEvent: function() {\n        var serieses = this.componentManager.where({componentType: 'series'}),\n            customEvent = this.componentManager.get('customEvent'),\n            tooltip = this.componentManager.get('tooltip');\n\n        ChartBase.prototype._attachCustomEvent.call(this, serieses);\n\n        if (this.hasGroupTooltip) {\n            this._attachCustomEventForGroupTooltip(customEvent, tooltip, serieses);\n        } else {\n            this._attachCustomEventForNormalTooltip(customEvent, tooltip, serieses);\n        }\n\n        this._attachCustomEventForSeriesSelection(customEvent, serieses);\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = axisTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"