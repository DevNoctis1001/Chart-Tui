var SeriesView = require('../../src/js/views/seriesView.js'),
    SeriesModel = require('../../src/js/models/seriesModel.js');

describe('test seriesView', function() {
    var data = {
            values: [[20], [40]],
            colors: ['blue'],
            scale: {min: 0, max: 160 },
            lastColors: ['red', 'ornage', 'yellow', 'green'],
        },
        options = {
            bars: 'vertical',
            chartType: 'bar'
        },
        size = {
            width: 200,
            height: 100
        },
        seriesModel = new SeriesModel(data);

    it('test render', function() {
        var seriesView = new SeriesView(seriesModel, options),
            elSeries = seriesView.render(size);

        expect(elSeries.className).toEqual('series-area');
        expect(elSeries.style.width).toEqual('200px');
        expect(elSeries.style.height).toEqual('100px');
        expect(!!elSeries.firstChild).toBeTruthy();
    });

});