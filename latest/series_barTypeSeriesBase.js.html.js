ne.util.defineNamespace("fedoc.content", {});
fedoc.content["series_barTypeSeriesBase.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Column chart series component.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar chartConst = require('../const'),\n    dom = require('../helpers/domHandler'),\n    renderUtil = require('../helpers/renderUtil');\n\nvar BarTypeSeriesBase = tui.util.defineClass(/** @lends BarTypeSeriesBase.prototype */ {\n    /**\n     * To make series data.\n     * @returns {object} add data\n     */\n    makeSeriesData: function() {\n        var groupBounds = this._makeBounds(this.bound.dimension);\n\n        this.groupBounds = groupBounds;\n\n        return {\n            groupBounds: groupBounds,\n            groupValues: this.percentValues\n        };\n    },\n\n    /**\n     * To make bar gutter.\n     * @param {number} groupSize bar group size\n     * @param {number} itemCount group item count\n     * @returns {number} bar gutter\n     */\n    makeBarGutter: function(groupSize, itemCount) {\n        var baseSize = groupSize / (itemCount + 1) / 2,\n            gutter;\n        if (baseSize &lt;= 2) {\n            gutter = 0;\n        } else if (baseSize &lt;= 6) {\n            gutter = 2;\n        } else {\n            gutter = 4;\n        }\n        return gutter;\n    },\n\n    /**\n     * To make bar size.\n     * @param {number} groupSize bar group size\n     * @param {number} barPadding bar padding\n     * @param {number} itemCount group item count\n     * @returns {number} bar size (width or height)\n     */\n    makeBarSize: function(groupSize, barPadding, itemCount) {\n        return (groupSize - (barPadding * (itemCount - 1))) / (itemCount + 1);\n    },\n\n    /**\n     * To make base info for normal chart bounds.\n     * @param {{width: number, height: number}} dimension series dimension\n     * @param {string} sizeType size type (width or height)\n     * @param {string} anotherSizeType another size type (width or height)\n     * @returns {{\n     *      dimension: {width: number, height: number},\n     *      groupValues: array.&lt;array.&lt;number>>,\n     *      groupSize: number, barPadding: number, barSize: number, step: number,\n     *      distanceToMin: number, isMinus: boolean\n     * }} base info\n     */\n    makeBaseInfoForNormalChartBounds: function(dimension, sizeType, anotherSizeType) {\n        var groupValues = this.percentValues,\n            groupSize = dimension[anotherSizeType] / groupValues.length,\n            itemCount = groupValues[0] &amp;&amp; groupValues[0].length || 0,\n            barPadding = this.makeBarGutter(groupSize, itemCount),\n            barSize = this.makeBarSize(groupSize, barPadding, itemCount),\n            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension[sizeType], this.data.scale);\n        return {\n            dimension: dimension,\n            groupValues: groupValues,\n            groupSize: groupSize,\n            barPadding: barPadding,\n            barSize: barSize,\n            step: barSize + barPadding,\n            distanceToMin: scaleDistance.toMin,\n            isMinus: this.data.scale.min &lt; 0 &amp;&amp; this.data.scale.max &lt;= 0\n        };\n    },\n\n    /**\n     * Render normal series label.\n     * @param {object} params parameters\n     *      @param {HTMLElement} params.container container\n     *      @param {array.&lt;array>} params.groupBounds group bounds\n     *      @param {array.&lt;array>} params.formattedValues formatted values\n     * @returns {HTMLElement} series label area\n     * @private\n     */\n    _renderNormalSeriesLabel: function(params) {\n        var groupBounds = params.groupBounds,\n            formattedValues = params.formattedValues,\n            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),\n            elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area'),\n            html;\n        html = tui.util.map(params.values, function(values, groupIndex) {\n            return tui.util.map(values, function(value, index) {\n                var bound, formattedValue, renderingPosition;\n                bound = groupBounds[groupIndex][index].end;\n                formattedValue = formattedValues[groupIndex][index];\n                renderingPosition = this.makeSeriesRenderingPosition({\n                    value: value,\n                    bound: bound,\n                    formattedValue: formattedValue,\n                    labelHeight: labelHeight\n                });\n                return this.makeSeriesLabelHtml(renderingPosition, formattedValue, groupIndex, index);\n            }, this).join('');\n        }, this).join('');\n\n        elSeriesLabelArea.innerHTML = html;\n        params.container.appendChild(elSeriesLabelArea);\n\n        return elSeriesLabelArea;\n    },\n\n    /**\n     * To make sum values.\n     * @param {array.&lt;number>} values values\n     * @param {array.&lt;function>} formatFunctions format functions\n     * @returns {number} sum result.\n     */\n    makeSumValues: function(values, formatFunctions) {\n        var sum = tui.util.sum(tui.util.filter(values, function(value) {\n                return value > 0;\n            })),\n            fns = [sum].concat(formatFunctions || []);\n\n        return tui.util.reduce(fns, function(stored, fn) {\n            return fn(stored);\n        });\n    },\n\n    /**\n     * To make stacked labels html.\n     * @param {object} params parameters\n     *      @param {number} params.groupIndex group index\n     *      @param {array.&lt;number>} params.values values,\n     *      @param {array.&lt;function>} params.formatFunctions formatting functions,\n     *      @param {array.&lt;object>} params.bounds bounds,\n     *      @param {array} params.formattedValues formatted values,\n     *      @param {number} params.labelHeight label height\n     * @returns {string} labels html\n     * @private\n     */\n    _makeStackedLabelsHtml: function(params) {\n        var values = params.values,\n            bound, htmls;\n\n        htmls = tui.util.map(values, function(value, index) {\n            var labelWidth, left, top, labelHtml, formattedValue;\n\n            if (value &lt; 0) {\n                return '';\n            }\n\n            bound = params.bounds[index].end;\n            formattedValue = params.formattedValues[index];\n            labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label);\n            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);\n            top = bound.top + ((bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2);\n            labelHtml = this.makeSeriesLabelHtml({\n                left: left,\n                top: top\n            }, formattedValue, params.groupIndex, index);\n            return labelHtml;\n        }, this);\n\n        if (this.options.stacked === 'normal') {\n            htmls.push(this.makeSumLabelHtml({\n                values: values,\n                formatFunctions: params.formatFunctions,\n                bound: bound,\n                labelHeight: params.labelHeight\n            }));\n        }\n        return htmls.join('');\n    },\n\n    /**\n     * Render stacked series label.\n     * @param {object} params parameters\n     *      @param {HTMLElement} params.container container\n     *      @param {array.&lt;array>} params.groupBounds group bounds\n     *      @param {array.&lt;array>} params.formattedValues formatted values\n     * @returns {HTMLElement} series label area\n     * @private\n     */\n    _renderStackedSeriesLabel: function(params) {\n        var groupBounds = params.groupBounds,\n            formattedValues = params.formattedValues,\n            formatFunctions = params.formatFunctions || [],\n            elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area'),\n            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),\n            html;\n\n        html = tui.util.map(params.values, function(values, index) {\n            var labelsHtml = this._makeStackedLabelsHtml({\n                groupIndex: index,\n                values: values,\n                formatFunctions: formatFunctions,\n                bounds: groupBounds[index],\n                formattedValues: formattedValues[index],\n                labelHeight: labelHeight\n            });\n            return labelsHtml;\n        }, this).join('');\n\n        elSeriesLabelArea.innerHTML = html;\n        params.container.appendChild(elSeriesLabelArea);\n\n        return elSeriesLabelArea;\n    },\n\n    /**\n     * Render series label.\n     * @param {object} params parameters\n     *      @param {HTMLElement} params.container container\n     *      @param {array.&lt;array>} params.groupBounds group bounds\n     *      @param {array.&lt;array>} params.formattedValues formatted values\n     * @returns {HTMLElement} series label area\n     * @private\n     */\n    _renderSeriesLabel: function(params) {\n        var elSeriesLabelArea;\n        if (!this.options.showLabel) {\n            return null;\n        }\n\n        if (this.options.stacked) {\n            elSeriesLabelArea = this._renderStackedSeriesLabel(params);\n        } else {\n            elSeriesLabelArea = this._renderNormalSeriesLabel(params);\n        }\n        return elSeriesLabelArea;\n    },\n\n    /**\n     * Get bound.\n     * @param {number} groupIndex group index\n     * @param {number} index index\n     * @returns {{left: number, top: number}} bound\n     * @private\n     */\n    _getBound: function(groupIndex, index) {\n        if (groupIndex === -1 || index === -1) {\n            return null;\n        }\n        return this.groupBounds[groupIndex][index].end;\n    }\n});\n\nBarTypeSeriesBase.mixin = function(func) {\n    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);\n};\n\nmodule.exports = BarTypeSeriesBase;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"