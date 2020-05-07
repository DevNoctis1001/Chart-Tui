import Component from './component';
import { RectModel, BoxSeriesModel, ClipRectAreaModel } from '@t/components/series';
import {
  ChartState,
  ChartType,
  StackData,
  SeriesData,
  StackGroupData,
  StackDataType,
  AxisData
} from '@t/store/store';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  RangeDataType,
  BarChartOptions,
  ColumnChartOptions,
  StackType,
  StackInfo
} from '@t/options';
import { first, last, includes } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';

type DrawModels = BoxSeriesModel | ClipRectAreaModel | RectModel;

type SizeKey = 'width' | 'height';

type SeriesRawData = BoxSeriesType<BoxSeriesDataType>[];

interface StackSeriesModelParamType {
  stackData: StackData;
  colors: string[];
  valueLabels: string[];
  tickDistance: number;
  offsetSizeKey: SizeKey;
  stackGroup?: { count: number; index: number };
}

export enum BoxType {
  BAR = 'bar',
  COLUMN = 'column'
}

export const STACK_TYPES = {
  NORMAL: 'normal',
  PERCENT: 'percent'
};

const PADDING = {
  TB: 15, // top & bottom
  LR: 24 // left & right
};

function isRangeData(value): value is RangeDataType {
  return Array.isArray(value);
}

function isGroupStack(rawData: StackDataType): rawData is StackGroupData {
  return !Array.isArray(rawData);
}

export function isBoxSeries(seriesName: ChartType): seriesName is BoxType {
  return includes(Object.values(BoxType), seriesName);
}

export default class BoxSeries extends Component {
  models!: DrawModels[];

  responders!: RectModel[];

  activatedResponders: this['responders'] = [];

  padding = PADDING.TB;

  isBar = true;

  name = BoxType.BAR;

  stack!: StackInfo;

  initialize({ name }: { name: BoxType }) {
    this.type = 'series';
    this.name = name;
    this.isBar = name === BoxType.BAR;
    this.padding = this.isBar ? PADDING.TB : PADDING.LR;
  }

