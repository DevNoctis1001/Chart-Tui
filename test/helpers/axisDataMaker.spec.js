/**
 * @fileoverview test axis model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/axisDataMaker'),
    chartConst = require('../../src/js/const');

describe('axisDataMaker', function() {
    describe('_makeLabels()', function() {
        it('전달받은 labelInterval 옵션 정보가 없으면, labels를 그대로 반환합니다.', function() {
            var actual = maker._makeLabels(['label1', 'label2', 'label3']),
                expected = ['label1', 'label2', 'label3'];
            expect(actual).toEqual(expected);
        });

        it('labelInterval 옵션이 있을 경우 처음과, 끝, 그리고 interval 위치에 해당하는 label을 제외하고 모두 EMPTY_AXIS_LABEL로 대체합니다.', function() {
            var actual = maker._makeLabels(['label1', 'label2', 'label3', 'label4', 'label5'], 2),
                expected = ['label1', chartConst.EMPTY_AXIS_LABEL, 'label3', chartConst.EMPTY_AXIS_LABEL, 'label5'];
            expect(actual).toEqual(expected);
        });
    });

    describe('makeLabelAxisData()', function() {
        it('레이블 타입의 axis data를 생성합니다.', function() {
            var result = maker.makeLabelAxisData({
                labels: ['label1', 'label2', 'label3']
            });
            expect(result).toEqual({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4,
                validTickCount: 0,
                isLabelAxis: true,
                isVertical: false,
                aligned: false
            });
        });

        it('aligned옵션이 true이면 tick label과 tick의 수가 동일하기 때문에 tickCount는 레이블 수 만큼만 설정된다. ', function() {
            var result = maker.makeLabelAxisData({
                labels: ['label1', 'label2', 'label3'],
                aligned: true
            });
            expect(result.tickCount).toBe(3);
        });
    });

    describe('makeValueAxisData()', function() {
        it('axisScaleMaker를 전달하여 value 타입 axis data를 생성합니다..', function() {
            var axisScaleMaker = jasmine.createSpyObj('axisScaleMaker', ['getFormattedScaleValues', 'getLimit']),
                actual, expected;

            axisScaleMaker.getFormattedScaleValues.and.returnValue([0, 25, 50, 75, 100]);
            axisScaleMaker.getLimit.and.returnValue({
                min: 0,
                max: 100
            });

            actual = maker.makeValueAxisData({
                axisScaleMaker: axisScaleMaker,
                isVertical: true,
                isPositionRight: true,
                aligned: true
            });
            expected = {
                labels: [0, 25, 50, 75, 100],
                tickCount: 5,
                validTickCount: 5,
                limit: {
                    min: 0,
                    max: 100
                },
                isVertical: true,
                isPositionRight: true,
                aligned: true
            };

            expect(actual).toEqual(expected);
        });
    });
});
