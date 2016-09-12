/**
 * @fileoverview Test for Axis.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../../src/js/axes/axis');
var dom = require('../../src/js/helpers/domHandler');
var renderUtil = require('../../src/js/helpers/renderUtil');

describe('Test for Axis', function() {
    var dataProcessor, boundsMaker, scaleModel, axis;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['isValidAllSeriesDataModel', 'getCategories', 'isCoordinateType']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['registerBaseDimension', 'getDimension', 'getPosition']);
        scaleModel = jasmine.createSpyObj('scaleModel', ['getMultilineXAxisLabels', 'getAxisData']);
        axis = new Axis({
            theme: {
                title: {
                    fontSize: 12
                },
                label: {
                    fontSize: 12
                },
                tickColor: 'black'
            },
            options: {
                title: {
                    text: 'Axis Title'
                }
            },
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker,
            scaleModel: scaleModel
        });
    });

    describe('_isValidAxis()', function() {
        it('component name이 rightYAxis가 아니면 true를 반환합니다.', function() {
            var actual, expected;

            axis.componentName = 'xAxis';
            actual = axis._isValidAxis();
            expected = true;

            expect(actual).toBe(expected);
        });

        it('component name이 rightYAxis면서 isValidAllGroup이 false이면  false를 반환합니다.', function() {
            var actual, expected;

            axis.componentName = 'rightYAxis';

            dataProcessor.isValidAllSeriesDataModel.and.returnValue(false);

            actual = axis._isValidAxis();
            expected = false;

            expect(actual).toBe(expected);
        });
    });

    describe('_renderOppositeSideTickArea()', function() {
        it('isCenter 옵션으로 인해 중앙에 배치될 경우 기존의 tick area html을 복사하며 우측을 표현하는 tick area를 추가적으로 생성하여 반환합니다.', function() {
            var actual, expectedHtml, expectedClass;

            axis.options.isCenter = true;
            actual = axis._renderOppositeSideTickArea('html');
            expectedHtml = 'html';
            expectedClass = 'tui-chart-tick-area opposite-side';

            expect(actual.innerHTML).toBe(expectedHtml);
            expect(actual.className).toBe(expectedClass);
        });

        it('isCenter 옵션이 없다면 undefined를 반환합니다.', function() {
            var actual = axis._renderOppositeSideTickArea('html');

            expect(actual).toBeUndefined();
        });
    });

    describe('_addCssClasses()', function() {
        it('isVertical이 true인 경우에는 container의 css className에 vertical 값을 설정합니다.', function() {
            var container = dom.create('DIV'),
                actual, expected;

            axis.isVertical = true;
            axis._addCssClasses(container);
            actual = container.className;
            expected = 'vertical';

            expect(actual).toMatch(expected);
        });

        it('isVertical이 없거나 false인 경우에는 container의 css className에 horizontal 값을 설정합니다.', function() {
            var container = dom.create('DIV'),
                actual, expected;

            axis._addCssClasses(container);
            actual = container.className;
            expected = 'horizontal';

            expect(actual).toMatch(expected);
        });

        it('isPositionRight이 true인 경우에는 container의 css className에 right 값을 설정합니다.', function() {
            var container = dom.create('DIV'),
                actual, expected;

            axis.data.isPositionRight = true;
            axis._addCssClasses(container);
            actual = container.className;
            expected = 'right';

            expect(actual).toMatch(expected);
        });

        it('isPositionRight이 없거나 false인 경우에는 container의 css className에 right 값이 설정되지 않습니다.', function() {
            var container = dom.create('DIV'),
                actual, expected;

            axis._addCssClasses(container);
            actual = container.className;
            expected = 'right';

            expect(actual).not.toMatch(expected);
        });

        it('options의 isCenter가 true인 경우에는 container의 css className에 center 값을 설정합니다.', function() {
            var container = dom.create('DIV'),
                actual, expected;

            axis.options.isCenter = true;
            axis._addCssClasses(container);
            actual = container.className;
            expected = 'center';

            expect(actual).toMatch(expected);
        });

        it('options의 isCenter가 없거나 false인 경우에는 container의 css className에 center 값이 설정되지 않습니다.', function() {
            var container = dom.create('DIV'),
                actual, expected;

            axis._addCssClasses(container);
            actual = container.className;
            expected = 'center';

            expect(actual).not.toMatch(expected);
        });
    });

    describe('_moveToLeft()', function() {
        it('tick 영역과 label 영역을 50만큼 좌측으로 이동시킵니다.', function(done) {
            var ticksElement = dom.create('DIV');
            var labelContainer = dom.create('DIV');

            axis.ticksElement = ticksElement;
            axis.labelContainer = labelContainer;
            axis.ticksElement.style.left = '20px';
            axis.labelContainer.style.left = '20px';
            spyOn(renderUtil, 'setOpacity');

            axis._moveToLeft(50);

            setTimeout(function() {
                expect(ticksElement.style.left).toBe('-30px');
                expect(labelContainer.style.left).toBe('-30px');
                done();
            }, 450);
        });

        it('tick 영역과 label 영역에 left값이 설정되어 있지 않으면 left를 0으로 계산합니다.', function(done) {
            var ticksElement = dom.create('DIV');
            var labelContainer = dom.create('DIV');

            axis.ticksElement = ticksElement;
            axis.labelContainer = labelContainer;
            spyOn(renderUtil, 'setOpacity');

            axis._moveToLeft(50);

            setTimeout(function() {
                expect(ticksElement.style.left).toBe('-50px');
                expect(labelContainer.style.left).toBe('-50px');
                done();
            }, 450);
        });

        it('startIndex가 0이면 첫번째 tick와 첫번째 label의 opacity를 0으로 변경시킵니다.', function(done) {
            var ticksElement = dom.create('DIV');
            var firstTickElement = dom.create('DIV');
            var labelContainer = dom.create('DIV');
            var firstLabelElement = dom.create('DIV');

            ticksElement.appendChild(firstTickElement);
            labelContainer.appendChild(firstLabelElement);
            axis.ticksElement = ticksElement;
            axis.labelContainer = labelContainer;
            axis.data.startIndex = 0;
            spyOn(renderUtil, 'setOpacity');

            axis._moveToLeft(50);

            setTimeout(function() {
                expect(renderUtil.setOpacity).toHaveBeenCalledWith([firstTickElement, firstLabelElement], 0);
                done();
            }, 450);
        });
    });

    describe('_resizeByTickSize()', function() {
        it('tick 영역과 label 영역의 너비를 50만큼 줄입니다.', function(done) {
            var ticksElement = dom.create('DIV');
            var labelContainer = dom.create('DIV')

            ticksElement.style.width = '200px';
            labelContainer.style.width = '200px';

            axis.ticksElement = ticksElement;
            axis.labelContainer = labelContainer;

            axis._resizeByTickSize(50);

            setTimeout(function() {
                expect(ticksElement.style.width).toBe('150px');
                expect(labelContainer.style.width).toBe('150px');
                done();
            }, 450);
        });
    });

    describe('animateForAddingData()', function() {
        it('if has shifting option, execute this._moveToLeft function', function() {
            spyOn(axis, '_moveToLeft');
            dataProcessor.isCoordinateType.and.returnValue(false);

            axis.animateForAddingData({
                shifting: true,
                tickSize: 50
            });

            expect(axis._moveToLeft).toHaveBeenCalledWith(50);
        });

        it('if has not shifting option, execute this._resizeByTickSize function', function() {
            spyOn(axis, '_resizeByTickSize');
            dataProcessor.isCoordinateType.and.returnValue(false);

            axis.animateForAddingData({
                tickSize: 50
            });

            expect(axis._resizeByTickSize).toHaveBeenCalledWith(50);
        });

        it('if axis is vertical type, this function is not working', function() {
            spyOn(axis, '_moveToLeft');
            spyOn(axis, '_resizeByTickSize');

            axis.isVertical = true;

            axis.animateForAddingData();

            expect(axis._moveToLeft).not.toHaveBeenCalled();
            expect(axis._resizeByTickSize).not.toHaveBeenCalled();
        });

        it('if data type is coordinateType, this functions is not working', function() {
            spyOn(axis, '_moveToLeft');
            spyOn(axis, '_resizeByTickSize');

            axis.isVertical = false;
            dataProcessor.isCoordinateType.and.returnValue(true);

            axis.animateForAddingData();

            expect(axis._moveToLeft).not.toHaveBeenCalled();
            expect(axis._resizeByTickSize).not.toHaveBeenCalled();
        });
    });

    describe('_makeCssTextFromPositionMap()', function() {
        it('position이나 dimension 정보를 전달하여 value에 px를 추가해 renderUtil.makeCssTextFromMap를 호출합니다.', function() {
            var actual = axis._makeCssTextFromPositionMap({
                left: 10,
                top: 20,
                width: 100,
                height: 100
            });

            expect(actual).toBe('left:10px;top:20px;width:100px;height:100px');
        });
    });

    describe('_makePositionMapForCenterAlign()', function() {
        it('make position map for center align option of y axis', function() {
            var actual;

            boundsMaker.getDimension.and.callFake(function(componentType) {
                return {
                    xAxis: {
                        height: 50
                    },
                    yAxis: {
                        width: 100
                    }
                }[componentType];
            });

            actual = axis._makePositionMapForCenterAlign();

            expect(actual.left).toBe(25);
            expect(actual.bottom).toBe(-50);
        });

        it('make position map for center align option of y axis, when has title offset option', function() {
            var actual;

            boundsMaker.getDimension.and.callFake(function(componentType) {
                return {
                    xAxis: {
                        height: 50
                    },
                    yAxis: {
                        width: 100
                    }
                }[componentType];
            });
            axis.options.title = {
                offset: {
                    x: 10,
                    y: 10
                }
            };

            actual = axis._makePositionMapForCenterAlign();

            expect(actual.left).toBe(35);
            expect(actual.bottom).toBe(-60);
        });
    });

    describe('_makeRightPosition', function() {
        it('make right position, when browser is IE7', function() {
            var actual;

            spyOn(renderUtil, 'isIE7').and.returnValue(true);

            actual = axis._makeRightPosition();

            expect(actual).toBe(0);
        });

        it('make right position, when rotateTitle option is false', function() {
            var actual;

            axis.options.rotateTitle = false;

            actual = axis._makeRightPosition();

            expect(actual).toBe(0);
        });

        it('make right position, when browser is not IE7 and rotateTitle option is not false', function() {
            var actual;

            spyOn(renderUtil, 'isIE7').and.returnValue(false);

            actual = axis._makeRightPosition(100);

            expect(actual).toBe(-100);
        });

        it('make right position, when rotateTitle option is false and has title offset option', function() {
            var actual;

            axis.options.rotateTitle = false;
            axis.options.title = {
                offset: {
                    x: 10
                }
            };

            actual = axis._makeRightPosition();

            expect(actual).toBe(-10);
        });
    });

    describe('_makeTopPosition()', function() {
        it('make top position, when rotateTitle option is false', function() {
            var actual;

            axis.options.rotateTitle = false;

            actual = axis._makeTopPosition(100);

            expect(actual).toBe(40);
        });

        it('make top position, when rotateTitle option is not false and right y axis', function() {
            var actual;

            axis.data.isPositionRight = true;
            actual = axis._makeTopPosition();

            expect(actual).toBe(0);
        });

        it('make top position, when rotateTitle option is not false and not right y axis and not old browser', function() {
            var actual;

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);

            actual = axis._makeTopPosition(100);

            expect(actual).toBe(100);
        });

        it('returns null, when rotateTitle option is not false and not right y axis and old browser', function() {
            var actual;

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);

            actual = axis._makeTopPosition();

            expect(actual).toBeNull();
        });

        it('make top position, when rotateTitle option is false and has title offset option', function() {
            var actual;

            axis.options.rotateTitle = false;
            axis.options.title = {
                offset: {
                    y: 10
                }
            };

            actual = axis._makeTopPosition(100);

            expect(actual).toBe(50);
        });
    });

    describe('_makePositionMapForNotCenterAlign()', function() {
        it('make positionMap for not center align', function() {
            var actual;

            spyOn(axis, '_makeTopPosition').and.returnValue(50);

            actual = axis._makePositionMapForNotCenterAlign();

            expect(actual.left).toBe(0);
            expect(actual.top).toBe(50);
        });

        it('make positionMap for not center align, when has titlePosition option', function() {
            var actual;

            spyOn(axis, '_makeTopPosition').and.returnValue(50);
            axis.options.title = {
                offset:{
                    left: 10
                }
            };

            actual = axis._makePositionMapForNotCenterAlign();

            expect(actual.left).toBe(0);
            expect(actual.top).toBe(50);
        });

        it('make positionMap for not center align, when right y axis', function() {
            var actual;

            spyOn(axis, '_makeTopPosition').and.returnValue(50);
            spyOn(axis, '_makeRightPosition').and.returnValue(30);
            axis.data.isPositionRight = true;

            actual = axis._makePositionMapForNotCenterAlign();

            expect(actual.right).toBe(30);
            expect(actual.left).toBeUndefined();
            expect(actual.top).toBe(50);
        });

        it('if top position is null, top not be returned', function() {
            var actual;

            spyOn(axis, '_makeTopPosition').and.returnValue(null);

            actual = axis._makePositionMapForNotCenterAlign();

            expect(actual.left).toBe(0);
            expect(actual.top).toBeUndefined();
        });
    });

    describe('_renderTitleAreaStyleForVertical()', function() {
        it('타이틀 너비가 50인 좌측 y axis 타이틀 영역의 css style을 렌더링 합니다.', function() {
            var elTitle = dom.create('DIV');

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);

            axis._renderTitleAreaStyleForVertical(elTitle, 50);

            expect(elTitle.style.width).toBe('50px');
            expect(elTitle.style.left).toBe('0px');
            expect(elTitle.style.top).toBe('50px');
        });

        it('IE8이하의 구형 브라우저에서는 top값을 설정하지 않습니다.', function() {
            var elTitle = dom.create('DIV');

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);

            axis._renderTitleAreaStyleForVertical(elTitle, 50);

            expect(elTitle.style.width).toBe('50px');
            expect(elTitle.style.left).toBe('0px');
            expect(elTitle.style.top).toBe('');
        });

        it('rotateTitle옵션이 false인 경우에는 top값을 제목 높이와 yAxis높이로 계산합니다. ', function() {
            var elTitle = dom.create('DIV');

            axis.options.rotateTitle = false;

            axis._renderTitleAreaStyleForVertical(elTitle, 200);

            expect(elTitle.style.top).toBe('90px');
        });

        it('우측 y axis 타이틀 영역의 css style을 렌더링합니다. 우측에 배치되기 때문에 right값으로 설정됩니다.', function() {
            var elTitle = dom.create('DIV');

            axis.data.isPositionRight = true;
            spyOn(renderUtil, 'isIE7').and.returnValue(false);
            axis._renderTitleAreaStyleForVertical(elTitle, 50);

            expect(elTitle.style.width).toBe('50px');
            expect(elTitle.style.right).toBe('-50px');
            expect(elTitle.style.top).toBe('0px');
        });

        it('우측 y axis 타이틀 이면서 IE7의 경우는 right를 0으로 설정합니다.', function() {
            var elTitle = dom.create('DIV');

            axis.data.isPositionRight = true;
            spyOn(renderUtil, 'isIE7').and.returnValue(true);
            axis._renderTitleAreaStyleForVertical(elTitle, 50);

            expect(elTitle.style.right).toBe('0px');
        });

        it('우측 y axis 타이틀 이면서 rotateTitle옵션이 false인 경우도 right를 0으로 설정합니다.', function() {
            var elTitle = dom.create('DIV');

            axis.data.isPositionRight = true;
            spyOn(renderUtil, 'isIE7').and.returnValue(false);
            axis.options.rotateTitle = false;
            axis._renderTitleAreaStyleForVertical(elTitle, 50);

            expect(elTitle.style.right).toBe('0px');
        });

        it('isCenter 옵션으로 인해 중앙에 배치될 경우의 css style을 랜더링 합니다.', function() {
            var elTitle = dom.create('DIV');

            boundsMaker.getDimension.and.callFake(function(type) {
                if (type === 'yAxis') {
                    return {
                        width: 80
                    };
                } else if (type === 'xAxis') {
                    return {
                        height: 30
                    };
                }
            });
            axis.options.title = {
                text: 'Title'
            };
            axis.options.isCenter = true;
            axis._renderTitleAreaStyleForVertical(elTitle);

            expect(elTitle.style.left).toBe('15px');
            expect(elTitle.style.bottom).toBe('-30px');
        });
    });

    describe('_renderTitleArea()', function() {
        it('render title area', function() {
            var elTitle;

            axis.options.title = {
                text: 'Axis Title'
            };
            axis.theme.fontSize = 12;
            axis.isVertical = true;
            elTitle = axis._renderTitleArea(200);

            expect(elTitle.innerHTML).toBe('Axis Title');
            expect(elTitle.style.width).toBe('200px');
        });

        it('returns null, when has not title', function() {
            var elTitle;

            delete axis.options.title;
            axis.theme.fontSize = 12;
            axis.isVertical = true;
            elTitle = axis._renderTitleArea(200);

            expect(elTitle).toBeNull();
        });
    });

    describe('_makeTickHtml()', function() {
        it('tick html을 생성합니다.', function() {
            var actual, expected;

            axis.data.labels = ['label1', 'label2', 'label3', 'label4', 'label5'];
            axis.data.tickCount = 5;

            actual = axis._makeTickHtml(100, 5, true, 0);
            expected = '<div class="tui-chart-tick" style="background-color:black;left: -1%"></div>' +
                '<div class="tui-chart-tick" style="background-color:black;left: 25%"></div>' +
                '<div class="tui-chart-tick" style="background-color:black;left: 50%"></div>' +
                '<div class="tui-chart-tick" style="background-color:black;left: 75%"></div>' +
                '<div class="tui-chart-tick" style="background-color:black;left: 99%"></div>';

            expect(actual).toBe(expected);
        });

        it('label숫자가 tickCount보다 작을 경우에는 label 숫자에 맞춰 tick html을 생성합니다.', function() {
            var actual, expected;

            axis.data.labels = ['label1', 'label2', 'label3', 'label4'];
            axis.data.tickCount = 4;

            actual = axis._makeTickHtml(100, 5, true, 0);
            expected = '<div class="tui-chart-tick" style="background-color:black;left: -1%"></div>' +
                '<div class="tui-chart-tick" style="background-color:black;left: 25%"></div>' +
                '<div class="tui-chart-tick" style="background-color:black;left: 50%"></div>' +
                '<div class="tui-chart-tick" style="background-color:black;left: 75%"></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_renderTickLine()', function() {
        it('가로 축 tick line 엘리먼트를 생성합니다.', function() {
            var actual = axis._renderTickLine(200, true, 0);

            expect(actual.className).toBe('tui-chart-tick-line');
            expect(actual.style.width).toBe('201px');
            expect(actual.style.left).toBe('-1px');
        });

        it('나눠진 가로 축 tick line 엘리먼트를 생성합니다.', function() {
            var actual = axis._renderTickLine(200, false, 0);

            expect(actual.className).toBe('tui-chart-tick-line');
            expect(actual.style.width).toBe('200px');
            expect(actual.style.left).toBe('0px');
        });

        it('세로 축 tick line 엘리먼트를 생성합니다.', function() {
            var actual;

            axis.isVertical = true;

            actual = axis._renderTickLine(200, false, 0);

            expect(actual.className).toBe('tui-chart-tick-line');
            expect(actual.style.height).toBe('200px');
            expect(actual.style.bottom).toBe('0px');
        });

        it('additionalSize 있을 때에는 left값에 additional을 더하여 tick line left 값을 설정합니다.', function() {
            var actual = axis._renderTickLine(200, false, 10);

            expect(actual.style.left).toBe('10px');
        });
    });

    describe('_renderTicks()', function() {
        it('tick 엘리먼트들이 포함된 ticks엘리먼트를 생성합니다.', function() {
            var actual;

            axis.data.labels = ['label1', 'label2', 'label3', 'label4', 'label5'];
            axis.data.tickCount = 5;

            actual = axis._renderTicks(200, 5, true, 0);

            expect(actual.childNodes.length).toBe(5);
        });
    });

    describe('_renderTickArea()', function() {
        it('tick line과 ticks 영역을 렌더링 합니다.', function() {
            var size = 300;
            var tickCount = 5;
            var categories = [];
            var elTickArea, childNodes;

            axis.data.isVertical = false;
            axis.data.labels = ['label1', 'label2', 'label3', 'label4', 'label5'];
            axis.data.tickCount = 5;

            elTickArea = axis._renderTickArea(size, tickCount, categories);
            childNodes = elTickArea.childNodes;

            expect(childNodes.length).toBe(2);
            expect(childNodes[0].className).toBe('tui-chart-tick-line');
            expect(childNodes[1].className).toBe('tui-chart-ticks');
        });
    });

    describe('_makeVerticalLabelCssText()', function() {
        it('세로 axis의 cssText를 생성합니다.', function() {
            var actual = axis._makeVerticalLabelCssText(50, 20),
                expected = ';width:40px';
            expect(actual).toBe(expected);
        });
    });

    describe('_applyLabelAreaStyle()', function() {
        it('label container에 fontSize, fontFamily, color등의 css style 속성을 추가합니다.', function() {
            var labelContainer = dom.create('DIV');

            axis.theme.label = {
                fontSize: 12,
                fontFamily: 'Verdana',
                color: 'red'
            };
            axis._applyLabelAreaStyle(labelContainer);

            expect(labelContainer.style.fontSize).toBe('12px');
            expect(labelContainer.style.fontFamily).toBe('Verdana');
            expect(labelContainer.style.color).toBe('red');
        });

        it('세로차트(isVertical=true)인 경우에는 너비값(width)도 설정합니다.', function() {
            var labelContainer = dom.create('DIV');

            axis.isVertical = true;
            axis._applyLabelAreaStyle(labelContainer, 50);

            expect(labelContainer.style.width).toBe('20px');
        });
    });

    describe('_renderLabelArea()', function() {
        it('render label area, when axis is label & horizontal type', function() {
            var size = 400;
            var axisWidth = 0;
            var tickCount = 5;
            var categories = ['label1', 'label2', 'label3', 'label4'];
            var elLabelArea, childNodes;

            axis.isLabel = true;
            axis.isVertical = false;

            elLabelArea = axis._renderLabelArea(size, axisWidth, tickCount, categories);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(4);
            expect(childNodes[0].style.left).toBe('0%');
            expect(childNodes[1].style.left).toBe('25%');
            expect(childNodes[2].style.left).toBe('50%');
            expect(childNodes[3].style.left).toBe('75%');
            expect(childNodes[0].style.width).toBe('100px');
            expect(childNodes[1].style.width).toBe('100px');
            expect(childNodes[2].style.width).toBe('100px');
            expect(childNodes[3].style.width).toBe('100px');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>label1</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>label2</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>label3</span>');
            expect(childNodes[3].innerHTML.toLowerCase()).toBe('<span>label4</span>');
        });

        it('render label area, when axis is label & vertical type', function() {
            var size = 400;
            var axisWidth = 100;
            var tickCount = 5;
            var categories = ['label1', 'label2', 'label3', 'label4'];
            var elLabelArea, childNodes;

            axis.isLabel = true;
            axis.isVertical = true;

            elLabelArea = axis._renderLabelArea(size, axisWidth, tickCount, categories);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(4);
            expect(childNodes[0].style.top).toBe('0%');
            expect(childNodes[1].style.top).toBe('25%');
            expect(childNodes[2].style.top).toBe('50%');
            expect(childNodes[3].style.top).toBe('75%');
            expect(childNodes[0].style.height).toBe('100px');
            expect(childNodes[1].style.height).toBe('100px');
            expect(childNodes[2].style.height).toBe('100px');
            expect(childNodes[3].style.height).toBe('100px');
            expect(childNodes[0].style.lineHeight).toBe('100px');
            expect(childNodes[1].style.lineHeight).toBe('100px');
            expect(childNodes[2].style.lineHeight).toBe('100px');
            expect(childNodes[3].style.lineHeight).toBe('100px');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>label1</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>label2</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>label3</span>');
            expect(childNodes[3].innerHTML.toLowerCase()).toBe('<span>label4</span>');
        });

        it('axis 영역의 너비가 400인 벨류 타입 x축 레이블 영역은 너비 200px과 간격 50%(or 49.75%)로 벨류형태의 레이블 값을 포함하여 렌더링 됩니다.', function() {
            var size = 400;
            var axisWidth = 0;
            var tickCount = 3;
            var categories = ['0.00', '30.00', '60.00'];
            var elLabelArea, childNodes;

            elLabelArea = axis._renderLabelArea(size, axisWidth, tickCount, categories);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);

            // 벨류 타입의 경우는 tick 옆에 배치되기 때문에 레이블 타입과는 다른 간격으로 놓이게 됩니다.
            expect(childNodes[0].style.left).toBe('0%');
            expect(childNodes[1].style.left).toBe('50%');
            expect(childNodes[2].style.left).toBe('99.75%');
            expect(childNodes[0].style.width).toBe('200px');
            expect(childNodes[1].style.width).toBe('200px');
            expect(childNodes[2].style.width).toBe('200px');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>0.00</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>30.00</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>60.00</span>');
        });

        it('axis 영역의 높이가 400인 벨류 타입 y축 레이블 영역은 50%(or 49.75%)의 간격으로 벨류형태의 레이블 값을 포함하여 렌더링 됩니다.', function() {
            var size = 400;
            var axisWidth = 100;
            var tickCount = 3;
            var categories = ['0.00', '30.00', '60.00'];
            var elLabelArea, childNodes;

            axis.isVertical = true;

            elLabelArea = axis._renderLabelArea(size, axisWidth, tickCount, categories);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);
            expect(childNodes[0].style.bottom).toBe('0%');
            expect(childNodes[1].style.bottom).toBe('50%');
            expect(childNodes[2].style.bottom).toBe('99.75%');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>0.00</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>30.00</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>60.00</span>');
        });
    });

    describe('_getRenderedTitleHeight()', function() {
        it('렌더링된 타이틀 높이를 반환합니다.', function() {
            var result = axis._getRenderedTitleHeight();
            expect(result).toBe(20);
        });
    });

    describe('_makeLabelCssText()', function() {
        //여기부터 검토
        it('레이블 높이가 100인 레이블 타입 y축의 cssText를 생성합니다.', function() {
            var actual, expected;;

            axis.isVertical = true;
            axis.isLabel = true;
            actual = axis._makeLabelCssText(100);
            expected = 'height:100px;line-height:100px;';

            expect(actual).toBe(expected);
        });

        it('레이블 너비가 100인 타입 x축의 cssText를 생성합니다.', function() {
            var actual, expected;;

            axis.isVertical = false;
            axis.isLabel = true;
            actual = axis._makeLabelCssText(100);
            expected = 'width:100px;';

            expect(actual).toBe(expected);
        });

        it('벨류 타입 y축의 경우는 빈 cssText가 생성됩니다.', function() {
            var actual, expected;;

            axis.isVertical = true;
            axis.isLabel = false;
            actual = axis._makeLabelCssText();
            expected = '';

            expect(actual).toBe(expected);
        });

        it('너비가 100인 벨류 타입 x축의 cssText를 생성합니다.', function() {
            var actual, expected;;

            axis.isVertical = false;
            axis.isLabel = false;
            actual = axis._makeLabelCssText(100);
            expected = 'width:100px;';

            expect(actual).toBe(expected);
        });
    });

    describe('_calculateRotationMovingPosition()', function() {
        it('xAxis label 회전 시 위치해야 할 position을 계산합니다.', function() {
            var actual, expected;

            axis.data.degree = 25;
            actual = axis._calculateRotationMovingPosition({
                left: 40,
                moveLeft: 20,
                top: 30,
                size: 100
            });
            expected = {
                top: 30,
                left: 20
            };
            expect(actual).toEqual(expected);
        });

        it('85도 각도에서는 레이블이 가운데 위치하도록 left를 조절합니다.', function() {
            var actual, expected;

            axis.data.degree = 85;
            actual = axis._calculateRotationMovingPosition({
                labelHeight: 20,
                left: 40,
                moveLeft: 20,
                top: 30,
                size: 100
            });
            expected = {
                top: 30,
                left: 10.038053019082547
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateRotationMovingPositionForOldBrowser()', function() {
        it('IE7이 아닌 경우의 25도 회전된 position정보를 계산하여 반환합니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'isIE7').and.returnValue(false);
            axis.data.degree = 25;
            actual = axis._calculateRotationMovingPositionForOldBrowser({
                labelWidth: 40,
                labelHeight: 20,
                left: 40,
                size: 100,
                label: 'label1',
                theme: {}
            });
            expected = {
                top: 10,
                left: 24.684610648167506
            };
            expect(actual).toEqual(expected);
        });

        it('85도 각도에서는 레이블이 가운데 위치하도록 left를 조절합니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'isIE7').and.returnValue(false);
            axis.data.degree = 85;
            actual = axis._calculateRotationMovingPositionForOldBrowser({
                degree: 85,
                labelWidth: 20,
                labelHeight: 20,
                left: 40,
                size: 100,
                label: 'label1',
                theme: {}
            });
            expected = {
                top: 10,
                left: 65.68026588169964
            };
            expect(actual).toEqual(expected);
        });

        it('IE7인 경우에는 changedWidth 값을 더하지 않습니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'isIE7').and.returnValue(true);
            axis.data.degree = 25;
            actual = axis._calculateRotationMovingPositionForOldBrowser({
                labelWidth: 40,
                labelHeight: 20,
                left: 40,
                size: 100,
                label: 'label1',
                theme: {}
            });
            expected = {
                top: 10,
                left: 28.45236523481399
            };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCssTextForRotationMoving()', function() {
        it('_calculateRotationMovingPosition() 결과로 얻은 position 정보로 cssText를 생성합니다.', function() {
            var actual, expected;
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
            spyOn(axis, '_calculateRotationMovingPosition').and.returnValue({left: 10, top: 10});
            actual = axis._makeCssTextForRotationMoving();
            expected = 'left:10%;top:10px';
            expect(actual).toEqual(expected);
        });

        it('old browser의 경우는 _calculateRotationMovingPositionForOldBrowser() 결과로 얻은 position 정보로 cssText를 생성합니다.', function() {
            var actual, expected;
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);
            spyOn(axis, '_calculateRotationMovingPositionForOldBrowser').and.returnValue({left: 10, top: 10});
            actual = axis._makeCssTextForRotationMoving();
            expected = 'left:10%;top:10px';
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalLabelsHtml()', function() {
        it('간격이 50px인 회전없는 레이블 영역 html을 생성합니다.', function() {
            var positions = [20, 50, 80];
            var categories = ['label1', 'label2', 'label3'];
            var labelSize = 50;
            var actual, expected;

            actual = axis._makeNormalLabelsHtml(positions, categories, labelSize, 0);
            expected = '<div class="tui-chart-label" style="width:50px;left:20%"><span>label1</span></div>' +
                '<div class="tui-chart-label" style="width:50px;left:50%"><span>label2</span></div>' +
                '<div class="tui-chart-label" style="width:50px;left:80%"><span>label3</span></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_makeRotationLabelsHtml()', function() {
        it('45도로 회전된 레이블 영역 html을 생성합니다.', function() {
            var areaSize = 100;
            var positions = [20, 50, 80];
            var categories = ['label1', 'label2', 'label3'];
            var labelSize = 80;
            var actual, expected;

            spyOn(axis, '_makeCssTextForRotationMoving').and.returnValue('left:10px;top:10px');
            spyOn(renderUtil, 'isIE7').and.returnValue(false);
            axis.data.degree = 45;
            actual = axis._makeRotationLabelsHtml(areaSize, positions, categories, labelSize, 0);
            expected = '<div class="tui-chart-label tui-chart-xaxis-rotation tui-chart-xaxis-rotation45" style="width:80px;left:10px;top:10px"><span>label1</span></div>' +
                '<div class="tui-chart-label tui-chart-xaxis-rotation tui-chart-xaxis-rotation45" style="width:80px;left:10px;top:10px"><span>label2</span></div>' +
                '<div class="tui-chart-label tui-chart-xaxis-rotation tui-chart-xaxis-rotation45" style="width:80px;left:10px;top:10px"><span>label3</span></div>';

            expect(actual).toBe(expected);
        });

        it('IE7일 경우의 45도로 회전된 레이블 영역 html을 생성합니다.', function() {
            var areaSize = 100;
            var positions = [30];
            var categories = ['label1'];
            var labelSize = 80;
            var actual, expected;

            spyOn(axis, '_makeCssTextForRotationMoving').and.returnValue('left:10px;top:10px');
            spyOn(renderUtil, 'isIE7').and.returnValue(true);
            axis.data.degree = 45;
            actual = axis._makeRotationLabelsHtml(areaSize, positions, categories, labelSize);
            expected = '<div class="tui-chart-label tui-chart-xaxis-rotation tui-chart-xaxis-rotation45" style="width:80px;left:10px;top:10px">' +
                    '<span style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                    ' M11=0.7071067811865476, M12=0.7071067811865475, M21=-0.7071067811865475, M22=0.7071067811865476)">label1</span>' +
                '</div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_makeLabelsHtml()', function() {
        it('degree 정보가 없을 경우에는 _makeNormalLabelsHtml()을 실행합니다.', function() {
            var areaSize = 100;
            var positions = [30, 80, 130];
            var categories = ['label1', 'label2', 'label3'];
            var labelSize = 50;
            var actual, expected;

            actual = axis._makeLabelsHtml(areaSize, positions, categories, labelSize, 0);
            expected = axis._makeNormalLabelsHtml(positions, categories, labelSize, 0);

            expect(actual).toBe(expected);
        });

        it('degree 정보가 있을 경우에는 _makeRotationLabelsHtml()을 실행합니다.', function() {
            var areaSize = 100;
            var positions = [30, 80, 130];
            var categories = ['label1', 'label2', 'label3'];
            var labelSize = 50;
            var actual, expected;

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
            axis.data.degree = 45;
            axis.componentName = 'xAxis';
            actual = axis._makeLabelsHtml(areaSize, positions, categories, labelSize);
            expected = axis._makeRotationLabelsHtml(areaSize, positions, categories, labelSize);

            expect(actual).toBe(expected);
        });
    });

    describe('_changeLabelAreaPosition()', function() {
        it('레이블 타입 축(x,y 모두 포함)의 경우에는 레이블 영역 위치 이동은 없습니다.', function() {
            var labelContainer = dom.create('DIV');

            axis.isLabel = true;
            axis._changeLabelAreaPosition(labelContainer);

            // 레이블이 타입의 경우 기본 설정이 가운데 배치되기 때문에 위치 이동 필요 없습니다.
            expect(labelContainer.style.top).toBe('');
            expect(labelContainer.style.left).toBe('');
        });

        it('벨류 타입 y축의 경우는 레이블을 tick의 중앙에 위치 시키기 위해 영역이 top 10px 이동 됩니다.', function() {
            var labelContainer = dom.create('DIV'),
                actual, expected;

            axis.isVertical = true;
            axis._changeLabelAreaPosition(labelContainer);

            actual = labelContainer.style.top;
            expected = '10px';

            expect(actual).toBe(expected);
        });

        it('벨류 타입 x축의 경우는 레이블을 tick의 중앙에 위치 시키기 위해 영역이 left -25px 이동 됩니다.', function() {
            var labelContainer = dom.create('DIV'),
                actual, expected;

            axis._changeLabelAreaPosition(labelContainer, 50);

            actual = labelContainer.style.left;
            expected = '-25px';

            expect(actual).toBe(expected);
        });
    });

    describe('_renderChildContainers()', function() {
        it('axis의 제목, 레이블, 틱 영역을 렌더링 합니다.', function() {
            var size = 300;
            var axisWidth = 300;
            var tickCount = 4;
            var categories = ['label1', 'label2', 'label3'];
            var actual;

            axis.data.labels = categories;
            axis.data.tickCount = 3;

            actual = axis._renderChildContainers(size, axisWidth, tickCount, categories);

            expect(actual.length).toBe(4);
            expect(actual[0].className).toBe('tui-chart-title-area rotation');
            expect(actual[1].className).toBe('tui-chart-label-area');
            expect(actual[2].className).toBe('tui-chart-tick-area');
            // isCenter가 true인 경우(yAxis 중앙정렬)에만 tick area가 추가됨
            expect(actual[4]).toBeUndefined();
        });

        it('line type(isVertical=true, aligned=true)의 경우 틱 영역은 제외합니다.', function() {
            var size = 300;
            var axisWidth = 300;
            var tickCount = 4;
            var categories = ['label1', 'label2', 'label3'];
            var actual;

            axis.isVertical = true;
            axis.data.aligned = true;

            actual = axis._renderChildContainers(size, axisWidth, tickCount, categories);

            expect(actual.length).toBe(2);
            expect(actual[0].className).toBe('tui-chart-title-area rotation');
            expect(actual[1].className).toBe('tui-chart-label-area');
        });
    });

    describe('_renderDividedAxis()', function() {
        it('분할 axis영역을 렌더링 합니다.', function() {
            var container = dom.create('DIV');

            axis.data = {
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4
            };

            boundsMaker.getDimension.and.returnValue({
                width: 50
            });

            axis._renderDividedAxis(container, 300);

            expect(container.childNodes[0].className).toBe('tui-chart-title-area rotation');
            expect(container.childNodes[1].className).toBe('tui-chart-label-area');
            expect(container.childNodes[2].className).toBe('tui-chart-tick-area');
            expect(container.childNodes[2].firstChild.className).toBe('tui-chart-tick-line');
            expect(container.childNodes[2].firstChild.style.width).toBe('151px');
            expect(container.childNodes[3].className).toBe('tui-chart-title-area rotation right');
            expect(container.childNodes[4].className).toBe('tui-chart-label-area');
            expect(container.childNodes[5].className).toBe('tui-chart-tick-area');
        });
    });

    describe('_renderNotDividedAxis()', function() {
        it('단독 axis영역을 렌더링 합니다.', function() {
            var container = dom.create('DIV');

            axis.data = {
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4
            };

            axis._renderNotDividedAxis(container, {
                width: 300,
                height: 50
            });

            expect(container.childNodes[0].className).toBe('tui-chart-title-area rotation');
            expect(container.childNodes[1].className).toBe('tui-chart-label-area');
            expect(container.childNodes[2].className).toBe('tui-chart-tick-area');
            expect(container.childNodes[2].firstChild.className).toBe('tui-chart-tick-line');
            expect(container.childNodes[2].firstChild.style.width).toBe('301px');
        });
    });

    describe('_renderAxisArea()', function() {
        it('axis의 전체 영역을 렌더링하면 className을 설정하고 dimension과 position을 설정합니다.', function() {
            var container = dom.create('DIV');

            boundsMaker.getDimension.and.returnValue({
                width: 300,
                height: 50
            });
            boundsMaker.getPosition.and.returnValue({
                top: 20
            });
            scaleModel.getAxisData.and.returnValue({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4
            });

            axis._renderAxisArea(container);

            expect(container.style.width).toBe('300px');
            expect(container.style.height).toBe('50px');
            expect(container.style.top).toBe('20px');
            expect(dom.hasClass(container, 'horizontal')).toBe(true);
        });

        it('divided이 true이면 _renderDividedAxis()를 수행하고 너비를 yAxis 너비만큼 늘려줍니다.', function() {
            var container = dom.create('DIV');


            spyOn(axis, '_renderNotDividedAxis');
            spyOn(axis, '_renderDividedAxis');
            boundsMaker.getDimension.and.callFake(function(type) {
                if (type === 'yAxis') {
                    return {
                        width: 80
                    };
                } else if (type === 'xAxis') {
                    return {
                        width: 300,
                        height: 50
                    };
                }
            });

            boundsMaker.getPosition.and.returnValue({
                top: 20
            });

            axis.componentName = 'xAxis';
            axis.options.divided = true;
            scaleModel.getAxisData.and.returnValue({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4
            });

            axis._renderAxisArea(container);

            expect(container.style.width).toBe('380px');
            expect(axis._renderNotDividedAxis).not.toHaveBeenCalled();
            expect(axis._renderDividedAxis).toHaveBeenCalled();
        });

        it('divided이 true가 아니면 _renderNotDividedAxis()를 수행합니다.', function() {
            var container = dom.create('DIV');


            spyOn(axis, '_renderNotDividedAxis');
            spyOn(axis, '_renderDividedAxis');
            boundsMaker.getDimension.and.callFake(function(type) {
                if (type === 'yAxis') {
                    return {
                        width: 80
                    };
                } else if (type === 'xAxis') {
                    return {
                        width: 300,
                        height: 50
                    };
                }
            });

            boundsMaker.getPosition.and.returnValue({
                top: 20
            });

            axis.componentName = 'xAxis';
            scaleModel.getAxisData.and.returnValue({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4
            });

            axis._renderAxisArea(container);

            expect(container.style.width).toBe('300px');
            expect(axis._renderNotDividedAxis).toHaveBeenCalled();
            expect(axis._renderDividedAxis).not.toHaveBeenCalled();
        });
    });

    describe('rerender()', function() {
        it('_isInvalidRightYAxis()가 false이면 container의 내용만 비우고 끝냅니다.', function() {
            axis.axisContainer = dom.create('DIV');
            axis.axisContainer.innerHTML = 'contents';

            spyOn(axis, '_isValidAxis').and.returnValues(false);

            axis.rerender();

            expect(axis.axisContainer.innerHTML).toBe('');
        });

        it('_isInvalidRightYAxis()가 false이서 this.options가 있을 경우 options의 내용을 갱신하면서 _renderAxisArea()를 수행합니다.', function() {
            var options = {
                title: 'ABC'
            };

            spyOn(axis, '_renderAxisArea');

            axis.axisContainer = dom.create('DIV');
            axis.options = {};
            axis.rerender({
                options: options
            });

            expect(axis.options).toEqual(options);
            expect(axis._renderAxisArea).toHaveBeenCalled();
        });
    });
});
