import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from "./chart";
import { AreaSeriesDataType, LineAreaChartOptions, LineAreaData, LineSeriesDataType, PlotBand, PlotLine } from "../../types/options";
export interface LineAreaChartProps {
    el: HTMLElement;
    options: LineAreaChartOptions;
    data: LineAreaData;
}
/**
 * @class
 * @classdesc LineArea Chart
 * @param {Object} props
 *   @param {HTMLElement} props.el - The target element to create chart.
 *   @param {Object} props.data - Data for making LineArea Chart.
 *     @param {Array<string>} props.data.categories - Categories.
 *     @param {Array<Object>} props.data.series - Series data.
 *       @param {Array<Object>} props.data.series.line - Line series data. Coordinate types data is not possible.
 *       @param {Array<Object>} props.data.series.area - Area series data.
 *   @param {Object} [props.options] - Options for making LineArea Chart.
 *     @param {Object} [props.options.chart]
 *       @param {string|Object} [props.options.chart.title] - Chart title text or options.
 *         @param {string} [props.options.chart.title.text] - Chart title text.
 *         @param {number} [props.options.chart.title.offsetX] - Offset value to move title horizontally.
 *         @param {number} [props.options.chart.title.offsetY] - Offset value to move title vertically.
 *         @param {string} [props.options.chart.title.align] - Chart text align. 'left', 'right', 'center' is available.
 *       @param {boolean|Object} [props.options.chart.animation] - Whether to use animation and duration when rendering the initial chart.
 *       @param {number|string} [props.options.chart.width] - Chart width. 'auto' or if not write, the width of the parent container is followed. 'auto' or if not created, the width of the parent container is followed.
 *       @param {number|string} [props.options.chart.height] - Chart height. 'auto' or if not write, the width of the parent container is followed. 'auto' or if not created, the height of the parent container is followed.
 *     @param {Object} [props.options.series] - Write common options in the upper depth and separate options to be applied to each chart.
 *       @param {Object} [props.options.series.line] - Options to be applied to the line chart. 'spline', 'showDot', 'dataLabels' is available. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Line Chart guide} on github.
 *       @param {Object} [props.options.series.area] - Options to be applied to the area chart. 'stack', 'spline', 'showDot', 'dataLabels' is available. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Area Chart guide} on github.
 *       @param {boolean} [props.options.series.zoomable=false] - Whether to use zoom feature or not.
 *       @param {boolean} [props.options.series.showDot=false] - Whether to show dot or not.
 *       @param {boolean} [props.options.series.spline=false] - Whether to make spline chart or not.
 *       @param {boolean} [props.options.series.selectable=false] - Whether to make selectable series or not.
 *       @param {boolean} [props.options.series.shift=false] - Whether to use shift when addData or not.
 *       @param {Object} [props.options.series.dataLabels] - Set the visibility, location, and formatting of dataLabel. For specific information, refer to the {@link https://github.com/nhn/tui.chart|DataLabels guide} on github.
 *     @param {Object} [props.options.xAxis]
 *       @param {Object} [props.options.xAxis.title] - Axis title.
 *       @param {boolean} [props.options.xAxis.pointOnColumn=false] - Whether to move the start of the chart to the center of the column.
 *       @param {boolean} [props.options.xAxis.rotateLabel=true] - Whether to allow axis label rotation.
 *       @param {boolean|Object} [props.options.xAxis.date] - Whether the x axis label is of date type. Format option used for date type. Whether the x axis label is of date type. If use date type, format option used for date type.
 *       @param {Object} [props.options.xAxis.tick] - Option to adjust tick interval.
 *       @param {Object} [props.options.xAxis.label] - Option to adjust label interval.
 *       @param {Object} [props.options.xAxis.scale] - Option to adjust axis minimum, maximum, step size.
 *       @param {number} [props.options.xAxis.width] - Width of xAxis.
 *       @param {number} [props.options.xAxis.height] - Height of xAxis.
 *     @param {Object|Array<Object>} [props.options.yAxis] - If this option is an array type, use the secondary y axis.
 *       @param {Object} [props.options.yAxis.title] - Axis title.
 *       @param {Object} [props.options.yAxis.tick] - Option to adjust tick interval.
 *       @param {Object} [props.options.yAxis.label] - Option to adjust label interval.
 *       @param {Object} [props.options.yAxis.scale] - Option to adjust axis minimum, maximum, step size.
 *       @param {number} [props.options.yAxis.width] - Width of yAxis.
 *       @param {number} [props.options.yAxis.height] - Height of yAxis.
 *     @param {Object} [props.options.plot]
 *       @param {number} [props.options.plot.width] - Width of plot.
 *       @param {number} [props.options.plot.height] - Height of plot.
 *       @param {boolean} [props.options.plot.visible] - Whether to show plot line.
 *       @param {Array<Object>} [props.options.plot.lines] - Plot lines information. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Plot guide} on github.
 *       @param {Array<Object>} [props.options.plot.bands] - Plot bands information. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Plot guide} on github.
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
 *     @param {Object} [props.options.theme] - Chart theme options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|LineArea Chart guide} on github.
 *       @param {Object} [props.options.theme.chart] - Chart font theme.
 *       @param {Object} [props.options.theme.series] - Series theme. Each theme to be applied to the two charts should be written separately.
 *       @param {Object} [props.options.theme.title] - Title theme.
 *       @param {Object} [props.options.theme.xAxis] - X Axis theme.
 *       @param {Object|Array<Object>} [props.options.theme.yAxis] - Y Axis theme. In the case of an arrangement, the first is the main axis and the second is the theme for the secondary axis.
 *       @param {Object} [props.options.theme.legend] - Legend theme.
 *       @param {Object} [props.options.theme.tooltip] - Tooltip theme.
 *       @param {Object} [props.options.theme.plot] - Plot theme.
 *       @param {Object} [props.options.theme.exportMenu] - ExportMenu theme.
 * @extends Chart
 */
