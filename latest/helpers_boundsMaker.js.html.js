tui.util.defineNamespace("fedoc.content", {});
fedoc.content["helpers_boundsMaker.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Bounds maker.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar chartConst = require('../const');\nvar calculator = require('./calculator');\nvar predicate = require('./predicate');\nvar renderUtil = require('./renderUtil');\n\n/**\n * Dimension.\n * @typedef {{width: number, height:number}} dimension\n */\n\n/**\n * Position.\n * @typedef {{left: number, top:number}} position\n */\n\n/**\n * Bound.\n * @typedef {{dimension: dimension, position:position}} bound\n */\n\nvar BoundsMaker = tui.util.defineClass(/** @lends BoundsMaker.prototype */{\n    /**\n     * Bounds maker.\n     * @constructs BoundsMaker\n     * @param {object} params parameters\n     */\n    init: function(params) {\n        /**\n         * options\n         * @type {object}\n         */\n        this.options = params.options || {};\n        this.options.legend = this.options.legend || {};\n        this.options.yAxis = this.options.yAxis || {};\n\n        /**\n         * theme\n         * @type {object}\n         */\n        this.theme = params.theme || {};\n\n        /**\n         * whether chart has axes or not\n         * @type {boolean}\n         */\n        this.hasAxes = params.hasAxes;\n\n        /**\n         * chart type\n         * @type {string}\n         */\n        this.chartType = params.chartType;\n\n        /**\n         * chart types for combo.\n         */\n        this.chartTypes = params.chartTypes || [];\n\n        /**\n         * data processor\n         * @type {DataProcessor}\n         */\n        this.dataProcessor = params.dataProcessor;\n\n        this.initBoundsData();\n    },\n\n    /**\n     * Initialize bounds data.\n     * @param {object} chartOption chart option\n     */\n    initBoundsData: function(chartOption) {\n        this.dimensions = {\n            legend: {\n                width: 0\n            },\n            yAxis: {\n                width: 0\n            },\n            rightYAxis: {\n                width: 0\n            },\n            xAxis: {\n                height: 0\n            },\n            circleLegend: {\n                width: 0\n            },\n            calculationLegend: {\n                width: 0\n            }\n        };\n\n        this.positions = {};\n\n        this.axesData = {};\n\n        this.xAxisDegree = 0;\n\n        /**\n         * chart left padding\n         * @type {number}\n         */\n        this.chartLeftPadding = chartConst.CHART_PADDING;\n\n        if (chartOption) {\n            this.options.chart = chartOption;\n        }\n\n        this._registerChartDimension();\n        this._registerTitleDimension();\n    },\n\n    /**\n     * Register dimension.\n     * @param {string} name component name\n     * @param {dimension} dimension component dimension\n     * @private\n     */\n    _registerDimension: function(name, dimension) {\n        this.dimensions[name] = tui.util.extend(this.dimensions[name] || {}, dimension);\n    },\n\n    /**\n     * Register base dimension.\n     * @param {string} name component name\n     * @param {dimension} dimension component dimension\n     */\n    registerBaseDimension: function(name, dimension) {\n        this._registerDimension(name, dimension);\n    },\n\n    /**\n     * Register axes data.\n     * @param {object} axesData axes data\n     */\n    registerAxesData: function(axesData) {\n        this.axesData = axesData;\n    },\n\n    /**\n     * Axes data.\n     * @returns {{xAxis: object, yAxis: object, rightYAxis: object}}\n     */\n    getAxesData: function() {\n        return this.axesData;\n    },\n\n    /**\n     * Calculate step of pixel unit.\n     * @param {{tickCount: number, isLabel: boolean}} axisData - data for rendering axis\n     * @param {number} size - width or height of serise area\n     * @returns {number}\n     * @private\n     */\n    _calculatePixelStep: function(axisData, size) {\n        var tickCount = axisData.tickCount;\n        var pixelStep;\n\n        if (axisData.isLabel) {\n            pixelStep = size / tickCount / 2;\n        } else {\n            pixelStep = size / (tickCount - 1);\n        }\n\n        return parseInt(pixelStep, 10);\n    },\n\n    /**\n     * Get minimum step of pixel unit for axis.\n     * @returns {number}\n     */\n    getMinimumPixelStepForAxis: function() {\n        var dimension = this.getDimension('series');\n        var yPixelStep = this._calculatePixelStep(this.axesData.yAxis, dimension.height);\n        var xPixelStep = this._calculatePixelStep(this.axesData.xAxis, dimension.width);\n\n        return Math.min(yPixelStep, xPixelStep);\n    },\n\n    /**\n     * Get max radius for bubble chart.\n     * @returns {number}\n     */\n    getMaxRadiusForBubbleChart: function() {\n        var maxRadius = this.getMinimumPixelStepForAxis();\n        var legendWidth = this.getDimension('calculationLegend').width || chartConst.MIN_LEGEND_WIDTH;\n        var circleLegendWidth = this.getDimension('circleLegend').width || legendWidth;\n\n        return Math.min((circleLegendWidth - chartConst.CIRCLE_LEGEND_PADDING) / 2, maxRadius);\n    },\n\n    /**\n     * Get bound.\n     * @param {string} name component name\n     * @returns {bound} component bound\n     */\n    getBound: function(name) {\n        return {\n            dimension: this.dimensions[name] || {},\n            position: this.positions[name] || {}\n        };\n    },\n\n    /**\n     * Set bound.\n     * @param {string} name component name\n     * @param {bound} bound component bound\n     * @private\n     */\n    _setBound: function(name, bound) {\n        this.dimensions[name] = bound.dimension;\n        this.positions[name] = bound.position;\n    },\n\n    /**\n     * Get dimension.\n     * @param {string} name component name\n     * @returns {dimension} component dimension\n     */\n    getDimension: function(name) {\n        return this.dimensions[name];\n    },\n\n    /**\n     * Get position.\n     * @param {string} name component name\n     * @returns {position} component position\n     */\n    getPosition: function(name) {\n        return this.positions[name];\n    },\n\n    /**\n     * Register chart dimension\n     * @private\n     */\n    _registerChartDimension: function() {\n        var chartOptions = this.options.chart || {},\n            dimension = {\n                width: chartOptions.width || chartConst.CHART_DEFAULT_WIDTH,\n                height: chartOptions.height || chartConst.CHART_DEFAULT_HEIGHT\n            };\n\n        this._registerDimension('chart', dimension);\n    },\n\n    /**\n     * Register title dimension\n     * @private\n     */\n    _registerTitleDimension: function() {\n        var chartOptions = this.options.chart || {},\n            titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, this.theme.title),\n            dimension = {\n                height: titleHeight + chartConst.TITLE_PADDING\n            };\n\n        this._registerDimension('title', dimension);\n    },\n\n    /**\n     * Calculate limit width of x axis.\n     * @param {number} labelCount - label count\n     * @returns {number} limit width\n     * @private\n     */\n    _calculateXAxisLabelLimitWidth: function(labelCount) {\n        var seriesWidth = this.getDimension('series').width;\n        var isAlign = predicate.isLineTypeChart(this.chartType);\n        var xAxisOptions = this.options.xAxis || {};\n\n        labelCount = labelCount || this.axesData.xAxis.labels.length;\n\n        if (predicate.isValidLabelInterval(xAxisOptions.labelInterval, xAxisOptions.tickInterval)) {\n            seriesWidth *= xAxisOptions.labelInterval;\n        }\n\n        return seriesWidth / (isAlign ? labelCount - 1 : labelCount);\n    },\n\n    /**\n     * Find rotation degree.\n     * @param {number} limitWidth limit width\n     * @param {number} labelWidth label width\n     * @param {number} labelHeight label height\n     * @returns {number} rotation degree\n     * @private\n     */\n    _findRotationDegree: function(limitWidth, labelWidth, labelHeight) {\n        var foundDegree,\n            halfWidth = labelWidth / 2,\n            halfHeight = labelHeight / 2;\n\n        tui.util.forEachArray(chartConst.DEGREE_CANDIDATES, function(degree) {\n            var compareWidth = (calculator.calculateAdjacent(degree, halfWidth) +\n                calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, halfHeight)) * 2;\n\n            foundDegree = degree;\n            if (compareWidth &lt;= limitWidth + chartConst.XAXIS_LABEL_COMPARE_MARGIN) {\n                return false;\n            }\n\n            return true;\n        });\n\n        return foundDegree;\n    },\n\n    /**\n     * Make rotation info about horizontal label.\n     * @param {number} limitWidth limit width\n     * @param {Array.&lt;string>} labels axis labels\n     * @param {object} theme axis label theme\n     * @returns {?object} rotation info\n     * @private\n     */\n    _makeHorizontalLabelRotationInfo: function(limitWidth) {\n        var labels = this.axesData.xAxis.labels,\n            theme = this.theme.xAxis.label,\n            maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(labels, theme),\n            degree, labelHeight;\n\n        if (maxLabelWidth &lt;= limitWidth) {\n            return null;\n        }\n\n        labelHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme);\n        degree = this._findRotationDegree(limitWidth, maxLabelWidth, labelHeight);\n\n        return {\n            maxLabelWidth: maxLabelWidth,\n            labelHeight: labelHeight,\n            degree: degree\n        };\n    },\n\n\n    /**\n     * Calculate overflow position left.\n     * @param {{degree: number, labelHeight: number}} rotationInfo rotation info\n     * @param {string} firstLabel firstLabel\n     * @returns {number} overflow position left\n     * @private\n     */\n    _calculateOverflowLeft: function(rotationInfo, firstLabel) {\n        var degree = rotationInfo.degree;\n        var labelHeight = rotationInfo.labelHeight;\n        var firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, this.theme.xAxis.label);\n        var newLabelWidth = (calculator.calculateAdjacent(degree, firstLabelWidth / 2)\n                + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;\n        var yAxisWidth = this.options.yAxis.isCenter ? 0 : this.getDimension('yAxis').width;\n        var diffLeft = newLabelWidth - yAxisWidth;\n\n        return diffLeft;\n    },\n\n    /**\n     * Update width of dimensions.\n     * @param {number} overflowLeft overflow left\n     * @private\n     */\n    _updateDimensionsWidth: function(overflowLeft) {\n        if (overflowLeft > 0) {\n            this.chartLeftPadding += overflowLeft;\n            this.dimensions.plot.width -= overflowLeft;\n            this.dimensions.series.width -= overflowLeft;\n            this.dimensions.customEvent.width -= overflowLeft;\n            this.dimensions.xAxis.width -= overflowLeft;\n            this.positions.series.left += overflowLeft;\n        }\n    },\n\n    /**\n     * Update degree of rotationInfo.\n     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo - rotation info\n     * @param {number} labelCount - label count\n     * @param {number} overflowLeft - overflow left\n     * @private\n     */\n    _updateDegree: function(rotationInfo, labelCount, overflowLeft) {\n        var limitWidth, newDegree;\n        if (overflowLeft > 0) {\n            limitWidth = this._calculateXAxisLabelLimitWidth(labelCount) + chartConst.XAXIS_LABEL_GUTTER;\n            newDegree = this._findRotationDegree(limitWidth, rotationInfo.maxLabelWidth, rotationInfo.labelHeight);\n            rotationInfo.degree = newDegree;\n        }\n    },\n\n    /**\n     * Calculate rotated height of xAxis.\n     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info\n     * @returns {number} xAxis height\n     * @private\n     */\n    _calculateXAxisRotatedHeight: function(rotationInfo) {\n        var degree = rotationInfo.degree;\n        var maxLabelWidth = rotationInfo.maxLabelWidth;\n        var labelHeight = rotationInfo.labelHeight;\n        var axisHeight = (calculator.calculateOpposite(degree, maxLabelWidth / 2) +\n                calculator.calculateOpposite(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;\n\n        return axisHeight;\n    },\n\n    /**\n     * Calculate height difference between origin category and rotation category.\n     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info\n     * @returns {number} height difference\n     * @private\n     */\n    _calculateDiffWithRotatedHeight: function(rotationInfo) {\n        var rotatedHeight = this._calculateXAxisRotatedHeight(rotationInfo);\n\n        return rotatedHeight - rotationInfo.labelHeight;\n    },\n\n    /**\n     * Calculate height difference between origin category and multiline category.\n     * @param {Array.&lt;string>} labels labels\n     * @param {number} limitWidth limit width\n     * @returns {number} calculated height\n     * @private\n     */\n    _calculateDiffWithMultilineHeight: function(labels, limitWidth) {\n        var theme = this.theme.xAxis.label,\n            multilineLabels = this.dataProcessor.getMultilineCategories(limitWidth, theme, this.axesData.xAxis.labels),\n            normalHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme),\n            multilineHeight = renderUtil.getRenderedLabelsMaxHeight(multilineLabels, tui.util.extend({\n                cssText: 'line-height:1.2;width:' + limitWidth + 'px'\n            }, theme));\n\n        return multilineHeight - normalHeight;\n    },\n\n    /**\n     * Update height of dimensions.\n     * @param {number} diffHeight diff height\n     * @private\n     */\n    _updateDimensionsHeight: function(diffHeight) {\n        this.dimensions.plot.height -= diffHeight;\n        this.dimensions.series.height -= diffHeight;\n        this.dimensions.customEvent.height -= diffHeight;\n        this.dimensions.tooltip.height -= diffHeight;\n        this.dimensions.yAxis.height -= diffHeight;\n        this.dimensions.rightYAxis.height -= diffHeight;\n        this.dimensions.xAxis.height += diffHeight;\n    },\n\n    /**\n     * Update dimensions and degree.\n     * @private\n     */\n    _updateDimensionsAndDegree: function() {\n        var xAxisOptions = this.options.xAxis || {};\n        var limitWidth = this._calculateXAxisLabelLimitWidth();\n        var labels = tui.util.filter(this.axesData.xAxis.labels, function(label) {\n            return !!label;\n        });\n        var rotationInfo, overflowLeft, diffHeight;\n\n        if (xAxisOptions.rotateLabel !== false) {\n            rotationInfo = this._makeHorizontalLabelRotationInfo(limitWidth);\n        }\n\n        if (rotationInfo) {\n            overflowLeft = this._calculateOverflowLeft(rotationInfo, labels[0]);\n            this.xAxisDegree = rotationInfo.degree;\n            this._updateDimensionsWidth(overflowLeft);\n            this._updateDegree(rotationInfo, labels.length, overflowLeft);\n            diffHeight = this._calculateDiffWithRotatedHeight(rotationInfo);\n        } else {\n            diffHeight = this._calculateDiffWithMultilineHeight(labels, limitWidth);\n        }\n\n        this._updateDimensionsHeight(diffHeight);\n    },\n\n    /**\n     * Make plot dimention\n     * @returns {{width: number, height: number}} plot dimension\n     * @private\n     */\n    _makePlotDimension: function() {\n        var seriesDimension = this.getDimension('series');\n\n        return {\n            width: seriesDimension.width,\n            height: seriesDimension.height + chartConst.OVERLAPPING_WIDTH\n        };\n    },\n\n    /**\n     * Register axis components dimension.\n     * @private\n     */\n    _registerAxisComponentsDimension: function() {\n        var plotDimension = this._makePlotDimension();\n\n        this._registerDimension('plot', plotDimension);\n\n        this._registerDimension('xAxis', {\n            width: plotDimension.width\n        });\n\n        this._registerDimension('yAxis', {\n            height: plotDimension.height\n        });\n\n        this._registerDimension('rightYAxis', {\n            height: plotDimension.height\n        });\n    },\n\n    /**\n     * Make series width.\n     * @returns {number} series width\n     */\n    makeSeriesWidth: function() {\n        var chartWidth = this.getDimension('chart').width;\n        var yAxisWidth = this.getDimension('yAxis').width;\n        var legendDimension = this.getDimension('calculationLegend');\n        var legendWidth, rightAreaWidth;\n\n        if (predicate.hasVerticalLegendWidth(this.options.legend)) {\n            legendWidth = legendDimension ? legendDimension.width : 0;\n        } else {\n            legendWidth = 0;\n        }\n\n        rightAreaWidth = legendWidth + this.getDimension('rightYAxis').width;\n\n        return chartWidth - (chartConst.CHART_PADDING * 2) - yAxisWidth - rightAreaWidth;\n    },\n\n    /**\n     * Make series height\n     * @returns {number} series height\n     */\n    makeSeriesHeight: function() {\n        var chartHeight = this.getDimension('chart').height;\n        var titleHeight = this.getDimension('title').height;\n        var legendOption = this.options.legend;\n        var legendHeight, bottomAreaWidth;\n\n        if (predicate.isHorizontalLegend(legendOption.align) &amp;&amp; legendOption.visible) {\n            legendHeight = this.getDimension('legend').height;\n        } else {\n            legendHeight = 0;\n        }\n\n        bottomAreaWidth = legendHeight + this.dimensions.xAxis.height;\n\n        return chartHeight - (chartConst.CHART_PADDING * 2) - titleHeight - bottomAreaWidth;\n    },\n\n    /**\n     * Make series dimension.\n     * @returns {{width: number, height: number}} series dimension\n     * @private\n     */\n    _makeSeriesDimension: function() {\n        return {\n            width: this.makeSeriesWidth(),\n            height: this.makeSeriesHeight()\n        };\n    },\n\n    /**\n     * Register center componets dimension.\n     * @private\n     */\n    _registerCenterComponentsDimension: function() {\n        var seriesDimension = this.getDimension('series');\n\n        this._registerDimension('tooltip', seriesDimension);\n        this._registerDimension('customEvent', seriesDimension);\n    },\n\n    /**\n     * Register axes type component positions.\n     * @param {number} leftLegendWidth legend width\n     * @private\n     */\n    _registerAxisComponentsPosition: function(leftLegendWidth) {\n        var seriesPosition = this.getPosition('series'),\n            seriesDimension = this.getDimension('series'),\n            yAxisWidth = this.getDimension('yAxis').width,\n            leftAreaWidth = yAxisWidth + seriesDimension.width + leftLegendWidth;\n\n        this.positions.plot = {\n            top: seriesPosition.top,\n            left: seriesPosition.left\n        };\n\n        this.positions.yAxis = {\n            top: seriesPosition.top,\n            left: this.chartLeftPadding + leftLegendWidth\n        };\n\n        this.positions.xAxis = {\n            top: seriesPosition.top + seriesDimension.height,\n            left: seriesPosition.left\n        };\n\n        this.positions.rightYAxis = {\n            top: seriesPosition.top,\n            left: this.chartLeftPadding + leftAreaWidth - chartConst.OVERLAPPING_WIDTH\n        };\n    },\n\n    /**\n     * Make legend bound.\n     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} legend bound\n     * @private\n     */\n    _makeLegendPosition: function() {\n        var dimensions = this.dimensions,\n            seriesDimension = this.getDimension('series'),\n            legendOption = this.options.legend,\n            top = dimensions.title.height,\n            yAxisAreaWidth, left;\n\n        if (predicate.isLegendAlignBottom(legendOption.align)) {\n            top += seriesDimension.height + this.getDimension('xAxis').height + chartConst.LEGEND_AREA_PADDING;\n        }\n\n        if (predicate.isHorizontalLegend(legendOption.align)) {\n            left = ((this.getDimension('chart').width - this.getDimension('legend').width) / 2)\n                - chartConst.LEGEND_AREA_PADDING;\n        } else if (predicate.isLegendAlignLeft(legendOption.align)) {\n            left = 0;\n        } else {\n            yAxisAreaWidth = this.getDimension('yAxis').width + this.getDimension('rightYAxis').width;\n            left = seriesDimension.width + yAxisAreaWidth + this.chartLeftPadding;\n        }\n\n        return {\n            top: top,\n            left: left\n        };\n    },\n\n    /**\n     * Make CircleLegend position.\n     * @returns {{top: number, left: number}}\n     * @private\n     */\n    _makeCircleLegendPosition: function() {\n        var seriesPosition = this.getPosition('series');\n        var seriesDimension = this.getDimension('series');\n        var circleDimension = this.getDimension('circleLegend');\n        var legendOption = this.options.legend;\n        var left, legendWidth;\n\n        if (predicate.isLegendAlignLeft(legendOption.align)) {\n            left = 0;\n        } else {\n            left = seriesPosition.left + seriesDimension.width;\n        }\n\n        if (predicate.hasVerticalLegendWidth(this.options.legend)) {\n            legendWidth = this.getDimension('legend').width + chartConst.CHART_PADDING;\n            left += (legendWidth - circleDimension.width) / 2;\n        }\n\n        return {\n            top: seriesPosition.top + seriesDimension.height - circleDimension.height,\n            left: left\n        };\n    },\n\n    /**\n     * Whether need expansion series or not.\n     * @returns {boolean}\n     * @private\n     */\n    _isNeedExpansionSeries: function() {\n        var chartType = this.chartType;\n\n        return !predicate.isMousePositionChart(chartType) &amp;&amp; !predicate.isTreemapChart(chartType)\n            &amp;&amp; !predicate.isPieDonutComboChart(chartType, this.chartTypes);\n    },\n\n    /**\n     * Register essential components positions.\n     * Essential components is all components except components for axis.\n     * @private\n     */\n    _registerEssentialComponentsPositions: function() {\n        var seriesPosition = this.getPosition('series');\n        var tooltipPosition;\n\n        this.positions.customEvent = tui.util.extend({}, seriesPosition);\n        this.positions.legend = this._makeLegendPosition();\n\n        if (this.getDimension('circleLegend').width) {\n            this.positions.circleLegend = this._makeCircleLegendPosition();\n        }\n\n        if (this._isNeedExpansionSeries()) {\n            tooltipPosition = {\n                top: seriesPosition.top - chartConst.SERIES_EXPAND_SIZE,\n                left: seriesPosition.left - chartConst.SERIES_EXPAND_SIZE\n            };\n        } else {\n            tooltipPosition = seriesPosition;\n        }\n\n        this.positions.tooltip = tooltipPosition;\n    },\n\n    /**\n     * Register positions.\n     * @private\n     */\n    _registerPositions: function() {\n        var alignOption = this.options.legend.align;\n        var isVisibleLegend = this.options.legend.visible;\n        var legendDimension = this.getDimension('legend');\n        var topLegendHeight = (predicate.isLegendAlignTop(alignOption) &amp;&amp; isVisibleLegend) ? legendDimension.height : 0;\n        var leftLegendWidth = (predicate.isLegendAlignLeft(alignOption) &amp;&amp; isVisibleLegend) ? legendDimension.width : 0;\n        var seriesPosition = {\n            top: this.getDimension('title').height + chartConst.CHART_PADDING + topLegendHeight,\n            left: this.chartLeftPadding + leftLegendWidth + this.getDimension('yAxis').width\n        };\n\n        this.positions.series = seriesPosition;\n\n        if (this.hasAxes) {\n            this._updateDimensionsAndDegree();\n            this._registerAxisComponentsPosition(leftLegendWidth);\n        }\n\n        this._registerEssentialComponentsPositions();\n    },\n\n    /**\n     * Register bound of extended series for rendering.\n     * @private\n     */\n    _registerExtendedSeriesBound: function() {\n        var seriesBound = this.getBound('series');\n        if (this._isNeedExpansionSeries()) {\n            seriesBound = renderUtil.expandBound(seriesBound);\n        }\n\n        this._setBound('extendedSeries', seriesBound);\n    },\n\n    /**\n     * Update bounds(positions, dimensions) of components for center option of yAxis.\n     * @private\n     */\n    _updateBoundsForYAxisCenterOption: function() {\n        var yAxisWidth = this.getDimension('yAxis').width,\n            yAxisExtensibleLeft = Math.floor((this.getDimension('series').width / 2)) + chartConst.OVERLAPPING_WIDTH,\n            xAxisDecreasingLeft = yAxisWidth - chartConst.OVERLAPPING_WIDTH,\n            additionalLeft = renderUtil.isOldBrowser() ? 1 : 0;\n\n        this.dimensions.extendedSeries.width += yAxisWidth;\n        this.dimensions.xAxis.width += chartConst.OVERLAPPING_WIDTH;\n        this.dimensions.plot.width += yAxisWidth + chartConst.OVERLAPPING_WIDTH;\n        this.dimensions.customEvent.width += yAxisWidth;\n        this.dimensions.tooltip.width += yAxisWidth;\n\n        this.positions.series.left -= (yAxisWidth - additionalLeft);\n        this.positions.extendedSeries.left -= (xAxisDecreasingLeft - additionalLeft);\n        this.positions.plot.left -= xAxisDecreasingLeft;\n        this.positions.yAxis.left += yAxisExtensibleLeft;\n        this.positions.xAxis.left -= xAxisDecreasingLeft;\n        this.positions.customEvent.left -= xAxisDecreasingLeft;\n        this.positions.tooltip.left -= xAxisDecreasingLeft;\n    },\n\n    /**\n     * Register series dimension.\n     */\n    registerSeriesDimension: function() {\n        var seriesDimension = this._makeSeriesDimension();\n\n        this._registerDimension('series', seriesDimension);\n    },\n\n    /**\n     * Register bounds data.\n     */\n    registerBoundsData: function() {\n        this._registerCenterComponentsDimension();\n\n        if (this.hasAxes) {\n            this._registerAxisComponentsDimension();\n        }\n\n        this._registerPositions();\n        this._registerExtendedSeriesBound();\n\n        if (this.options.yAxis.isCenter) {\n            this._updateBoundsForYAxisCenterOption();\n        }\n    }\n});\n\nmodule.exports = BoundsMaker;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"