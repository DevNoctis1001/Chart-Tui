tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_axisTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview axisTypeMixer is mixer for help to axis types charts like bar, column, line, area, bubble, combo.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase');\nvar axisDataMaker = require('../helpers/axisDataMaker');\nvar renderUtil = require('../helpers/renderUtil');\nvar predicate = require('../helpers/predicate');\nvar Axis = require('../axes/axis');\nvar Plot = require('../plots/plot');\nvar Legend = require('../legends/legend');\nvar GroupTypeCustomEvent = require('../customEvents/groupTypeCustomEvent');\nvar BoundsTypeCustomEvent = require('../customEvents/boundsTypeCustomEvent');\nvar Tooltip = require('../tooltips/tooltip');\nvar GroupTooltip = require('../tooltips/groupTooltip');\n\n/**\n * Axis limit value.\n * @typedef {{min: number, max: number}} axisLimit\n */\n\n/**\n * axisTypeMixer is mixer for help to axis types charts like bar, column, line, area, bubble, combo.\n * @mixin\n */\nvar axisTypeMixer = {\n    /**\n     * Add axis components.\n     * @param {Array.&lt;object>} axes axes option\n     * @param {boolean} aligned whether aligned or not\n     * @private\n     */\n    _addAxisComponents: function(axes, aligned) {\n        var self = this;\n        tui.util.forEach(axes, function(axis) {\n            var axisParams = {\n                aligned: aligned,\n                isLabel: !!axis.isLabel,\n                chartType: axis.chartType\n            };\n\n            if (axis.name === 'rightYAxis') {\n                axisParams.componentType = 'yAxis';\n                axisParams.index = 1;\n            }\n\n            self.componentManager.register(axis.name, Axis, axisParams);\n        });\n    },\n\n    /**\n     * Add series components\n     * @param {Array&lt;object>} serieses serieses\n     * @param {object} options options\n     * @param {boolean} aligned whether aligned or not\n     * @private\n     */\n    _addSeriesComponents: function(serieses, options) {\n        var self = this,\n            seriesBaseParams = {\n                libType: options.libType,\n                chartType: options.chartType,\n                userEvent: this.userEvent,\n                componentType: 'series'\n            };\n\n        tui.util.forEach(serieses, function(series) {\n            var seriesParams = tui.util.extend(seriesBaseParams, series.data);\n            self.componentManager.register(series.name, series.SeriesClass, seriesParams);\n        });\n    },\n\n    /**\n     * Add tooltip component\n     * @private\n     */\n    _addTooltipComponent: function() {\n        var TooltipClass = this.hasGroupTooltip ? GroupTooltip : Tooltip;\n        this.componentManager.register('tooltip', TooltipClass, this._makeTooltipData());\n    },\n\n    /**\n     * Add legend component.\n     * @param {Array.&lt;string>} chartTypes series chart types\n     * @param {string} chartType chartType\n     * @private\n     */\n    _addLegendComponent: function(chartTypes, chartType) {\n        this.componentManager.register('legend', Legend, {\n            chartTypes: chartTypes,\n            chartType: chartType,\n            userEvent: this.userEvent\n        });\n    },\n\n    /**\n     * Add components for axis type chart.\n     * @param {object} params parameters\n     *      @param {object} params.axes axes data\n     *      @param {object} params.plotData plot data\n     *      @param {function} params.serieses serieses\n     * @private\n     */\n    _addComponentsForAxisType: function(params) {\n        var options = this.options;\n        var aligned = !!params.aligned;\n\n        this.componentManager.register('plot', Plot);\n        this._addAxisComponents(params.axes, aligned);\n        if (options.legend.visible) {\n            this._addLegendComponent(params.seriesNames, params.chartType);\n        }\n        this._addSeriesComponents(params.serieses, options);\n        this._addTooltipComponent();\n    },\n\n    /**\n     * Get limit map.\n     * @param {{yAxis: object, xAxis: object}} axesData axes data\n     * @param {Array.&lt;string>} chartTypes chart types\n     * @returns {{column: ?axisLimit, line: ?axisLimit}} limit map\n     * @private\n     */\n    _getLimitMap: function(axesData, chartTypes) {\n        var limitMap = {},\n            yAxisLimit = axesData.yAxis ? axesData.yAxis.limit : axesData.rightYAxis.limit;\n\n        limitMap[chartTypes[0]] = this.isVertical ? yAxisLimit : axesData.xAxis.limit;\n\n        if (chartTypes.length > 1) {\n            limitMap[chartTypes[1]] = axesData.rightYAxis ? axesData.rightYAxis.limit : yAxisLimit;\n        }\n\n        return limitMap;\n    },\n\n    /**\n     * Get map for AxisScaleMaker of axes(xAxis, yAxis).\n     * @returns {Object.&lt;string, AxisScaleMaker>}\n     * @private\n     */\n    _getAxisScaleMakerMap: function() {\n        if (!this.axisScaleMakerMap) {\n            this.axisScaleMakerMap = this._makeAxisScaleMakerMap();\n        }\n\n        return this.axisScaleMakerMap;\n    },\n\n    /**\n     * Make axis data for rendering area of axis like yAxis, xAxis, rightYAxis.\n     * @param {AxisScaleMaker} axisScaleMaker - AxisScaleMaker\n     * @param {object} options - options for axis\n     * @param {boolean} [isVertical] - whether vertical or not\n     * @param {boolean} [isPositionRight] - whether right position or not\n     * @returns {object}\n     * @private\n     */\n    _makeAxisData: function(axisScaleMaker, options, isVertical, isPositionRight) {\n        var aligned = predicate.isLineTypeChart(this.chartType);\n        var axisData;\n\n        if (axisScaleMaker) {\n            axisData = axisDataMaker.makeValueAxisData({\n                axisScaleMaker: axisScaleMaker,\n                options: options,\n                isVertical: !!isVertical,\n                isPositionRight: !!isPositionRight,\n                aligned: !!aligned\n            });\n        } else {\n            axisData = axisDataMaker.makeLabelAxisData({\n                labels: this.dataProcessor.getCategories(),\n                options: options,\n                isVertical: !!isVertical,\n                isPositionRight: !!isPositionRight,\n                aligned: !!aligned\n            });\n        }\n\n        return axisData;\n    },\n\n    /**\n     * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.\n     * @returns {object} axes data\n     * @private\n     * @override\n     */\n    _makeAxesData: function() {\n        var axisScaleMakerMap = this._getAxisScaleMakerMap();\n        var options = this.options;\n        var yAxisOptions = tui.util.isArray(options.yAxis) ? options.yAxis : [options.yAxis];\n        var axesData = {\n            xAxis: this._makeAxisData(axisScaleMakerMap.xAxis, options.xAxis),\n            yAxis: this._makeAxisData(axisScaleMakerMap.yAxis, yAxisOptions[0], true)\n        };\n\n        if (this.hasRightYAxis) {\n            axesData.rightYAxis = this._makeAxisData(null, yAxisOptions[1], true, true);\n        }\n\n        return axesData;\n    },\n\n    /**\n     * Make series data for rendering.\n     * @param {{yAxis: object, xAxis: object}} axesData axes data\n     * @param {Array.&lt;string>} chartTypes chart types\n     * @param {boolean} isVertical whether vertical or not\n     * @returns {object} series data\n     * @private\n     */\n    _makeSeriesDataForRendering: function(axesData, chartTypes) {\n        var limitMap = this._getLimitMap(axesData, chartTypes);\n        var aligned = axesData.xAxis.aligned;\n        var seriesData = {};\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            seriesData[chartType + 'Series'] = {\n                limit: limitMap[chartType],\n                aligned: aligned,\n                hasAxes: true\n            };\n        });\n\n        return seriesData;\n    },\n\n    /**\n     * Add data ratios.\n     * @private\n     * @override\n     */\n    _addDataRatios: function() {\n        var self = this;\n        var axesData = this.boundsMaker.getAxesData();\n        var chartTypes = this.chartTypes || [this.chartType];\n        var limitMap = this._getLimitMap(axesData, chartTypes);\n        var stackType = tui.util.pick(this.options.series, 'stackType');\n\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            self.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);\n        });\n    },\n\n    /**\n     * Make rendering data for axis type chart.\n     * @returns {object} data for rendering\n     * @private\n     * @override\n     */\n    _makeRenderingData: function() {\n        var axesData = this.boundsMaker.getAxesData();\n        var optionChartTypes = this.chartTypes || [this.chartType];\n        var seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical);\n        var yAxis = axesData.yAxis ? axesData.yAxis : axesData.rightYAxis;\n\n        return tui.util.extend({\n            plot: {\n                vTickCount: yAxis.validTickCount,\n                hTickCount: axesData.xAxis.validTickCount\n            },\n            customEvent: {\n                tickCount: this.isVertical ? axesData.xAxis.tickCount : yAxis.tickCount\n            }\n        }, seriesData, axesData);\n    },\n\n    /**\n     * Add grouped event handler layer.\n     * @private\n     * @override\n     */\n    _addCustomEventComponentForGroupTooltip: function() {\n        this.componentManager.register('customEvent', GroupTypeCustomEvent, {\n            chartType: this.chartType,\n            isVertical: this.isVertical\n        });\n    },\n\n    /**\n     * Add custom event component for normal tooltip.\n     * @private\n     */\n    _addCustomEventComponentForNormalTooltip: function() {\n        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {\n            chartType: this.chartType,\n            isVertical: this.isVertical\n        });\n    },\n\n    /**\n     * Add custom event component.\n     * @private\n     */\n    _addCustomEventComponent: function() {\n        if (this.hasGroupTooltip) {\n            this._addCustomEventComponentForGroupTooltip();\n        } else {\n            this._addCustomEventComponentForNormalTooltip();\n        }\n    },\n\n    /**\n     * Attach coordinate event.\n     * @param {CustomEvent} customEvent custom event component\n     * @param {Tooltip} tooltip tooltip component\n     * @param {Array.&lt;Series>} serieses series components\n     * @private\n     */\n    _attachCustomEventForGroupTooltip: function(customEvent, tooltip, serieses) {\n        customEvent.on('showGroupTooltip', tooltip.onShow, tooltip);\n        customEvent.on('hideGroupTooltip', tooltip.onHide, tooltip);\n\n        tui.util.forEach(serieses, function(series) {\n            if (series.onShowGroupTooltipLine) {\n                tooltip.on('showGroupTooltipLine', series.onShowGroupTooltipLine, series);\n                tooltip.on('hideGroupTooltipLine', series.onHideGroupTooltipLine, series);\n            }\n            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);\n            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);\n        });\n    },\n\n    /**\n     * Attach custom event for normal tooltip.\n     * @param {CustomEvent} customEvent custom event component\n     * @param {Tooltip} tooltip tooltip component\n     * @param {Array.&lt;Series>} serieses series components\n     * @private\n     */\n    _attachCustomEventForNormalTooltip: function(customEvent, tooltip, serieses) {\n        customEvent.on('showTooltip', tooltip.onShow, tooltip);\n        customEvent.on('hideTooltip', tooltip.onHide, tooltip);\n\n        tui.util.forEach(serieses, function(series) {\n            var showAnimationEventName, hideAnimationEventName;\n\n            if (series.onShowAnimation) {\n                showAnimationEventName = renderUtil.makeCustomEventName('show', series.chartType, 'animation');\n                hideAnimationEventName = renderUtil.makeCustomEventName('hide', series.chartType, 'animation');\n                tooltip.on(showAnimationEventName, series.onShowAnimation, series);\n                tooltip.on(hideAnimationEventName, series.onHideAnimation, series);\n            }\n        });\n    },\n\n    /**\n     * Attach custom event for series selection.\n     * @param {CustomEvent} customEvent custom event component\n     * @param {Array.&lt;Series>} serieses series components\n     * @private\n     */\n    _attachCustomEventForSeriesSelection: function(customEvent, serieses) {\n        tui.util.forEach(serieses, function(series) {\n            var selectSeriesEventName = renderUtil.makeCustomEventName('select', series.chartType, 'series'),\n                unselectSeriesEventName = renderUtil.makeCustomEventName('unselect', series.chartType, 'series');\n\n            customEvent.on(selectSeriesEventName, series.onSelectSeries, series);\n            customEvent.on(unselectSeriesEventName, series.onUnselectSeries, series);\n        });\n    },\n\n    /**\n     * Attach custom event.\n     * @private\n     * @override\n     */\n    _attachCustomEvent: function() {\n        var serieses = this.componentManager.where({componentType: 'series'}),\n            customEvent = this.componentManager.get('customEvent'),\n            tooltip = this.componentManager.get('tooltip');\n\n        ChartBase.prototype._attachCustomEvent.call(this, serieses);\n\n        if (this.hasGroupTooltip) {\n            this._attachCustomEventForGroupTooltip(customEvent, tooltip, serieses);\n        } else {\n            this._attachCustomEventForNormalTooltip(customEvent, tooltip, serieses);\n        }\n\n        this._attachCustomEventForSeriesSelection(customEvent, serieses);\n    },\n\n    /**\n     * Override for initializing to axisScaleMakerMap.\n     * @private\n     * @override\n     */\n    _rerender: function() {\n        this.axisScaleMakerMap = null;\n        ChartBase.prototype._rerender.apply(this, arguments);\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = axisTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"