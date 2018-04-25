/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import chartConst from './../const';
export default class RaphaelTitleComponent {
    /**
     * Render title
     * @param {object} renderInfo infos for render
     *   @param {object} renderInfo.paper - paper
     *   @param {string} renderInfo.titleText - title text
     *   @param {{x: number, y: number}} renderInfo.offset - title offset x, y
     *   @param {object} renderInfo.theme - theme object
     *   @param {string} [renderInfo.align] - title align option
     *   @param {number} renderInfo.chartWidth chart width
     * @returns {Array.<object>} title set
     */
    render(renderInfo) {
        const {
            paper,
            titleText,
            offset,
            theme,
            align = chartConst.TITLE_ALIGN_LEFT,
            chartWidth
        } = renderInfo;
        const {fontSize, fontFamily} = theme.fontSize;
        const titleSize = raphaelRenderUtil.getRenderedTextSize(titleText, fontSize, fontFamily);
        const titleSet = paper.set();
        const pos = this.getTitlePosition(titleSize, align, chartWidth, offset);

        titleSet.push(raphaelRenderUtil.renderText(paper, pos, titleText, {
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color,
            'text-anchor': 'start'
        }));

        return titleSet;
    }

    /**
     * calculate position of title
     * @param {{width: number, height: number}} titleSize - size of title
     * @param {string} [align] - title align option
     * @param {number} chartWidth chart width
     * @param {{x: number, y: number}} offset - title offset x, y
     * @returns {{top: number, left: number}} position of title
     */
    getTitlePosition(titleSize, align, chartWidth, offset) {
        let left;

        if (align === chartConst.TITLE_ALIGN_CENTER) {
            left = chartWidth / 2;
        } else if (align === chartConst.TITLE_ALIGN_RIGHT) {
            left = chartWidth - titleSize.width - (titleSize.width / 2);
        } else {
            left = chartConst.CHART_PADDING;
        }

        const pos = {
            left,
            top: chartConst.CHART_PADDING + (titleSize.height / 2) // for renderText's baseline
        };

        if (offset) {
            if (offset.x) {
                pos.left += offset.x;
            } else if (offset.y) {
                pos.top += offset.y;
            }
        }

        return pos;
    }

    /**
     * Resize title component
     * @param {number} chartWidth chart width
     * @param {Array.<object>} titleSet title set
     */
    resize(chartWidth, titleSet) {
        titleSet.attr({
            left: chartConst.CHART_PADDING
        });
    }
}
