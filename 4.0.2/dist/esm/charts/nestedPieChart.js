import Chart from "./chart";
import nestedPieSeriesData from "../store/nestedPieSeriesData";
import Tooltip from "../component/tooltip";
import Legend from "../component/legend";
import Title from "../component/title";
import ExportMenu from "../component/exportMenu";
import HoveredSeries from "../component/hoveredSeries";
import DataLabels from "../component/dataLabels";
import SelectedSeries from "../component/selectedSeries";
import Background from "../component/background";
import * as basicBrush from "../brushes/basic";
import * as legendBrush from "../brushes/legend";
import * as labelBrush from "../brushes/label";
import * as exportMenuBrush from "../brushes/exportMenu";
import * as sectorBrush from "../brushes/sector";
import * as dataLabelBrush from "../brushes/dataLabel";
import PieSeries from "../component/pieSeries";
/**
 * @class
 * @classdesc NestedPie Chart
 * @param {Object} props
 *   @param {HTMLElement} props.el - The target element to create chart.
 *   @param {Object} props.data - Data for making NestedPie Chart.
 *     @param {Array<string>} [props.data.categories] - Categories.
 *     @param {Array<Object>} props.data.series - Series data.
 *       @param {string} props.data.series.name - Series name.
 *       @param {number} props.data.series.data - Series data.
 *       @param {string} [props.data.series.parentName] - Value specifying parent data when using group nested pie chart.
 *   @param {Object} [props.options] - Options for making NestedPie Chart.
 *     @param {Object} [props.options.chart]
 *       @param {string|Object} [props.options.chart.title] - Chart title text or options.
 *         @param {string} [props.options.chart.title.text] - Chart title text.
 *         @param {number} [props.options.chart.title.offsetX] - Offset value to move title horizontally.
 *         @param {number} [props.options.chart.title.offsetY] - Offset value to move title vertically.
 *         @param {string} [props.options.chart.title.align] - Chart text align. 'left', 'right', 'center' is available.
 *       @param {boolean|Object} [props.options.chart.animation] - Whether to use animation and duration when rendering the initial chart.
 *       @param {number|string} [props.options.chart.width] - Chart width. 'auto' or if not write, the width of the parent container is followed. 'auto' or if not created, the width of the parent container is followed.
 *       @param {number|string} [props.options.chart.height] - Chart height. 'auto' or if not write, the width of the parent container is followed. 'auto' or if not created, the height of the parent container is followed.
 *     @param {Object} [props.options.series]
 *       @param {boolean} [props.options.series.selectable=false] - Whether to make selectable series or not.
 *       @param {Object} [props.options.series.dataLabels] - Set the visibility, location, and formatting of dataLabel. For specific information, refer to the {@link https://github.com/nhn/tui.chart|DataLabels guide} on github.
 *       @param {Object} [props.options.series.aliasName] - Chart options are specified based on the alias name. 'radiusRange', 'angleRange', 'clockwise', 'dataLabels' is available. For specific information, refer to the {@link https://github.com/nhn/tui.chart|NestedPie Chart guide} on github.
 *     @param {Object} [props.options.legend]
 *       @param {string} [props.options.legend.align] - Legend align. 'top', 'bottom', 'right', 'left' is available.
 *       @param {string} [props.options.legend.showCheckbox] - Whether to show checkbox.
 *       @param {boolean} [props.options.legend.visible] - Whether to show legend.
 *       @param {number} [props.options.legend.width] - Width of legend.
 *     @param {Object} [props.options.exportMenu]
 *       @param {boolean} [props.options.exportMenu.visible] - Whether to show export menu.
 *       @param {string} [props.options.exportMenu.filename] - File name applied when downloading.
 *     @param {Object} [props.options.tooltip]
 *       @param {number} [props.options.tooltip.offsetX] - Offset value to move title horizontally.
 *       @param {number} [props.options.tooltip.offsetY] - Offset value to move title vertically.
 *       @param {Function} [props.options.tooltip.formatter] - Function to format data value.
 *       @param {Function} [props.options.tooltip.template] - Function to create custom template. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Tooltip guide} on github.
 *     @param {Object} [props.options.responsive] - Rules for changing chart options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Responsive guide} on github.
 *       @param {boolean|Object} [props.options.responsive.animation] - Animation duration when the chart is modified.
 *       @param {Array<Object>} [props.options.responsive.rules] - Rules for the Chart to Respond.
 *     @param {Object} [props.options.theme] - Chart theme options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|NestedPie Chart guide} on github.
 *       @param {Object} [props.options.theme.chart] - Chart font theme.
 *       @param {Object} [props.options.theme.series] - Series theme.
 *       @param {Object} [props.options.theme.title] - Title theme.
 *       @param {Object} [props.options.theme.legend] - Legend theme.
 *       @param {Object} [props.options.theme.tooltip] - Tooltip theme.
 *       @param {Object} [props.options.theme.exportMenu] - ExportMenu theme.
 * @extends Chart
 */
