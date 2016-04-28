tui.util.defineNamespace("fedoc.content", {});
fedoc.content["customEvents_areaTypeDataModel.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview AreaTypeDataModel is data model for custom event of area type.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar AreaTypeDataModel = tui.util.defineClass(/** @lends AreaTypeDataModel.prototype */ {\n    /**\n     * AreaTypeDataModel is data mode for custom event of area type.\n     * @constructs AreaTypeDataModel\n     * @param {object} seriesInfo series info\n     */\n    init: function(seriesInfo) {\n        this.data = this._makeData(seriesInfo.data.groupPositions, seriesInfo.chartType);\n    },\n\n    /**\n     * Make area type data for custom event.\n     * @param {Array.&lt;Array.&lt;object>>} groupPositions - group positions\n     * @param {string} chartType - chart type\n     * @returns {Array}\n     * @private\n     */\n    _makeData: function(groupPositions, chartType) {\n        groupPositions = tui.util.pivot(groupPositions);\n        return tui.util.map(groupPositions, function(positions, groupIndex) {\n            return tui.util.map(positions, function(position, index) {\n                return {\n                    chartType: chartType,\n                    indexes: {\n                        groupIndex: groupIndex,\n                        index: index\n                    },\n                    bound: position\n                };\n            });\n        });\n    },\n\n    /**\n     * Find Data.\n     * @param {number} groupIndex - group index\n     * @param {number} layerY - mouse position\n     * @returns {object}\n     */\n    findData: function(groupIndex, layerY) {\n        var result = null,\n            min = 10000;\n        tui.util.forEach(this.data[groupIndex], function(data) {\n            var diff = Math.abs(layerY - data.bound.top);\n            if (min > diff) {\n                min = diff;\n                result = data;\n            }\n        });\n        return result;\n    }\n});\n\nmodule.exports = AreaTypeDataModel;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"