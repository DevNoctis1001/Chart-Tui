import { StoreModule, Layout, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import { BubbleChartOptions } from '@t/options';

export function showCircleLegend(options: BubbleChartOptions, isBubbleChart = false) {
  return isBubbleChart && options?.circleLegend?.visible;
}

function showLegend(options: Options, isBubbleChart = false) {
  return showCircleLegend(options, isBubbleChart) || options.legend?.visible;
}

function calculateLegendWidth(width: number) {
  // @TODO: 라벨 길이 비교 필요
  return width / 10;
}

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }) {
      const {
        chart: { height, width },
        series,
        options,
      } = state;

      const padding = 10;
      const yAxis = {
        width: 50,
        height: height - padding * 2 - 34,
        x: 0 + padding,
        y: 0 + padding,
      };

      const legendWidth = showLegend(options, !!series.bubble) ? calculateLegendWidth(width) : 0;

      const xAxis = {
        width: width - (yAxis.x + yAxis.width + legendWidth + padding * 2),
        height: 20,
        x: yAxis.x + yAxis.width,
        y: yAxis.y + yAxis.height,
      };

      const legend = {
        width: legendWidth,
        height: yAxis.height,
        x: xAxis.x + xAxis.width + padding,
        y: yAxis.y,
      };

      const plot = {
        width: xAxis.width,
        height: yAxis.height,
        x: xAxis.x,
        y: 0 + padding,
      };

      extend(state.layout, { yAxis, xAxis, plot, legend });
    },
  },
  observe: {
    updateLayoutObserve() {
      this.dispatch('setLayout');
    },
    // setLayout({chart}) {
    //   const yAxis = {
    //     width: 33,
    //     height: chart.height,
    //     x: 0,
    //     y: 0
    //   };
    //   const xAxis = {
    //     width: chart.width,
    //     height: 34,
    //     x: yAxis.x + yAxis.width,
    //     y: yAxis.y + yAxis.height
    //   };
    //   const plot = {
    //     width: chart.width - yAxis.width,
    //     height: chart.height - xAxis.height,
    //     x: yAxis.x + yAxis.width,
    //     y: 0
    //   };
    //   this.dispatch('setLayout', {
    //     plot,
    //     xAxis,
    //     yAxis
    //   });
    // }
  },
};

export default layout;
