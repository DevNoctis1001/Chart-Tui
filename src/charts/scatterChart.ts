import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import ScatterSeries from '@src/component/scatterSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import Title from '@src/component/title';
import AxisTitle from '@src/component/axisTitle';
import ExportMenu from '@src/component/exportMenu';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';

import { ScatterChartOptions, ScatterSeriesData, ScatterSeriesType } from '@t/options';

interface ScatterChartProps {
  el: Element;
  options: ScatterChartOptions;
  data: ScatterSeriesData;
}

export default class ScatterChart extends Chart<ScatterChartOptions> {
  modules = [dataRange, scale, axes];

  constructor(props: ScatterChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        scatter: props.data.series as ScatterSeriesType[],
      },
      categories: props.data?.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(ScatterSeries);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(Tooltip);

    this.painter.addGroups([
      basicBrushes,
      axisBrushes,
      tooltipBrushes,
      legendBrush,
      labelBrush,
      exportMenuBrush,
    ]);
  }
}
