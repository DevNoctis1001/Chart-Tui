ne.util.defineNamespace("fedoc.content", {});
fedoc.content["plugins_raphaelPieChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview RaphaelPieCharts is graph renderer for pie chart.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar raphaelRenderUtil = require('./raphaelRenderUtil');\n\nvar Raphael = window.Raphael,\n    ANGLE_180 = 180,\n    RAD = Math.PI / ANGLE_180,\n    ANIMATION_TIME = 500,\n    LOADING_ANIMATION_TIME = 700;\n\n/**\n * @classdesc RaphaelPieCharts is graph renderer for pie chart.\n * @class RaphaelPieChart\n */\nvar RaphaelPieChart = tui.util.defineClass(/** @lends RaphaelPieChart.prototype */ {\n    /**\n     * Render function of pie chart.\n     * @param {object} paper raphael paper\n     * @param {HTMLElement} container container\n     * @param {{sectorsInfo: array.&lt;object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data\n     * @param {function} inCallback in callback\n     * @param {function} outCallback out callback\n     * @return {object} paper raphael paper\n     */\n    render: function(paper, container, data, inCallback, outCallback) {\n        var dimension = data.dimension;\n\n        if (!paper) {\n            paper = Raphael(container, dimension.width, dimension.height);\n        }\n\n        if (!paper.customAttributes.sector) {\n            paper.customAttributes.sector = tui.util.bind(this._makeSectorPath, this);\n        }\n\n        this.circleBound = data.circleBound;\n        this._renderPie(paper, data, inCallback, outCallback);\n\n        return paper;\n    },\n\n    /**\n     * To make sector path.\n     * @param {number} cx center x\n     * @param {number} cy center y\n     * @param {number} r radius\n     * @param {number} startAngle start angle\n     * @param {number} endAngle end angel\n     * @returns {{path: array}} sector path\n     * @private\n     */\n    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {\n        var x1 = cx + r * Math.sin(startAngle * RAD), // 원 호의 시작 x 좌표\n            y1 = cy - r * Math.cos(startAngle * RAD), // 원 호의 시작 y 좌표\n            x2 = cx + r * Math.sin(endAngle * RAD),// 원 호의 종료 x 좌표\n            y2 = cy - r * Math.cos(endAngle * RAD), // 원 호의 종료 y 좌표\n            largeArcFlag = endAngle - startAngle > ANGLE_180 ? 1 : 0,\n            path = [\"M\", cx, cy,\n                \"L\", x1, y1,\n                \"A\", r, r, 0, largeArcFlag, 1, x2, y2,\n                \"Z\"\n            ];\n        // path에 대한 자세한 설명은 아래 링크를 참고\n        // http://www.w3schools.com/svg/svg_path.asp\n        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d\n        return {path: path};\n    },\n\n    /**\n     * Render sector\n     * @param {object} params parameters\n     *      @param {object} params.paper raphael paper\n     *      @param {{cx: number, cy: number, r:number}} params.circleBound circle bounds\n     *      @param {number} params.startAngle start angle\n     *      @param {number} params.endAngle end angle\n     *      @param {{fill: string, stroke: string, strike-width: string}} params.attrs attrs\n     * @returns {object} raphael object\n     * @private\n     */\n    _renderSector: function (params) {\n        var circleBound = params.circleBound,\n            angles = params.angles;\n        return params.paper.path().attr({\n            sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]\n        }).attr(params.attrs);\n    },\n\n    /**\n     * Render pie graph.\n     * @param {object} paper raphael paper\n     * @param {{sectorsInfo: array.&lt;object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data\n     * @param {function} inCallback in callback\n     * @param {function} outCallback out callback\n     * @private\n     */\n    _renderPie: function(paper, data, inCallback, outCallback) {\n        var circleBound = data.circleBound,\n            colors = data.theme.colors,\n            chartBackground = data.chartBackground,\n            sectors = [];\n\n        tui.util.forEachArray(data.sectorsInfo, function(sectorInfo, index) {\n            var percentValue = sectorInfo.percentValue,\n                color = colors[index],\n                sector = this._renderSector({\n                    paper: paper,\n                    circleBound: circleBound,\n                    angles: sectorInfo.angles.start,\n                    attrs: {\n                        fill: color,\n                        stroke: chartBackground,\n                        'stroke-width': 1\n                    }\n                });\n\n            this._bindHoverEvent({\n                target: sector,\n                position: sectorInfo.popupPosition,\n                index: index,\n                inCallback: inCallback,\n                outCallback: outCallback\n            });\n\n            sectors.push({\n                sector: sector,\n                angles: sectorInfo.angles.end,\n                percentValue: percentValue\n            });\n        }, this);\n\n        this.sectors = sectors;\n    },\n\n    /**\n     * Render legend lines.\n     * @param {object} paper paper\n     * @param {array.&lt;object>} outerPositions outer position\n     */\n    renderLegendLines: function(paper, outerPositions) {\n        var paths = this._makeLinePaths(outerPositions),\n            legendLines = tui.util.map(paths, function(path) {\n                return raphaelRenderUtil.renderLine(paper, path, 'transparent', 1);\n            });\n        this.legendLines = legendLines;\n    },\n\n    /**\n     * To make line paths.\n     * @param {array.&lt;object>} outerPositions outer positions\n     * @returns {Array} line paths.\n     * @private\n     */\n    _makeLinePaths: function(outerPositions) {\n        var paths = tui.util.map(outerPositions, function(positions) {\n            return [\n                raphaelRenderUtil.makeLinePath(positions.start, positions.middle),\n                raphaelRenderUtil.makeLinePath(positions.middle, positions.end)\n            ].join('');\n        }, this);\n        return paths;\n    },\n\n    /**\n     * Bind hover event.\n     * @param {object} params parameters\n     *      @param {object} params.target raphael item\n     *      @param {{left: number, top: number}} params.position position\n     *      @param {string} params.id id\n     *      @param {function} params.inCallback in callback\n     *      @param {function} params.outCallback out callback\n     * @private\n     */\n    _bindHoverEvent: function(params) {\n        var throttled = tui.util.throttle(function(e) {\n            if (!e) {\n                return;\n            }\n            params.inCallback(params.position, 0, params.index, {\n                clientX: e.clientX,\n                clientY: e.clientY\n            });\n        }, 100);\n        params.target.mouseover(function (e) {\n            params.inCallback(params.position, 0, params.index, {\n                clientX: e.clientX,\n                clientY: e.clientY\n            });\n        }).mousemove(throttled).mouseout(function () {\n            params.outCallback();\n        });\n    },\n\n    /**\n     * To expand selector radius.\n     * @param {object} sector pie sector\n     */\n    _expandSector: function(sector) {\n        var cx = this.circleBound.cx,\n            cy = this.circleBound.cy;\n        sector.animate({\n            transform: \"s1.1 1.1 \" + cx + \" \" + cy\n        }, ANIMATION_TIME, \"elastic\");\n    },\n\n    /**\n     * To restore selector radius.\n     * @param {object} sector pie sector\n     */\n    _restoreSector: function(sector) {\n        sector.animate({transform: \"\"}, ANIMATION_TIME, \"elastic\");\n    },\n\n    /**\n     * Show animation.\n     * @param {{index: number}} data data\n     */\n    showAnimation: function(data) {\n        var sector = this.sectors[data.index].sector;\n        this._expandSector(sector);\n    },\n\n    /**\n     * Hide animation.\n     * @param {{index: number}} data data\n     */\n    hideAnimation: function(data) {\n        var sector = this.sectors[data.index].sector;\n        this._restoreSector(sector);\n    },\n\n    /**\n     * Animate.\n     * @param {function} callback callback\n     */\n    animate: function(callback) {\n        var delayTime = 0,\n            circleBound = this.circleBound;\n        tui.util.forEachArray(this.sectors, function(item) {\n            var angles = item.angles,\n                animationTime = LOADING_ANIMATION_TIME * item.percentValue,\n                anim = Raphael.animation({\n                    sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]\n                }, animationTime);\n            item.sector.animate(anim.delay(delayTime));\n            delayTime += animationTime;\n        }, this);\n\n        if (callback) {\n            setTimeout(callback, delayTime);\n        }\n    },\n\n    /**\n     * Animate legend lines.\n     */\n    animateLegendLines: function() {\n        if (!this.legendLines) {\n            return;\n        }\n        tui.util.forEachArray(this.legendLines, function(line) {\n            line.animate({\n                'stroke': 'black',\n                'stroke-opacity': 1\n            });\n        });\n    }\n});\n\nmodule.exports = RaphaelPieChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"