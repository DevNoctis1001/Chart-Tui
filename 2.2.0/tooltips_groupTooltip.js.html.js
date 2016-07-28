tui.util.defineNamespace("fedoc.content", {});
fedoc.content["tooltips_groupTooltip.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Group tooltip component.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar TooltipBase = require('./tooltipBase'),\n    GroupTooltipPositionModel = require('./groupTooltipPositionModel'),\n    chartConst = require('../const'),\n    dom = require('../helpers/domHandler'),\n    renderUtil = require('../helpers/renderUtil'),\n    defaultTheme = require('../themes/defaultTheme'),\n    tooltipTemplate = require('./tooltipTemplate');\n\n/**\n * @classdesc GroupTooltip component.\n * @class GroupTooltip\n */\nvar GroupTooltip = tui.util.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {\n    /**\n     * Group tooltip component.\n     * @constructs GroupTooltip\n     * @override\n     */\n    init: function() {\n        this.prevIndex = null;\n        TooltipBase.apply(this, arguments);\n    },\n\n    /**\n     * Make tooltip html.\n     * @param {string} category category\n     * @param {Array.&lt;{value: string, legend: string, chartType: string, suffix: ?string}>} items items data\n     * @returns {string} tooltip html\n     * @private\n     */\n    _makeTooltipHtml: function(category, items) {\n        var template = tooltipTemplate.tplGroupItem,\n            cssTextTemplate = tooltipTemplate.tplGroupCssText,\n            colors = this._makeColors(this.theme),\n            itemsHtml = tui.util.map(items, function(item, index) {\n                return template(tui.util.extend({\n                    cssText: cssTextTemplate({color: colors[index]})\n                }, item));\n            }).join('');\n\n        return tooltipTemplate.tplGroup({\n            category: category,\n            items: itemsHtml\n        });\n    },\n\n    /**\n     * Set default align option of tooltip.\n     * @private\n     * @override\n     */\n    _setDefaultTooltipPositionOption: function() {\n        if (this.options.align) {\n            return;\n        }\n\n        if (this.isVertical) {\n            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION;\n        } else {\n            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION;\n        }\n    },\n\n    /**\n     * Render tooltip component.\n     * @returns {HTMLElement} tooltip element\n     * @override\n     */\n    render: function() {\n        var el = TooltipBase.prototype.render.call(this),\n            chartDimension = this.boundsMaker.getDimension('chart'),\n            bound = this.boundsMaker.getBound('tooltip');\n\n        this.positionModel = new GroupTooltipPositionModel(chartDimension, bound, this.isVertical, this.options);\n\n        return el;\n    },\n\n    /**\n     * Rerender.\n     * @param {{checkedLegends: Array.&lt;boolean>}} data rendering data\n     * @override\n     */\n    rerender: function(data) {\n        TooltipBase.prototype.rerender.call(this, data);\n        this.prevIndex = null;\n\n        if (data.checkedLegends) {\n            this.theme = this._updateLegendTheme(data.checkedLegends);\n        }\n    },\n\n    /**\n     * Zoom.\n     */\n    zoom: function() {\n        this.prevIndex = null;\n        TooltipBase.prototype.zoom.call(this);\n    },\n\n    /**\n     * Update legend theme.\n     * @param {object | Array.&lt;boolean>}checkedLegends checked legends\n     * @returns {{colors: Array.&lt;string>}} legend theme\n     * @private\n     */\n    _updateLegendTheme: function(checkedLegends) {\n        var colors = [];\n\n        tui.util.forEachArray(this.dataProcessor.getOriginalLegendData(), function(item) {\n            var _checkedLegends = checkedLegends[item.chartType] || checkedLegends;\n            if (_checkedLegends[item.index]) {\n                colors.push(item.theme.color);\n            }\n        });\n\n        return {\n            colors: colors\n        };\n    },\n\n    /**\n     * Make tooltip data.\n     * @returns {Array.&lt;object>} tooltip data\n     * @override\n     */\n    _makeTooltipData: function() {\n        var self = this;\n\n        return tui.util.map(this.dataProcessor.getSeriesGroups(), function(seriesGroup, index) {\n            return {\n                category: self.dataProcessor.getCategory(index),\n                values: seriesGroup.pluck('label')\n            };\n        });\n    },\n\n    /**\n     * Make colors.\n     * @param {object} theme tooltip theme\n     * @returns {Array.&lt;string>} colors\n     * @private\n     */\n    _makeColors: function(theme) {\n        var colorIndex = 0,\n            legendLabels = this.dataProcessor.getLegendData(),\n            defaultColors, colors, prevChartType;\n\n        if (theme.colors) {\n            return theme.colors;\n        }\n\n        defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);\n\n        return tui.util.map(tui.util.pluck(legendLabels, 'chartType'), function(chartType) {\n            var color;\n\n            if (prevChartType !== chartType) {\n                colors = theme[chartType] ? theme[chartType].colors : defaultColors;\n                colorIndex = 0;\n            }\n\n            prevChartType = chartType;\n            color = colors[colorIndex];\n            colorIndex += 1;\n\n            return color;\n        });\n    },\n\n    /**\n     * Make rendering data about legend item.\n     * @param {Array.&lt;string>} values values\n     * @returns {Array.&lt;{value: string, legend: string, chartType: string, suffix: ?string}>} legend item data.\n     * @private\n     */\n    _makeItemRenderingData: function(values) {\n        var dataProcessor = this.dataProcessor,\n            suffix = this.suffix;\n\n        return tui.util.map(values, function(value, index) {\n            var legendLabel = dataProcessor.getLegendItem(index);\n\n            return {\n                value: value,\n                legend: legendLabel.label,\n                chartType: legendLabel.chartType,\n                suffix: suffix\n            };\n        });\n    },\n\n    /**\n     * Make tooltip.\n     * @param {number} groupIndex group index\n     * @returns {string} tooltip html\n     * @private\n     */\n    _makeGroupTooltipHtml: function(groupIndex) {\n        var data = this.data[groupIndex],\n            items = this._makeItemRenderingData(data.values);\n\n        return this.templateFunc(data.category, items);\n    },\n\n    /**\n     * Get tooltip sector element.\n     * @returns {HTMLElement} sector element\n     * @private\n     */\n    _getTooltipSectorElement: function() {\n        var groupTooltipSector;\n\n        if (!this.groupTooltipSector) {\n            this.groupTooltipSector = groupTooltipSector = dom.create('DIV', 'tui-chart-group-tooltip-sector');\n            dom.append(this.tooltipContainer, groupTooltipSector);\n        }\n\n        return this.groupTooltipSector;\n    },\n\n    /**\n     * Make bound about tooltip sector of vertical type chart.\n     * @param {number} height height\n     * @param {{start: number, end: number}} range range\n     * @param {boolean} isLine whether line or not\n     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound\n     * @private\n     */\n    _makeVerticalTooltipSectorBound: function(height, range, isLine) {\n        var width;\n\n        if (isLine) {\n            width = 1;\n            height += 6;\n        } else {\n            width = range.end - range.start;\n        }\n\n        return {\n            dimension: {\n                width: width,\n                height: height\n            },\n            position: {\n                left: range.start + chartConst.SERIES_EXPAND_SIZE,\n                top: chartConst.SERIES_EXPAND_SIZE\n            }\n        };\n    },\n\n    /**\n     * Make bound about tooltip sector of horizontal type chart.\n     * @param {number} width width\n     * @param {{start: number, end:number}} range range\n     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound\n     * @private\n     */\n    _makeHorizontalTooltipSectorBound: function(width, range) {\n        return {\n            dimension: {\n                width: width,\n                height: range.end - range.start\n            },\n            position: {\n                left: chartConst.SERIES_EXPAND_SIZE,\n                top: range.start + chartConst.SERIES_EXPAND_SIZE\n            }\n        };\n    },\n\n    /**\n     * Make bound about tooltip sector.\n     * @param {number} size width or height\n     * @param {{start: number, end:number}} range range\n     * @param {boolean} isVertical whether vertical or not\n     * @param {boolean} isLine whether line type or not\n     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound\n     * @private\n     */\n    _makeTooltipSectorBound: function(size, range, isVertical, isLine) {\n        var bound;\n\n        if (isVertical) {\n            bound = this._makeVerticalTooltipSectorBound(size, range, isLine);\n        } else {\n            bound = this._makeHorizontalTooltipSectorBound(size, range);\n        }\n\n        return bound;\n    },\n\n    /**\n     * Show tooltip sector.\n     * @param {number} size width or height\n     * @param {{start: number, end:number}} range range\n     * @param {boolean} isVertical whether vertical or not\n     * @param {number} index index\n     * @param {boolean} [isMoving] whether moving or not\n     * @private\n     */\n    _showTooltipSector: function(size, range, isVertical, index, isMoving) {\n        var groupTooltipSector = this._getTooltipSectorElement(),\n            isLine = (range.start === range.end),\n            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);\n\n        if (isLine) {\n            this.fire('showGroupTooltipLine', bound);\n        } else {\n            renderUtil.renderDimension(groupTooltipSector, bound.dimension);\n            renderUtil.renderPosition(groupTooltipSector, bound.position);\n            dom.addClass(groupTooltipSector, 'show');\n        }\n\n        if (isMoving) {\n            index -= 1;\n        }\n\n        this.fire('showGroupAnimation', index);\n    },\n\n    /**\n     * Hide tooltip sector.\n     * @param {number} index index\n     * @private\n     */\n    _hideTooltipSector: function(index) {\n        var groupTooltipSector = this._getTooltipSectorElement();\n\n        dom.removeClass(groupTooltipSector, 'show');\n        this.fire('hideGroupAnimation', index);\n        this.fire('hideGroupTooltipLine');\n    },\n\n    /**\n     * Show tooltip.\n     * @param {HTMLElement} elTooltip tooltip element\n     * @param {{index: number, range: {start: number, end: number},\n     *          size: number, direction: string, isVertical: boolean\n     *        }} params coordinate event parameters\n     * @param {{left: number, top: number}} prevPosition prev position\n     * @private\n     */\n    _showTooltip: function(elTooltip, params, prevPosition) {\n        var dimension, position;\n\n        if (!tui.util.isNull(this.prevIndex)) {\n            this.fire('hideGroupAnimation', this.prevIndex);\n        }\n\n        elTooltip.innerHTML = this._makeGroupTooltipHtml(params.index);\n\n        this._fireBeforeShowTooltip(params.index, params.range);\n\n        dom.addClass(elTooltip, 'show');\n\n        this._showTooltipSector(params.size, params.range, params.isVertical, params.index, params.isMoving);\n\n        dimension = this.getTooltipDimension(elTooltip);\n        position = this.positionModel.calculatePosition(dimension, params.range);\n\n        this._moveToPosition(elTooltip, position, prevPosition);\n\n        this._fireAfterShowTooltip(params.index, params.range, {\n            element: elTooltip,\n            position: position\n        });\n\n        this.prevIndex = params.index;\n    },\n\n    /**\n     * To call beforeShowTooltip callback of userEvent.\n     * @param {number} index index\n     * @param {{start: number, end: number}} range range\n     * @private\n     */\n    _fireBeforeShowTooltip: function(index, range) {\n        this.userEvent.fire('beforeShowTooltip', {\n            index: index,\n            range: range\n        });\n    },\n\n    /**\n     * To call afterShowTooltip callback of userEvent.\n     * @param {number} index index\n     * @param {{start: number, end: number}} range range\n     * @param {object} additionParams addition parameters\n     * @private\n     */\n    _fireAfterShowTooltip: function(index, range, additionParams) {\n        this.userEvent.fire('afterShowTooltip', tui.util.extend({\n            index: index,\n            range: range\n        }, additionParams));\n    },\n\n    /**\n     * Hide tooltip.\n     * @param {HTMLElement} elTooltip tooltip element\n     * @param {number} index index\n     * @private\n     */\n    _hideTooltip: function(elTooltip, index) {\n        this.prevIndex = null;\n        this._hideTooltipSector(index);\n        dom.removeClass(elTooltip, 'show');\n        elTooltip.style.cssText = '';\n    }\n});\n\nmodule.exports = GroupTooltip;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"