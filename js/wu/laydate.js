'use strict';

layui.use('laydate', function () {
    var laydate = layui.laydate;
    var nowTime = new Date();
    var startTime = laydate.render({
        elem: '#startTime',
        type: 'date',
        format: 'yyyy/MM/dd', //可任意组合
        max: 'nowTime', //默认最大值为当前日期
        isInitValue: true,
        done: function done(value, date) {
            this.searchList.billcreatedate0 = value;
            endTime.config.min = {
                year: date.year,
                month: date.month - 1, //关键
                date: date.date
            };
        }
    });
    var endTime = laydate.render({
        elem: '#endTime',
        type: 'date',
        max: 'nowTime',
        format: 'yyyy/MM/dd',
        isInitValue: true,
        done: function done(value, date) {

            startTime.config.max = {
                year: date.year,
                month: date.month - 1, //关键
                date: date.date
            };
        }
    });
    var startTimel = laydate.render({
        elem: '#startTimel',
        type: 'date',
        format: 'yyyy/MM/dd',
        isInitValue: true,
        max: 'nowTime', //默认最大值为当前日期
        done: function done(value, date) {
            endTimel.config.min = {
                year: date.year,
                month: date.month - 1, //关键
                date: date.date
            };
        }
    });
    var endTimel = laydate.render({
        elem: '#endTimel',
        type: 'date',
        max: 'nowTime',
        format: 'yyyy/MM/dd',
        isInitValue: true,
        done: function done(value, date) {
            startTimel.config.max = {
                year: date.year,
                month: date.month - 1, //关键
                date: date.date
            };
        }
    });
});