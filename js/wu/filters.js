'use strict';

Vue.filter('moneyFilter', function (value) {
    return value + ' \u5143';
});

Vue.filter('taxRateFilter', function (value) {
    return value + ' %';
});