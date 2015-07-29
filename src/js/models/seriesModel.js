/**
 * @fileoverview SeriesModel is model for management of series data.
 *               Series data used to draw the series area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var HIDDEN_WIDTH = 1;

/**
 * @classdesc SeriesModel is model for management of series data.
 * @class
 * @augments Model
 */
var SeriesModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {object} data series data
     * @param {object} options options
     */
    init: function(data, options) {
        this.options = options = options || {};
        /**
         * Series makers
         * @type {array}
         */
        this.markers = [];

        /**
         * Series percent values
         * @type {Array}
         */
        this.percentValues = [];

        /**
         * Axis scale
         * @type {{min: number, max: number}}
         */
        this.tickScale = {};

        /**
         * Series colors
         * @type {Array}
         */
        this.colors = [];

        /**
         * Series last item styles
         * @type {Array}
         */
        this.lastItemStyles = [];

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Set series data.
     * @param {{values: array, scale: object, colors: array}} data series data
     * @private
     */
    _setData: function(data) {
        if (!data || ne.util.isEmpty(data.values) || !data.scale) {
            throw new Error('Invalid series data.');
        }

        this.markers = data.values;
        this.percentValues = this._makePercentValues(data.values, data.scale);
        this.isVertical = data.isVertical;

        if (ne.util.isNotEmpty(data.lastItemStyles)) {
            this.lastItemStyles = data.lastItemStyles;
        }
    },

    /**
     * Convert two dimensional(2d) values.
     * @param {array.<array>} values2d target 2d array
     * @param {function} condition convert condition function
     * @returns {array.<array>} 2d array
     * @private
     */
    _convertValues: function(values2d, condition) {
        var result = ne.util.map(values2d, function(values) {
            return ne.util.map(values, condition);
        });
        return result;
    },

    /**
     * Make to percent value.
     * @param {array.<array>} values maker data
     * @param {{min:number, max:number}} scale min, max scale
     * @returns {array.<array>} percent values
     * @private
     */
    _makePercentValues: function(values, scale) {
        var min = scale.min,
            max = scale.max,
            percentValues = this._convertValues(values, function(value) {
                return (value - min) / max;
            });
        return percentValues;
    },

    /**
     * Pick last colors.
     * @returns {array} colors
     */
    pickLastColors: function() {
        var lastItemsStyles = this.lastItemStyles,
            colors = [];
        if (lastItemsStyles.length && lastItemsStyles[0].color) {
            colors = ne.util.pluck(lastItemsStyles, 'color');
        }

        return colors;
    },

    /**
     * Make column chart bounds.
     * @param {{width: number, height:nunber}} dimension dimension
     * @returns {array.array} bounds
     */
    makeColumnBounds: function(dimension) {
        var groupValues = this.percentValues,
            maxBarWidth = (dimension.width / groupValues.length),
            barWidth = parseInt(maxBarWidth / (groupValues[0].length + 1), 10),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingLeft = (maxBarWidth * groupIndex) + (barWidth / 2);
                return ne.util.map(values, function (value, index) {
                    var barHeight = parseInt(value * dimension.height, 10);
                    return {
                        top: dimension.height - barHeight + HIDDEN_WIDTH,
                        left: paddingLeft + (barWidth * index),
                        width: barWidth,
                        height: barHeight
                    };
                }, this);
            });
        return bounds;
    },

    /**
     * Make bar chart bounds.
     * @param {{width: number, height:nunber}} dimension dimension
     * @param {number} hiddenWidth hidden width
     * @returns {array.array} bounds
     */
    makeBarBounds: function(dimension, hiddenWidth) {
        var groupValues = this.percentValues,
            maxBarHeight = (dimension.height / groupValues.length),
            barHeight = parseInt(maxBarHeight / (groupValues[0].length + 1), 10),
            bounds = ne.util.map(groupValues, function(values, groupIndex) {
                var paddingTop = (maxBarHeight * groupIndex) + (barHeight / 2) + hiddenWidth;
                return ne.util.map(values, function (value, index) {
                    return {
                        top: paddingTop + (barHeight * index),
                        left: -HIDDEN_WIDTH,
                        width: parseInt(value * dimension.width, 10),
                        height: barHeight
                    };
                }, this);
            });
        return bounds;
    },

    /**
     * Make line chart positions.
     * @param {{width: number, height:nunber}} dimension dimension
     * @returns {array.array} positions
     */
    makeLinePositions: function(dimension) {
        var groupValues = this.percentValues,
            width = dimension.width,
            height = dimension.height,
            step = width / groupValues[0].length,
            start = step / 2,
            result = ne.util.map(groupValues, function(values) {
                return ne.util.map(values, function(value, index) {
                    return {
                        left: start + (step * index),
                        top: height - (value * height)
                    };
                });
            });
        return result;
    }
});

module.exports = SeriesModel;