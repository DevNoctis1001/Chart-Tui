tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_lineTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview lineTypeMixer is mixer of line type chart(line, area).\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase');\nvar chartConst = require('../const');\nvar axisDataMaker = require('../helpers/axisDataMaker');\nvar AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');\n\n/**\n * lineTypeMixer is mixer of line type chart(line, area).\n * @mixin\n */\nvar lineTypeMixer = {\n    /**\n     * Initialize line type chart.\n     * @param {Array.&lt;Array>} rawData raw data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     * @private\n     */\n    _lineTypeInit: function(rawData, theme, options) {\n        ChartBase.call(this, {\n            rawData: rawData,\n            theme: theme,\n            options: options,\n            hasAxes: true,\n            isVertical: true\n        });\n\n        /**\n         * checked legends.\n         * @type {null | Array.&lt;?boolean> | {line: ?Array.&lt;boolean>, column: ?Array.&lt;boolean>}}\n         */\n        this.checkedLegends = null;\n\n        this._initForAutoTickInterval();\n\n        this._addComponents(options.chartType);\n    },\n\n    /**\n     * Initialize for auto tick interval option.\n     * @private\n     */\n    _initForAutoTickInterval: function() {\n        /**\n         * previous updated xAxisData\n         * @type {null | object}\n         */\n        this.prevUpdatedData = null;\n\n        /**\n         * first updated tick count\n         */\n        this.firstTickCount = null;\n    },\n\n    /**\n     * Make map for AxisScaleMaker of axes(xAxis, yAxis).\n     * @returns {Object.&lt;string, AxisScaleMaker>}\n     * @private\n     */\n    _makeAxisScaleMakerMap: function() {\n        return {\n            yAxis: this._createAxisScaleMaker(this.options.yAxis, 'yAxis')\n        };\n    },\n\n    /**\n     * Add custom event component for normal tooltip.\n     * @private\n     */\n    _addCustomEventComponentForNormalTooltip: function() {\n        this.componentManager.register('customEvent', AreaTypeCustomEvent, {\n            chartType: this.chartType,\n            isVertical: this.isVertical,\n            zoomable: tui.util.pick(this.options.series, 'zoomable')\n        });\n    },\n\n    /**\n     * Add components\n     * @param {string} chartType chart type\n     * @private\n     */\n    _addComponents: function(chartType) {\n        this._addComponentsForAxisType({\n            chartType: chartType,\n            axis: [\n                {\n                    name: 'yAxis',\n                    isVertical: true\n                },\n                {\n                    name: 'xAxis',\n                    isLabel: true\n                }\n            ],\n            series: [\n                {\n                    name: this.options.chartType + 'Series',\n                    SeriesClass: this.Series\n                }\n            ],\n            plot: true\n        });\n    },\n\n    /**\n     * Update axesData.\n     * @private\n     * @override\n     */\n    _updateAxesData: function() {\n        var boundsMaker = this.boundsMaker;\n        var axesData = boundsMaker.getAxesData();\n        var xAxisData = axesData.xAxis;\n        var seriesWidth = boundsMaker.getDimension('series').width;\n        var shiftingOption = tui.util.pick(this.options.series, 'shifting');\n        var prevUpdatedData = this.prevUpdatedData;\n\n        if (shiftingOption || !prevUpdatedData) {\n            axisDataMaker.updateLabelAxisDataForAutoTickInterval(xAxisData, seriesWidth, this.addedDataCount);\n        } else {\n            axisDataMaker.updateLabelAxisDataForStackingDynamicData(xAxisData, prevUpdatedData, this.firstTickCount);\n        }\n\n        this.prevUpdatedData = xAxisData;\n\n        if (!this.firstTickCount) {\n            this.firstTickCount = xAxisData.tickCount;\n        }\n\n        boundsMaker.registerAxesData(axesData);\n    },\n\n    /**\n     * On change checked legend.\n     * @param {Array.&lt;?boolean> | {line: ?Array.&lt;boolean>, column: ?Array.&lt;boolean>}} checkedLegends checked legends\n     * @param {?object} rawData rawData\n     * @param {?object} boundsParams addition params for calculating bounds\n     * @override\n     */\n    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {\n        var self = this;\n        var pastPaused = this.paused;\n\n        if (!pastPaused) {\n            this._pauseAnimationForAddingData();\n        }\n\n        this._rerender(checkedLegends, rawData, boundsParams);\n\n        this.checkedLegends = checkedLegends;\n\n        if (!pastPaused) {\n            setTimeout(function() {\n                self._restartAnimationForAddingData();\n            }, chartConst.RERENDER_TIME);\n        }\n    },\n\n    /**\n     * Render for zoom.\n     * @param {boolean} isResetZoom - whether reset zoom or not\n     * @private\n     */\n    _renderForZoom: function(isResetZoom) {\n        var self = this;\n\n        this.boundsMaker.initBoundsData();\n        this._render(function(renderingData) {\n            renderingData.customEvent.isResetZoom = isResetZoom;\n            self._renderComponents(renderingData, 'zoom');\n        });\n    },\n\n    /**\n     * On zoom.\n     * @param {Array.&lt;number>} indexRange - index range for zoom\n     * @override\n     */\n    onZoom: function(indexRange) {\n        this._pauseAnimationForAddingData();\n        this.dataProcessor.updateRawDataForZoom(indexRange);\n        this.axisScaleMakerMap = null;\n        this._renderForZoom(false);\n    },\n\n    /**\n     * On reset zoom.\n     * @override\n     */\n    onResetZoom: function() {\n        var rawData = this.dataProcessor.getOriginalRawData();\n\n        if (this.checkedLegends) {\n            rawData = this._filterCheckedRawData(rawData, this.checkedLegends);\n        }\n\n        this.axisScaleMakerMap = null;\n        this.prevUpdatedData = null;\n        this.firstTickCount = null;\n\n        this.dataProcessor.initData(rawData);\n        this.dataProcessor.initZoomedRawData();\n        this.dataProcessor.addDataFromRemainDynamicData(tui.util.pick(this.options.series, 'shifting'));\n        this._renderForZoom(true);\n        this._restartAnimationForAddingData();\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = lineTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"