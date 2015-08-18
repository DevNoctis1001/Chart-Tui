/**
 * @fileoverview test legend
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Legend = require('../../src/js/legends/legend.js');

describe('test Legend', function() {
    var legendLabels = [
            'legend1',
            'legend2'
        ],
        theme = {
            label: {
                fontSize: 12
            },
            colors: ['red', 'orange']
        },
        bound = {
            position: {
                top: 20,
                right: 10
            }
        },
        compareHtml = '<div class="ne-chart-legend">' +
            '<div class="ne-chart-legend-rect" style="background-color:red;margin-top:2px"></div>' +
            '<div class="ne-chart-legend-label" style="height:19px">legend1</div>' +
            '</div>' +
            '<div class="ne-chart-legend">' +
            '<div class="ne-chart-legend-rect" style="background-color:orange;margin-top:2px"></div>' +
            '<div class="ne-chart-legend-label" style="height:19px">legend2</div>' +
            '</div>',
        legend;

    beforeEach(function() {
        legend = new Legend({
            legendLabels: legendLabels,
            theme: theme,
            bound: bound
        });
    });

    it('render()', function() {
        var elLegend = legend.render(),
            elTemp = document.createElement('DIV'),
            tempChildren;

        elTemp.innerHTML = compareHtml;
        elTemp.style.top = '20px';
        elTemp.style.right = '10px';
        elTemp.style.fontSize = '12px';

        tempChildren = elTemp.childNodes;

        expect(elLegend.className).toEqual('ne-chart-legend-area');
        expect(elLegend.style.cssText).toEqual(elTemp.style.cssText);

        ne.util.forEachArray(elLegend.childNodes, function(child, index) {
            var elTempChild = tempChildren[index];
            expect(child.firstChild.cssText).toEqual(elTempChild.firstChild.cssText);
            expect(child.lastChild.cssText).toEqual(elTempChild.lastChild.cssText);
        });
    });

    it('renderLabelTheme()', function() {
        var el = document.createElement('DIV');
        legend._renderLabelTheme(el, {
            fontSize: 14,
            color: 'red'
        });
        expect(el.style.fontSize).toEqual('14px');
        expect(el.style.color).toEqual('red');
    });
});