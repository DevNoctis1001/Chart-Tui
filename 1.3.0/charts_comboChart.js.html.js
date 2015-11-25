ne.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_comboChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Combo chart.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar calculator = require('../helpers/calculator'),\n    ChartBase = require('./chartBase'),\n    axisTypeMixer = require('./axisTypeMixer'),\n    axisDataMaker = require('../helpers/axisDataMaker'),\n    predicate = require('../helpers/predicate'),\n    defaultTheme = require('../themes/defaultTheme'),\n    ColumnChartSeries = require('../series/columnChartSeries'),\n    LineChartSeries = require('../series/lineChartSeries');\n\nvar ComboChart = tui.util.defineClass(ChartBase, /** @lends ComboChart.prototype */ {\n    /**\n     * Combo chart.\n     * @constructs ComboChart\n     * @extends ChartBase\n     * @param {array.&lt;array>} userData chart data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     */\n    init: function(userData, theme, options) {\n        var seriesChartTypes = tui.util.keys(userData.series).sort(),\n            optionChartTypes = this._getYAxisOptionChartTypes(seriesChartTypes, options.yAxis),\n            chartTypes = optionChartTypes.length ? optionChartTypes : seriesChartTypes;\n\n        this.chartTypes = chartTypes;\n        this.seriesChartTypes = seriesChartTypes;\n        this.optionChartTypes = optionChartTypes;\n        this.className = 'tui-combo-chart';\n\n        ChartBase.call(this, {\n            userData: userData,\n            theme: theme,\n            options: options,\n            seriesChartTypes: seriesChartTypes,\n            hasAxes: true,\n            isVertical: true\n        });\n\n        this._addComponents(this.convertedData, this.options, this.theme);\n    },\n\n    /**\n     * To make options map\n     * @param {object} chartTypes chart types\n     * @param {object} options chart options\n     * @param {object} orderInfo chart order\n     * @returns {object} options map\n     * @private\n     */\n    _makeOptionsMap: function(chartTypes, options) {\n        var optionsMap = {};\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            optionsMap[chartType] = options.series &amp;&amp; options.series[chartType];\n        });\n        return optionsMap;\n    },\n\n    /**\n     * To make theme map\n     * @param {object} chartTypes chart types\n     * @param {object} theme chart theme\n     * @param {object} legendLabels legend labels\n     * @returns {object} theme map\n     * @private\n     */\n    _makeThemeMap: function(chartTypes, theme, legendLabels) {\n        var themeMap = {},\n            colorCount = 0;\n        tui.util.forEachArray(chartTypes, function(chartType) {\n            var chartTheme = JSON.parse(JSON.stringify(theme)),\n                removedColors;\n\n            if (chartTheme.series[chartType]) {\n                themeMap[chartType] = chartTheme.series[chartType];\n            } else if (!chartTheme.series.colors) {\n                themeMap[chartType] = JSON.parse(JSON.stringify(defaultTheme.series));\n                themeMap[chartType].label.fontFamily = chartTheme.chart.fontFamily;\n            } else {\n                removedColors = chartTheme.series.colors.splice(0, colorCount);\n                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);\n                themeMap[chartType] = chartTheme.series;\n                colorCount += legendLabels[chartType].length;\n            }\n        });\n        return themeMap;\n    },\n\n    /**\n     * To make serieses\n     * @param {array.&lt;string>} chartTypes chart types\n     * @param {object} convertedData converted data.\n     * @param {object} options chart options\n     * @param {object} theme chart theme\n     * @returns {array.&lt;object>} serieses\n     * @private\n     */\n    _makeSerieses: function(chartTypes, convertedData, options, theme) {\n        var seriesClasses = {\n                column: ColumnChartSeries,\n                line: LineChartSeries\n            },\n            optionsMap = this._makeOptionsMap(chartTypes, options),\n            themeMap = this._makeThemeMap(chartTypes, theme, convertedData.legendLabels),\n            serieses;\n        serieses = tui.util.map(chartTypes, function(chartType) {\n            var values = convertedData.values[chartType],\n                formattedValues = convertedData.formattedValues[chartType],\n                data;\n\n            if (predicate.isLineTypeChart(chartType)) {\n                values = tui.util.pivot(values);\n                formattedValues = tui.util.pivot(formattedValues);\n            }\n\n            data = {\n                allowNegativeTooltip: true,\n                componentType: 'series',\n                chartType: chartType,\n                options: optionsMap[chartType],\n                theme: themeMap[chartType],\n                data: {\n                    values: values,\n                    formattedValues: formattedValues,\n                    formatFunctions: convertedData.formatFunctions,\n                    joinLegendLabels: convertedData.joinLegendLabels\n                }\n            };\n\n            return {\n                name: chartType + 'Series',\n                SeriesClass: seriesClasses[chartType],\n                data: data\n            };\n        });\n\n        return serieses;\n    },\n\n    /**\n     * Add components\n     * @param {object} convertedData converted data\n     * @param {object} options chart options\n     * @param {object} theme chart theme\n     * @private\n     */\n    _addComponents: function(convertedData, options, theme) {\n        var axes = ['yAxis', 'xAxis'],\n            serieses = this._makeSerieses(this.seriesChartTypes, convertedData, options, theme);\n\n        if (this.optionChartTypes.length) {\n            axes.push('yrAxis');\n        }\n\n        this._addComponentsForAxisType({\n            convertedData: convertedData,\n            axes: axes,\n            seriesChartTypes: this.seriesChartTypes,\n            chartType: options.chartType,\n            serieses: serieses\n        });\n    },\n\n    /**\n     * Get y axis option chart types.\n     * @param {array.&lt;string>} chartTypes chart types\n     * @param {object} yAxisOptions y axis options\n     * @returns {array.&lt;string>} chart types\n     * @private\n     */\n    _getYAxisOptionChartTypes: function(chartTypes, yAxisOptions) {\n        var resultChartTypes = chartTypes.slice(),\n            isReverse = false,\n            optionChartTypes;\n\n        yAxisOptions = yAxisOptions ? [].concat(yAxisOptions) : [];\n\n        if (yAxisOptions.length === 1 &amp;&amp; !yAxisOptions[0].chartType) {\n            resultChartTypes = [];\n        } else if (yAxisOptions.length) {\n            optionChartTypes = tui.util.map(yAxisOptions, function(option) {\n                return option.chartType;\n            });\n\n            tui.util.forEachArray(optionChartTypes, function(chartType, index) {\n                isReverse = isReverse || (chartType &amp;&amp; resultChartTypes[index] !== chartType || false);\n            });\n\n            if (isReverse) {\n                resultChartTypes.reverse();\n            }\n        }\n\n        return resultChartTypes;\n    },\n\n    /**\n     * To make y axis data.\n     * @param {object} params parameters\n     *      @param {number} params.index chart index\n     *      @param {object} params.convertedData converted data\n     *      @param {{width: number, height: number}} params.seriesDimension series dimension\n     *      @param {array.&lt;string>} chartTypes chart type\n     *      @param {boolean} isOneYAxis whether one series or not\n     *      @param {object} options chart options\n     *      @param {object} addParams add params\n     * @returns {object} y axis data\n     * @private\n     */\n    _makeYAxisData: function(params) {\n        var convertedData = params.convertedData,\n            index = params.index,\n            chartType = params.chartTypes[index],\n            options = params.options,\n            yAxisValues, yAxisOptions, seriesOption;\n\n        if (params.isOneYAxis) {\n            yAxisValues = convertedData.joinValues;\n            yAxisOptions = [options.yAxis];\n        } else {\n            yAxisValues = convertedData.values[chartType];\n            yAxisOptions = options.yAxis || [];\n        }\n\n        seriesOption = options.series &amp;&amp; options.series[chartType] || options.series;\n\n        return axisDataMaker.makeValueAxisData(tui.util.extend({\n            values: yAxisValues,\n            stacked: seriesOption &amp;&amp; seriesOption.stacked || '',\n            options: yAxisOptions[index],\n            chartType: chartType,\n            seriesDimension: params.seriesDimension,\n            formatFunctions: convertedData.formatFunctions,\n            isVertical: true\n        }, params.addParams));\n    },\n\n    /**\n     * To make axes data\n     * @param {object} convertedData converted data\n     * @param {object} bounds chart bounds\n     * @param {object} options chart options\n     * @returns {object} axes data\n     * @private\n     */\n    _makeAxesData: function(convertedData, bounds, options) {\n        var formatFunctions = convertedData.formatFunctions,\n            yAxisParams = {\n                convertedData: convertedData,\n                seriesDimension: bounds.series.dimension,\n                chartTypes: this.chartTypes,\n                isOneYAxis: !this.optionChartTypes.length,\n                options: options\n            },\n            xAxisData = axisDataMaker.makeLabelAxisData({\n                labels: convertedData.labels\n            }),\n            yAxisData = this._makeYAxisData(tui.util.extend({\n                index: 0\n            }, yAxisParams)),\n            axesData, yrAxisData;\n\n        axesData = {\n            yAxis: yAxisData,\n            xAxis: xAxisData\n        };\n\n        if (!yAxisParams.isOneYAxis) {\n            yrAxisData = this._makeYAxisData(tui.util.extend({\n                index: 1,\n                addParams: {\n                    isPositionRight: true\n                }\n            }, yAxisParams));\n            if (yAxisData.tickCount &lt; yrAxisData.tickCount) {\n                this._increaseYAxisTickCount(yrAxisData.tickCount - yAxisData.tickCount, yAxisData, formatFunctions);\n            } else if (yAxisData.tickCount > yrAxisData.tickCount) {\n                this._increaseYAxisTickCount(yAxisData.tickCount - yrAxisData.tickCount, yrAxisData, formatFunctions);\n            }\n\n            yrAxisData.aligned = xAxisData.aligned;\n            axesData.yrAxis = yrAxisData;\n        }\n\n        return axesData;\n    },\n\n    /**\n     * Increase y axis tick count.\n     * @param {number} increaseTickCount increase tick count\n     * @param {object} toData to tick info\n     * @param {array.&lt;function>} formatFunctions format functions\n     * @private\n     */\n    _increaseYAxisTickCount: function(increaseTickCount, toData, formatFunctions) {\n        toData.scale.max += toData.step * increaseTickCount;\n        toData.labels = axisDataMaker.formatLabels(calculator.makeLabelsFromScale(toData.scale, toData.step), formatFunctions);\n        toData.tickCount += increaseTickCount;\n        toData.validTickCount += increaseTickCount;\n    },\n\n    /**\n     * Render\n     * @returns {HTMLElement} chart element\n     */\n    render: function() {\n        //this._attachComboChartCoordinateEvent();\n        return ChartBase.prototype.render.call(this, {\n            seriesChartTypes: this.seriesChartTypes,\n            optionChartTypes: this.optionChartTypes\n        });\n    }\n});\n\naxisTypeMixer.mixin(ComboChart);\n\nmodule.exports = ComboChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"