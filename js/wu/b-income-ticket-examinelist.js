'use strict';

var app = new Vue({
    el: '#app',
    data: {
        auditingList: [],

        searchParam: {
            billPaperType: '',
            billStatus: ''
        },
        page: 1, //显示的是哪一页
        pageSize: 10, //每一页显示的数据条数
        total: 0, //记录总数

        itemData: {}, //点击每一项的数据

        loading: false,
        reason: '申请原因',
        maxDate: ''
    },
    created: function created() {
        var now = new Date();
        this.maxDate = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        this.setTime();
        this.getList();
    },
    mounted: function mounted() {
        var that = this;
        layui.use('laydate', function () {
            var laydate = layui.laydate;
            var nowTime = new Date();
            var a = laydate.render({
                elem: '#startTime',
                type: 'date',
                max: 'nowTime',
                format: 'yyyy-MM-dd',
                done: function done(value, date) {
                    that.searchParam.applyDateStart = value;
                    b.config.min = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
            var b = laydate.render({
                elem: '#endTime',
                type: 'date',
                max: 'nowTime',
                format: 'yyyy-MM-dd',
                done: function done(value, date) {
                    that.searchParam.applyDateEnd = value;
                    a.config.max = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });

            var c = laydate.render({
                elem: '#startTimel',
                type: 'date',
                max: 'nowTime',
                format: 'yyyy-MM-dd',
                done: function done(value, date) {
                    that.searchParam.billCreateDateStart = value;
                    d.config.min = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
            var d = laydate.render({
                elem: '#endTimel',
                type: 'date',
                max: 'nowTime',
                format: 'yyyy-MM-dd',
                done: function done(value, date) {
                    that.searchParam.billCreateDateEnd = value;
                    c.config.max = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
        });
    },


    watch: {
        msg: function msg(v) {
            console.log(v);
        }
    },

    methods: {
        setTime: function setTime() {
            var now = new Date();
            this.searchParam.applyDateEnd = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
            var startTime = new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
            this.searchParam.applyDateStart = startTime.getFullYear() + '-' + (startTime.getMonth() + 1 < 10 ? '0' : '') + (startTime.getMonth() + 1) + '-' + (startTime.getDate() < 10 ? "0" : "") + startTime.getDate();
        },

        // 控制若开始时间超过结束时间时，默认结束时间为开始时间，若结束时间早于开始时间，默认开始时间为结束时间
        selectTime: function selectTime() {
            // console.log('aa',this.searchParam.applyDateStart,this.searchParam.applyDateEnd)
            if (this.searchParam.applyDateStart && this.searchParam.applyDateEnd) {
                if (this.searchParam.applyDateStart > this.searchParam.applyDateEnd) {
                    this.searchParam.applyDateEnd = this.searchParam.applyDateStart;
                }
                if (this.searchParam.applyDateEnd < this.searchParam.applyDateStart) {
                    this.searchParam.applyDateStart = this.searchParam.applyDateEnd;
                }
            }
            if (this.searchParam.billCreateDateStart && this.searchParam.billCreateDateEnd) {
                if (this.searchParam.billCreateDateStart > this.searchParam.billCreateDateEnd) {
                    this.searchParam.billCreateDateEnd = this.searchParam.billCreateDateStart;
                }
                if (this.searchParam.billCreateDateEnd < this.searchParam.billCreateDateStart) {
                    this.searchParam.billCreateDateStart = this.searchParam.billCreateDateEnd;
                }
            }
        },
        formaterBillType: function formaterBillType(v) {
            return gformaterBillType(v);
        },
        formaterBillPaperType: function formaterBillPaperType(v) {
            return gformaterBillPaperType(v);
        },


        // 重置
        reset: function reset() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.searchParam)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var k = _step.value;

                    Vue.delete(this.searchParam, k);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            ;
            this.searchParam.billPaperType = '';
            this.searchParam.billStatus = '';
            this.setTime();
            this.pageInit();
            $('#pagination').pagination({
                refresh: true,
                pageSize: 10,
                pageNumber: 1,
                total: this.total
            });
            this.searchClick();
        },


        // 列表
        getList: async function getList() {
            var _this = this;

            var params = {
                applyDateStart: this.searchParam.applyDateStart || '',
                applyDateEnd: this.searchParam.applyDateEnd || '',
                billCreateDateStart: this.searchParam.billCreateDateStart || '',
                billCreateDateEnd: this.searchParam.billCreateDateEnd || '',
                inCompany: this.searchParam.inCompany || '',
                billCode: this.searchParam.billCode || '',
                memberName: this.searchParam.memberName || '',
                billStatus: this.searchParam.billStatus || '',
                billPaperType: this.searchParam.billPaperType || '',
                pagenum: this.page,
                pagesize: this.pageSize
            };
            var self = this;

            $http('/incomebill/service/findIncomeBillByParas', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    var data = res.data.resultData;
                    self.auditingList = data.list;
                    self.total = data.rowsTotal;
                    self.pageInit();
                }
            }).catch(function (err) {
                _this.loading = false;
            });
        },

        //查询列表
        searchClick: function searchClick() {
            this.getList();
        },


        //初始化分页
        pageInit: function pageInit() {
            var self = this;
            $('#pagination').pagination({
                total: this.total,
                onSelectPage: function onSelectPage(pageNumber, pageSize) {
                    // console.log(pageNumber, pageSize)
                    $(this).pagination('loading');
                    self.page = pageNumber;
                    self.pageSize = pageSize;
                    self.getList();
                    $(this).pagination('loaded');
                }
            });
        },
        adoptClick: function adoptClick(data) {
            this.itemData = data;
        },
        voidClick: function voidClick(data) {
            var _this2 = this;

            this.itemData = data;
            $http('/incomebill/HandleCancelIncomebillAndReturnReason', { id: data.id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    console.log(res);
                    _this2.reason = res.data.resultData;
                } else {
                    _this2.$message({
                        type: 'warning',
                        message: '申请原因请求失败！'
                    });
                }
            }).catch(function (err) {
                _this2.$message({
                    type: 'warning',
                    message: '申请原因请求失败！'
                });
            });
        },


        //审核通过未通过
        examineAdopt: async function examineAdopt(type) {
            var _this3 = this;

            //   console.log(this.itemData)
            if (!this.itemData.textarea && type == '0') {
                this.$message({
                    message: '不通过时必须输入原因！',
                    type: 'warning'
                });
                return;
            }
            var params = {
                type: type,
                incomebillID: this.itemData.id,
                reason: this.itemData.textarea || ''
                // memberId:''
            };
            $http('/IncomeBillAudit/adoptIncomeBillById', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    $('#adoptModal').modal('hide');
                    _this3.$message({
                        type: 'success',
                        message: '操作成功！'
                    });
                    _this3.getList();
                } else {
                    _this3.$message({
                        type: 'warning',
                        message: '操作失败！'
                    });
                }
            }).catch(function (err) {
                _this3.loading = false;
                _this3.$message({
                    type: 'warning',
                    message: '操作失败！'
                });
            });
        },


        //作废通过未通过
        voidAdopt: function voidAdopt(type) {
            var _this4 = this;

            if (!this.itemData.textarea) {
                if (this.itemData.billStatus == 6) {
                    this.$message({
                        message: '请填写审核原因！',
                        type: 'warning'
                    });
                } else {
                    this.$message({
                        message: '请填写作废原因！',
                        type: 'warning'
                    });
                }
                return;
            }
            var params = {
                type: type,
                incomebillId: this.itemData.id,
                reason: this.itemData.textarea || ''
            };
            $http('/incomebill/HandleCancelIncomebillById', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    $('#voidModal').modal('hide');
                    $('#voidModall').modal('hide');
                    _this4.$message({
                        type: 'success',
                        message: res.data.resultData
                    });
                    _this4.getList();
                } else {
                    _this4.loading = false;
                    _this4.$message({
                        type: 'warning',
                        message: res.data.resultData
                    });
                }
            }).catch(function (err) {
                _this4.loading = false;
                _this4.$message({
                    type: 'warning',
                    message: res.data.resultData
                });
            });
        },


        //详情按钮
        detailBtn: function detailBtn(data) {
            window.location.href = 'b-income-ticket-examinedetail.html?from=examine&id=' + data.id + '&billStatus=' + data.billStatus;
        }
    }
});