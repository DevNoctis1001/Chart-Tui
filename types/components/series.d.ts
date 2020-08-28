import { Point, Rect, BezierPoint, BoxSeriesDataType } from '../options';
import { CircleStyleName, RectStyleName } from '@src/brushes/basic';
import { TooltipData } from '@t/components/tooltip';
import { LineModel, LabelModel } from '@t/components/axis';
import { SectorStyle, SectorStyleName } from '@src/brushes/sector';
import { LegendData } from '@t/components/legend';

export type Nullable<T> = T | null;
export type StyleProp<T, K> = (T | K)[];
export type PointModel = Point & { value?: number; name?: string };
export interface CircleStyle {
  strokeStyle?: string;
  lineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
}

export type CircleModel = {
  type: 'circle';
  radius: number;
  color: string;
  style?: StyleProp<CircleStyle, CircleStyleName>;
  seriesIndex?: number;
  index?: number;
  angle?: {
    start: number;
    end: number;
  };
  name?: string;
} & Point;

export type CircleResponderModel = {
  detectionSize?: number;
  data: TooltipData;
} & CircleModel;

export type ClipRectAreaModel = {
  type: 'clipRectArea';
} & Rect;

export type LinePointsModel = {
  type: 'linePoints';
  color: string;
  lineWidth: number;
  points: BezierPoint[];
  name?: string;
  seriesIndex?: number;
};

export type AreaPointsModel = Omit<LinePointsModel, 'type'> & {
  type: 'areaPoints';
  fillColor: string;
};

export type PathRectModel = {
  type: 'pathRect';
  radius?: number;
  fill?: string;
  stroke?: string;
} & Rect;

export interface RectStyle {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
}

export type RectModel = {
  type: 'rect';
  color: string;
  borderColor?: string;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness?: number;
  value?: BoxSeriesDataType;
  name?: string;
} & Rect;

export type RectResponderModel = Partial<RectModel> & {
  type: 'rect';
  index?: number;
  data?: { name?: string } & Partial<TooltipData>;
} & Rect &
  Partial<LegendData>;

export type AreaSeriesModels = {
  rect: ClipRectAreaModel[];
  series: AreaPointsModel[];
  dot: CircleModel[];
  selectedSeries: CircleModel[];
};

export type BoxSeriesModels = {
  clipRect?: ClipRectAreaModel[];
  series: RectModel[];
  connector?: LineModel[];
  label?: LabelModel[];
};

export type CircleSeriesModels = {
  series: CircleModel[];
  selectedSeries: CircleModel[];
};

export type LineSeriesModels = {
  rect: ClipRectAreaModel[];
  series: LinePointsModel[];
  dot: CircleModel[];
  selectedSeries: CircleModel[];
};

export type StackTotalModel = Omit<RectModel, 'type' | 'color'> & {
  type: 'stackTotal';
};

export type PieSeriesModels = {
  series: SectorModel[];
};

export type SectorModel = {
  type: 'sector';
  color: string;
  degree: {
    start: number;
    end: number;
  };
  radius: {
    inner: number;
    outer: number;
  };
  name?: string;
  value?: number;
  style?: StyleProp<SectorStyle, SectorStyleName>;
  clockwise: boolean;
  drawingStartAngle: number;
} & Point;

export type SectorResponderModel = {
  data: TooltipData;
  seriesIndex: number;
} & SectorModel;

export type PolygonModel = {
  type: 'polygon';
  points: Point[];
  color: string;
  lineWidth: number;
  fillColor?: string;
  distances?: number[];
};

export type RadarSeriesModels = {
  polygon: PolygonModel[];
  dot: CircleModel[];
  selectedSeries: CircleModel[];
};

export type BoxPlotSeriesModel = RectModel | LineModel | CircleModel;

export type BoxPlotSeriesModels = {
  series: BoxPlotSeriesModel[];
  selectedSeries: BoxPlotSeriesModel[];
};

export type LineResponderModel = {
  x2: number;
  y2: number;
  detectionSize?: number;
} & Point;

export type BoxPlotModel = {
  type: 'boxPlot';
  color: string;
  name: string;
  rect: Omit<RectModel, 'type' | 'color'>;
  median: LineResponderModel;
  whisker: LineResponderModel;
  minimum: LineResponderModel;
  maximum: LineResponderModel;
};

export type BoxPlotResponderModel = {
  data?: TooltipData;
} & BoxPlotModel &
  Point;

export type BulletModel = {
  modelType: 'bullet' | 'range' | 'marker';
} & RectModel;

export type BulletResponderModel = {
  data?: TooltipData;
} & BulletModel;

export type BulletSeriesModels = {
  series: BulletModel[];
  selectedSeries: BulletResponderModel[];
};
