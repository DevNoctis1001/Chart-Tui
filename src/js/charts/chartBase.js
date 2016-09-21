/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentManager = require('./componentManager');
var DefaultDataProcessor = require('../dataModels/dataProcessor');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var UserEventListener = require('../helpers/userEventListener');
var boundsAndScaleBuilder = require('../models/boundsAndScaleBuilder.js');

var ChartBase = tui.util.defineClass(/** @lends ChartBase.prototype */ {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.rawData raw data
     *      @param {object} params.theme chart theme
     *      @param {object} params.options chart options
     *      @param {boolean} params.hasAxes whether has axes or not
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {DataProcessor} params.DataProcessor DataProcessor
     */
    init: function(params) {
        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme;

        this._initializeOptions(params.options);

        /**
         * chart type
         * @type {string}
         */
        this.chartType = this.options.chartType;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = this._createDataProcessor(params);

        this.seriesNames = params.seriesNames;

        /**
         * component manager
         * @type {ComponentManager}
         */
        this.componentManager = this._createComponentManager();

        /**
         * user event listener
         * @type {object}
         */
        this.userEvent = new UserEventListener();

        /**
         * Dimension map
         * @type {null}
         */
        this.dimensionMap = null;

        /**
         * scale option for making scale data
         * @type {null|object}
         */
        this.scaleOption = null;
    },

    /**
     * Set offset property
     * @param {{offset: object}} ptions -options
     * @param {string} fromProperty - from property name
     * @param {string} toProperty - to property name
     * @private
     */
    _setOffsetProperty: function(ptions, fromProperty, toProperty) {
        if (!tui.util.isExisty(ptions[fromProperty])) {
            return;
        }

        ptions.offset = ptions.offset || {};
        ptions.offset[toProperty] = ptions[fromProperty];
        delete ptions[fromProperty];
    },

    /**
     * Initialize offset.
     * @param {{offsetX: ?number, offsetY: ?number}} options - offset options
     * @private
     */
    _initializeOffset: function(options) {
        if (!options) {
            return;
        }

        this._setOffsetProperty(options, 'offsetX', 'x');
        this._setOffsetProperty(options, 'offsetY', 'y');
    },

    /**
     * Initialize title options.
     * @param {
     *      Array.<{title: (string | {text: string, offsetX: number, offsetY: number})}> |
     *      {title: (string | {text: string, offsetX: number, offsetY: number})}
     * } targetOptions - target options
     * @private
     */
    _initializeTitleOptions: function(targetOptions) {
        var self = this;
        var optionsSet;

        if (!targetOptions) {
            return;
        }

        optionsSet = tui.util.isArray(targetOptions) ? targetOptions : [targetOptions];
        tui.util.forEachArray(optionsSet, function(options) {
            var title = options.title;

            if (tui.util.isString(title)) {
                options.title = {
                    text: title
                };
            }

            self._initializeOffset(options.title);
        });
    },

    /**
     * Initialize tooltip options.
     * @param {{grouped: ?boolean, offsetX: ?number, offsetY: ?number}} options - tooltip options
     * @private
     */
    _initializeTooltipOptions: function(options) {
        var position = options.position;

        options.grouped = !!options.grouped;
        this._initializeOffset(options);

        if (!options.offset && position) {
            options.offset = {
                x: position.left,
                y: position.top
            };
        }

        delete options.position;
    },

    /**
     * Initialize options.
     * @param {object} options - options for chart
     * @private
     */
    _initializeOptions: function(options) {
        options.xAxis = options.xAxis || {};
        options.series = options.series || {};
        options.tooltip = options.tooltip || {};
        options.legend = options.legend || {};

        this._initializeTitleOptions(options.chart);
        this._initializeTitleOptions(options.xAxis);
        this._initializeTitleOptions(options.yAxis);

        if (tui.util.isUndefined(options.legend.visible)) {
            options.legend.visible = true;
        }

        this._initializeTooltipOptions(options.tooltip);

        /**
         * options
         * @type {object}
         */
        this.options = options;
    },

    /**
     * Create dataProcessor for processing raw data.
     * @param {object} params parameters
     *      @param {object} params.rawData - raw data
     *      @param {DataProcessor} params.DataProcessor - DataProcessor class
     *      @param {{chart: object, chartType: string}} params.options - chart options
     *      @param {Array} params.seriesNames series - chart types for rendering series
     * @returns {object} data processor
     * @private
     */
    _createDataProcessor: function(params) {
        var DataProcessor, dataProcessor;

        DataProcessor = params.DataProcessor || DefaultDataProcessor;
        dataProcessor = new DataProcessor(params.rawData, this.chartType, params.options, params.seriesNames);

        return dataProcessor;
    },

    /**
     * Create ComponentMananger.
     * @returns {ComponentMananger}
     * @private
     */
    _createComponentManager: function() {
        return new ComponentManager({
            options: this.options,
            theme: this.theme,
            dataProcessor: this.dataProcessor,
            hasAxes: this.hasAxes
        });
    },

    /**
     * Make data for tooltip component.
     * @returns {object} tooltip data
     * @private
     */
    _makeTooltipData: function() {
        return {
            isVertical: this.isVertical,
            userEvent: this.userEvent,
            chartType: this.chartType,
            xAxisType: this.options.xAxis.type,
            dateFormat: this.options.xAxis.dateFormat
        };
    },

    /**
     * Make rendering data for axis type chart.
     * @returns {object} rendering data.
     * @private
     */
    _makeRenderingData: function() {
        return {};
    },

    /**
     * Attach custom event.
     * @param {Array.<object>} seriesSet - series set
     * @private
     */
    _attachCustomEvent: function(seriesSet) {
        var legend = this.componentManager.get('legend');
        var customEvent = this.componentManager.get('customEvent');

        seriesSet = seriesSet || this.componentManager.where({componentType: 'series'});

        if (tui.util.pick(this.options.series, 'zoomable')) {
            customEvent.on('zoom', this.onZoom, this);
            customEvent.on('resetZoom', this.onResetZoom, this);
        }

        if (legend) {
            legend.on('changeCheckedLegends', this.onChangeCheckedLegends, this);
            tui.util.forEach(seriesSet, function(series) {
                var selectLegendEventName = renderUtil.makeCustomEventName('select', series.chartType, 'legend');
                legend.on(selectLegendEventName, series.onSelectLegend, series);
            });
        }
    },

    /**
     * Add data ratios.
     * @private
     * @abstract
     */
    _addDataRatios: function() {},

    /**
     * Build bounds and scale data.
     * @param {boolean} addingDataMode - whether adding data mode or not
     * @returns {{
     *      layoutBounds: {
     *          dimensionMap: object,
     *          positionMap: object
     *      },
     *      limitMap: object,
     *      axisDataMap: object,
     *      maxRadius: ?number
     * }}
     * @private
     */
    _buildBoundsAndScaleData: function(addingDataMode) {
        return boundsAndScaleBuilder.build(this.dataProcessor, this.componentManager, {
            chartType: this.chartType,
            seriesNames: this.seriesNames,
            options: this.options,
            theme: this.theme,
            hasAxes: this.hasAxes,
            scaleOption: this.scaleOption,
            isVertical: this.isVertical,
            hasRightYAxis: this.hasRightYAxis,
            addedDataCount: this.addedDataCount,
            addingDataMode: addingDataMode
        });
    },

    /**
     * Render.
     * @param {function} onRender render callback function
     * @param {?boolean} addingDataMode - whether adding data mode or not
     * @private
     */
    _render: function(onRender, addingDataMode) {
        var boundsAndScale = this._buildBoundsAndScaleData(addingDataMode);
        var renderingData;

        this.dimensionMap = boundsAndScale.dimensionMap;

        // 비율값 추가
        this._addDataRatios(boundsAndScale.limitMap, boundsAndScale.axisDataMap);

        renderingData = this._makeRenderingData(boundsAndScale.limitMap, boundsAndScale.axisDataMap);

        onRender(renderingData, boundsAndScale);

        this._sendSeriesData();
    },

    /**
     * Render chart.
     * @returns {HTMLElement} chart element
     */
    render: function() {
        var self = this;
        var container = dom.create('DIV', this.className);

        dom.addClass(container, 'tui-chart');
        this._renderTitle(container);

        renderUtil.renderBackground(container, this.theme.chart.background);
        renderUtil.renderFontFamily(container, this.theme.chart.fontFamily);

        this._render(function(renderingData, boundsAndScale) {
            renderUtil.renderDimension(container, boundsAndScale.dimensionMap.chart);
            self.componentManager.render('render', renderingData, boundsAndScale, container);
        });

        this._attachCustomEvent();
        this.chartContainer = container;

        return container;
    },

    /**
     * Filter raw data belong to checked legend.
     * @param {object} rawData raw data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rawData
     * @private
     */
    _filterCheckedRawData: function(rawData, checkedLegends) {
        var cloneData = JSON.parse(JSON.stringify(rawData));

        if (tui.util.isArray(cloneData.series)) {
            cloneData.series = tui.util.filter(cloneData.series, function(series, index) {
                return checkedLegends[index];
            });
        } else {
            tui.util.forEach(cloneData.series, function(serieses, chartType) {
                if (!checkedLegends[chartType]) {
                    cloneData.series[chartType] = [];
                } else if (checkedLegends[chartType].length) {
                    cloneData.series[chartType] = tui.util.filter(serieses, function(series, index) {
                        return checkedLegends[chartType][index];
                    });
                }
            });
        }

        return cloneData;
    },

    /**
     * Make rerendering data.
     * @param {object} renderingData rendering data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rendering data
     * @private
     */
    _makeRerenderingData: function(renderingData, checkedLegends) {
        var tooltipData = this._makeTooltipData();
        var seriesSet = this.componentManager.where({componentType: 'series'});

        renderingData.tooltip = tui.util.extend({
            checkedLegends: checkedLegends
        }, tooltipData, renderingData.tooltip);

        tui.util.forEach(seriesSet, function(series) {
            renderingData[series.componentName] = tui.util.extend({
                checkedLegends: checkedLegends[series.seriesName] || checkedLegends
            }, renderingData[series.componentName]);
        });

        return renderingData;
    },

    /**
     * Rerender.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @private
     */
    _rerender: function(checkedLegends, rawData) {
        var self = this;
        var dataProcessor = this.dataProcessor;

        if (!rawData) {
            rawData = this._filterCheckedRawData(dataProcessor.getZoomedRawData(), checkedLegends);
        }

        this.dataProcessor.initData(rawData);

        this._render(function(renderingData, boundsAndScale) {
            renderingData = self._makeRerenderingData(renderingData, checkedLegends);
            self.componentManager.render('rerender', renderingData, boundsAndScale);
        });
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._rerender(checkedLegends, rawData, boundsParams);
    },

    /**
     * On zoom.
     * @abstract
     */
    onZoom: function() {},

    /**
     * On reset zoom.
     * @abstract
     */
    onResetZoom: function() {},

    /**
     * Render title.
     * @param {HTMLElement} container - container
     * @private
     */
    _renderTitle: function(container) {
        var chartOptions = this.options.chart || {};
        var title = chartOptions.title || {};
        var titleElement = renderUtil.renderTitle(title.text, this.theme.title, 'tui-chart-title');

        if (title.offset) {
            renderUtil.renderPosition(titleElement, {
                left: title.offset.x,
                top: title.offset.y
            });
        }

        dom.append(container, titleElement);
    },

    /**
     * Send series data to custom event component.
     * @param {string} chartType - type of chart
     * @private
     */
    _sendSeriesData: function(chartType) {
        var self = this;
        var customEvent = this.componentManager.get('customEvent');
        var seriesInfos, chartTypes;

        if (!customEvent) {
            return;
        }

        chartTypes = this.chartTypes || [chartType || this.chartType];
        seriesInfos = tui.util.map(chartTypes, function(seriesName) {
            var _chartType = self.dataProcessor.findChartType(seriesName);
            var componentName = (seriesName || _chartType) + 'Series';
            var component = self.componentManager.get(componentName) || self.componentManager.get('series');

            return {
                chartType: _chartType,
                data: component.getSeriesData()
            };
        });

        customEvent.initCustomEventData(seriesInfos);
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        this.componentManager.execute('animateComponent');
    },

    /**
     * Register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on: function(eventName, func) {
        this.userEvent.register(eventName, func);
    },

    /**
     * Update dimension of chart.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {boolean} whether updated or not
     * @private
     */
    _updateChartDimension: function(dimension) {
        var updated = false;
        var options = this.options;

        options.chart = options.chart || {};

        if (dimension.width && dimension.width > 0 && options.chart.width !== dimension.width) {
            options.chart.width = dimension.width;
            updated = true;
        }

        if (dimension.height && dimension.height > 0 && options.chart.height !== dimension.height) {
            options.chart.height = dimension.height;
            updated = true;
        }

        return updated;
    },

    /**
     * Public API for resizable.
     * @param {object} dimension dimension
     *      @param {number} dimension.width width
     *      @param {number} dimension.height height
     * @api
     */
    resize: function(dimension) {
        var self = this;
        var updated;

        if (!dimension) {
            return;
        }

        updated = this._updateChartDimension(dimension);

        if (!updated) {
            return;
        }

        this._render(function(renderingData, boundsAndScale) {
            renderUtil.renderDimension(self.chartContainer, boundsAndScale.dimensionMap.chart);
            self.componentManager.render('resize', renderingData, boundsAndScale);
        });
    },

    /**
     * Set tooltip align option.
     * @param {string} align align (left|center|right, top|middle|bottom)
     * @api
     */
    setTooltipAlign: function(align) {
        this.componentManager.get('tooltip').setAlign(align);
    },

    /**
     * Set tooltip offset option.
     * @param {object} offset - tooltip offset
     *      @param {number} offset.x - offset x
     *      @param {number} offset.y - offset y
     * @api
     */
    setTooltipOffset: function(offset) {
        this.componentManager.get('tooltip').setOffset(offset);
    },

    /**
     * Set position option.
     * @param {object} position moving position
     *      @param {number} position.left left
     *      @param {number} position.top top
     * @api
     * @deprecated
     */
    setTooltipPosition: function(position) {
        this.componentManager.get('tooltip').setPosition(position);
    },

    /**
     * Reset tooltip align option.
     * @api
     */
    resetTooltipAlign: function() {
        this.componentManager.get('tooltip').resetAlign();
    },

    /**
     * Reset tooltip position.
     * @api
     */
    resetTooltipOffset: function() {
        this.componentManager.get('tooltip').resetOffset();
    },

    /**
     * Reset tooltip position.
     * @api
     * @deprecated
     */
    resetTooltipPosition: function() {
        this.resetTooltipOffset();
    },

    /**
     * Show series label.
     * @api
     */
    showSeriesLabel: function() {
        var seriesSet = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(seriesSet, function(series) {
            series.showLabel();
        });
    },

    /**
     * Hide series label.
     * @api
     */
    hideSeriesLabel: function() {
        var seriesSet = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(seriesSet, function(series) {
            series.hideLabel();
        });
    },

    /**
     * Add data.
     * @abstract
     */
    addData: function() {},

    /**
     * Add plot line.
     * @abstract
     */
    addPlotLine: function() {},

    /**
     * Add plot band.
     * @abstract
     */
    addPlotBand: function() {},

    /**
     * Remove plot line.
     * @abstract
     */
    removePlotLine: function() {},

    /**
     * Remove plot band.
     * @abstract
     */
    removePlotBand: function() {}
});

module.exports = ChartBase;
