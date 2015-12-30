tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_verticalTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview verticalTypeMixer is mixer of vertical type chart(column, line, area).\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar axisDataMaker = require('../helpers/axisDataMaker'),\n    predicate = require('../helpers/predicate');\n\n/**\n * verticalTypeMixer is mixer of vertical type chart(column, line, area).\n * @mixin\n */\nvar verticalTypeMixer = {\n    /**\n     * Make axes data\n     * @param {object} bounds chart bounds\n     * @param {object} options chart options\n     * @returns {object} axes data\n     * @private\n     */\n    _makeAxesData: function(bounds) {\n        var options = this.options,\n            aligned = predicate.isLineTypeChart(options.chartType),\n            xAxisData = axisDataMaker.makeLabelAxisData({\n                labels: this.dataProcessor.getCategories(),\n                aligned: aligned,\n                options: options.xAxis\n            }),\n            yAxisData = axisDataMaker.makeValueAxisData({\n                values: this.dataProcessor.getGroupValues(),\n                seriesDimension: bounds.series.dimension,\n                stacked: options.series &amp;&amp; options.series.stacked || '',\n                chartType: options.chartType,\n                formatFunctions: this.dataProcessor.getFormatFunctions(),\n                options: options.yAxis,\n                isVertical: true,\n                aligned: aligned\n            });\n\n        return {\n            xAxis: xAxisData,\n            yAxis: yAxisData\n        };\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = verticalTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"