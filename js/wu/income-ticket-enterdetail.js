'use strict';

var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            detailInfo: {
                IncomeBill: {},
                IncomeBill_detailList: [],
                Income_hisList: []
            },
            goodDetail: {
                good: {},
                goodBills: []
            },
            btnType: '', //按钮状态
            id: '', //进项票id
            reason: '' //作废理由
        };
    },
    created: function created() {},
    mounted: function mounted() {
        this.id = window.location.href.split('=')[1];
        this.search();
    },

    watch: {},

    methods: {
        checkChange: function checkChange(v) {
            console.log(v);
        },
        back: function back() {
            // window.history.go(-1);

            window.location.href = 'income-ticket-enterrecord.html';
        },

        // 商品详情
        toGoodDetail: function toGoodDetail(item) {
            var _this = this;

            // console.log(item.pid)
            $http('/goods/selectGoodinfoByPid', { Pid: item.pid }).then(function (res) {
                if (res.data.resultCode == 200) {
                    // console.log(res);
                    _this.goodDetail = res.data.resultData;
                    _this.goodDetail.goodBills.map(function (val) {
                        val.billPaperType = gformaterBillPaperType(val.billPaperType);
                        val.billType = gformaterBillTypes(val.billType);
                    });
                }
            }).catch(function (err) {
                console.log(err);
            });
        },

        // 查询接口
        search: function search() {
            var _this2 = this;

            $http('/incomebill/findIncomeBillDetail', { IncomeBillId: this.id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    // console.log(res);
                    _this2.detailInfo = res.data.resultData;
                    _this2.detailInfo.Income_hisList.map(function (val) {
                        val.billType = gformaterBillType(val.billType);
                        val.isRed = false;
                    });
                    if (_this2.detailInfo.Income_hisList.length) {
                        _this2.detailInfo.Income_hisList[0].isRed = true;
                    }
                    _this2.detailInfo.IncomeBill.billPaperType = gformaterBillPaperType(_this2.detailInfo.IncomeBill.billPaperType);
                }
            }).catch(function (err) {
                console.log(err);
            });
        },

        // 删除接口
        del: function del() {
            var _this3 = this;

            var id = this.id;
            $http('/incomebill/deleteIncomeBillById', { incomebillId: id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this3.$message({
                        message: '操作成功！',
                        type: 'success'
                    });
                    _this3.searchBtn();
                    $('#delModal').modal('hide');
                }
            }).catch(function (err) {
                console.log(err);
            });
        },

        //编辑
        toEdit: function toEdit() {
            window.location.href = 'income-ticket-entering.html?from=detail&id=' + this.id;
        },

        // 撤销接口
        cancel: function cancel() {
            var _this4 = this;

            $http('/incomebill/revokeIncomeBillById', { incomebillId: this.id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this4.$message({
                        message: '操作成功！',
                        type: 'success'
                    });
                    $('#cancelModal').modal('hide');
                }
            }).catch(function (err) {
                console.log(err);
            });
        },


        // 申请作废接口
        void1: function void1() {
            var _this5 = this;

            if (this.reason) {
                var id = this.id;
                var data = {
                    incomebillId: id,
                    reason: this.reason
                };
                $http('/incomebill/cancelIncomeBillById', data).then(function (res) {
                    if (res.data.resultCode == 200) {
                        _this5.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                        _this5.search();
                        $('#voidModal').modal('hide');
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            } else {
                this.$message({
                    message: '作废原因未填写！',
                    type: 'warning'
                });
            }
        }
    }
});