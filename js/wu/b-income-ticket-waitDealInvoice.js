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
            showmsg: false, //是否展示响应信息
            msg: '', //响应信息
            page: 1, //显示的是哪一页
            pageSize: 10, //每一页显示的数据条数
            total: 0, //记录总数
            show: false, //是否展示无数据提示信息

            // memberName:'',
            memberId: '',
            options: [],
            goodsList: [],

            statusList: [],
            rushInvoiceInfo: {
                connector: '', //联系人
                memberName: '', //会员名称
                connectPhone: '', //联系人手机
                SendTextMessag: []

            },
            isShowPhoneTip: false, //是否显示手机号码错误提示
            currY: '', //当前年份
            currM: '', //当前月份
            midValue: {}
        };
    },
    mounted: function mounted() {
        this.getmemberName();
    },

    watch: {},

    methods: {

        // 获取所有memberId
        getmemberName: function getmemberName() {
            var _this = this;

            // alert("oo");
            this.options.shift();
            console.log(this.options);
            $http('/BillProcessed/findAllVipforService').then(function (res) {
                console.log(res);
                if (res.data.resultCode == 200) {
                    _this.options = res.data.resultData;
                    _this.memberId = res.data.resultData[0].uid;
                    // this.memberName=res.data.resultData[0].memberName;
                    console.log(_this.memberId);
                    console.log(_this.options);

                    _this.currY = new Date().getFullYear();
                    _this.currM = new Date().getMonth() + 1;

                    var params = {
                        year: _this.currY,
                        month: _this.currM,
                        memberId: _this.memberId
                    };
                    _this.getReplaceOut();
                    _this.getMonthBillInfo(params);
                    _this.getFindDealingReplaceOut();
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        changeType: function changeType() {

            // alert(this.memberId);

            this.currY = new Date().getFullYear();
            this.currM = new Date().getMonth() + 1;

            var params = {
                year: this.currY,
                month: this.currM,
                memberId: this.memberId
            };
            this.getReplaceOut();
            this.getMonthBillInfo(params);
            this.getFindDealingReplaceOut();
            // return this.memberId;
            // alert("ii");
            // this.options =[];

        },


        //月份信息
        getReplaceOut: function getReplaceOut() {
            var _this2 = this;

            // alert('执行月份信息='+ JSON.stringify(this.options) + this.memberId)
            $http('/replaceout/findDealingMonthBill', { memberId: this.memberId }).then(function (res) {
                if (res.data.resultCode == 200) {
                    // console.log(res,123)
                    _this2.statusList = res.data.resultData.map(function (val) {
                        val.active = false;
                        val.dataList.map(function (val1) {
                            val1.isClick = false;
                        });
                        return val;
                    });

                    _this2.statusList[_this2.statusList.length - 1].active = true;
                    var i = void 0;
                    var listArr = _this2.statusList[_this2.statusList.length - 1].dataList;
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
                    memberId: this.memberId
                };
                this.getMonthBillInfo(params);

                this.getFindDealingReplaceOut();
            }
        },

        //按月统计核销数据
        getMonthBillInfo: function getMonthBillInfo(params) {
            var _this3 = this;

            // alert("统计");
            // alert('统计='+ JSON.stringify(params));
            $http('/replaceout/findDealingMonthBillInfo', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this3.midValue = res.data.resultData;
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        getFindDealingReplaceOut: function getFindDealingReplaceOut() {
            var _this4 = this;

            // alert("tj");
            this.show = false;
            var params = {
                memberId: this.memberId, //会员/业务员 编号
                clientType: null, //   客户端类型
                pagenum: this.page, //第几页
                pagesize: this.pageSize, //每页多少条
                year: this.currY, //年
                month: this.currM //月

            };
            $http('/replaceout/findDealingReplaceOut', params).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this4.goodsList = res.data.resultData.list;
                    _this4.total = res.data.resultData.rowsTotal;
                    _this4.pageInit();
                }
            }).catch(function (err) {
                console.log(err);
            });
        },


        //催票
        cuiInvoice: function cuiInvoice() {
            var _this5 = this;

            var tes = $("#change option:selected").text();
            // console.log(tes);
            // $("member").val(tes);
            this.rushInvoiceInfo = {
                connector: '',
                memberName: '',
                connectPhone: '',
                SendTextMessag: ''
            };
            var flag = true;
            this.checkedItem.map(function (val) {
                _this5.checkedItem.map(function (val1) {
                    if (val1.warehouse != val.warehouse) {
                        flag = false;
                        return;
                    }
                });
            });
            if (flag) {
                var sendText = [];
                this.checkedItem.map(function (val) {
                    _this5.rushInvoiceInfo.memberName = tes;

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
            var _this6 = this;

            // console.log(this.rushInvoiceInfo)
            $http('/replaceout/confirmSendTextMessag', this.rushInvoiceInfo).then(function (res) {
                if (res.data.resultCode == 200) {
                    console.log(res);
                    // this.showmsg = true;
                    // this.msg = res.data.message;
                    _this6.$message({
                        message: res.data.message,
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
            window.location.href = '../wu/b-income-ticket-entering.html';
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
            window.location.href = 'http://47.100.247.219:9090/replaceout/FindReplaceoutExcelByMonth?' + Qs.stringify(data);
        }
    }
})