  update(delta: number) {
    if (this.models && this.models[0].type === 'clipRectArea') {
      if (this.isBar) {
        this.models[0].width = this.rect.width * delta;
      } else {
        this.models[0].y = this.rect.height - this.rect.height * delta;
        this.models[0].height = this.rect.height * delta;
      }
    }
  }

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, series, theme, axes, categories } = chartState;

    this.rect = layout.plot;
    this.stack = series[this.name]!.stack!;

    const { colors } = theme.series;
    const seriesData = series[this.name]!;

    const seriesModels: BoxSeriesModel[] = this.renderSeriesModel(seriesData, colors, axes);

    const tooltipData: TooltipData[] = this.makeTooltipData(seriesData, colors, categories);

    const rectModel = this.renderRect(seriesModels);

    this.models = [this.renderClipRectAreaModel(), ...seriesModels];

    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  private renderSeriesModel(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    axes: Record<string, AxisData>
  ) {
    const valueAxis = this.isBar ? 'xAxis' : 'yAxis';
    const labelAxis = this.isBar ? 'yAxis' : 'xAxis';
    const anchorSizeKey = this.isBar ? 'height' : 'width';
    const offsetSizeKey = this.isBar ? 'width' : 'height';
    const tickDistance = this.rect[anchorSizeKey] / axes[labelAxis].validTickCount;

    if (this.stack) {
      return this.renderStackSeriesModel(
        seriesData,
        colors,
        axes[valueAxis].labels,
        tickDistance,
        offsetSizeKey
      );
    }

    return this.renderBoxSeriesModel(
      seriesData.data,
      colors,
      axes[valueAxis].labels,
      tickDistance,
      offsetSizeKey
    );
  }

  renderBoxSeriesModel(
    seriesRawData: SeriesRawData,
    colors: string[],
    valueLabels: string[],
    tickDistance: number,
    offsetSizeKey: SizeKey
  ): BoxSeriesModel[] {
    const minValue = Number(first(valueLabels));
    const offsetAxisLength = this.rect[offsetSizeKey];
    const axisValueRatio = offsetAxisLength / (Number(last(valueLabels)) - minValue);
    const columnWidth = (tickDistance - this.padding * 2) / seriesRawData.length;

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const seriesPos = seriesIndex * columnWidth + this.padding;
      const color = colors[seriesIndex];

      return data.map((value, index) => {
        const dataStart = seriesPos + index * tickDistance;
        let startPosition = 0;

        if (isRangeData(value)) {
          const [start, end] = value;
          value = end - start;

          startPosition = (start - minValue) * axisValueRatio;
        }

        const barLength = value * axisValueRatio;

        return {
          type: 'box',
          color,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? startPosition : dataStart,
          y: this.isBar ? dataStart : offsetAxisLength - barLength - startPosition
        };
      });
    });
  }

  private renderStackSeriesModel(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number,
    offsetSizeKey: SizeKey
  ): BoxSeriesModel[] {
    const stackData = seriesData.stackData!;

    return isGroupStack(stackData)
      ? this.makeStackGroupSeriesModel(
          seriesData,
          [...colors],
          valueLabels,
          tickDistance,
          offsetSizeKey
        )
      : this.makeStackSeriesModel({ stackData, colors, valueLabels, tickDistance, offsetSizeKey });
  }

  private renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height
    };
  }

  private renderRect(seriesModel): RectModel[] {
    return seriesModel.map(data => {
      const { x, y, width, height, color } = data;

      return {
        type: 'rect',
        color,
        x,
        y,
        width,
        height,
        offsetKey: this.isBar ? 'y' : 'x'
      };
    });
  }

  onMousemove({ responders }: { responders: RectModel[] }) {
    this.activatedResponders.forEach((responder: RectModel) => {
      const index = this.models.findIndex(model => model === responder);
      this.models.splice(index, 1);
    });

    this.models = [...this.models, ...responders];

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }

  private makeTooltipData(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    categories?: string[]
  ): TooltipData[] {
    const seriesRawData = seriesData.data;

    if (this.stack) {
      return this.getStackTooltip(seriesData, colors, categories);
    }

    return seriesRawData.flatMap(({ name, data }, index) =>
      data.map((value, dataIdx) => ({
        label: name,
        color: colors[index],
        value: this.getTooltipValue(value),
        category: categories?.[dataIdx]
      }))
    );
  }

  private getStackTooltip(
    seriesRaw: SeriesData<BoxType>,
    colors: string[],
    categories?: string[]
  ): TooltipData[] {
    const seriesRawData = seriesRaw.data;
    const stackData = seriesRaw.stackData!;

    return isGroupStack(stackData)
      ? this.makeGroupStackTooltipData(seriesRawData, stackData, colors, categories)
      : this.makeStackTooltipData(seriesRawData, stackData, colors, categories);
  }

  private makeGroupStackTooltipData(
    seriesRawData: SeriesRawData,
    stackData: StackGroupData,
    colors: string[],
    categories?: string[]
  ) {
    return Object.keys(stackData).flatMap((groupId, groupIdx) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const groupColors = colors.splice(groupIdx, filtered.length);

      return this.makeStackTooltipData(seriesRawData, stackData[groupId], groupColors, categories);
    });
  }

  private makeStackTooltipData(
    seriesRawData: SeriesRawData,
    stackData: StackData,
    colors: string[],
    categories?: string[]
  ) {
    return stackData.flatMap(({ values }, index) =>
      values.map((value, seriesIndex) => ({
        label: seriesRawData[seriesIndex].name,
        color: colors[seriesIndex],
        value,
        category: categories?.[index]
      }))
    );
  }

  private getTooltipValue(value) {
    return isRangeData(value) ? `${value[0]} ~ ${value[1]}` : value;
  }

  private getTotalOfPrevValues(values, currentIndex, included = false) {
    return values.reduce((a, b, idx) => {
      const isPrev = included ? idx <= currentIndex : idx < currentIndex;

      if (isPrev) {
        return a + b;
      }

      return a;
    }, 0);
  }

  makeStackSeriesModel({
    stackData,
    colors,
    valueLabels,
    tickDistance,
    offsetSizeKey,
    stackGroup = {
      count: 1,
      index: 0
    }
  }: StackSeriesModelParamType) {
    const seriesModels: BoxSeriesModel[] = [];
    const offsetAxisLength = this.rect[offsetSizeKey];
    const columnWidth = (tickDistance - this.padding * 2) / stackGroup.count;
    const stackType: StackType = this.stack.type;

    stackData.forEach(({ values, sum }, index) => {
      const seriesPos = index * tickDistance + this.padding + columnWidth * stackGroup.index;

      values.forEach((value, seriesIndex) => {
        const color = colors[seriesIndex];
        const beforeValueSum = this.getTotalOfPrevValues(values, seriesIndex, !this.isBar);
        let barLength, startPosition;

        if (stackType === STACK_TYPES.PERCENT) {
          barLength = (value / sum) * offsetAxisLength;
          startPosition = (beforeValueSum / sum) * offsetAxisLength;
        } else {
          const offsetValue = Number(last(valueLabels)) - Number(first(valueLabels));
          const axisValueRatio = offsetAxisLength / offsetValue;

          barLength = value * axisValueRatio;
          startPosition = beforeValueSum * axisValueRatio;
        }

        seriesModels.push({
          type: 'box',
          color,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? startPosition : seriesPos,
          y: this.isBar ? seriesPos : offsetAxisLength - startPosition
        });
      });
    });

    return seriesModels;
  }

  makeStackGroupSeriesModel(
    seriesRaw: SeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number,
    offsetSizeKey: SizeKey
  ) {
    const stackGroupData = seriesRaw.stackData as StackGroupData;
    const seriesRawData = seriesRaw.data;
    const stackGroupIds = Object.keys(stackGroupData);
    let seriesModels: BoxSeriesModel[] = [];

    stackGroupIds.forEach((groupId, index) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);

      seriesModels = [
        ...seriesModels,
        ...this.makeStackSeriesModel({
          stackData: stackGroupData[groupId],
          colors: colors.splice(index, filtered.length),
          valueLabels,
          tickDistance,
          offsetSizeKey,
          stackGroup: {
            count: stackGroupIds.length,
            index
          }
        })
      ];
    });

    return seriesModels;
  }
}
