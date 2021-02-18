import { isNumber, isUndefined } from "./utils";
export function isAvailableShowTooltipInfo(info, eventDetectType, targetChartType) {
    const { index, seriesIndex, chartType } = info;
    return (isNumber(index) &&
        (eventDetectType === 'grouped' || isNumber(seriesIndex)) &&
        (isUndefined(chartType) || chartType === targetChartType));
}
export function isAvailableSelectSeries(info, targetChartType) {
    const { index, seriesIndex, chartType } = info;
    return (isNumber(index) &&
        isNumber(seriesIndex) &&
        (isUndefined(chartType) || chartType === targetChartType));
}
