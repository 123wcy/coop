'use strict';

var app = new Vue({
    el: "#app",
    data: function data() {
        return {
            allcheckbox: false, //全选按钮
            checkedItem: [], //已选择项
            page: 1, //显示的是哪一页
            pageSize: 10, //每一页显示的数据条数
            total: 0, //记录总数
            show: false, //是否展示无数据提示信息
            searchList: {
                applyDateStart: '', //录入开始时间
                applyDateEnd: '', //录入结束时间
                billCreateDateStart: '', //开票开始时间
                billCreateDateEnd: '', //开票结束时间
                billStatus: '', //发票状态
                billPaperType: '', //发票类型
                inCompany: '', //来票单位
                billCode: '', //发票编号
                pagenum: '1', //当前页码
                pagesize: '10', //每页条数
                clientType: null, //客户端类型
                // memberId: 'U20180003',//会员UID
                memberName: ''
            },
            enterrecordList: [],
            delCode: '', //删除发票编号
            delItem: '', //删除发票信息
            reason: '申请原因',
            voidItem: {}, //作废发票信息
            maxDate: '',
            itemData: {} //点击每一项的数据
        };
    },
    created: function created() {
        var now = new Date();
        this.maxDate = now.getFullYear() + "/" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "/" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        this.setTime();
    },
    mounted: function mounted() {
        this.searchBtn();
        this.pageInit();

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
                    that.searchList.applyDateStart = value;
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
                    that.searchList.applyDateEnd = value;
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
                format: 'yyyy-MM-dd',
                max: 'nowTime',
                done: function done(value, date) {
                    that.searchList.billCreateDateStart = value;
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
                    that.searchList.billCreateDateEnd = value;
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

    },
    methods: {
        setTime: function setTime() {
            var now = new Date();
            this.searchList.applyDateEnd = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
            var startTime = new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
            this.searchList.applyDateStart = startTime.getFullYear() + '-' + (startTime.getMonth() + 1 < 10 ? '0' : '') + (startTime.getMonth() + 1) + '-' + (startTime.getDate() < 10 ? "0" : "") + startTime.getDate();
        },
        formaterBillType: function formaterBillType(v) {
            return gformaterBillType(v);
        },
        formaterBillPaperType: function formaterBillPaperType(v) {
            return gformaterBillPaperType(v);
        },
        pageInit: function pageInit() {
            var that = this;
            $('#pagination').pagination({
                total: that.total,
                onSelectPage: function onSelectPage(pageNumber, pageSize) {
                    // console.log(pageNumber, pageSize, that.total)

                    that.searchList.pagenum = pageNumber;
                    that.searchList.pagesize = pageSize;
                    that.searchBtn();
                    $(this).pagination('loading');
                    $(this).pagination('loaded');
                }
            });
        },
        allCheck: function allCheck() {
            if (this.allcheckbox) {
                this.enterrecordList = this.enterrecordList.map(function (val) {
                    val.checked = true;
                    return val;
                });
                this.checkedItem = this.enterrecordList;
            } else {
                this.enterrecordList = this.enterrecordList.map(function (val) {
                    val.checked = false;
                    return val;
                });
                this.checkedItem = [];
            }
        },

        //单选
        singleCheck: function singleCheck(item) {
            var a = this.enterrecordList.filter(function (val) {
                return val.checked;
            });
            this.checkedItem = a;
            if (a.length !== this.enterrecordList.length) {
                this.allcheckbox = false;
            } else {
                this.allcheckbox = true;
            }
        },


        //删除
        toDel: function toDel(item) {
            this.delItem = item;
        },


        // 删除接口
        del: function del() {
            var _this2 = this;

            var id = this.delItem.id;
            $http('/incomebill/deleteIncomeBillById', { incomebillId: id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this2.$message({
                        message: '操作成功！',
                        type: 'success'
                    });
                    $('#delModal').modal('hide');
                    _this2.searchBtn();
                }
            }).catch(function (err) {
                console.log(err);
            });
        },


        //编辑
        toEdit: function toEdit(item) {
            // 到进项票录入查询接口
            // sessionStorage.setItem('recordDetail', JSON.stringify(item))
            window.location.href = '../wu/b-income-ticket-entering.html?id=' + item.id;
        },


        // 详情
        toDetail: function toDetail(item) {
            // console.log(item)//到详情查询接口
            // let id = item.id;
            window.location.href = "../wu/b-income-ticket-examinedetail.html?form=enterrecord&id=" + item.id + "&billStatus=" + item.billStatus;
        },
        adoptClick: function adoptClick(data) {
            this.itemData.textarea="";
            this.itemData = data;
        },
        voidClick: function voidClick(data) {
            this.itemData.textarea="";
            var _this3 = this;

            this.itemData = data;
            $http('/incomebill/HandleCancelIncomebillAndReturnReason', { id: data.id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    console.log(res);
                    _this3.reason = res.data.resultData;
                } else {
                    _this3.$message({
                        type: 'warning',
                        message: '申请原因请求失败！'
                    });
                }
            }).catch(function (err) {
                _this3.$message({
                    type: 'warning',
                    message: '申请原因请求失败！'
                });
            });
        },


        //审核通过未通过
        examineAdopt: function examineAdopt(type) {
            var _this4 = this;

            return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var params;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!(!_this4.itemData.textarea && type == '0')) {
                                    _context.next = 3;
                                    break;
                                }

                                _this4.$message({
                                    message: '不通过时必须输入原因！',
                                    type: 'warning'
                                });
                                return _context.abrupt("return");

                            case 3:
                                params = {
                                    type: type,
                                    incomebillID: _this4.itemData.id,
                                    reason: _this4.itemData.textarea || ''
                                    // memberId:''
                                };

                                $http('/IncomeBillAudit/adoptIncomeBillById', params).then(function (res) {
                                    if (res.data.resultCode == 200) {
                                        $('#adoptModal').modal('hide');
                                        _this4.$message({
                                            type: 'success',
                                            message: '操作成功！'
                                        });
                                        _this4.searchBtn();
                                    } else {
                                        _this4.$message({
                                            type: 'warning',
                                            message: '操作失败！'
                                        });
                                    }
                                }).catch(function (err) {
                                    _this4.loading = false;
                                    _this4.$message({
                                        type: 'warning',
                                        message: '操作失败！'
                                    });
                                });

                            case 5:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, _this4);
            }))();
        },


        //作废通过未通过
        voidAdopt: function voidAdopt(type) {
            var _this5 = this;

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
                    _this5.$message({
                        type: 'success',
                        message: res.data.resultData
                    });
                    _this5.searchBtn();
                } else {
                    _this5.loading = false;
                    _this5.$message({
                        type: 'warning',
                        message: res.data.resultData
                    });
                }
            }).catch(function (err) {
                _this5.loading = false;
                _this5.$message({
                    type: 'warning',
                    message: res.data.resultData
                });
            });
        },


        // 查询接口
        searchBtn: function searchBtn() {
            var _this = this;
            _this.allcheckbox = false;
            _this.show = false;
            $http('/incomebill/findIncomeBillByParas1', this.searchList).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this.enterrecordList = res.data.resultData.list;
                    _this.total = res.data.resultData.rowsTotal; //总页码
                    _this.pageInit();
                }
            }).catch(function (err) {
                console.log(err);
            });
        },


        // 返回
        back: function back() {
            window.location.href = '../wu/b-income-ticket-waitenter.html';
        },


        // 重置
        reset: function reset() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.searchList)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var k = _step.value;

                    Vue.delete(this.searchList, k);
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
            this.searchList.billStatus = "";
            this.searchList.billPaperType = "";
            this.setTime();
            this.pageInit();
            $('#pagination').pagination({
                refresh: true,
                pageSize: 10,
                pageNumber: 1,
                total: this.total
            });
            this.searchBtn();
        },


        // 导出
        onexport: function onexport() {
            var exportData = {};
            if (!this.checkedItem.length) {
                exportData.applyDateStart = this.searchList.applyDateStart;
                exportData.applyDateEnd = this.searchList.applyDateEnd;
                exportData.billCreateDateStart = this.searchList.billCreateDateStart;
                exportData.billCreateDateEnd = this.searchList.billCreateDateEnd;
                exportData.billStatus = this.searchList.billStatus;
                exportData.inCompany = this.searchList.inCompany;
                exportData.billCode = this.searchList.billCode;
                exportData.billPaperType = this.searchList.billPaperType;
                exportData.id = null;
                exportData.clientType = null;

                exportData.memberName = this.searchList.memberName;
            } else {
                var ids = [];
                this.checkedItem.map(function (val) {
                    ids.push(val.id);
                });
                exportData.Ids = ids.join(',');
            }
            console.log(exportData);
            window.location.href = 'http://47.100.247.219:9090/incomebill/importIncomeBillToExcels?' + Qs.stringify(exportData);
        }
    }
})