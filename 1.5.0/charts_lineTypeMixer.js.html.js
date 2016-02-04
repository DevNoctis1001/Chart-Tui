tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_lineTypeMixer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview lineTypeMixer is mixer of line type chart(line, area).\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase'),\n    predicate = require('../helpers/predicate'),\n    axisDataMaker = require('../helpers/axisDataMaker'),\n    AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');\n\n/**\n * lineTypeMixer is mixer of line type chart(line, area).\n * @mixin\n */\nvar lineTypeMixer = {\n    /**\n     * Initialize line type chart.\n     * @param {Array.&lt;Array>} rawData raw data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     * @param {object} initedData initialized data from combo chart\n     * @private\n     */\n    _lineTypeInit: function(rawData, theme, options) {\n        ChartBase.call(this, {\n            rawData: rawData,\n            theme: theme,\n            options: options,\n            hasAxes: true,\n            isVertical: true\n        });\n\n        this._addComponents(options.chartType);\n    },\n\n    /**\n     * Make axes data\n     * @returns {object} axes data\n     * @private\n     */\n    _makeAxesData: function() {\n        var options = this.options,\n            aligned = predicate.isLineTypeChart(options.chartType),\n            xAxisData = axisDataMaker.makeLabelAxisData({\n                labels: this.dataProcessor.getCategories(),\n                aligned: aligned,\n                options: options.xAxis\n            }),\n            yAxisData = axisDataMaker.makeValueAxisData({\n                values: this.dataProcessor.getGroupValues(),\n                seriesDimension: {\n                    height: this.boundsMaker.makeSeriesHeight()\n                },\n                stackedOption: options.series &amp;&amp; options.series.stacked || '',\n                chartType: options.chartType,\n                formatFunctions: this.dataProcessor.getFormatFunctions(),\n                options: options.yAxis,\n                isVertical: true,\n                aligned: aligned\n            });\n\n        return {\n            xAxis: xAxisData,\n            yAxis: yAxisData\n        };\n    },\n\n    /**\n     * Add custom event component for normal tooltip.\n     * @private\n     */\n    _addCustomEventComponentForNormalTooltip: function() {\n        this.componentManager.register('customEvent', AreaTypeCustomEvent, {\n            chartType: this.chartType,\n            isVertical: this.isVertical\n        });\n    },\n\n    /**\n     * Add components\n     * @param {string} chartType chart type\n     * @private\n     */\n    _addComponents: function(chartType) {\n        this._addComponentsForAxisType({\n            axes: [\n                {\n                    name: 'yAxis'\n                },\n                {\n                    name: 'xAxis',\n                    isLabel: true\n                }\n            ],\n            chartType: chartType,\n            serieses: [\n                {\n                    name: this.options.chartType + 'Series',\n                    SeriesClass: this.Series\n                }\n            ]\n        });\n    },\n\n    /**\n     * Render\n     * @returns {HTMLElement} chart element\n     */\n    render: function() {\n        return ChartBase.prototype.render.apply(this, arguments);\n    },\n\n    /**\n     * Mix in.\n     * @param {function} func target function\n     * @ignore\n     */\n    mixin: function(func) {\n        tui.util.extend(func.prototype, this);\n    }\n};\n\nmodule.exports = lineTypeMixer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"