export default class LineAreaChart extends Chart<LineAreaChartOptions> {
    constructor(props: LineAreaChartProps);
    initialize(): void;
    /**
     * Add data.
     * @param {Array<number>} data - Array of data to be added.
     * @param {string} category - Category to be added.
     * @param {string} chartType - Which type of chart to add.
     * @api
     * @example
     * chart.addData([10, 20], '6', 'line');
     */
    addData: (data: LineSeriesDataType[] | AreaSeriesDataType[], category: string, chartType: "area" | "line") => void;
    /**
     * Add series.
     * @param {Object} data - Data to be added.
     *   @param {string} data.name - Series name.
     *   @param {Array<number>} data.data - Array of data to be added.
     * @param {Object} dataInfo - Which type of chart to add.
     *   @param {Object} dataInfo.chartType - Chart type.
     * @api
     * @example
     * chart.addSeries(
     *   {
     *     name: 'newSeries',
     *     data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
     *   },
     *   {
     *     chartType: 'line'
     *   });
     */
    addSeries: (data: Pick<import("../../types/options").AreaSeriesType, "visible" | "data" | "name"> | Pick<import("../../types/options").LineSeriesType, "visible" | "data" | "name">, dataInfo: AddSeriesDataInfo) => void;
    /**
     * Convert the chart data to new data.
     * @param {Object} data - Data to be set
     * @api
     * @example
     * chart.setData({
     *   categories: ['1', '2', '3'],
     *   series: {
     *     line: [
     *       {
     *         name: 'A',
     *         data: [1, 2, 3],
     *       }
     *     ],
     *     area: [
     *       {
     *         name: 'B',
     *         data: [4, 5, 6],
     *       }
     *     ]
     *   }
     * });
     */
    setData(data: LineAreaData): void;
    /**
     * Add plot line.
     * @param {Object} data - plot info
     *   @param {string|number} data.value - The value where the plot line will be drawn.
     *   @param {string} data.color - Plot line color.
     *   @param {string} [data.id] - Plot id. The value on which the removePlotLine is based.
     * @api
     * @example
     * chart.addPlotLine({
     *   value: 2,
     *   color: '#00ff22',
     *   id: 'plot-1',
     * });
     */
    addPlotLine(data: PlotLine): void;
    /**
     * Remove plot line with id.
     * @param {string} id - Id of the plot line to be removed.
     * @api
     * @example
     * chart.removePlotLine('plot-1');
     */
    removePlotLine(id: string): void;
    /**
     * Add plot band.
     * @param {Object} data - Plot info.
     * @param {Array<string|number>} data.range - The range to be drawn.
     * @param {string} data.color - Plot band color.
     * @param {string} [data.id] - Plot id. The value on which the removePlotBand is based.
     * @api
     * @example
     * chart.addPlotBand({
     *   value: [2, 4],
     *   color: '#00ff22',
     *   id: 'plot-1',
     * });
     */
    addPlotBand(data: PlotBand): void;
    /**
     * Remove plot band with id.
     * @param {string} id - Id of the plot band to be removed.
     * @api
     * @example
     * chart.removePlotBand('plot-1');
     */
    removePlotBand(id: string): void;
    /**
     * Hide series data label.
     * @api
     * @example
     * chart.hideSeriesDataLabel();
     */
    hideSeriesDataLabel: () => void;
    /**
     * Show series data label.
     * @api
     * @example
     * chart.showSeriesDataLabel();
     */
    showSeriesDataLabel: () => void;
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
     *   xAxis: {
     *     title: 'Month',
     *     date: { format: 'yy/MM' },
     *   },
     *   yAxis: {
     *     title: 'Energy (kWh)',
     *   },
     *   series: {
     *     line: {
     *       showDot: true
     *     },
     *     selectable: true,
     *   },
     *   tooltip: {
     *     formatter: (value) => `${value}kWh`,
     *   },
     * });
     */
    setOptions: (options: LineAreaChartOptions) => void;
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
     *     line: {
     *       showDot: true,
     *     },
     *   },
     * });
     */
    updateOptions: (options: LineAreaChartOptions) => void;
    /**
     * Show tooltip.
     * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
     *      @param {number} seriesInfo.seriesIndex - Index of series.
     *      @param {number} seriesInfo.index - Index of data within series.
     *      @param {string} seriesInfo.chartType - Specify which chart to select.
     * @api
     * @example
     * chart.showTooltip({index: 1, seriesIndex: 2, chartType: 'line'});
     */
    showTooltip: (seriesInfo: SelectSeriesInfo) => void;
    /**
     * Hide tooltip.
     * @api
     * @example
     * chart.hideTooltip();
     */
    hideTooltip: () => void;
}
