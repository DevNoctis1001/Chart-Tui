tui.util.defineNamespace("fedoc.content", {});
fedoc.content["customEvents_pointTypeCustomEvent.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview PointTypeCustomEven is event handle layer for line type chart.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar chartConst = require('../const'),\n    CustomEventBase = require('./customEventBase');\n\nvar PointTypeCustomEven = tui.util.defineClass(CustomEventBase, /** @lends PointTypeCustomEven.prototype */ {\n    /**\n     * PointTypeCustomEven is event handle layer for line type chart.\n     * @constructs PointTypeCustomEven\n     * @extends CustomEventBase\n     */\n    init: function() {\n        CustomEventBase.apply(this, arguments);\n\n        /**\n         * previous found data\n         * @type {null | object}\n         */\n        this.prevFoundData = null;\n    },\n\n    /**\n     * On mousemove.\n     * @param {MouseEvent} e mouse event object\n     * @private\n     * @override\n     */\n    _onMousemove: function(e) {\n        var elTarget = e.target || e.srcElement,\n            clientX = e.clientX - chartConst.SERIES_EXPAND_SIZE,\n            foundData = this._findPointTypeData(elTarget, clientX, e.clientY);\n\n        if (!this._isChanged(this.prevFoundData, foundData)) {\n            return;\n        }\n\n        if (this.prevFoundData) {\n            this.fire('hideTooltip', this.prevFoundData);\n        }\n\n        if (foundData) {\n            this.fire('showTooltip', foundData);\n        }\n\n        this.prevFoundData = foundData;\n    },\n\n    /**\n     * On mouseout.\n     * @param {MouseEvent} e mouse event object\n     * @override\n     */\n    _onMouseout: function() {\n        if (this.prevFoundData) {\n            this.fire('hideTooltip', this.prevFoundData);\n            this.prevFoundData = null;\n        }\n    }\n});\n\nmodule.exports = PointTypeCustomEven;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"