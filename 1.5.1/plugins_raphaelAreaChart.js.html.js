tui.util.defineNamespace("fedoc.content", {});
fedoc.content["plugins_raphaelAreaChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Raphael area chart renderer.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar RaphaelLineBase = require('./raphaelLineTypeBase'),\n    raphaelRenderUtil = require('./raphaelRenderUtil');\n\nvar raphael = window.Raphael,\n    EMPHASIS_OPACITY = 1,\n    DE_EMPHASIS_OPACITY = 0.3;\n\nvar concat = Array.prototype.concat;\n\nvar RaphaelAreaChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {\n    /**\n     * RaphaelAreaChart is graph renderer for area chart.\n     * @constructs RaphaelAreaChart\n     * @extends RaphaelLineTypeBase\n     */\n    init: function() {\n        /**\n         * selected legend index\n         * @type {?number}\n         */\n        this.selectedLegendIndex = null;\n    },\n\n    /**\n     * Render function of area chart.\n     * @param {HTMLElement} container container\n     * @param {{groupPositions: Array.&lt;Array>, dimension: object, theme: object, options: object}} data render data\n     * @returns {object} paper raphael paper\n     */\n    render: function(container, data) {\n        var dimension = data.dimension,\n            groupPositions = data.groupPositions,\n            theme = data.theme,\n            colors = theme.colors,\n            opacity = data.options.hasDot ? 1 : 0,\n            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),\n            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),\n            paper;\n\n        this.paper = paper = raphael(container, 1, dimension.height);\n        this.stackedOption = data.options.stacked;\n        this.isSpline = data.options.spline;\n        this.dimension = dimension;\n        this.zeroTop = data.zeroTop;\n\n        this.groupPaths = this.isSpline ? this._getSplineAreasPath(groupPositions) : this._getAreasPath(groupPositions);\n        this.groupAreas = this._renderAreas(paper, this.groupPaths, colors);\n        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);\n        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);\n\n        if (data.options.hasSelection) {\n            this.selectionDot = this._makeSelectionDot(paper);\n            this.selectionColor = theme.selectionColor;\n        }\n\n        this.outDotStyle = outDotStyle;\n        this.groupPositions = groupPositions;\n        this.dotOpacity = opacity;\n        delete this.pivotGroupDots;\n\n        return paper;\n    },\n\n    /**\n     * Render area graphs.\n     * @param {object} paper paper\n     * @param {Array.&lt;object>} groupPaths group paths\n     * @param {Array.&lt;string>} colors colors\n     * @returns {Array} raphael objects\n     * @private\n     */\n    _renderAreas: function(paper, groupPaths, colors) {\n        var groupAreas;\n\n        colors = colors.slice(0, groupPaths.length);\n        colors.reverse();\n        groupPaths.reverse();\n\n        groupAreas = tui.util.map(groupPaths, function(path, groupIndex) {\n            var areaColor = colors[groupIndex] || 'transparent',\n                lineColor = areaColor;\n\n            return {\n                area: raphaelRenderUtil.renderArea(paper, path.area.join(' '), {\n                    fill: areaColor,\n                    opacity: 0.5,\n                    stroke: areaColor\n                }),\n                line: raphaelRenderUtil.renderLine(paper, path.line.join(' '), lineColor)\n            };\n        });\n\n        return groupAreas.reverse();\n    },\n\n    /**\n     * Make height.\n     * @param {number} top top\n     * @param {number} startTop start top\n     * @returns {number} height\n     * @private\n     */\n    _makeHeight: function(top, startTop) {\n        return Math.abs(top - startTop);\n    },\n\n    /**\n     * Make areas path.\n     * @param {Array.&lt;{left: number, top: number, startTop: number}>} positions positions\n     * @returns {Array.&lt;string | number>} path\n     * @private\n     */\n    _makeAreasPath: function(positions) {\n        var len = positions.length * 2,\n            path = [];\n\n        tui.util.forEachArray(positions, function(position, index) {\n            path[index] = ['L', position.left, position.top];\n            path[len - index - 1] = ['L', position.left, position.startTop];\n        });\n\n        path = concat.apply([], path);\n        path[0] = 'M';\n\n        return path;\n    },\n\n    /**\n     * Get area path.\n     * @param {Array.&lt;Array.&lt;{left: number, top: number, startTop: number}>>} groupPositions positions\n     * @returns {Array.&lt;{area: Array.&lt;string | number>, line: Array.&lt;string | number>}>} path\n     * @private\n     */\n    _getAreasPath: function(groupPositions) {\n        var self = this;\n\n        return tui.util.map(groupPositions, function(positions) {\n            positions[0].left -= 1;\n\n            return {\n                area: self._makeAreasPath(positions),\n                line: self._makeLinesPath(positions)\n            };\n        });\n    },\n\n    /**\n     * Make spline area bottom path.\n     * @param {Array.&lt;{left: number, top: number}>} positions positions\n     * @param {Array.&lt;{left: number, top: number}>} prevPositions previous positions\n     * @returns {Array.&lt;string | number>} spline area path\n     * @private\n     */\n    _makeSplineAreaBottomPath: function(positions) {\n        var self = this;\n\n        return tui.util.map(positions, function(position) {\n            return ['L', position.left, self.zeroTop];\n        }).reverse();\n    },\n\n    /**\n     * Get spline areas path.\n     * @param {Array.&lt;Array.&lt;{left: number, top: number, startTop: number}>>} groupPositions positions\n     * @returns {Array.&lt;{area: Array.&lt;string | number>, line: Array.&lt;string | number>}>} path\n     * @private\n     */\n    _getSplineAreasPath: function(groupPositions) {\n        var self = this;\n\n        return tui.util.map(groupPositions, function(positions) {\n            var linesPath, areasBottomPath;\n\n            positions[0].left -= 1;\n            linesPath = self._makeSplineLinesPath(positions);\n            areasBottomPath = self._makeSplineAreaBottomPath(positions);\n\n            return {\n                area: linesPath.concat(areasBottomPath),\n                line: linesPath\n            };\n        });\n    },\n\n    /**\n     * Resize graph of area chart.\n     * @param {object} params parameters\n     *      @param {{width: number, height:number}} params.dimension dimension\n     *      @param {Array.&lt;Array.&lt;{left:number, top:number}>>} params.groupPositions group positions\n     */\n    resize: function(params) {\n        var self = this,\n            dimension = params.dimension,\n            groupPositions = params.groupPositions;\n\n        this.groupPositions = groupPositions;\n        this.groupPaths = this.isSpline ? this._getSplineAreasPath(groupPositions) : this._getAreasPath(groupPositions);\n        this.paper.setSize(dimension.width, dimension.height);\n        this.tooltipLine.attr({top: dimension.height});\n\n        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {\n            var area = self.groupAreas[groupIndex];\n            area.area.attr({path: path.area.join(' ')});\n            area.line.attr({path: path.line.join(' ')});\n\n            tui.util.forEachArray(self.groupDots[groupIndex], function(item, index) {\n                self._moveDot(item.dot, groupPositions[groupIndex][index]);\n            });\n        });\n    },\n\n    /**\n     * Select legend.\n     * @param {?number} legendIndex legend index\n     */\n    selectLegend: function(legendIndex) {\n        var self = this,\n            noneSelected = tui.util.isNull(legendIndex);\n\n        this.selectedLegendIndex = legendIndex;\n\n        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {\n            var area = self.groupAreas[groupIndex],\n                opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;\n\n            area.area.attr({'fill-opacity': opacity});\n            area.line.attr({'stroke-opacity': opacity});\n\n            tui.util.forEachArray(self.groupDots[groupIndex], function(item) {\n                if (self.dotOpacity) {\n                    item.dot.attr({'fill-opacity': opacity});\n                }\n            });\n        });\n    }\n});\n\nmodule.exports = RaphaelAreaChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"