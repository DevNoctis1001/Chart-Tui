tui.util.defineNamespace("fedoc.content", {});
fedoc.content["customEvents_pieChartCustomEvent.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview PieChartCustomEvent is event handle layer for pie chart tooltip.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar CustomEventBase = require('./customEventBase'),\n    renderUtil = require('../helpers/renderUtil');\n\nvar PieChartCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends PieChartCustomEvent.prototype */ {\n    /**\n     * PieChartCustomEvent is event handle layer for pie chart tooltip.\n     * @constructs PieChartCustomEvent\n     * @param {object} params parameters\n     *      @param {BoundsMaker} params.boundsMaker bounds maker instance\n     *      @param {string} parmas.chartType chart type\n     * @extends CustomEventBase\n     */\n    init: function(params) {\n        this.boundsMaker = params.boundsMaker;\n        this.chartType = params.chartType;\n    },\n    /**\n     * Render event handle layer area\n     * @param {HTMLElement} customEventContainer custom event container element\n     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer\n     * @private\n     */\n    _renderCustomEventArea: function(customEventContainer) {\n        var bound = this.boundsMaker.getBound('customEvent');\n        renderUtil.renderDimension(customEventContainer, bound.dimension);\n        renderUtil.renderPosition(customEventContainer, bound.position);\n    },\n\n    /**\n     * Initialize data of custom event\n     * @override\n     */\n    initCustomEventData: function() {},\n\n    /**\n     * On click.\n     * @param {mouseevent} e mouse event\n     * @private\n     * @override\n     */\n    _onClick: function(e) {\n        this._onMouseEvent('click', e);\n    },\n\n    /**\n     * On mouse move.\n     * @param {mouseevent} e mouse event\n     * @private\n     * @override\n     */\n    _onMousemove: function(e) {\n        this._onMouseEvent('move', e);\n    }\n});\n\ntui.util.CustomEvents.mixin(PieChartCustomEvent);\n\nmodule.exports = PieChartCustomEvent;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"