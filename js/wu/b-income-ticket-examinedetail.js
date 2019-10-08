'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var app = new Vue({
    el: '#app',
    data: function data() {
        var _ref;

        return _ref = {
            reason: '申请原因',
            IncomeBill: {}, //输入框
            IncomeBill_detailList: {}, //最下面的每条表格记录
            Income_hisList: {}, //最上方的字段
            member: {} }, _defineProperty(_ref, 'IncomeBill', []), _defineProperty(_ref, 'goodDetail', {
            good: {},
            goodBills: []
        }), _ref;
    },
    created: function created() {},
    mounted: function mounted() {
        var param = Qs.parse(window.location.search.replace(/^\?/, ''));
        this.examineDetail(param.id);
    },

    watch: {},
    methods: {
        //1-保存未提交，2-提交审核中，3-已撤销，4-审核通过，5-审核未通过，6-待作废，7-作废通过，8-作废未通过

        formaterBillType: function formaterBillType(v) {
            return gformaterBillType(v);
        },
        formaterBillPaperType: function formaterBillPaperType(v) {
            return gformaterBillPaperType(v);
        },
        toDetail: function toDetail(item) {
            var _this = this;
            console.log(item.pid);
            $http('/goods/selectGoodinfoByPid', { Pid: item.pid }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this.goodDetail = res.data.resultData;
                    console.log(res.data.resultData);
                    _this.goodDetail.goodBills.map(function (val) {
                        val.billPaperType = gformaterBillPaperType(val.billPaperType);
                        val.billType = gformaterBillTypes(val.billType);
                    });
                    console.log(_this.goodDetail);
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        goBack: function goBack() {
            if (window.location.href.indexOf('from=examine') != -1) {
                window.location.href = 'b-income-ticket-examinelist.html';
            } else if (window.location.href.indexOf('form=SalesmanQuery') != -1) {
                window.location.href = 'InvoiceManagementSalesmanQuery.html';
            } else {
                window.location.href = '../Salesman/b-income-ticket-enterrecord.html';
            }
        },
        examineDetail: function examineDetail(id) {
            var _this2 = this;

            var self = this;
            $http('/incomebill/findIncomeBillDetail', { IncomeBillId: id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    var data = res.data.resultData;
                    self.IncomeBill = data.IncomeBill;
                    self.IncomeBill_detailList = data.IncomeBill_detailList;
                    self.Income_hisList = data.Income_hisList;
                    self.member = data.member;
                    self.Income_hisList.map(function (val) {
                        val.billType = gformaterBillType(val.billType);
                        val.isRed = false;
                    });
                    if (self.Income_hisList.length) {
                        self.Income_hisList[0].isRed = true;
                    }
                    self.IncomeBill.billPaperType = gformaterBillPaperType(self.IncomeBill.billPaperType);
                }
            }).catch(function (err) {
                _this2.loading = false;
            });
        },
        voidClick: function voidClick() {
            var _this3 = this;

            $http('/incomebill/HandleCancelIncomebillAndReturnReason', { id: this.IncomeBill.id }).then(function (res) {
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

            if (!this.IncomeBill.textarea && type == '0') {
                this.$message({
                    message: '不通过时必须输入原因！',
                    type: 'warning'
                });
                return;
            }
            var params = {
                type: type,
                incomebillID: this.IncomeBill.id,
                reason: this.IncomeBill.textarea
            };
            $http('/IncomeBillAudit/adoptIncomeBillById', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    if (res.data.resultCode == 200) {
                        if (res.data.resultCode == 200) {
                            $('#adoptModal').modal('hide');
                            _this4.$message({
                                type: 'success',
                                message: '操作成功！'
                            });
                            _this4.examineDetail(_this4.IncomeBill.id);
                        } else {
                            _this4.loading = false;
                            _this4.$message({
                                type: 'success',
                                message: '操作成功！'
                            });
                        }
                    }
                } else {
                    _this4.loading = false;
                    _this4.$message({
                        type: 'success',
                        message: '操作成功！'
                    });
                    _this4.loading = false;
                }
            }).catch(function (err) {
                _this4.loading = false;
            });
        },


        //作废通过未通过
        voidAdopt: function voidAdopt(type) {
            var _this5 = this;

            if (!this.IncomeBill.textarea) {
                if (this.IncomeBill.billStatus == 6) {
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
                incomebillId: this.IncomeBill.id,
                reason: this.IncomeBill.textarea
            };
            $http('/incomebill/HandleCancelIncomebillById', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    if (res.data.resultCode == 200) {
                        $('#voidModall').modal('hide');
                        $('#voidModal').modal('hide');
                        _this5.$message({
                            type: 'success',
                            message: '操作成功！'
                        });
                        // this.getList()
                        _this5.examineDetail(_this5.IncomeBill.id);
                    } else {
                        _this5.loading = false;
                        _this5.$message({
                            type: 'success',
                            message: '操作成功！'
                        });
                    }
                }
            }).catch(function (err) {
                _this5.$message({
                    type: 'success',
                    message: '操作成功！'
                });
                _this5.loading = false;
            });
        },


        //编辑
        editClick: function editClick() {
            var billStatus = this.gGetQueryString('billStatus');
            if (window.location.href.indexOf('form=enterrecord') != -1) {
                window.location.href = 'b-income-ticket-entering.html?form=enterrecord&id=' + this.IncomeBill.id + '&billStatus=' + billStatus;
            } else {
                window.location.href = 'b-income-ticket-entering.html?from=detail&id=' + this.IncomeBill.id + '&billStatus=' + billStatus;
            }
        }
    }

});