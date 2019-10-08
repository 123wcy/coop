'use strict';

var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            applyCount: '', //商品重量
            applyTotalPrice: '', //商品金额
            incomeMoney: '', //进项票总额
            showmsg: false, //是否展示响应信息
            msg: '', //响应信息
            IncomeBill_detailList: [],
            IncomeBill: {},

            enteringList: {
                memberName: '', //委托会员
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
                isShowCode: false //是否显示纳税人识别号
            },

            submitData: {
                incomebilldetails: '',
                incomebill: '',
                buttonType: '',
                // customerUid: '',
                memberId: ''
            }, //提交数据

            value4: '',
            billStatus: '', //票据状态
            maxDate: '',
            hideBtn: true
        };
    },
    created: function created() {
        var now = new Date();
        this.maxDate = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        if (sessionStorage.getItem("IncomeBill_detailList") && window.location.href.indexOf('?') == -1) {
            this.IncomeBill_detailList = JSON.parse(sessionStorage.getItem("IncomeBill_detailList"));
            this.enteringList.memberName = this.IncomeBill_detailList[0].memberName;
            this.enteringList.inCompany = this.IncomeBill_detailList[0].supply;
            if (sessionStorage.getItem("editData")) {
                this.hideBtn = false;
                var data = JSON.parse(sessionStorage.getItem("editData"));
                this.getEditData(data);
            } else {
                var id = this.IncomeBill_detailList[0].customerId;
                this.searchCustomer(id);
                // this.submitData.customerUid =  id;
            }
        }

        if (window.location.href.indexOf('id') != -1) {
            var _id = this.gGetQueryString("id"); //全局方法，获得url参数值
            this.hideBtn = false;
            this.editInvoice(_id);
        }

        this.submitData.memberId = this.gGetQueryString("memberId");

        this.billStatus = this.gGetQueryString("billStatus");

        // console.log(this.billStatus)
        if (window.location.href.indexOf('companyName=') !== -1) {
            if (sessionStorage.getItem("IncomeBill_detailList")) {
                this.IncomeBill_detailList = JSON.parse(sessionStorage.getItem("IncomeBill_detailList"));
                var param = Qs.parse(window.location.search.replace(/^\?/, ''));
                this.enteringList.inCompany = param.companyName;
                this.enteringList.memberName = this.IncomeBill_detailList[0].memberName;
                var _id2 = param.uid;
                this.searchCustomer(_id2);
                console.log(this.IncomeBill_detailList);
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
            var a = laydate.render({
                elem: '#startTime',
                type: 'date',
                format: 'yyyy-MM-dd',
                max: 'nowTime',
                done: function done(value) {
                    that.enteringList.billCreateDate = value;
                }
            });
        });
    },


    watch: {
        enteringLists: function enteringLists(val, oldVal) {
            // this.enteringList.phone = parseInt(val) || '' // 配合computed watch 深度监听
        }
    },
    computed: {
        enteringLists: function enteringLists() {
            // return this.enteringList.phone;
        }
    },
    methods: {
        //商品金额
        productMoneyFun: function productMoneyFun(item) {
            var _this2 = this;

            var total = void 0;
            this.IncomeBill_detailList.map(function (val) {
                if (val.id == item.id) {
                    if (+item.billWeight <= +item.outweight) {
                        total = item.billWeight * item.price;
                        item.billMoney = total.toFixed(2);
                        _this2.countBillTotal();
                    } else {
                        item.billWeight = item.outweight;
                        total = item.billWeight * item.price;
                        item.billMoney = total.toFixed(2);
                        _this2.countBillTotal();
                        _this2.$message({
                            message: '输入票面商品重量不能大于左侧相同商品重量',
                            type: 'warning'
                        });
                    }
                }
            });
        },
        checkCode: function checkCode(v) {
            console.log(v);
            if (v) {
                var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                if (reg.test(v) === false) {
                    this.enteringList.isShowCode = true;
                    return false;
                } else {
                    this.enteringList.isShowCode = false;
                }
            }
        },
        checkTaxpayerCode: function checkTaxpayerCode(v) {
            console.log(v);
        },
        back: function back() {
            var id = window.location.href.split('&')[1];
            var billStatus = window.location.href.split('&')[2];
            if (window.location.href.indexOf('?id') != -1) {
                if (sessionStorage.getItem('editData')) {
                    sessionStorage.removeItem('editData');
                    if (sessionStorage.getItem('goodsList')) {
                        sessionStorage.removeItem('goodsList');
                    }
                }
                window.location.href = '../Salesman/b-income-ticket-enterrecord.html';
            } else if (window.location.href.indexOf('from=detail') != -1) {

                console.log(id);
                window.location.href = 'b-income-ticket-examinedetail.html?from=examine&' + id + '&' + billStatus;
            } else if (window.location.href.indexOf('form=enterrecord') != -1) {
                window.location.href = 'b-income-ticket-examinedetail.html?form=enterrecord&' + id + '&' + billStatus;
            } else {
                window.location.href = 'b-income-ticket-waitenter.html?from=entering';
            }
        },


        // examineDetail(id){
        //     let self = this
        //     $http('/incomebill/findIncomeBillDetail',{IncomeBillId:id || '2'}).then(res=>{
        //         if(res.data.resultCode==200){
        //             let data = res.data.resultData
        //             self.enteringList = data.IncomeBill
        //             self.IncomeBill_detailList = data.IncomeBill_detailList
        //             self.Income_hisList = data.Income_hisList
        //         }
        //     }).catch( err=> {
        //         this.loading = false                                
        //     })
        // },

        addClick: function addClick() {
            // sessionStorage.setItem('IncomeBill_detailList',JSON.stringify(this.IncomeBill_detailList))
            window.location.href = './b-income-ticket-waitenter.html?memberId=' + this.gGetQueryString("memberId") + '&from=entering';
        },
        batchInvoice: function batchInvoice() {
            window.location.href = './b-income-ticket-entered.html?memberId=' + this.gGetQueryString("memberId") + '&from=entering';
        },


        // //商品金额
        // productMoneyFun(i,item){
        //     this.showmsg = false;
        //     let total;
        //     // item.productMoney = +item.height * +item.price

        //     this.IncomeBill_detailList.map(val=>{
        //         if(val.id == item.id){
        //             if(+item.applyCount <= +item.outweight){
        //                  total = item.applyCount *  item.price;
        //                  item.applyTotalPrice = total.toFixed(2);
        //                  this.countBillTotal();
        //             } else {
        //                 this.showmsg = true;
        //                 this.$message({
        //                     type:'warning',
        //                     message:'输入票面商品重量不能大于左侧相同商品重量'
        //                 })
        //                 this.IncomeBill_detailList[i].applyCount = item.outweight

        //             }
        //         }
        //     })

        // },
        // 发票总额
        countBillTotal: function countBillTotal() {
            var _this3 = this;

            var total = 0;
            this.IncomeBill_detailList.map(function (val) {
                val.billMoney = val.billMoney ? val.billMoney : '0';
                total += _this3.gitFloat(val.billMoney);
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
            this.IncomeBill_detailList.map(function (val) {
                // console.log(val)
                money += +val.outweight * +val.price;
            });
            this.incomeMoney = money.toFixed(2);
        },


        // 四舍五入
        toDecimal: function toDecimal(i) {
            var f = parseFloat(this.IncomeBill_detailList[i].billWeight);
            if (isNaN(f)) {
                return 0;
            }
            this.IncomeBill_detailList[i].billWeight = Math.round(this.IncomeBill_detailList[i].billWeight * 100) / 100;
        },


        //保留两位小数
        gitFloat: function gitFloat(value) {
            return parseFloat(parseFloat(value ? value : '0').toFixed(2));
        },
        delItem: function delItem(item) {
            this.IncomeBill_detailList = this.IncomeBill_detailList.filter(function (val) {
                if (val.id !== item.id) {
                    return val;
                }
            });
            this.countBillTotal();
            this.countIncomeMoney();
            sessionStorage.setItem('IncomeBill_detailList', JSON.stringify(this.IncomeBill_detailList));
        },


        //将此页面中的数据提交至“业务员端”开票系统进行审核，同时将数据保存至“进项票录入记录”。
        submit: function submit(type) {
            // $("#form").submit(function(ev){ev.preventDefault();});

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
            var incomebilldetails = [];
            if (this.hideBtn) {
                //非编辑入口
                this.IncomeBill_detailList.map(function (val) {
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
                        customerUid: this.IncomeBill_detailList[0].customerId

                    });
                }
            } else {
                //编辑入口
                this.IncomeBill_detailList.map(function (val) {
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
        },

        // 编辑发票接口
        editInvoice: function editInvoice(id) {
            var _this4 = this;

            var _this = this;
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
                    _this4.getEditData(resData);
                    // this.enteringList = {
                    //     inCompany: res.data.resultData.IncomeBill.inCompany,//来票单位
                    //     billPaperType: res.data.resultData.IncomeBill.billPaperType,//发票类型
                    //     taxRate: res.data.resultData.IncomeBill.taxRate,//税率
                    //     billCreateDate: res.data.resultData.IncomeBill.billCreateDate,//开票时间
                    //     billCode: res.data.resultData.IncomeBill.billCode,//发票编号
                    //     billTotalAccount: res.data.resultData.IncomeBill.billTotalAccount,//发票总额
                    //     openBank: res.data.resultData.IncomeBill.openBank,//开户银行
                    //     openAccount: res.data.resultData.IncomeBill.openAccount,
                    //     taxpayerCode: res.data.resultData.IncomeBill.taxpayerCode,
                    //     lpAddress: res.data.resultData.IncomeBill.lpAddress,
                    //     phone: res.data.resultData.IncomeBill.phone
                    // };
                    // this.IncomeBill_detailList = res.data.resultData.IncomeBill_detailList;
                    // this.enteringList.memberName = res.data.resultData.member.memberName;
                    // this.submitData.customerUid = res.data.resultData.IncomeBill.customerUid;

                    // this.countIncomeMoney();
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
            this.IncomeBill_detailList = data.IncomeBill_detailList;
            this.enteringList.memberName = data.member.memberName;
            if (sessionStorage.getItem("IncomeBill_detailList")) {
                var _goodsList = JSON.parse(sessionStorage.getItem("IncomeBill_detailList"));
                this.IncomeBill_detailList.map(function (val) {
                    _goodsList = _goodsList.filter(function (val1) {
                        return val1.id != val.id;
                    });
                });
                this.IncomeBill_detailList = this.IncomeBill_detailList.concat(_goodsList);
            }
            this.countIncomeMoney();
        },

        // 查询customerId接口
        searchCustomer: function searchCustomer(id) {
            var _this5 = this;

            var _this = this;
            $http('/Customer/findCustomerByName', {
                Uid: id,
                memberId: _this.gGetQueryString('memberId')
            }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this.submitData.memberId = res.data.resultData.memberId;
                    _this.enteringList.openBank = res.data.resultData.openBank;
                    _this.enteringList.openAccount = res.data.resultData.bankAccount;
                    _this.enteringList.taxpayerCode = res.data.resultData.taxCode;
                    _this.enteringList.lpAddress = res.data.resultData.companyAddr;
                    _this.enteringList.phone = res.data.resultData.phone;

                    if (window.location.href.indexOf('companyName=') !== -1) {
                        if (sessionStorage.getItem("IncomeBill_detailList")) {
                            var IncomeBill_detailList = JSON.parse(sessionStorage.getItem("IncomeBill_detailList"));
                            // this.enteringList.memberName = data.member.memberName;
                            _this.submitData.memberId = res.data.resultData.memberId;
                            _this.enteringList.openBank = res.data.resultData.openBank;
                            _this.enteringList.openAccount = res.data.resultData.bankAccount;
                            _this.enteringList.taxpayerCode = res.data.resultData.taxCode;
                            _this.enteringList.lpAddress = res.data.resultData.companyAddr;
                            _this.enteringList.phone = res.data.resultData.phone;
                            _this.enteringList.customerUid = res.data.resultData.uid;
                            if (_this.enteringList.taxpayerCode) {
                                $('.taxpayerCode').attr('disabled', true);
                            }
                            _this.IncomeBill_detailList.map(function (val) {
                                goodsList = goodsList.filter(function (val1) {
                                    return val1.id != val.id;
                                });
                            });
                            _this.IncomeBill_detailList = _this5.IncomeBill_detailList.concat(goodsList);
                        }
                        if (sessionStorage.getItem("editData")) {
                            var data = JSON.parse(sessionStorage.getItem("editData"));
                            _this.IncomeBill_detailList = data.IncomeBill_detailList;
                            _this5.enteringList = {
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
                                customerUid: res.data.resultData.uid,
                                memberName: data.member.memberName
                            };
                        }
                        _this5.countIncomeMoney();
                    }
                }
            }).catch(function (err) {
                console.log(err);
            });
        },


        // 提交接口
        saveIncombill: function saveIncombill(type) {
            var _this6 = this;

            $http('/incomebill/saveorupdateIncombillforS', this.submitData).then(function (res) {
                if (res.data.resultCode == 200) {
                    if (res.data.resultMessage == '1') {
                        if (type == 1) {
                            _this6.$message({
                                message: '提交成功',
                                type: 'success'
                            });
                        } else if (type == 2) {
                            _this6.$message({
                                message: '保存成功',
                                type: 'success'
                            });
                        }
                        sessionStorage.removeItem('IncomeBill_detailList');
                        setTimeout(function () {
                            window.location.href = 'b-income-ticket-waitenter.html';
                        }, 1000);
                    } else {
                        _this6.$message({
                            message: res.data.resultMessage,
                            type: 'warning'
                        });
                    }
                }
            }).catch(function (err) {
                _this6.$message({
                    message: res.data.resultMessage,
                    type: 'warning'
                });
            });
        }
    }
});