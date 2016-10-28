tui.util.defineNamespace("fedoc.content", {});
fedoc.content["components_plots_plot.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Plot component.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar chartConst = require('../../const/');\nvar dom = require('../../helpers/domHandler');\nvar predicate = require('../../helpers/predicate');\nvar calculator = require('../../helpers/calculator');\nvar renderUtil = require('../../helpers/renderUtil');\nvar plotTemplate = require('./plotTemplate');\n\nvar Plot = tui.util.defineClass(/** @lends Plot.prototype */ {\n    /**\n     * Plot component.\n     * @constructs Plot\n     * @param {object} params parameters\n     *      @param {number} params.vTickCount vertical tick count\n     *      @param {number} params.hTickCount horizontal tick count\n     *      @param {object} params.theme axis theme\n     */\n    init: function(params) {\n        /**\n         * Plot view className\n         * @type {string}\n         */\n        this.className = 'tui-chart-plot-area';\n\n        /**\n         * Data processor\n         * @type {DataProcessor}\n         */\n        this.dataProcessor = params.dataProcessor;\n\n        /**\n         * Options\n         * @type {object}\n         */\n        this.options = params.options || {};\n        this.options.showLine = tui.util.isUndefined(this.options.showLine) ? true : this.options.showLine;\n        this.options.lines = this.options.lines || [];\n        this.options.bands = this.options.bands || [];\n\n        /**\n         * x axis type\n         * @type {?string}\n         */\n        this.xAxisType = params.xAxisType;\n\n        /**\n         * Theme\n         * @type {object}\n         */\n        this.theme = params.theme || {};\n\n        /**\n         * chart type\n         * @type {string}\n         */\n        this.chartType = params.chartType;\n\n        /**\n         * sub charts type\n         * @type {Array.&lt;string>}\n         */\n        this.chartTypes = params.chartTypes;\n\n        /**\n         * whether vertical or not\n         */\n        this.isVertical = params.isVertical;\n\n        /**\n         * layout bounds information for this components\n         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}\n         */\n        this.layout = null;\n\n        /**\n         * axis data map\n         * @type {null|object}\n         */\n        this.axisDataMap = null;\n    },\n\n    /**\n     * Render plot area.\n     * @param {HTMLElement} plotContainer plot area element\n     * @private\n     */\n    _renderPlotArea: function(plotContainer) {\n        var dimension;\n\n        dimension = this.layout.dimension;\n\n        renderUtil.renderDimension(plotContainer, dimension);\n        renderUtil.renderPosition(plotContainer, this.layout.position);\n\n        if (predicate.isLineTypeChart(this.chartType, this.chartTypes)) {\n            this._renderOptionalLines(plotContainer, dimension);\n        }\n\n        if (this.options.showLine) {\n            this._renderPlotLines(plotContainer, dimension);\n        }\n    },\n\n    /**\n     * Set data for rendering.\n     * @param {{\n     *      layout: {\n     *          dimension: {width: number, height: number},\n     *          position: {left: number, top: number}\n     *      },\n     *      axisDataMap: object\n     * }} data - bounds and scale data\n     * @private\n     */\n    _setDataForRendering: function(data) {\n        if (data) {\n            this.layout = data.layout;\n            this.dimensionMap = data.dimensionMap;\n            this.axisDataMap = data.axisDataMap;\n        }\n    },\n\n    /**\n     * Render plot component.\n     * @param {object} data - bounds and scale data\n     * @returns {HTMLElement} plot element\n     */\n    render: function(data) {\n        var container = dom.create('DIV', this.className);\n\n        this._setDataForRendering(data);\n        this._renderPlotArea(container);\n        this.plotContainer = container;\n\n        return container;\n    },\n\n    /**\n     * Rerender.\n     * @param {object} data - bounds and scale data\n     */\n    rerender: function(data) {\n        this.plotContainer.innerHTML = '';\n        this._setDataForRendering(data);\n        this._renderPlotArea(this.plotContainer);\n    },\n\n    /**\n     * Resize plot component.\n     * @param {object} data - bounds and scale data\n     */\n    resize: function(data) {\n        this.rerender(data);\n    },\n\n    /**\n     * Make template params for vertical line.\n     * @param {object} additionalParams - additional params\n     * @returns {object}\n     * @private\n     */\n    _makeVerticalLineTemplateParams: function(additionalParams) {\n        return tui.util.extend({\n            className: 'vertical',\n            positionType: 'left',\n            width: '1px'\n        }, additionalParams);\n    },\n\n    /**\n     * Make template params for horizontal line.\n     * @param {object} additionalParams - additional params\n     * @returns {object}\n     * @private\n     */\n    _makeHorizontalLineTemplateParams: function(additionalParams) {\n        return tui.util.extend({\n            className: 'horizontal',\n            positionType: 'bottom',\n            height: '1px'\n        }, additionalParams);\n    },\n\n    /**\n     * Make line html.\n     * @param {number} position - position value\n     * @param {number} standardWidth - standard width\n     * @param {object} templateParams - template parameters\n     * @returns {string}\n     * @private\n     */\n    _makeLineHtml: function(position, standardWidth, templateParams) {\n        var percentagePosition = calculator.makePercentageValue(position, standardWidth);\n\n        templateParams.positionValue = percentagePosition + '%';\n        templateParams.opacity = templateParams.opacity || '';\n        return plotTemplate.tplPlotLine(templateParams);\n    },\n\n    /**\n     * Create value range for optional line.\n     * @param {{range: ?Array.&lt;number>, value: ?number}} optionalLineData - optional line data\n     * @returns {Array.&lt;number>}\n     * @private\n     */\n    _createOptionalLineValueRange: function(optionalLineData) {\n        var range = optionalLineData.range || [optionalLineData.value];\n\n        if (predicate.isDatetimeType(this.xAxisType)) {\n            range = tui.util.map(range, function(value) {\n                var date = new Date(value);\n\n                return date.getTime() || value;\n            });\n        }\n\n        return range;\n    },\n\n    /**\n     * Create position for optional line, when value axis.\n     * @param {{dataMin: number, distance: number}} xAxisData - x axis data\n     * @param {number} width - width\n     * @param {number} value - value\n     * @returns {number|null}\n     * @private\n     */\n    _createOptionalLinePosition: function(xAxisData, width, value) {\n        var ratio = (value - xAxisData.dataMin) / xAxisData.distance;\n        var position = ratio * width;\n\n        if (ratio === 1) {\n            position -= 1;\n        }\n\n        if (position &lt; 0) {\n            position = null;\n        }\n\n        return position;\n    },\n\n    /**\n     * Create position for optional line, when label axis.\n     * @param {number} width - width\n     * @param {number} value - value\n     * @returns {number|null}\n     * @private\n     */\n    _createOptionalLinePositionWhenLabelAxis: function(width, value) {\n        var dataProcessor = this.dataProcessor;\n        var index = dataProcessor.findCategoryIndex(value);\n        var position = null;\n        var ratio;\n\n        if (!tui.util.isNull(index)) {\n            ratio = (index === 0) ? 0 : (index / (dataProcessor.getCategoryCount() - 1));\n            position = ratio * width;\n        }\n\n        if (ratio === 1) {\n            position -= 1;\n        }\n\n        return position;\n    },\n\n    /**\n     * Create position map for optional line.\n     * @param {{range: ?Array.&lt;number>, value: ?number}} optionalLineData - optional line data\n     * @param {{isLabelAxis: boolean, dataMin: number, distance: number}} xAxisData - x axis data\n     * @param {number} width - width\n     * @returns {{start: number, end: number}}\n     * @private\n     */\n    _createOptionalLinePositionMap: function(optionalLineData, xAxisData, width) {\n        var range = this._createOptionalLineValueRange(optionalLineData);\n        var startPosition, endPosition;\n\n        if (xAxisData.isLabelAxis) {\n            startPosition = this._createOptionalLinePositionWhenLabelAxis(width, range[0]);\n            endPosition = this._createOptionalLinePositionWhenLabelAxis(width, range[1]);\n        } else {\n            startPosition = this._createOptionalLinePosition(xAxisData, width, range[0]);\n            endPosition = range[1] &amp;&amp; this._createOptionalLinePosition(xAxisData, width, range[1]);\n        }\n\n        if (tui.util.isExisty(endPosition) &amp;&amp; tui.util.isNull(startPosition)) {\n            startPosition = 0;\n        }\n\n        return {\n            start: startPosition,\n            end: endPosition\n        };\n    },\n\n    /**\n     * Make optional line html.\n     * @param {Array.&lt;number>} xAxisData - positions\n     * @param {number} width - standard width\n     * @param {object} templateParams - template parameters\n     * @param {object} optionalLineData - optional line information\n     * @returns {string}\n     * @private\n     */\n    _makeOptionalLineHtml: function(xAxisData, width, templateParams, optionalLineData) {\n        var positionMap = this._createOptionalLinePositionMap(optionalLineData, xAxisData, width);\n        var plotLineWidth = '1px';\n        var html = '';\n        var percentageWidth;\n\n        if (tui.util.isExisty(positionMap.start) &amp;&amp; (positionMap.start >= 0) &amp;&amp; (positionMap.start &lt;= width)) {\n            if (tui.util.isExisty(positionMap.end)) {\n                percentageWidth = calculator.makePercentageValue(positionMap.end - positionMap.start, width);\n                templateParams.width = percentageWidth + '%';\n            } else {\n                templateParams.width = plotLineWidth;\n            }\n\n            templateParams.color = optionalLineData.color || 'transparent';\n            templateParams.opacity = renderUtil.makeOpacityCssText(optionalLineData.opacity);\n            html = this._makeLineHtml(positionMap.start, width, templateParams);\n        }\n\n        return html;\n    },\n\n    /**\n     * Make optional lines html.\n     * @param {Array.&lt;object>} lines - optional lines\n     * @param {{width: number, height: number}} dimension - dimension\n     * @returns {string}\n     * @private\n     */\n    _makeOptionalLinesHtml: function(lines, dimension) {\n        var width = dimension.width;\n        var xAxisData = this.axisDataMap.xAxis;\n        var templateParams = this._makeVerticalLineTemplateParams({\n            height: dimension.height + 'px'\n        });\n        var makeOptionalLineHtml = tui.util.bind(this._makeOptionalLineHtml, this, xAxisData, width, templateParams);\n\n        return tui.util.map(lines, makeOptionalLineHtml).join('');\n    },\n\n    /**\n     * Render optional lines and bands.\n     * @param {HTMLElement} container - container\n     * @param {{width: number, height: number}} dimension - dimension\n     * @private\n     */\n    _renderOptionalLines: function(container, dimension) {\n        var optionalContainer = dom.create('DIV', 'tui-chart-plot-optional-lines-area');\n        var bandsHtml = this._makeOptionalLinesHtml(this.options.bands, dimension);\n        var linesHtml = this._makeOptionalLinesHtml(this.options.lines, dimension);\n\n        this.optionalContainer = optionalContainer;\n\n        dom.append(container, optionalContainer);\n\n        optionalContainer.innerHTML = bandsHtml + linesHtml;\n    },\n\n    /**\n     * Make html of plot lines.\n     * @param {Array.&lt;number>} positions - position values\n     * @param {number} standardWidth - standard width\n     * @param {object} templateParams parameters\n     * @returns {string} html\n     * @private\n     */\n    _makeLinesHtml: function(positions, standardWidth, templateParams) {\n        var self = this;\n        var lineHtml = tui.util.map(positions, function(position) {\n            return self._makeLineHtml(position, standardWidth, templateParams);\n        }).join('');\n\n        return lineHtml;\n    },\n\n    /**\n     * Maker html for vertical lines\n     * @param {{width: number, height: number}} dimension - dimension\n     * @param {string} lineColor - line color\n     * @returns {string}\n     * @private\n     */\n    _makeVerticalLinesHtml: function(dimension, lineColor) {\n        var positions = this._makeHorizontalPositions(dimension.width);\n        var templateParams = this._makeVerticalLineTemplateParams({\n            height: dimension.height + 'px',\n            color: lineColor\n        });\n\n        return this._makeLinesHtml(positions, dimension.width, templateParams);\n    },\n    /**\n     * Maker html for horizontal lines\n     * @param {{width: number, height: number}} dimension - dimension\n     * @param {string} lineColor - line color\n     * @returns {string}\n     * @private\n     */\n    _makeHorizontalLinesHtml: function(dimension, lineColor) {\n        var positions = this._makeVerticalPositions(dimension.height);\n        var templateParams = this._makeHorizontalLineTemplateParams({\n            width: dimension.width + 'px',\n            color: lineColor\n        });\n\n        return this._makeLinesHtml(positions, dimension.height, templateParams);\n    },\n\n    /**\n     * Render plot lines.\n     * @param {HTMLElement} container - container element\n     * @param {{width: number, height: number}} dimension plot area dimension\n     * @private\n     */\n    _renderPlotLines: function(container, dimension) {\n        var lineContainer = dom.create('DIV', 'tui-chart-plot-lines-area');\n        var theme = this.theme;\n        var lineHtml = '';\n\n        if (!predicate.isLineTypeChart(this.chartType)) {\n            lineHtml += this._makeVerticalLinesHtml(dimension, theme.lineColor);\n        }\n\n        lineHtml += this._makeHorizontalLinesHtml(dimension, theme.lineColor);\n\n        dom.append(container, lineContainer);\n        lineContainer.innerHTML += lineHtml;\n        renderUtil.renderBackground(container, theme.background);\n    },\n\n    /**\n     * Make positions for vertical line.\n     * @param {number} height plot height\n     * @returns {Array.&lt;number>} positions\n     * @private\n     */\n    _makeVerticalPositions: function(height) {\n        var axisDataMap = this.axisDataMap;\n        var yAxis = axisDataMap.yAxis || axisDataMap.rightYAxis;\n        var positions = calculator.makeTickPixelPositions(height, yAxis.validTickCount);\n\n        positions.shift();\n\n        return positions;\n    },\n\n    /**\n     * Make divided positions of plot.\n     * @param {number} width - plot width\n     * @param {number} tickCount - tick count\n     * @returns {Array.&lt;number>}\n     * @private\n     */\n    _makeDividedPlotPositions: function(width, tickCount) {\n        var yAxisWidth = this.dimensionMap.yAxis.width;\n        var leftWidth, rightWidth, leftPositions, rightPositions;\n\n        tickCount = parseInt(tickCount / 2, 10) + 1;\n        width -= yAxisWidth;\n        leftWidth = Math.round((width) / 2);\n        rightWidth = width - leftWidth;\n\n        leftPositions = calculator.makeTickPixelPositions(leftWidth, tickCount);\n        rightPositions = calculator.makeTickPixelPositions(rightWidth, tickCount, leftWidth + yAxisWidth);\n\n        leftPositions.pop();\n        rightPositions.shift();\n\n        return leftPositions.concat(rightPositions);\n    },\n\n    /**\n     * Make positions for horizontal line.\n     * @param {number} width plot width\n     * @returns {Array.&lt;number>} positions\n     * @private\n     */\n    _makeHorizontalPositions: function(width) {\n        var tickCount = this.axisDataMap.xAxis.validTickCount;\n        var positions;\n\n        if (this.options.divided) {\n            positions = this._makeDividedPlotPositions(width, tickCount);\n        } else {\n            positions = calculator.makeTickPixelPositions(width, tickCount);\n            positions.shift();\n        }\n\n        return positions;\n    },\n\n    /**\n     * Add plot line.\n     * @param {{index: number, color: string, id: string}} data - data\n     */\n    addPlotLine: function(data) {\n        this.options.lines.push(data);\n        this.rerender();\n    },\n\n    /**\n     * Add plot band.\n     * @param {{range: Array.&lt;number>, color: string, id: string}} data - data\n     */\n    addPlotBand: function(data) {\n        this.options.bands.push(data);\n        this.rerender();\n    },\n\n    /**\n     * Remove plot line.\n     * @param {string} id - line id\n     */\n    removePlotLine: function(id) {\n        this.options.lines = tui.util.filter(this.options.lines, function(line) {\n            return line.id !== id;\n        });\n        this.rerender();\n    },\n\n    /**\n     * Remove plot band.\n     * @param {string} id - band id\n     */\n    removePlotBand: function(id) {\n        this.options.bands = tui.util.filter(this.options.bands, function(line) {\n            return line.id !== id;\n        });\n        this.rerender();\n    },\n\n    /**\n     * Animate for adding data.\n     * @param {{tickSize: number, shifting: boolean}} data - data for animation\n     */\n    animateForAddingData: function(data) {\n        var self = this;\n        var beforeLeft = 0;\n        var interval = data.tickSize;\n        var areaWidth;\n\n        if (this.dataProcessor.isCoordinateType()) {\n            this.optionalContainer.innerHTML = '';\n        } else if (data.shifting) {\n            renderUtil.startAnimation(chartConst.ADDING_DATA_ANIMATION_DURATION, function(ratio) {\n                var left = interval * ratio;\n                self.optionalContainer.style.left = (beforeLeft - left) + 'px';\n            });\n        } else {\n            areaWidth = this.layout.dimension.width;\n            renderUtil.startAnimation(chartConst.ADDING_DATA_ANIMATION_DURATION, function(ratio) {\n                var left = interval * ratio;\n                self.optionalContainer.style.width = (areaWidth - left) + 'px';\n            }, function() {\n            });\n        }\n    }\n});\n\nmodule.exports = Plot;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"