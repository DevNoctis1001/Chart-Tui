/**
 * @fileoverview test line chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LineChartSeries = require('../../src/js/series/lineChartSeries.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('test LineChartSeries', function() {
    var getRenderedLabelWidth, getRenderedLabelHeight, series;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        getRenderedLabelWidth  = renderUtil.getRenderedLabelWidth;
        getRenderedLabelHeight  = renderUtil.getRenderedLabelHeight;

        renderUtil.getRenderedLabelWidth = function() {
            return 50;
        };

        renderUtil.getRenderedLabelHeight = function() {
            return 20;
        };
    });

    afterAll(function() {
        renderUtil.getRenderedLabelWidth = getRenderedLabelWidth;
        renderUtil.getRenderedLabelHeight = getRenderedLabelHeight;
    });

    beforeEach(function() {
        series = new LineChartSeries({
            chartType: 'line',
            data: {
                values: [],
                formattedValues: [],
                scale: {min: 0, max: 0}
            },
            options: {}
        });
    });

    describe('_makePositions()', function() {
        it('라인차트의 position 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.25], [0.5]];
            bounds = series._makePositions({
                width: 200,
                height: 400
            });
            expect(bounds).toEqual([
                [{
                    top: 300,
                    left: 100
                }],
                [{
                    top: 200,
                    left: 100
                }]
            ]);
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('라인차트에서 series label을 렌더링 하면 label은 dot위치 상단에 중앙(상하,좌우)정렬하여 위치하게 됩니다.', function() {
            var container = dom.create('div'),
                children;
            series._renderSeriesLabel({
                container: container,
                groupPositions: [
                    [
                        {
                            top: 50,
                            left: 50
                        },
                        {
                            top: 70,
                            left: 150
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 100
                },
                formattedValues: [
                    ['1.5', '2.2']
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.left).toEqual('25px');
            expect(children[0].style.top).toEqual('35px');
            expect(children[0].innerHTML).toEqual('1.5');

            expect(children[1].style.left).toEqual('125px');
            expect(children[1].style.top).toEqual('55px');
            expect(children[1].innerHTML).toEqual('2.2');
        });
    });
});
