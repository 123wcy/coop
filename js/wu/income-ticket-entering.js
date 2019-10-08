'use strict';

var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            // applyCount:'',//商品重量
            // applyTotalPrice:'',//商品金额
            incomeMoney: '', //进项票总额
            goodsList: [],
            enteringList: {
                id: '',
                inCompany: '', //来票单位
                billPaperType: '1', //发票类型
                taxRate: '', //税率
                billCreateDate: '', //开票时间
                billCode: '', //发票编号
                billTotalAccount: '', //发票总额
                openBank: '', //开户银行
                openAccount: '',
                taxpayerCode: '',
                lpAddress: '',
                phone: '',
                customerUid: ''

            },
            submitData: {
                incomebilldetails: '',
                incomebill: '',
                buttonType: ''
                // customerUid: 'qwe12',
                // customerId: ''
            }, //提交数据
            maxDate: '',
            hideBtn: true
            // goodsListCopy: []//编辑入口复制出的商品信息

        };
    },
    created: function created() {
        var now = new Date();
        this.maxDate = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        if (sessionStorage.getItem("goodsList") && window.location.href.indexOf('?') == -1) {
            this.goodsList = JSON.parse(sessionStorage.getItem("goodsList"));
            this.enteringList.inCompany = this.goodsList[0].supply;
            if (sessionStorage.getItem("editData")) {
                this.hideBtn = false;
                var data = JSON.parse(sessionStorage.getItem("editData"));
                this.getEditData(data);
            } else {
                var id = this.goodsList[0].customerId;
                this.searchCustomer(id);
                // let id = this.goodsList[0].customerId;
                // this.searchCustomer(id);
                // this.submitData.customerUid =  id;
            }
        }
        if (window.location.href.indexOf('id=') != -1 && window.location.href.indexOf('companyName=') == -1) {
            var _id = this.gGetQueryString("id");
            this.hideBtn = false;
            this.editInvoice(_id);
        }
        if (window.location.href.indexOf('companyName=') !== -1) {
            if (sessionStorage.getItem("goodsList")) {
                this.goodsList = JSON.parse(sessionStorage.getItem("goodsList"));
                var param = Qs.parse(window.location.search.replace(/^\?/, ''));
                this.enteringList.inCompany = param.companyName;
                var _id2 = param.uid;
                this.searchCustomer(_id2);
                console.log(this.goodsList);
            } else {
                if (sessionStorage.getItem("editData")) {
                    this.hideBtn = false;
                    var _param = Qs.parse(window.location.search.replace(/^\?/, ''));
                    this.enteringList.inCompany = _param.companyName;
                    var _id3 = _param.uid;
                    this.searchCustomer(_id3);
                }
            }
        }
    },
    mounted: function mounted() {
        this.countIncomeMoney();
        var that = this;
        layui.use('laydate', function () {
            var laydate = layui.laydate;
            var nowTime = new Date();
            laydate.render({
                elem: '#startTime',
                type: 'date',
                max: 'nowTime',
                // format: 'yyyy-MM-dd',
                done: function done(value) {
                    that.enteringList.billCreateDate = value;
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
        //商品金额
        productMoneyFun: function productMoneyFun(item) {
            var _this = this;

            var total = void 0;
            this.goodsList.map(function (val) {
                if (val.id == item.id) {
                    if (+item.billWeight <= +item.outweight) {
                        total = item.billWeight * item.price;
                        item.billMoney = total.toFixed(2);
                        _this.countBillTotal();
                    } else {
                        item.billWeight = item.outweight;
                        total = item.billWeight * item.price;
                        item.billMoney = total.toFixed(2);
                        _this.countBillTotal();
                        _this.$message({
                            message: '输入票面商品重量不能大于左侧相同商品重量',
                            type: 'warning'
                        });
                    }
                }
            });
        },

        // 发票总额
        countBillTotal: function countBillTotal() {
            var _this2 = this;

            var total = 0;
            this.goodsList.map(function (val) {
                val.billMoney = val.billMoney ? val.billMoney : '0';
                total += _this2.gitFloat(val.billMoney);
            });
            this.enteringList.billTotalAccount = total.toFixed(2);
            if ($("form").data('bootstrapValidator')) {
                $("form").data('bootstrapValidator').destroy();
                $('form').data('bootstrapValidator', null);
                //重新添加校验
                validator();
            }
        },

        // 应录进项票总额:
        countIncomeMoney: function countIncomeMoney() {
            var money = 0;
            this.goodsList.map(function (val) {
                // console.log(val)
                money += +val.outweight * +val.price;
            });
            this.incomeMoney = money.toFixed(2);
        },

        // 四舍五入
        toDecimal: function toDecimal(i) {
            var f = parseFloat(this.goodsList[i].billWeight);
            if (isNaN(f)) {
                return 0;
            }
            this.goodsList[i].billWeight = Math.round(this.goodsList[i].billWeight * 100) / 100;
        },

        //保留两位小数
        gitFloat: function gitFloat(value) {
            return parseFloat(parseFloat(value ? value : '0').toFixed(2));
        },
        delItem: function delItem(item) {
            this.goodsList = this.goodsList.filter(function (val) {
                if (val.id !== item.id) {
                    return val;
                }
            });
            this.countBillTotal();
            this.countIncomeMoney();
            sessionStorage.setItem('goodsList', JSON.stringify(this.goodsList));
        },

        // 新增商品
        toAddGoods: function toAddGoods(){
            window.location.href = './income-ticket-waitenter.html?from=entering';
        },
        // 批量录入
        toBatch: function toBatch(){
            window.location.href = './income-ticket-entered.html';
        },
        //将此页面中的数据提交至“业务员端”开票系统进行审核，同时将数据保存至“进项票录入记录”。
        submit: function submit(type) {

            if (type == 2) {
                if ($("form").data('bootstrapValidator')) {
                    $("form").data('bootstrapValidator').destroy(); //清除验证
                }
                this.submitData.buttonType = '保存';
                this.submitInfo(type);
            } else if (type == 1) {
                if ($("form").data('bootstrapValidator')) {
                    $("form").data('bootstrapValidator').destroy(); //清除验证
                }
                //重新添加校验
                validator();
                var bootstrapValidator = $("form").data('bootstrapValidator');
                bootstrapValidator.validate();
                this.submitData.buttonType = '提交';
                if ($("form").data('bootstrapValidator').isValid()) {
                    //获取验证结果，如果成功，执行下面代码
                    this.submitInfo(type);
                } else {
                    return;
                }
            }
        },
        submitInfo: function submitInfo(type) {
            var flag = true; //控制商品重量不能为空
            this.goodsList.map(function (val) {
                if (!val.billWeight) {
                    flag = false;
                }
            });
            if (flag) {
                var incomebilldetails = [];
                if (this.hideBtn) {
                    //非编辑入口
                    this.goodsList.map(function (val) {
                        incomebilldetails.push({
                            detailId: '',
                            ingoodId: val.id,
                            applyCount: val.billWeight,
                            applyPrice: val.price,
                            applyTotalPrice: val.billMoney
                        });
                    });
                    this.submitData.incomebilldetails = JSON.stringify(incomebilldetails);
                    if (window.location.href.indexOf('companyName=') !== -1) {
                        this.submitData.incomebill = JSON.stringify({
                            //id:'',//编辑入口时候使用；非编辑入口请为null
                            inCompany: this.enteringList.inCompany,
                            billPaperType: this.enteringList.billPaperType,
                            taxRate: this.enteringList.taxRate,
                            billCreateDate: this.enteringList.billCreateDate,
                            billCode: this.enteringList.billCode,
                            billTotalAccount: this.enteringList.billTotalAccount,
                            openBank: this.enteringList.openBank,
                            openAccount: this.enteringList.openAccount,
                            taxpayerCode: this.enteringList.taxpayerCode,
                            lpAddress: this.enteringList.lpAddress,
                            phone: this.enteringList.phone,
                            customerUid: this.enteringList.customerUid

                        });
                    } else {
                        this.submitData.incomebill = JSON.stringify({
                            //id:'',//编辑入口时候使用；非编辑入口请为null
                            inCompany: this.enteringList.inCompany,
                            billPaperType: this.enteringList.billPaperType,
                            taxRate: this.enteringList.taxRate,
                            billCreateDate: this.enteringList.billCreateDate,
                            billCode: this.enteringList.billCode,
                            billTotalAccount: this.enteringList.billTotalAccount,
                            openBank: this.enteringList.openBank,
                            openAccount: this.enteringList.openAccount,
                            taxpayerCode: this.enteringList.taxpayerCode,
                            lpAddress: this.enteringList.lpAddress,
                            phone: this.enteringList.phone,
                            customerUid: this.goodsList[0].customerId

                        });
                    }
                } else {
                    //编辑入口
                    this.goodsList.map(function (val) {
                        if (val.detailId) {
                            incomebilldetails.push({
                                detailId: val.detailId,
                                ingoodId: val.id,
                                applyCount: val.billWeight,
                                // applyPrice: val.price,
                                applyTotalPrice: val.billMoney
                            });
                        } else {
                            incomebilldetails.push({
                                // detailId: '',
                                ingoodId: val.id,
                                applyCount: val.billWeight,
                                // applyPrice: val.price,
                                applyTotalPrice: val.billMoney
                            });
                        }
                    });
                    this.submitData.incomebilldetails = JSON.stringify(incomebilldetails);
                    this.submitData.incomebill = JSON.stringify({
                        id: this.enteringList.id, //编辑入口时候使用；非编辑入口请为null
                        inCompany: this.enteringList.inCompany,
                        billPaperType: this.enteringList.billPaperType,
                        taxRate: this.enteringList.taxRate,
                        billCreateDate: this.enteringList.billCreateDate,
                        billCode: this.enteringList.billCode,
                        billTotalAccount: this.enteringList.billTotalAccount,
                        openBank: this.enteringList.openBank,
                        openAccount: this.enteringList.openAccount,
                        taxpayerCode: this.enteringList.taxpayerCode,
                        lpAddress: this.enteringList.lpAddress,
                        phone: this.enteringList.phone,
                        customerUid: this.enteringList.customerUid
                    });
                }
                this.saveIncombill(type);
            } else {
                this.$message({
                    message: '输入票面商品重量不能为空',
                    type: 'warning'
                });
            }
        },
        back: function back() {
            // window.history.go(-1);
            if (window.location.href.indexOf('from=record') != -1 || !this.hideBtn) {
                if (sessionStorage.getItem('editData')) {
                    sessionStorage.removeItem('editData');
                    if (sessionStorage.getItem('goodsList')) {
                        sessionStorage.removeItem('goodsList');
                    }
                }
                window.location.href = 'income-ticket-enterrecord.html';
            } else if (window.location.href.indexOf('from=detail') != -1) {
                var id = window.location.href.split('&')[1];
                window.location.href = 'income-ticket-enterdetail.html?' + id;
            } else {
                window.location.href = 'income-ticket-waitenter.html?from=enteringback';
            }
        },

        // 编辑发票接口
        editInvoice: function editInvoice(id) {
            var _this3 = this;

            $http('/incomebill/findIncomeBillDetail', { IncomeBillId: id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    var resData = res.data.resultData;
                    resData.IncomeBill_detailList.map(function (val) {
                        val.id1 = val.goodId;
                        val.detailId = val.id;
                    });
                    resData.IncomeBill_detailList.map(function (val) {
                        val.id = val.id1;
                    });
                    sessionStorage.setItem('editData', JSON.stringify(resData));
                    _this3.getEditData(resData);
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        getEditData: function getEditData(data) {
            this.enteringList = {
                id: data.IncomeBill.id,
                inCompany: data.IncomeBill.inCompany, //来票单位
                billPaperType: data.IncomeBill.billPaperType, //发票类型
                taxRate: data.IncomeBill.taxRate, //税率
                billCreateDate: data.IncomeBill.billCreateDate, //开票时间
                billCode: data.IncomeBill.billCode, //发票编号
                billTotalAccount: data.IncomeBill.billTotalAccount, //发票总额
                openBank: data.IncomeBill.openBank, //开户银行
                openAccount: data.IncomeBill.openAccount,
                taxpayerCode: data.IncomeBill.taxpayerCode,
                lpAddress: data.IncomeBill.lpAddress,
                phone: data.IncomeBill.phone,
                customerUid: data.IncomeBill.customerUid
            };
            this.goodsList = data.IncomeBill_detailList;
            // this.goodsListCopy = this.goodsList;
            if (sessionStorage.getItem("goodsList")) {
                var goodsList = JSON.parse(sessionStorage.getItem("goodsList"));
                this.goodsList.map(function (val) {
                    goodsList = goodsList.filter(function (val1) {
                        return val1.id != val.id;
                    });
                });
                this.goodsList = this.goodsList.concat(goodsList);
            }
            // console.log(this.goodsList,'ass')
            // this.submitData.customerUid = res.data.resultData.IncomeBill.customerUid;
            this.countIncomeMoney();
        },

        // 查询customerId接口
        searchCustomer: function searchCustomer(id) {
            var _this4 = this;

            $http('/Customer/findCustomerByName', { Uid: id }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this4.enteringList.openBank = res.data.resultData.openBank;
                    _this4.enteringList.openAccount = res.data.resultData.bankAccount;
                    _this4.enteringList.taxpayerCode = res.data.resultData.taxCode;
                    _this4.enteringList.lpAddress = res.data.resultData.companyAddr;
                    _this4.enteringList.phone = res.data.resultData.phone;
                    if (_this4.enteringList.taxpayerCode) {
                        $('.taxpayerCode').attr('disabled', true);
                    }
                    if (window.location.href.indexOf('companyName=') !== -1) {
                        if (sessionStorage.getItem("goodsList")) {
                            var goodsList = JSON.parse(sessionStorage.getItem("goodsList"));
                            _this4.enteringList.openBank = res.data.resultData.openBank;
                            _this4.enteringList.openAccount = res.data.resultData.bankAccount;
                            _this4.enteringList.taxpayerCode = res.data.resultData.taxCode;
                            _this4.enteringList.lpAddress = res.data.resultData.companyAddr;
                            _this4.enteringList.phone = res.data.resultData.phone;
                            _this4.enteringList.customerUid = res.data.resultData.uid;
                            if (_this4.enteringList.taxpayerCode) {
                                $('.taxpayerCode').attr('disabled', true);
                            }
                            _this4.goodsList.map(function (val) {
                                goodsList = goodsList.filter(function (val1) {
                                    return val1.id != val.id;
                                });
                            });
                            _this4.goodsList = _this4.goodsList.concat(goodsList);
                        }
                        if (sessionStorage.getItem("editData")) {
                            var data = JSON.parse(sessionStorage.getItem("editData"));
                            _this4.goodsList = data.IncomeBill_detailList;
                            _this4.enteringList = {
                                id: data.IncomeBill.id,
                                inCompany: res.data.resultData.companyName, //来票单位
                                billPaperType: data.IncomeBill.billPaperType, //发票类型
                                taxRate: data.IncomeBill.taxRate, //税率
                                billCreateDate: data.IncomeBill.billCreateDate, //开票时间
                                billCode: data.IncomeBill.billCode, //发票编号
                                billTotalAccount: data.IncomeBill.billTotalAccount, //发票总额
                                openBank: res.data.resultData.openBank, //开户银行
                                openAccount: res.data.resultData.bankAccount,
                                taxpayerCode: res.data.resultData.taxCode,
                                lpAddress: res.data.resultData.companyAddr,
                                phone: res.data.resultData.phone,
                                customerUid: res.data.resultData.uid
                            };
                        }
                        _this4.countIncomeMoney();
                    }
                }
            }).catch(function (err) {
                console.log(err);
            });
        },

        // 提交接口
        saveIncombill: function saveIncombill(type) {
            var _this5 = this;

            $http('/incomebill/saveorupdateIncombill', this.submitData).then(function (res) {
                if (res.data.resultCode == 200) {
                    if (res.data.resultCode == 200) {
                        if (res.data.resultMessage == '1') {
                            if (type == 1) {
                                _this5.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                            } else if (type == 2) {
                                _this5.$message({
                                    message: '保存成功',
                                    type: 'success'
                                });
                            }
                            if (sessionStorage.getItem('editData')) {
                                sessionStorage.removeItem('editData');
                                if (sessionStorage.getItem('goodsList')) {
                                    sessionStorage.removeItem('goodsList');
                                }
                                setTimeout(function () {
                                    window.location.href = 'income-ticket-enterrecord.html';
                                }, 1000);
                            } else if (sessionStorage.getItem('goodsList')) {
                                sessionStorage.removeItem('goodsList');
                                setTimeout(function () {
                                    window.location.href = 'income-ticket-waitenter.html';
                                }, 1000);
                            }
                        } else {
                            _this5.$message({
                                message: res.data.resultMessage,
                                type: 'warning'
                            });
                        }
                    }
                }
            }).catch(function (err) {
                console.log(err);
            });
        }
    }
});