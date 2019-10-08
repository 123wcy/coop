'use strict';

var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            allcheckbox: false, //全选按钮
            disabled: true, //按钮是否可用
            isShow: false, //是否显示确定按钮
            isSelect: false, //是否选中行
            checkedItem: [], //已选择项
            page: 1, //显示的是哪一页
            pageSize: 10, //每一页显示的数据条数
            total: 0, //记录总数
            show: false, //是否展示无数据提示信息

            goodsList: [],
            statusList: [],
            rushInvoiceInfo: {
                connector: '', //联系人
                memberName: '', //会员名称
                connectPhone: '', //联系人手机
                SendTextMessag: ''
                // {
                //     goodsName:'', //商品名称
                //     goodsSpec:'', // 商品规格
                //     cgcontractNumber:'',//采购合同号
                //     startTime:'',//合同签订日期
                // }

            },
            isShowPhoneTip: false, //是否显示手机号码错误提示
            currY: '', //当前年份
            currM: '', //当前月份
            midValue: {}
        };
    },
    created: function created() {},
    mounted: function mounted() {
        this.currY = new Date().getFullYear();
        this.currM = new Date().getMonth() + 1;
        var params = {
            year: this.currY,
            month: this.currM,
            memberId: 'U20180003'
        };
        this.getReplaceOut();
        this.getMonthBillInfo(params);
        this.getFindDealingReplaceOut();
    },

    watch: {},

    methods: {
        //月份信息
        getReplaceOut: function getReplaceOut() {
            var _this = this;

            $http('/replaceout/findDealingMonthBill', { memberId: 'U20180003' }).then(function (res) {
                if (res.data.resultCode == 200) {
                    // console.log(res,123)
                    _this.statusList = res.data.resultData.map(function (val) {
                        val.active = false;
                        val.dataList.map(function (val1) {
                            val1.isClick = false;
                        });
                        return val;
                    });

                    _this.statusList[_this.statusList.length - 1].active = true;
                    var i = void 0;
                    var listArr = _this.statusList[_this.statusList.length - 1].dataList;
                    for (var j = listArr.length - 1; j < listArr.length; j--) {
                        if (listArr[j].status != '——') {
                            listArr[j].isClick = true;
                            break;
                        }
                    }
                    // console.log(this.statusList)
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        computedStatus: function computedStatus(v) {
            if (v == '未核销') {
                return 'not-wait-off';
            }
            if (v == '——') {
                return 'not-allowed';
            }
        },
        statusClick: function statusClick(statusData, index, v) {
            if (v.status != '——') {
                this.statusList.map(function (val) {
                    val.dataList.map(function (val1) {
                        if (val1.time == v.time) {
                            val1.isClick = true;
                        } else {
                            val1.isClick = false;
                        }
                    });
                });
                this.currY = statusData.year;
                this.currM = v.time.split('-')[1];
                var params = {
                    year: this.currY,
                    month: this.currM,
                    memberId: 'U20180003'
                };
                this.getMonthBillInfo(params);
                this.getFindDealingReplaceOut();
            }
        },

        //按月统计核销数据
        getMonthBillInfo: function getMonthBillInfo(params) {
            var _this2 = this;

            $http('/replaceout/findDealingMonthBillInfo', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this2.midValue = res.data.resultData;
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        getFindDealingReplaceOut: function getFindDealingReplaceOut() {
            var _this3 = this;

            this.show = false;
            var params = {
                memberId: 'U20180003', //会员/业务员 编号
                clientType: null, //   客户端类型
                pagenum: this.page, //第几页
                pagesize: this.pageSize, //每页多少条
                year: this.currY, //年
                month: this.currM //月

            };
            $http('/replaceout/findDealingReplaceOut', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this3.goodsList = res.data.resultData.list;
                    _this3.total = res.data.resultData.rowsTotal;
                    _this3.pageInit();
                }
            }).catch(function (err) {
                console.log(err);
            });
        },


        //催票
        cuiInvoice: function cuiInvoice() {
            var _this4 = this;

            this.rushInvoiceInfo = {
                connector: '',
                memberName: '',
                connectPhone: '',
                SendTextMessag: ''
            };
            var flag = true;
            this.checkedItem.map(function (val) {
                _this4.checkedItem.map(function (val1) {
                    if (val1.warehouse != val.warehouse) {
                        flag = false;
                        return;
                    }
                });
            });
            if (flag) {
                var sendText = [];
                this.checkedItem.map(function (val) {
                    _this4.rushInvoiceInfo.memberName = val.memberName;

                    sendText.push({
                        goodsName: val.goodsName,
                        goodsSpec: val.goodsSpec,
                        cgContractNumber: val.cgContractNumber,
                        startTime: val.startTime
                    });
                });
                // console.log(typeof sendText,'aa')
                this.rushInvoiceInfo.SendTextMessag = JSON.stringify(sendText);
                $("#cuiModal").modal('show');
            } else {
                $('#notCuiModal').modal('show');
            }
        },


        //确认催票联系人
        contactClick: function contactClick() {
            var _this5 = this;

            // console.log(this.rushInvoiceInfo)
            $http('/replaceout/confirmSendTextMessag', this.rushInvoiceInfo).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this5.$message({
                        message: '催票成功！',
                        type: 'success'
                    });
                    $("#cuiModal").modal('hide');
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        phoneBlur: function phoneBlur() {
            if (!/^1(3|4|5|7|8)\d{9}$/.test(this.rushInvoiceInfo.connectPhone)) {
                this.isShowPhoneTip = true;
                return false;
            } else {
                this.isShowPhoneTip = false;
            }
        },
        pageInit: function pageInit() {
            var that = this;
            $('#pagination').pagination({
                total: that.total,
                onSelectPage: function onSelectPage(pageNumber, pageSize) {
                    console.log(pageNumber, pageSize, that.total);
                    that.page = pageNumber;
                    that.pageSize = pageSize;
                    that.getFindDealingReplaceOut();
                    $(this).pagination('loading');
                    $(this).pagination('loaded');
                }
            });
        },
        allCheck: function allCheck() {
            if (this.allcheckbox && this.goodsList.length) {
                this.disabled = false;
                this.goodsList = this.goodsList.map(function (val) {
                    val.checked = true;
                    return val;
                });
                this.checkedItem = this.goodsList;
            } else {
                this.disabled = true;
                this.goodsList = this.goodsList.map(function (val) {
                    val.checked = false;
                    return val;
                });
                this.checkedItem = [];
            }
        },

        //单选
        singleCheck: function singleCheck(item) {
            var a = this.goodsList.filter(function (val) {
                return val.checked;
            });
            this.checkedItem = a;
            if (a.length !== this.goodsList.length) {
                this.allcheckbox = false;
            } else {
                this.allcheckbox = true;
            }

            for (var i = 0; i < this.goodsList.length; i++) {
                if (this.goodsList[i].checked) {
                    this.disabled = false;
                    return;
                } else {
                    this.disabled = true;
                }
            }
        },
        invoiceInput: function invoiceInput() {
            // sessionStorage.setItem('goodsList',JSON.stringify(this.checkedItem))
            window.location.href = 'income-ticket-entering.html';
        },
        onexport: function onexport() {

            var exportData = {};
            var ids = [];
            this.checkedItem.map(function (val) {
                ids.push(val.id);
            });
            exportData.Ids = ids.join(',');
            exportData.year = this.currY;
            exportData.month = this.currM;

            this.exportExcell(exportData);
        },


        //导出接口
        exportExcell: function exportExcell(data) {
            window.location.href = 'http://47.100.247.219:9090/incomebill/replaceout/FindReplaceoutExcelByMonth?' + Qs.stringify(data);
        }
    }
});