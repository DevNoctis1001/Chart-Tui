import {
  Point,
  DataLabelOptions,
  DataLabelStyle,
  DataLabelPieSeriesName,
  SubDataLabel,
  BoxSeriesDataType,
} from '@t/options';
import { PointModel, SectorModel, RectModel } from './series';

export type DataLabelSeriesType = 'area' | 'line' | 'bar' | 'column' | 'bullet' | 'pie';

export type DataLabelType =
  | 'stackTotal'
  | 'rect'
  | 'point'
  | 'sector'
  | 'pieSeriesName'
  | 'treemapSeriesName';

type DataLabelData = {
  data: DataLabel[];
  options: DataLabelOptions;
};

export type DataLabelsMap = {
  [key in DataLabelSeriesType]?: DataLabelData;
};

export type DataLabel = {
  type: DataLabelType;
  text: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  defaultColor?: string;
  name?: string;
} & Point;

export type DataLabelOption = Required<
  Pick<DataLabelOptions, 'anchor' | 'offsetX' | 'offsetY' | 'formatter'>
> & {
  style?: DataLabelStyle;
  stackTotal?: Required<SubDataLabel>;
  pieSeriesName?: DataLabelPieSeriesName;
};

export type DataLabelModel = {
  type: 'dataLabel';
  dataLabelType: DataLabelType;
  style?: DataLabelStyle;
  opacity?: number;
} & Omit<DataLabel, 'type'>;

export type DataLabelModels = { series: DataLabelModel[]; total: DataLabelModel[] };

export type PointDataLabel = PointModel & {
  type: 'point';
};
export type RadialDataLabel = Omit<SectorModel, 'type'> & {
  type: 'sector';
};
export type RectDirection = 'top' | 'bottom' | 'left' | 'right';

export type RectDataLabel = Omit<RectModel, 'type' | 'color' | 'value'> & {
  value?: BoxSeriesDataType | string;
  type: 'rect' | 'stackTotal' | 'treemapSeriesName';
  direction: RectDirection;
  plot: {
    x: number;
    y: number;
    size: number;
  };
};

export type SeriesDataLabelType = Array<PointDataLabel | RadialDataLabel | RectDataLabel>;
