tui.util.defineNamespace("fedoc.content", {});
fedoc.content["models_data_seriesItemForCoordinateType.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview SeriesItemForCoordinateType is a element of SeriesGroup.items.\n * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar predicate = require('../../helpers/predicate');\nvar renderUtil = require('../../helpers/renderUtil');\n\nvar SeriesItemForCoordinateType = tui.util.defineClass(/** @lends SeriesItemForCoordinateType.prototype */{\n    /**\n     * SeriesItemForCoordinateType is a element of SeriesGroup.items.\n     * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.\n     * @constructs SeriesItemForCoordinateType\n     * @param {object} params - parameters\n     *      @param {Array.&lt;number>|{x: number, y:number, r: ?number, label: ?string}} params.datum - raw series datum\n     *      @param {string} params.chartType - type of chart\n     *      @param {?Array.&lt;function>} params.formatFunctions - format functions\n     *      @param {number} params.index - raw data index\n     */\n    init: function(params) {\n        /**\n         * type of chart\n         * @type {string}\n         */\n        this.chartType = params.chartType;\n\n        /**\n         * format functions\n         * @type {Array.&lt;function>}\n         */\n        this.formatFunctions = params.formatFunctions;\n\n        /**\n         * x axis type\n         * @type {?string}\n         */\n        this.xAxisType = params.xAxisType;\n\n        /**\n         * date format\n         * @type {?string}\n         */\n        this.dateFormat = params.dateFormat;\n\n        /**\n         * ratio map\n         * @type {object}\n         */\n        this.ratioMap = {};\n\n        this._initData(params.datum, params.index);\n    },\n\n    /**\n     * Initialize data of item.\n     @param {Array.&lt;number>|{x: number, y:number, r: ?number, label: ?string}} rawSeriesDatum - raw series datum\n     * @param {number} index - raw data index\n     * @private\n     */\n    _initData: function(rawSeriesDatum, index) {\n        var date;\n\n        if (tui.util.isArray(rawSeriesDatum)) {\n            this.x = rawSeriesDatum[0] || 0;\n            this.y = rawSeriesDatum[1] || 0;\n            this.r = rawSeriesDatum[2];\n        } else {\n            this.x = rawSeriesDatum.x;\n            this.y = rawSeriesDatum.y;\n            this.r = rawSeriesDatum.r;\n        }\n\n        if (predicate.isDatetimeType(this.xAxisType)) {\n            date = tui.util.isDate(this.x) ? this.x : (new Date(this.x));\n            this.x = date.getTime() || 0;\n        }\n\n        this.index = index;\n\n        if (predicate.isLineTypeChart(this.chartType)) {\n            this.label = renderUtil.formatValue(this.y, this.formatFunctions, this.chartType, 'series');\n        } else {\n            this.label = rawSeriesDatum.label || '';\n        }\n    },\n\n    /**\n     * Add start.\n     * @param {number} value - value\n     * @private\n     */\n    addStart: function(value) {\n        this.start = value;\n    },\n\n    /**\n     * Add ratio.\n     * @param {string} valueType - type of value like x, y, r\n     * @param {?number} divNumber - number for division\n     * @param {?number} subNumber - number for subtraction\n     */\n    addRatio: function(valueType, divNumber, subNumber) {\n        if (!tui.util.isExisty(this.ratioMap[valueType]) &amp;&amp; divNumber) {\n            this.ratioMap[valueType] = (this[valueType] - subNumber) / divNumber;\n        }\n    },\n\n    /**\n     * Pick value map.\n     * @returns {{x: (number | null), y: (number | null), r: (number | null)}}\n     */\n    pickValueMap: function() {\n        var formatFunctions = this.formatFunctions;\n        var chartType = this.chartType;\n        var valueMap = {\n            x: this.ratioMap.x ? this.x : null,\n            y: this.ratioMap.y ? this.y : null,\n            r: this.ratioMap.r ? this.r : null\n        };\n\n        if (predicate.isLineTypeChart(this.chartType)) {\n            if (predicate.isDatetimeType(this.xAxisType)) {\n                valueMap.category = renderUtil.formatDate(this.x, this.dateFormat);\n            } else {\n                valueMap.category = renderUtil.formatValue(this.x, formatFunctions, chartType, 'category');\n            }\n        }\n\n        return valueMap;\n    }\n});\n\nmodule.exports = SeriesItemForCoordinateType;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"