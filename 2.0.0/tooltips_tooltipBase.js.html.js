tui.util.defineNamespace("fedoc.content", {});
fedoc.content["tooltips_tooltipBase.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview TooltipBase is base class of tooltip components.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar chartConst = require('../const'),\n    dom = require('../helpers/domHandler'),\n    predicate = require('../helpers/predicate'),\n    renderUtil = require('../helpers/renderUtil');\n\nvar TooltipBase = tui.util.defineClass(/** @lends TooltipBase.prototype */ {\n    /**\n     * TooltipBase is base class of tooltip components.\n     * @constructs TooltipBase\n     * @param {object} params parameters\n     *      @param {Array.&lt;number>} params.values converted values\n     *      @param {BoundsMaker} params.boundsMaker bounds maker\n     *      @param {object} params.theme axis theme\n     */\n    init: function(params) {\n        var isPieChart = predicate.isPieChart(params.chartType);\n\n        tui.util.extend(this, params);\n        /**\n         * className\n         * @type {string}\n         */\n        this.className = 'tui-chart-tooltip-area';\n\n        /**\n         * Tooltip container.\n         * @type {HTMLElement}\n         */\n        this.tooltipContainer = null;\n\n        /**\n         * Tooltip suffix.\n         * @type {string}\n         */\n        this.suffix = this.options.suffix ? '&amp;nbsp;' + this.options.suffix : '';\n\n        /**\n         * Tooltip template function.\n         * @type {function}\n         */\n        this.templateFunc = this.options.template || tui.util.bind(this._makeTooltipHtml, this);\n\n        /**\n         * Tooltip animation time.\n         * @type {number}\n         */\n        this.animationTime = isPieChart ? chartConst.TOOLTIP_PIE_ANIMATION_TIME : chartConst.TOOLTIP_ANIMATION_TIME;\n\n        this.chartType = params.chartType;\n\n        /**\n         * TooltipBase base data.\n         * @type {Array.&lt;Array.&lt;object>>}\n         */\n        this.data = [];\n\n        this._setDefaultTooltipPositionOption();\n        this._saveOriginalPositionOptions();\n    },\n\n    /**\n     * Make tooltip html.\n     * @private\n     * @abstract\n     */\n    _makeTooltipHtml: function() {},\n\n    /**\n     * Set default align option of tooltip.\n     * @private\n     * @abstract\n     */\n    _setDefaultTooltipPositionOption: function() {},\n\n    /**\n     * Save position options.\n     * @private\n     */\n    _saveOriginalPositionOptions: function() {\n        this.orgPositionOptions = {\n            align: this.options.align,\n            position: this.options.position\n        };\n    },\n\n    /**\n     * Make tooltip data.\n     * @private\n     * @abstract\n     */\n    _makeTooltipData: function() {},\n\n    /**\n     * Render tooltip component.\n     * @returns {HTMLElement} tooltip element\n     */\n    render: function() {\n        var el = dom.create('DIV', this.className);\n\n        this.data = this._makeTooltipData();\n\n        renderUtil.renderPosition(el, this.boundsMaker.getPosition('tooltip'));\n\n        this.tooltipContainer = el;\n\n        return el;\n    },\n\n    /**\n     * Rerender.\n     */\n    rerender: function() {\n        this.data = this._makeTooltipData();\n        this.resize();\n    },\n\n    /**\n     * Resize tooltip component.\n     * @override\n     */\n    resize: function() {\n        renderUtil.renderPosition(this.tooltipContainer, this.boundsMaker.getPosition('tooltip'));\n        if (this.positionModel) {\n            this.positionModel.updateBound(this.boundsMaker.getBound('tooltip'));\n        }\n    },\n\n    /**\n     * Get tooltip element.\n     * @returns {HTMLElement} tooltip element\n     * @private\n     */\n    _getTooltipElement: function() {\n        var tooltipElement;\n\n        if (!this.tooltipElement) {\n            this.tooltipElement = tooltipElement = dom.create('DIV', 'tui-chart-tooltip');\n            dom.append(this.tooltipContainer, tooltipElement);\n        }\n\n        return this.tooltipElement;\n    },\n\n    /**\n     * onShow is callback of custom event showTooltip for SeriesView.\n     * @param {object} params coordinate event parameters\n     */\n    onShow: function(params) {\n        var tooltipElement = this._getTooltipElement(),\n            prevPosition;\n\n        if (!predicate.isMousePositionChart(params.chartType) &amp;&amp; tooltipElement.offsetWidth) {\n            prevPosition = {\n                left: tooltipElement.offsetLeft,\n                top: tooltipElement.offsetTop\n            };\n        }\n\n        this._showTooltip(tooltipElement, params, prevPosition);\n    },\n\n    /**\n     * Get tooltip dimension\n     * @param {HTMLElement} tooltipElement tooltip element\n     * @returns {{width: number, height: number}} rendered tooltip dimension\n     */\n    getTooltipDimension: function(tooltipElement) {\n        return {\n            width: tooltipElement.offsetWidth,\n            height: tooltipElement.offsetHeight\n        };\n    },\n\n    /**\n     * Move to Position.\n     * @param {HTMLElement} tooltipElement tooltip element\n     * @param {{left: number, top: number}} position position\n     * @param {{left: number, top: number}} prevPosition prev position\n     * @private\n     */\n    _moveToPosition: function(tooltipElement, position, prevPosition) {\n        if (prevPosition) {\n            this._slideTooltip(tooltipElement, prevPosition, position);\n        } else {\n            renderUtil.renderPosition(tooltipElement, position);\n        }\n    },\n\n    /**\n     * Slide tooltip\n     * @param {HTMLElement} tooltipElement tooltip element\n     * @param {{left: number, top: number}} prevPosition prev position\n     * @param {{left: number, top: number}} position position\n     * @private\n     */\n    _slideTooltip: function(tooltipElement, prevPosition, position) {\n        var moveTop = position.top - prevPosition.top,\n            moveLeft = position.left - prevPosition.left;\n\n        renderUtil.cancelAnimation(this.slidingAnimation);\n\n        this.slidingAnimation = renderUtil.startAnimation(this.animationTime, function(ratio) {\n            var left = moveLeft * ratio,\n                top = moveTop * ratio;\n            tooltipElement.style.left = (prevPosition.left + left) + 'px';\n            tooltipElement.style.top = (prevPosition.top + top) + 'px';\n        });\n    },\n\n    /**\n     * onHide is callback of custom event hideTooltip for SeriesView\n     * @param {number} index index\n     */\n    onHide: function(index) {\n        var tooltipElement = this._getTooltipElement();\n\n        this._hideTooltip(tooltipElement, index);\n    },\n\n    /**\n     * Set tooltip align option.\n     * @param {string} align align\n     */\n    setAlign: function(align) {\n        this.options.align = align;\n        if (this.positionModel) {\n            this.positionModel.updateOptions(this.options);\n        }\n    },\n\n    /**\n     * Set position option.\n     * @param {{left: number, top: number}} position moving position\n     */\n    setPosition: function(position) {\n        this.options.position = tui.util.extend({}, this.options.position, position);\n        if (this.positionModel) {\n            this.positionModel.updateOptions(this.options);\n        }\n    },\n\n    /**\n     * Reset tooltip align option.\n     */\n    resetAlign: function() {\n        var align = this.orgPositionOptions.align;\n\n        this.options.align = align;\n        if (this.positionModel) {\n            this.positionModel.updateOptions(this.options);\n        }\n    },\n\n    /**\n     * Reset tooltip position.\n     */\n    resetPosition: function() {\n        var position = this.orgPositionOptions.position;\n\n        this.options.position = position;\n        if (this.positionModel) {\n            this.positionModel.updateOptions(this.options);\n        }\n    }\n});\n\ntui.util.CustomEvents.mixin(TooltipBase);\n\nmodule.exports = TooltipBase;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"