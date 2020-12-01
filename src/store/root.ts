import { StoreModule } from '@t/store/store';
import { Size } from '@t/options';

const root: StoreModule = {
  name: 'root',
  // 파라메터로 data 초기 데이터도 받아야 한다.
  state: ({ options }) => ({
    chart: { width: 0, height: 0, ...options.chart },
  }),
  action: {
    setChartSize({ state }, size: Size) {
      state.chart.width = size.width;
      state.chart.height = size.height;
    },
    initChartSize({ state }, containerEl: HTMLElement) {
      if (state.chart.width === 0 || state.chart.height === 0) {
        if (containerEl.parentNode) {
          this.dispatch('setChartSize', {
            width: containerEl.offsetWidth,
            height: containerEl.offsetHeight,
          });
        } else {
          setTimeout(() => {
            this.dispatch('setChartSize', {
              width: containerEl.offsetWidth,
              height: containerEl.offsetHeight,
            });
          }, 0);
        }
      }
    },
  },
};

export default root;