export default class NestedPieChart extends Chart {
    constructor({ el, options, data: { series, categories } }) {
        super({
            el,
            options,
            series: { pie: series },
            categories,
        });
        this.modules = [nestedPieSeriesData];
        /**
         * Hide series data label.
         * @api
         * @example
         * chart.hideSeriesDataLabel();
         */
        this.hideSeriesDataLabel = () => {
            this.store.dispatch('updateOptions', {
                options: { series: { dataLabels: { visible: false } } },
            });
        };
        /**
         * Show series data label.
         * @api
         * @example
         * chart.showSeriesDataLabel();
         */
        this.showSeriesDataLabel = () => {
            this.store.dispatch('updateOptions', {
                options: { series: { dataLabels: { visible: true } } },
            });
        };
        /**
         * Convert the chart options to new options.
         * @param {Object} options - Chart options.
         * @api
         * @example
         * chart.setOptions({
         *   chart: {
         *     width: 500,
         *     height: 'auto',
         *     title: 'Energy Usage',
         *   },
         *   series: {
         *     alias2: {
         *       radiusRange: [20%, 50%],
         *     },
         *   },
         *   tooltip: {
         *     formatter: (value) => `${value}kWh`,
         *   },
         * });
         */
        this.setOptions = (options) => {
            this.resetSeries();
            this.dispatchOptionsEvent('initOptions', options);
        };
        /**
         * Update chart options.
         * @param {Object} options - Chart options.
         * @api
         * @example
         * chart.updateOptions({
         *   chart: {
         *     height: 'auto',
         *     title: 'Energy Usage',
         *   },
         *   series: {
         *     alias1: {
         *       showDot: true,
         *     },
         *   },
         * });
         */
        this.updateOptions = (options) => {
            this.resetSeries();
            this.dispatchOptionsEvent('updateOptions', options);
        };
        /**
         * Show tooltip.
         * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
         *      @param {number} seriesInfo.seriesIndex - Index of series.
         *      @param {number} seriesInfo.alias - alias name.
         * @api
         * @example
         * chart.showTooltip({seriesIndex: 1, alias: 'name'});
         */
        this.showTooltip = (seriesInfo) => {
            this.eventBus.emit('showTooltip', Object.assign({}, seriesInfo));
        };
        /**
         * Hide tooltip.
         * @api
         * @example
         * chart.hideTooltip();
         */
        this.hideTooltip = () => {
            this.eventBus.emit('hideTooltip');
        };
    }
    initialize() {
        var _a;
        super.initialize();
        this.componentManager.add(Background);
        this.componentManager.add(Title);
        this.componentManager.add(Legend);
        (_a = this.store.initStoreState.series.pie, (_a !== null && _a !== void 0 ? _a : [])).forEach(({ name }) => {
            this.componentManager.add(PieSeries, { alias: name });
        });
        this.componentManager.add(ExportMenu, { chartEl: this.el });
        this.componentManager.add(HoveredSeries);
        this.componentManager.add(SelectedSeries);
        this.componentManager.add(DataLabels);
        this.componentManager.add(Tooltip, { chartEl: this.el });
        this.painter.addGroups([
            basicBrush,
            legendBrush,
            labelBrush,
            exportMenuBrush,
            sectorBrush,
            dataLabelBrush,
        ]);
    }
    /**
     * Add series.
     * @param {Object} data - Data to be added.
     *   @param {string} data.name - Series name.
     *   @param {Array<Object>} data.data - Array of data to be added.
     * @param {Object} dataInfo - Which name of chart to add.
     *   @param {string} dataInfo.name - Chart series name.
     * @api
     * @example
     * chart.addSeries(
     *   {
     *     name: 'newSeries',
     *     data: [
     *       { name: 'A', data: 10 },
     *       { name: 'B', data: 20 },
     *     ],
     *   },
     *   {
     *     name: 'series name'
     *   });
     */
    addSeries(data, dataInfo) {
        this.resetSeries();
        this.store.dispatch('addSeries', Object.assign({ data }, dataInfo));
        this.componentManager.add(PieSeries, { alias: data.name });
    }
    /**
     * Convert the chart data to new data.
     * @param {Object} data - Data to be set
     * @api
     * @example
     * chart.setData({
     *   categories: ['A', 'B'],
     *   series: [
     *     {
     *       name: 'browsers',
     *       data: [
     *         {
     *           name: 'Chrome',
     *           data: 50,
     *         },
     *         {
     *           name: 'Safari',
     *           data: 20,
     *         },
     *       ]
     *     },
     *     {
     *       name: 'versions',
     *       data: [
     *         {
     *           name: '1',
     *           data: 50,
     *         },
     *         {
     *           name: '2',
     *           data: 20,
     *         },
     *       ]
     *     }
     *   ]
     * });
     */
    setData(data) {
        var _a;
        this.componentManager.remove(PieSeries);
        this.resetSeries();
        this.store.dispatch('setData', { series: { pie: data.series } });
        (_a = this.store.initStoreState.series.pie, (_a !== null && _a !== void 0 ? _a : [])).forEach(({ name }) => {
            this.componentManager.add(PieSeries, { alias: name });
        });
    }
}
