'use strict';

var app = new Vue({
    el: "#app",
    data: function data() {
        return {
            //按发票查询list
            searchList: {
                billcreatedate0: '', //开票时间0
                billcreatedate1: '', //开票时间1
                invoiceUnit: '', //发票单位
                billcode: '', //发票编码
                memberName: '', //委托会员
                billType: '1', //票据类型
                // memberId: '',//会员/业务员 编号
                billPaperType: '1' //发票类型
            }, //搜索
            shopSearchList: {
                name: '',
                spec: '',
                batch: '',
                warehouse: '',
                memberName: ''
            },

            invoiceDataList: [],
            shopDataList: [],

            page: 1, //显示的是哪一页
            pageSize: 10, //每一页显示的数据条数
            total: 0, //记录总数

            tabBtn: 1,
            loading: false,

            checkedItem: [],
            goodDetail: {
                good: {},
                goodBills: []
            }
        };
    },
    created: function created() {
        var params = {
            pagenum: this.page,
            pagesize: this.pageSize
        };
        this.goInvoice(Object.assign(this.searchList, params));
    },

    mounted: function mounted() {
        var that = this;
        layui.use('laydate', function () {
            var laydate = layui.laydate;
            var nowTime = new Date();
            var a = laydate.render({
                elem: '#startTime',
                type: 'date',
                format: 'yyyy-MM-dd',
                max: 'nowTime',
                done: function done(value, date) {
                    that.searchList.billcreatedate0 = value;
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
                    that.searchList.billcreatedate1 = value;
                    a.config.max = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
        });
    },

    methods: {
        toSearch: function toSearch(v) {
            var params = {
                pagenum: 1,
                pagesize: 10
            };

            this.pageInit();
            if (v == 1) {
                this.goInvoice(Object.assign(this.searchList, params));
            }
            if (v == 2) {
                this.goShop(Object.assign(this.shopSearchList, params));
            }
            $('#pagination').pagination({
                refresh: true,
                pageSize: 10,
                pageNumber: 1,
                total: this.total
            });
        },
        reset: function reset(v) {
            this.searchList = {
                billcreatedate0: '', //开票时间0
                billcreatedate1: '', //开票时间1
                invoiceUnit: '', //发票单位
                billcode: '', //发票编码
                memberName: '', //委托会员
                billType: '1', //票据类型
                billPaperType: '1' //发票类型,
            };
            this.shopSearchList = {
                name: '',
                spec: '',
                batch: '',
                warehouse: '',
                memberName: ''
            }, this.toSearch(v);
        },
        goInvoice: function goInvoice() {
            var _this = this;

            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.tabBtn = 1;
            $http('/Invoice/findInvoiceByParas', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this.loading = false;
                    var data = res.data.resultData;
                    _this.invoiceDataList = data.list;
                    _this.page = data.page;
                    _this.pageSize = data.rows;
                    _this.total = data.rowsTotal; //总条数
                    _this.invoiceDataList.map(function (val) {
                        if (val.billPaperType == '1') {
                            val.billPaperType = '增值税专用发票';
                        }
                        if (val.billPaperType == '2') {
                            val.billPaperType = '普通发票';
                        }
                        return val;
                    });
                    _this.pageInit();
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        goShop: function goShop() {
            var _this2 = this;

            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            // this.loading = true
            this.tabBtn = 2;
            $http('/queryBill/findBillsGroupByGoods', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this2.loading = false;
                    var data = res.data.resultData;
                    _this2.shopDataList = data.list;
                    _this2.page = data.page;
                    _this2.pageSize = data.rows;
                    _this2.total = data.rowsTotal; //总条数
                    // 1-增值税专用发票
                    // 2-普通发票
                    _this2.shopDataList.map(function (val) {
                        val.ticketlist.map(function (val1) {
                            if (val1.billPaperType == '1') {
                                val1.billPaperType = '增值税专用发票';
                            }
                            if (val1.billPaperType == '2') {
                                val1.billPaperType = '普通发票';
                            }
                        });
                        return val;
                    });
                    _this2.pageInit();
                }
            }).catch(function (err) {
                _this2.loading = false;
                console.log(err);
            });
        },
        pageInit: function pageInit() {
            var that = this;
            $('#pagination').pagination({
                total: that.total,
                onSelectPage: function onSelectPage(pageNumber, pageSize) {
                    console.log(pageNumber, pageSize, that.total);
                    that.page = pageNumber;
                    that.pageSize = pageSize;
                    that.searchClick(that.tabBtn);
                    $(this).pagination('loading');
                    $(this).pagination('loaded');
                }
            });
        },
        toDetail: function toDetail(id, ticketType) {
            // let id = item.id;
            if (ticketType == '进项票') {
                window.location.href = 'b-income-ticket-examinedetail.html?form=SalesmanQuery&id=' + id;
            }
            if (ticketType == '销项票') {
                window.location.href = '../Salesman/y_sales_review_details.html?id=' + id;
            }
        },

        // 商品详情弹窗接口
        detailDialog: function detailDialog(id) {
            var _this3 = this;

            $http('/goods/selectGoodinfoByPid', { Pid: id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this3.goodDetail = res.data.resultData;
                    _this3.goodDetail.goodBills.map(function (val) {
                        val.billPaperType = gformaterBillPaperType(val.billPaperType);
                        val.billType = gformaterBillTypes(val.billType);
                    });
                    $('#detailModal').modal('show');
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        searchClick: function searchClick(v) {
            var params = {
                pagenum: this.page,
                pagesize: this.pageSize
            };
            this.pageInit();
            if (v == 1) {
                this.goInvoice(Object.assign(this.searchList, params));
            }
            // console.log(v)
            if (v == 2) {
                // let params = {
                //     pagenum: this.page,
                //     pagesize: this.pageSize,
                // }
                this.goShop(Object.assign(this.shopSearchList, params));
            }
            // $('#pagination').pagination('refresh');
        },
        handleSelectionChange: function handleSelectionChange(val) {
            console.log(val);
            // this.shopDataList = {
            //     name:val
            // }
            this.checkedItem = val;
        },
        rowClick: function rowClick(row, event, column) {
            console.log(row, event, column);
            Array.prototype.remove = function (val) {
                var index = this.indexOf(val);
                if (index > -1) {
                    this.splice(index, 1);
                }
            };

            if (this.expandRows.indexOf(row.id) < 0) {
                this.expandRows = [];
                this.expandRows.push(row.id);
            } else {
                this.expandRows.remove(row.id);
            }
        },
        expandChange: function expandChange(row, expandedRows) {

            if (expandedRows.length > 1) {
                //只展开当前选项
                expandedRows.shift();
            }
        },
        exportExcell: function exportExcell(v) {
            var exportData = {};

            if (v == 1) {
                // 按发票导出
                if (this.checkedItem.length) {
                    var ids = [];
                    this.checkedItem.map(function (val) {
                        ids.push(val.id);
                    });
                    exportData.ids = ids.join(',');
                    exportData.billType = this.searchList.billType;
                } else {
                    exportData = {
                        billcreatedate0: this.searchList.billcreatedate0,
                        billcreatedate1: this.searchList.billcreatedate1,
                        invoiceUnit: this.searchList.invoiceUnit,
                        billcode: this.searchList.billcode,
                        billType: this.searchList.billType,
                        billpapertype: this.searchList.billPaperType,
                        memberName: this.searchList.memberName,
                        ids: null
                    };
                }
                console.log(exportData);
                window.location.href = 'http://47.100.247.219:9090/Invoice/outPutInvoiceExcel?' + Qs.stringify(exportData);
            } else if (v == 2) {
                // 按商品导出
                if (this.checkedItem.length) {
                    var _ids = [];
                    this.checkedItem.map(function (val) {
                        _ids.push(val.pid);
                    });
                    exportData.pid = _ids.join(',');
                } else {
                    exportData = {
                        name: this.shopSearchList.name,
                        batch: this.shopSearchList.batch,
                        spec: this.shopSearchList.spec,
                        warehouse: this.shopSearchList.warehouse,
                        memberName: this.shopSearchList.memberName,
                        pid: null
                    };
                }
                console.log(exportData);
                window.location.href = 'http://47.100.247.219:9090/queryBill/findBillsGroupFileByGoods?' + Qs.stringify(exportData);
            }
        }
    }

});