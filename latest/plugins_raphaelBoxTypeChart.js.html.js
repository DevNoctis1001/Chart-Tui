tui.util.defineNamespace("fedoc.content", {});
fedoc.content["plugins_raphaelBoxTypeChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\nvar raphaelRenderUtil = require('./raphaelRenderUtil');\n\nvar raphael = window.Raphael;\n\nvar ANIMATION_DURATION = 100;\nvar MIN_BORDER_WIDTH = 1;\nvar MAX_BORDER_WIDTH = 3;\n\n/**\n * @classdesc RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).\n * @class RaphaelBarChart\n */\nvar RaphaelBoxTypeChart = tui.util.defineClass(/** @lends RaphaelBoxTypeChart.prototype */ {\n    /**\n     * Render function of bar chart\n     * @param {HTMLElement} container container element\n     * @param {{\n     *      dimension: {width: number, height: number},\n     *      colorSpectrum: object,\n     *      seriesDataModel: SeriesDataModel,\n     *      groupBounds: (Array.&lt;Array.&lt;object>>|object.&lt;string, object>),\n     *      theme: object\n     * }} seriesData - data for graph rendering\n     * @returns {object}\n     */\n    render: function(container, seriesData) {\n        var dimension = seriesData.dimension;\n\n        this.paper = raphael(container, dimension.width, dimension.height);\n        /**\n         * theme\n         * @type {*|{}}\n         */\n        this.theme = seriesData.theme || {};\n\n        /**\n         * color spectrum\n         * @type {Object}\n         */\n        this.colorSpectrum = seriesData.colorSpectrum;\n\n        /**\n         *\n         */\n        this.chartBackground = seriesData.chartBackground;\n\n        /**\n         * zoomable option\n         */\n        this.zoomable = seriesData.zoomable;\n\n        /**\n         * border color for rendering box\n         * @type {string}\n         */\n        this.borderColor = this.theme.borderColor || 'none';\n\n        /**\n         * border width for rendering box\n         */\n        this.borderWidth = this.theme.borderWidth;\n\n        /**\n         * group bounds\n         * @type {Array.&lt;Array.&lt;object>>|object.&lt;string, object>}\n         */\n        this.groupBounds = seriesData.groupBounds;\n\n        /**\n         * bound map\n         * @type {object.&lt;string, {left: number, top: number, width: number, height: number}>}\n         */\n        this.boundMap = seriesData.boundMap;\n\n        this._bindGetBoundFunction();\n        this._bindGetColorFunction();\n\n        /**\n         * boxes set\n         * @type {Array.&lt;Array.&lt;{rect: Object, color: string}>>}\n         */\n        this.boxesSet = this._renderBoxes(seriesData.seriesDataModel, seriesData.startDepth, !!seriesData.isPivot);\n\n        return this.paper;\n    },\n\n    /**\n     * Bind _getBound private function.\n     * @private\n     */\n    _bindGetBoundFunction: function() {\n        if (this.boundMap) {\n            this._getBound = this._getBoundFromBoundMap;\n        } else {\n            this._getBound = this._getBoundFromGroupBounds;\n        }\n    },\n\n    /**\n     * Bind _bindGetColorFunction private function.\n     * @private\n     */\n    _bindGetColorFunction: function() {\n        if (this.colorSpectrum) {\n            this._getColor = this._getColorFromSpectrum;\n        } else if (this.zoomable) {\n            this._getColor = this._getColorFromColorsWhenZoomable;\n        } else {\n            this._getColor = this._getColorFromColors;\n        }\n    },\n\n    /**\n     * Get bound from groupBounds by indexes(groupIndex, index) of seriesItem.\n     * @param {SeriesItem} seriesItem - seriesItem\n     * @returns {{width: number, height: number, left: number, top: number}}\n     * @private\n     */\n    _getBoundFromGroupBounds: function(seriesItem) {\n        return this.groupBounds[seriesItem.groupIndex][seriesItem.index].end;\n    },\n\n    /**\n     * Get bound from boundMap by id of seriesItem.\n     * @param {SeriesItem} seriesItem - seriesItem\n     * @returns {{width: number, height: number, left: number, top: number}}\n     * @private\n     */\n    _getBoundFromBoundMap: function(seriesItem) {\n        return this.boundMap[seriesItem.id];\n    },\n\n    /**\n     * Get color from colorSpectrum by ratio of seriesItem.\n     * @param {SeriesItem} seriesItem - seriesItem\n     * @returns {string}\n     * @private\n     */\n    _getColorFromSpectrum: function(seriesItem) {\n        var color;\n\n        if (!seriesItem.hasChild) {\n            color = this.colorSpectrum.getColor(seriesItem.ratio) || this.chartBackground;\n        } else {\n            color = 'none';\n        }\n\n        return color;\n    },\n\n    /**\n     * Get color from colors theme by group property of seriesItem.\n     * @param {SeriesItem} seriesItem - seriesItem\n     * @returns {string}\n     * @private\n     */\n    _getColorFromColors: function(seriesItem) {\n        return seriesItem.hasChild ? 'none' : this.theme.colors[seriesItem.group];\n    },\n\n    /**\n     * Get color from colors theme, when zoomable option.\n     * @param {SeriesItem} seriesItem - seriesItem\n     * @param {number} startDepth - start depth\n     * @returns {string}\n     * @private\n     */\n    _getColorFromColorsWhenZoomable: function(seriesItem, startDepth) {\n        return (seriesItem.depth === startDepth) ? this.theme.colors[seriesItem.group] : 'none';\n    },\n\n    /**\n     * Render rect.\n     * @param {{width: number, height: number, left: number, top: number}} bound - bound\n     * @param {string} color - color\n     * @param {number} strokeWidth - stroke width\n     * @returns {object}\n     * @private\n     */\n    _renderRect: function(bound, color, strokeWidth) {\n        return raphaelRenderUtil.renderRect(this.paper, bound, {\n            fill: color,\n            stroke: this.borderColor,\n            'stroke-width': strokeWidth\n        });\n    },\n\n    /**\n     * Get stroke width.\n     * @param {?number} depth - depth\n     * @param {number} startDepth - start depth\n     * @returns {number}\n     * @private\n     */\n    _getStrokeWidth: function(depth, startDepth) {\n        var strokeWidth;\n\n        if (this.borderWidth) {\n            strokeWidth = this.borderWidth;\n        } else if (tui.util.isExisty(depth)) {\n            strokeWidth = Math.max(MIN_BORDER_WIDTH, MAX_BORDER_WIDTH - (depth - startDepth));\n        } else {\n            strokeWidth = MIN_BORDER_WIDTH;\n        }\n\n        return strokeWidth;\n    },\n\n    /**\n     * Render boxes.\n     * @param {SeriesDataModel} seriesDataModel - seriesDataModel\n     * @param {number} startDepth - start depth\n     * @param {boolean} isPivot - whether pivot or not\n     * @returns {Array.&lt;Array.&lt;{rect: object, color: string}>>}\n     * @private\n     */\n    _renderBoxes: function(seriesDataModel, startDepth, isPivot) {\n        var self = this;\n        var rectToBack;\n\n        if (this.colorSpectrum || !this.zoomable) {\n            rectToBack = function(rect) {\n                rect.toBack();\n            };\n        } else {\n            rectToBack = function() {};\n        }\n\n        return seriesDataModel.map(function(seriesGroup, groupIndex) {\n            return seriesGroup.map(function(seriesItem, index) {\n                var result = null;\n                var strokeWidth = self._getStrokeWidth(seriesItem.depth, startDepth);\n                var bound, color;\n\n                seriesItem.groupIndex = groupIndex;\n                seriesItem.index = index;\n                bound = self._getBound(seriesItem);\n\n                if (bound) {\n                    color = self._getColor(seriesItem, startDepth);\n                    result = {\n                        rect: self._renderRect(bound, color, strokeWidth),\n                        seriesItem: seriesItem,\n                        color: color\n                    };\n                    rectToBack(result.rect);\n                }\n\n                return result;\n            });\n        }, isPivot);\n    },\n\n    /**\n     * Animate changing color of box.\n     * @param {object} rect - raphael object\n     * @param {string} [color] - fill color\n     * @param {number} [opacity] - fill opacity\n     * @private\n     */\n    _animateChangingColor: function(rect, color, opacity) {\n        var properties = {\n            'fill-opacity': tui.util.isExisty(opacity) ? opacity : 1\n        };\n\n        if (color) {\n            properties.fill = color;\n        }\n\n        rect.animate(properties, ANIMATION_DURATION);\n    },\n\n    /**\n     * Show animation.\n     * @param {{groupIndex: number, index:number}} indexes - index info\n     * @param {boolean} [useSpectrum] - whether use spectrum legend or not\n     * @param {number} [opacity] - fill opacity\n     */\n    showAnimation: function(indexes, useSpectrum, opacity) {\n        var box = this.boxesSet[indexes.groupIndex][indexes.index];\n        var color;\n\n        if (!box) {\n            return;\n        }\n\n        useSpectrum = tui.util.isUndefined(useSpectrum) ? true : useSpectrum;\n        color = useSpectrum ? this.theme.overColor : box.color;\n\n        if (box.seriesItem.hasChild) {\n            if (useSpectrum) {\n                box.rect.attr({'fill-opacity': 0});\n            }\n            box.rect.toFront();\n        }\n\n        this._animateChangingColor(box.rect, color, opacity);\n    },\n\n    /**\n     * Hide animation.\n     * @param {{groupIndex: number, index:number}} indexes - index info\n     * @param {boolean} [useColorValue] - whether use colorValue or not\n     */\n    hideAnimation: function(indexes, useColorValue) {\n        var colorSpectrum = this.colorSpectrum;\n        var box = this.boxesSet[indexes.groupIndex][indexes.index];\n        var opacity = 1;\n        var color;\n\n        if (!box) {\n            return;\n        }\n\n        if (box.seriesItem.hasChild) {\n            color = null;\n            if (useColorValue) {\n                opacity = 0;\n            }\n        } else {\n            color = box.color;\n        }\n\n        this._animateChangingColor(box.rect, color, opacity);\n\n        setTimeout(function() {\n            if (!colorSpectrum &amp;&amp; box.seriesItem.hasChild) {\n                box.rect.toBack();\n            }\n        }, ANIMATION_DURATION);\n    },\n\n    /**\n     * Resize.\n     * @param {{\n     *      dimension: {width: number, height: number},\n     *      groupBounds: (Array.&lt;Array.&lt;object>>|object.&lt;string, object>)\n     * }} seriesData - data for graph rendering\n     */\n    resize: function(seriesData) {\n        var self = this;\n        var dimension = seriesData.dimension;\n\n        this.boundMap = seriesData.boundMap;\n        this.groupBounds = seriesData.groupBounds;\n        this.paper.setSize(dimension.width, dimension.height);\n\n        raphaelRenderUtil.forEach2dArray(this.boxesSet, function(box, groupIndex, index) {\n            var bound;\n\n            if (!box) {\n                return;\n            }\n\n            bound = self._getBound(box.seriesItem, groupIndex, index);\n\n            if (bound) {\n                raphaelRenderUtil.updateRectBound(box.rect, bound);\n            }\n        });\n    }\n});\n\nmodule.exports = RaphaelBoxTypeChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"