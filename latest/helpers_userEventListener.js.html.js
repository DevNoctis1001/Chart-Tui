tui.util.defineNamespace("fedoc.content", {});
fedoc.content["helpers_userEventListener.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview UserEventListener is listener of user event.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar UserEventListener = tui.util.defineClass(/** @lends UserEventListener.prototype */ {\n    /**\n     * Register user event.\n     * @param {string} eventName event name\n     * @param {function} func event callback\n     */\n    register: function(eventName, func) {\n        this.on(eventName, func);\n    }\n});\n\ntui.util.CustomEvents.mixin(UserEventListener);\n\nmodule.exports = UserEventListener;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"