tui.util.defineNamespace("fedoc.content", {});
fedoc.content["helpers_renderUtil.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Util for rendering.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\n/*eslint no-magic-numbers: [1, {ignore: [-1, 0, 1, 2, 7, 8]}]*/\n\nvar dom = require('./domHandler'),\n    chartConst = require('./../const');\n\nvar concat = Array.prototype.concat;\n\nvar browser = tui.util.browser,\n    isIE7 = browser.msie &amp;&amp; browser.version === 7,\n    isOldBrowser = browser.msie &amp;&amp; browser.version &lt;= 8;\n\n/**\n * Util for rendering.\n * @module renderUtil\n */\nvar renderUtil = {\n    /**\n     * Concat string.\n     * @memberOf module:renderUtil\n     * @params {...string} target strings\n     * @returns {string} concat string\n     */\n    concatStr: function() {\n        return String.prototype.concat.apply('', arguments);\n    },\n\n    /**\n     * Make cssText for font.\n     * @memberOf module:renderUtil\n     * @param {{fontSize: number, fontFamily: string, color: string}} theme font theme\n     * @returns {string} cssText\n     */\n    makeFontCssText: function(theme) {\n        var cssTexts = [];\n\n        if (!theme) {\n            return '';\n        }\n\n        if (theme.fontSize) {\n            cssTexts.push(this.concatStr('font-size:', theme.fontSize, 'px'));\n        }\n\n        if (theme.fontFamily) {\n            cssTexts.push(this.concatStr('font-family:', theme.fontFamily));\n        }\n\n        if (theme.color) {\n            cssTexts.push(this.concatStr('color:', theme.color));\n        }\n\n        return cssTexts.join(';');\n    },\n\n    checkEl: null,\n    /**\n     * Create element for size check.\n     * @memberOf module:renderUtil\n     * @returns {HTMLElement} element\n     * @private\n     */\n    _createSizeCheckEl: function() {\n        var div, span;\n        if (!this.checkEl) {\n            div = dom.create('DIV', 'tui-chart-size-check-element');\n            span = dom.create('SPAN');\n            div.appendChild(span);\n            this.checkEl = div;\n        } else {\n            this.checkEl.style.cssText = '';\n        }\n\n        return this.checkEl;\n    },\n\n    /**\n     * Make caching key.\n     * @param {string} label labek\n     * @param {{fontSize: number, fontFamily: string}} theme theme\n     * @param {string} offsetType offset type (offsetWidth or offsetHeight)\n     * @returns {string} key\n     * @private\n     */\n    _makeCachingKey: function(label, theme, offsetType) {\n        var keys = [label, offsetType];\n\n        tui.util.forEach(theme, function(key, value) {\n            keys.push(key + value);\n        });\n\n        return keys.join('-');\n    },\n\n    /**\n     * Size cache.\n     * @type {object}\n     */\n    sizeCache: {},\n\n    /**\n     * Add css style.\n     * @param {HTMLElement} div div element\n     * @param {{fontSize: number, fontFamily: string, cssText: string}} theme theme\n     * @private\n     */\n    _addCssStyle: function(div, theme) {\n        div.style.fontSize = (theme.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';\n\n        if (theme.fontFamily) {\n            div.style.fontFamily = theme.fontFamily;\n        }\n\n        if (theme.cssText) {\n            div.style.cssText += theme.cssText;\n        }\n    },\n\n    /**\n     * Get rendered label size (width or height).\n     * @memberOf module:renderUtil\n     * @param {string | number} label label\n     * @param {object} theme theme\n     * @param {string} offsetType offset type (offsetWidth or offsetHeight)\n     * @returns {number} size\n     * @private\n     */\n    _getRenderedLabelSize: function(label, theme, offsetType) {\n        var key, div, span, labelSize;\n\n        theme = theme || {};\n\n        label = tui.util.isExisty(label) ? String(label) : '';\n\n        if (!label) {\n            return 0;\n        }\n\n        key = this._makeCachingKey(label, theme, offsetType);\n        labelSize = this.sizeCache[key];\n\n        if (!labelSize) {\n            div = this._createSizeCheckEl();\n            span = div.firstChild;\n\n            span.innerHTML = label;\n\n            this._addCssStyle(div, theme);\n\n            document.body.appendChild(div);\n            labelSize = span[offsetType];\n            document.body.removeChild(div);\n\n            this.sizeCache[key] = labelSize;\n        }\n\n        return labelSize;\n    },\n\n    /**\n     * Get rendered label width.\n     * @memberOf module:renderUtil\n     * @param {string} label label\n     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme\n     * @returns {number} width\n     */\n    getRenderedLabelWidth: function(label, theme) {\n        var labelWidth = this._getRenderedLabelSize(label, theme, 'offsetWidth');\n        return labelWidth;\n    },\n\n    /**\n     * Get rendered label height.\n     * @memberOf module:renderUtil\n     * @param {string} label label\n     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme\n     * @returns {number} height\n     */\n    getRenderedLabelHeight: function(label, theme) {\n        var labelHeight = this._getRenderedLabelSize(label, theme, 'offsetHeight');\n        return labelHeight;\n    },\n\n    /**\n     * Get Rendered Labels Max Size(width or height).\n     * @memberOf module:boundsMaker\n     * @param {string[]} labels labels\n     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme\n     * @param {function} iteratee iteratee\n     * @returns {number} max size (width or height)\n     * @private\n     */\n    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {\n        var maxSize = 0,\n            sizes;\n\n        if (labels &amp;&amp; labels.length) {\n            sizes = tui.util.map(labels, function(label) {\n                return iteratee(label, theme);\n            });\n            maxSize = tui.util.max(sizes);\n        }\n\n        return maxSize;\n    },\n\n    /**\n     * Get rendered labels max width.\n     * @memberOf module:boundsMaker\n     * @param {string[]} labels labels\n     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme\n     * @returns {number} max width\n     * @private\n     */\n    getRenderedLabelsMaxWidth: function(labels, theme) {\n        var iteratee = tui.util.bind(this.getRenderedLabelWidth, this),\n            maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);\n        return maxWidth;\n    },\n\n    /**\n     * Get rendered labels max height.\n     * @memberOf module:boundsMaker\n     * @param {string[]} labels labels\n     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme\n     * @returns {number} max height\n     */\n    getRenderedLabelsMaxHeight: function(labels, theme) {\n        var iteratee = tui.util.bind(this.getRenderedLabelHeight, this),\n            maxHeight = this._getRenderedLabelsMaxSize(labels, theme, iteratee);\n        return maxHeight;\n    },\n\n    /**\n     * Render dimension.\n     * @memberOf module:renderUtil\n     * @param {HTMLElement} el target element\n     * @param {{width: number, height: number}} dimension dimension\n     */\n    renderDimension: function(el, dimension) {\n        el.style.cssText = [\n            this.concatStr('width:', dimension.width, 'px'),\n            this.concatStr('height:', dimension.height, 'px')\n        ].join(';');\n    },\n\n    /**\n     * Render position(top, right).\n     * @memberOf module:renderUtil\n     * @param {HTMLElement} el target element\n     * @param {{top: number, left: number, right: number}} position position\n     */\n    renderPosition: function(el, position) {\n        if (tui.util.isUndefined(position)) {\n            return;\n        }\n\n        if (!tui.util.isUndefined(position.top)) {\n            el.style.top = position.top + 'px';\n        }\n\n        if (!tui.util.isUndefined(position.left)) {\n            el.style.left = position.left + 'px';\n        }\n\n        if (!tui.util.isUndefined(position.right)) {\n            el.style.right = position.right + 'px';\n        }\n    },\n\n    /**\n     * Render background.\n     * @memberOf module:renderUtil\n     * @param {HTMLElement} el target element\n     * @param {string} background background option\n     */\n    renderBackground: function(el, background) {\n        if (!background) {\n            return;\n        }\n\n        el.style.background = background;\n    },\n\n    /**\n     * Render font family.\n     * @memberOf module:renderUtil\n     * @param {HTMLElement} el target element\n     * @param {string} fontFamily font family option\n     */\n    renderFontFamily: function(el, fontFamily) {\n        if (!fontFamily) {\n            return;\n        }\n\n        el.style.fontFamily = fontFamily;\n    },\n\n    /**\n     * Render title.\n     * @memberOf module:renderUtil\n     * @param {string} title title\n     * @param {{fontSize: number, color: string, background: string}} theme title theme\n     * @param {string} className css class name\n     * @returns {HTMLElement} title element\n     */\n    renderTitle: function(title, theme, className) {\n        var elTitle, cssText;\n\n        if (!title) {\n            return null;\n        }\n\n        elTitle = dom.create('DIV', className);\n        elTitle.innerHTML = title;\n\n        cssText = renderUtil.makeFontCssText(theme);\n\n        if (theme.background) {\n            cssText += ';' + this.concatStr('background:', theme.background);\n        }\n\n        elTitle.style.cssText = cssText;\n\n        return elTitle;\n    },\n\n    /**\n     * Expand dimension.\n     * @param {{\n     *      dimension: {width: number, height: number},\n     *      position: {left: number, top: number}\n     * }} bound series bound\n     * @returns {{\n     *      dimension: {width: number, height: number},\n     *      position: {left: number, top: number}\n     * }} expended bound\n     */\n    expandBound: function(bound) {\n        var dimension = bound.dimension,\n            position = bound.position;\n        return {\n            dimension: {\n                width: dimension.width + chartConst.SERIES_EXPAND_SIZE * 2,\n                height: dimension.height + chartConst.SERIES_EXPAND_SIZE * 2\n            },\n            position: {\n                left: position.left - chartConst.SERIES_EXPAND_SIZE,\n                top: position.top - chartConst.SERIES_EXPAND_SIZE\n            }\n        };\n    },\n\n    /**\n     * Make custom event name.\n     * @param {string} prefix prefix\n     * @param {string} value value\n     * @param {string} suffix suffix\n     * @returns {string} custom event name\n     */\n    makeCustomEventName: function(prefix, value, suffix) {\n        return prefix + tui.util.properCase(value) + tui.util.properCase(suffix);\n    },\n\n    /**\n     * Format value.\n     * @param {number} value value\n     * @param {Array.&lt;function>} formatFunctions - functions for format\n     * @param {string} areaType - type of area like yAxis, xAxis, series, circleLegend\n     * @param {string} [valueType] - value type\n     * @returns {string} formatted value\n     */\n    formatValue: function(value, formatFunctions, areaType, valueType) {\n        var fns = [value].concat(formatFunctions || []);\n\n        valueType = valueType || 'value';\n\n        return tui.util.reduce(fns, function(stored, fn) {\n            return fn(stored, areaType, valueType);\n        });\n    },\n\n    /**\n     * Format values.\n     * @param {Array.&lt;number>} values values\n     * @param {Array.&lt;function>} formatFunctions functions for format\n     * @param {string} areaType - type of area like yAxis, xAxis, series, circleLegend\n     * @param {string} valueType - value type\n     * @returns {Array.&lt;string>}\n     */\n    formatValues: function(values, formatFunctions, areaType, valueType) {\n        var formatedValues;\n        if (!formatFunctions || !formatFunctions.length) {\n            return values;\n        }\n        formatedValues = tui.util.map(values, function(label) {\n            return renderUtil.formatValue(label, formatFunctions, areaType, valueType);\n        });\n        return formatedValues;\n    },\n\n    /**\n     * Cancel animation\n     * @param {{id: number}} animation animaion object\n     */\n    cancelAnimation: function(animation) {\n        if (animation &amp;&amp; animation.id) {\n            cancelAnimationFrame(animation.id);\n            delete animation.id;\n        }\n    },\n\n    /**\n     * Start animation.\n     * @param {number} animationTime animation time\n     * @param {function} onAnimation animation callback function\n     * @returns {{id: number}} requestAnimationFrame id\n     */\n    startAnimation: function(animationTime, onAnimation) {\n        var animation = {},\n            startTime;\n\n        /**\n         * Animate.\n         */\n        function animate() {\n            var diffTime = (new Date()).getTime() - startTime,\n                ratio = Math.min((diffTime / animationTime), 1);\n\n            onAnimation(ratio);\n\n            if (ratio === 1) {\n                delete animation.id;\n            } else {\n                animation.id = requestAnimationFrame(animate);\n            }\n        }\n\n        startTime = (new Date()).getTime();\n        animation.id = requestAnimationFrame(animate);\n\n        return animation;\n    },\n\n    /**\n     * Whether IE7 or not.\n     * @returns {boolean} result boolean\n     */\n    isIE7: function() {\n        return isIE7;\n    },\n\n    /**\n     * Whether oldBrowser or not.\n     * @memberOf module:renderUtil\n     * @returns {boolean} result boolean\n     */\n    isOldBrowser: function() {\n        return isOldBrowser;\n    },\n\n    /**\n     * Format zero fill.\n     * @param {string} value target value\n     * @param {number} len length of result\n     * @returns {string} formatted value\n     * @private\n     */\n    formatZeroFill: function(value, len) {\n        var zero = '0';\n\n        value = String(value);\n\n        if (value.length >= len) {\n            return value;\n        }\n\n        while (value.length &lt; len) {\n            value = zero + value;\n        }\n\n        return value;\n    },\n\n    /**\n     * Format Decimal.\n     * @param {string} value target value\n     * @param {number} len length of under decimal point\n     * @returns {string} formatted value\n     */\n    formatDecimal: function(value, len) {\n        var pow;\n\n        if (len === 0) {\n            return Math.round(value);\n        }\n\n        pow = Math.pow(10, len);\n        value = Math.round(value * pow) / pow;\n        value = parseFloat(value).toFixed(len);\n\n        return value;\n    },\n\n    /**\n     * Format Comma.\n     * @param {string} value target value\n     * @returns {string} formatted value\n     * @private\n     */\n    formatComma: function(value) {\n        var comma = ',',\n            underPointValue = '',\n            betweenLen = 3,\n            orgValue = value,\n            sign, values, lastIndex, formattedValue;\n\n        value = String(value);\n        sign = value.indexOf('-') > -1 ? '-' : '';\n\n        if (value.indexOf('.') > -1) {\n            values = value.split('.');\n            value = String(Math.abs(values[0]));\n            underPointValue = '.' + values[1];\n        } else {\n            value = String(Math.abs(value));\n        }\n\n        if (value.length &lt;= betweenLen) {\n            formattedValue = orgValue;\n        } else {\n            values = (value).split('').reverse();\n            lastIndex = values.length - 1;\n            values = tui.util.map(values, function(char, index) {\n                var result = [char];\n                if (index &lt; lastIndex &amp;&amp; (index + 1) % betweenLen === 0) {\n                    result.push(comma);\n                }\n                return result;\n            });\n            formattedValue = sign + concat.apply([], values).reverse().join('') + underPointValue;\n        }\n\n        return formattedValue;\n    }\n};\n\ntui.util.defineNamespace('tui.chart');\ntui.chart.renderUtil = renderUtil;\n\nmodule.exports = renderUtil;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"