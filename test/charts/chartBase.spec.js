/**
 * @fileoverview test ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase.js'),
    Legend = require('../../src/js/legends/legend.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('ChartBase', function() {
    var chartBase;

    beforeEach(function() {
        chartBase = new ChartBase({}, {
            title: {
                fontSize: 14
            }
        }, {
            chart: {
                title: 'Chart Title'
            }
        });
    });

    describe('addComponent()', function() {
        it('legend 추가 후 추가 확인', function () {
            chartBase.addComponent('legend', Legend, {});
            expect(!!chartBase.componentMap.legend).toBeTruthy();
        });

        it('추가되지 않은 plot 확인', function () {
            expect(!!chartBase.componentMap.plot).toBeFalsy();
        });
    });

    describe('_renderTitle()', function() {
        it('타이틀 렌더링 확인', function () {
            var el = dom.create('DIV');
            chartBase._renderTitle(el);
            expect(el.firstChild.innerHTML).toEqual('Chart Title');
            expect(el.firstChild.style.fontSize).toEqual('14px');
        });
    });
});
