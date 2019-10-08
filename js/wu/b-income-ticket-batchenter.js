'use strict';

var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            goodsList: [],
            invoiceList: [],
            // 整体数据结构
            goodsInvoiceList: [],
            isSelect: false,
            rowSpanIndex: '', //合并单元格第几行
            currentSelect: {}, //当前选择的项
            allMoney: '',
            // 批量录入提交数据模型
            batchInfo: {
                inCompany: '', //来票单位
                billPaperType: '', //发票类型
                taxRate: '', //税率
                billCreateDate: '', //开票时间
                billCode: '', //发票编号
                billMoney: '', //发票总额
                openBank: '',
                openAccount: '',
                taxpayerCode: '',
                lpAddress: '',
                phone: ''

            },
            timer: null //定时器
        };
    },
    created: function created() {

        if (sessionStorage.getItem('IncomeBill_detailList')) {
            this.goodsList = JSON.parse(sessionStorage.getItem('IncomeBill_detailList'));
        }
        if (sessionStorage.getItem('invoiceList')) {
            this.invoiceList = JSON.parse(sessionStorage.getItem('invoiceList'));
        }
        // // 缓存中没有数据，自己先写死的数据
        // this.goodsList = [];
        // for(let i=0;i<9;i++){
        //     let obj = {
        //         id : i,
        //         contractNumber:1
        //     }
        //     this.goodsList.push(obj);
        // }
        // this.invoiceList = [];
        // for(let j=0;j<5;j++){
        //     let obj = {
        //         id:j
        //     }
        //     this.invoiceList.push(obj);
        // }
        // goodsList长度大于invoiceList长度的情况
        if (this.goodsList.length >= this.invoiceList.length) {
            for (var i = 0; i < this.goodsList.length; i++) {
                var obj = {};
                var goods = [this.goodsList[i]];
                if (this.invoiceList[i]) {
                    obj = {
                        goods: goods,
                        invoice: this.invoiceList[i],
                        choose: false
                    };
                    this.goodsInvoiceList.push(obj);
                } else {
                    obj = {
                        goods: goods,
                        // invoice:{},
                        choose: false
                    };
                    this.goodsInvoiceList.push(obj);
                }
            }
            // console.log(this.goodsInvoiceList);
        } else {
            for (var _i = 0; _i < this.invoiceList.length; _i++) {
                var _obj = {};
                var invoice = this.invoiceList[_i];
                if (this.goodsList[_i]) {
                    _obj = {
                        goods: [this.goodsList[_i]],
                        invoice: invoice,
                        choose: false
                    };
                    this.goodsInvoiceList.push(_obj);
                } else {
                    _obj = {
                        invoice: invoice,
                        goods: [],
                        choose: false
                    };
                    this.goodsInvoiceList.push(_obj);
                }
            }
            // console.log(this.goodsInvoiceList);
        }
    },
    mounted: function mounted() {
        this.allMoneyFun();
        this.goodsInvoiceList[0].isSelect = true;
        this.selectInvoice(this.goodsInvoiceList[0]);
    },

    watch: {},
    methods: {
        allMoneyFun: function allMoneyFun() {
            var money = 0;
            this.goodsList.map(function (val) {
                money += +val.outweight * +val.price;
            });
            this.allMoney = money + '元';
        },

        // submit() {

        // },
        addGoods: function addGoods() {
            window.location.href = 'b-income-ticket-waitenter.html?from=batch';
            sessionStorage.setItem('goodsList', JSON.stringify(this.goodsList));
        },
        addInvoice: function addInvoice() {
            window.location.href = './b-income-ticket-entered.html';
        },
        delItem: function delItem(item) {
            var invoiceDel = [];
            for (var j = 0; j < this.goodsInvoiceList.length; j++) {
                for (var z = 0; z < this.goodsInvoiceList[j].goods.length; z++) {
                    // 匹配到整体数据结构中goods数组中的数据先删除
                    if (this.goodsInvoiceList[j].goods[z].id == item.id) {
                        if (this.goodsInvoiceList[j].goods.length > 1) {
                            this.goodsInvoiceList[j].goods.splice(z, 1);
                        } else {
                            if (this.goodsInvoiceList[j].invoice) {
                                if (this.goodsInvoiceList.length > 1) {
                                    invoiceDel = this.goodsInvoiceList.splice(j, 1);
                                    for (var k = 0; k < this.goodsInvoiceList.length; k++) {
                                        if (!this.goodsInvoiceList[k].invoice) {
                                            this.goodsInvoiceList[k].invoice = invoiceDel[0].invoice;
                                            break;
                                        }
                                        if (k == this.goodsInvoiceList.length - 1) {
                                            this.goodsInvoiceList.push({
                                                goods: [],
                                                invoice: invoiceDel[0].invoice,
                                                choose: false
                                            });
                                            break;
                                        }
                                    }
                                } else {
                                    this.goodsInvoiceList[j].goods.splice(0, 1);
                                }
                            } else {
                                this.goodsInvoiceList.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            }
            // goodsList数据结构打乱重新排序
            this.goodsList = [];
            for (var _j = 0; _j < this.goodsInvoiceList.length; _j++) {
                if (this.goodsInvoiceList[_j].goods.length) {
                    for (var _z = 0; _z < this.goodsInvoiceList[_j].goods.length; _z++) {
                        this.goodsList.push(this.goodsInvoiceList[_j].goods[_z]);
                    }
                } else {}
            }
            this.allMoneyFun();
            for (var _j2 = 0; _j2 < this.goodsInvoiceList.length; _j2++) {
                if (this.goodsInvoiceList[_j2].invoice) {
                    if (this.goodsInvoiceList[_j2].goods.length > 0) {
                        $('.invoice-table tr').eq(_j2 + 2).css({
                            "height": 50 * this.goodsInvoiceList[_j2].goods.length
                        });
                    } else {
                        $('.invoice-table tr').eq(_j2 + 2).css({
                            "height": 50
                        });
                    }
                }
            }
        },
        delInvItem: function delInvItem(index) {
            var delItem = this.goodsInvoiceList.splice(index, 1);
            var invoiceDel = [];
            var goodsDel = [];
            for (var i = 0; i < this.goodsInvoiceList.length; i++) {
                if (!this.goodsInvoiceList[i].goods.length) {
                    invoiceDel.push(this.goodsInvoiceList[i].invoice);
                    this.goodsInvoiceList.splice(i, 1);
                } else {}
            }
            for (var j = 0; j < delItem[0].goods.length; j++) {
                goodsDel.push(delItem[0].goods[j]);
            }
            if (goodsDel.length >= invoiceDel.length) {
                for (var _i2 = 0; _i2 < goodsDel.length; _i2++) {
                    var obj = {};
                    var goods = [goodsDel[_i2]];
                    if (invoiceDel[_i2]) {
                        obj = {
                            goods: goods,
                            invoice: invoiceDel[_i2],
                            choose: false
                        };
                        this.goodsInvoiceList.push(obj);
                    } else {
                        obj = {
                            goods: goods,
                            // invoice:{},
                            choose: false
                        };
                        this.goodsInvoiceList.push(obj);
                    }
                }
            } else {
                for (var _i3 = 0; _i3 < invoiceDel.length; _i3++) {
                    var _obj2 = {};
                    var invoice = invoiceDel[_i3];
                    if (goodsDel[_i3]) {
                        _obj2 = {
                            goods: [goodsDel[_i3]],
                            invoice: invoice,
                            choose: false
                        };
                        this.goodsInvoiceList.push(_obj2);
                    } else {
                        _obj2 = {
                            invoice: invoice,
                            goods: [],
                            choose: false
                        };
                        this.goodsInvoiceList.push(_obj2);
                    }
                }
            }
            // goodsList数据结构打乱重新排序
            this.goodsList = [];
            for (var _j3 = 0; _j3 < this.goodsInvoiceList.length; _j3++) {
                if (this.goodsInvoiceList[_j3].goods.length) {
                    for (var z = 0; z < this.goodsInvoiceList[_j3].goods.length; z++) {
                        this.goodsList.push(this.goodsInvoiceList[_j3].goods[z]);
                    }
                } else {
                    this.goodsList.push({});
                }
            }
            for (var _j4 = 0; _j4 < this.goodsInvoiceList.length; _j4++) {
                if (this.goodsInvoiceList[_j4].invoice) {
                    if (this.goodsInvoiceList[_j4].goods.length > 0) {
                        $('.invoice-table tr').eq(_j4 + 2).css({
                            "height": 50 * this.goodsInvoiceList[_j4].goods.length
                        });
                    } else {
                        $('.invoice-table tr').eq(_j4 + 2).css({
                            "height": 50
                        });
                    }
                }
            }
        },
        selectItem: function selectItem(item, e) {
            this.goodsList = this.goodsList.map(function (val) {
                val.isSelect = false;
                // 加上val.id是否存在判断，在匹配的时候如果goodsInvoiceList的goods
                // 置为空，val.id也是没有值，影响结果
                if (item.id == val.id && val.id || item.id == val.id && val.id == 0) {
                    val.isSelect = true;
                }
                return val;
            });

            this.currentSelect = this.goodsList.filter(function (val) {
                if (item.id == val.id) {
                    return val;
                }
            });
        },
        selectInvoice: function selectInvoice(item, e) {
            console.log(item, e);
            // this.goodsInvoiceList.map(val => {
            //     val.choose = false;
            //     if(val == item) {
            //         val.choose = true;
            //     }
            // })
            this.batchInfo = {
                inCompany: item.invoice.inCompany,
                billPaperType: item.invoice.billPaperType,
                taxRate: item.invoice.taxRate,
                billCreateDate: item.invoice.billCreateDate.split(' ')[0],
                billCode: item.invoice.billCode,
                billMoney: item.invoice.billMoney,
                openBank: item.invoice.openBank,
                openAccount: item.invoice.openAccount,
                taxpayerCode: item.invoice.taxpayerCode,
                lpAddress: item.invoice.lpAddress,
                phone: item.invoice.phone
            };
        },
        rowspantype: function rowspantype(item) {
            return item;
        },
        match: function match(index) {
            this.batchInfo = {};
            // 获取右侧匹配的对象
            var invoiceItem = this.goodsInvoiceList[index].invoice;
            console.log(invoiceItem);
            // 获取选中的对象
            var selectItem = "";
            for (var i = 0; i < this.goodsList.length; i++) {
                if (this.goodsList[i].isSelect) {
                    selectItem = this.goodsList[i];
                }
            }
            if (!selectItem) {
                return;
            }
            for (var j = 0; j < this.goodsInvoiceList.length; j++) {
                for (var z = 0; z < this.goodsInvoiceList[j].goods.length; z++) {
                    // 匹配到整体数据结构中goods数组中的数据先删除
                    if (this.goodsInvoiceList[j].goods[z].id == selectItem.id) {
                        this.goodsInvoiceList[j].goods.splice(z, 1);
                    }
                }
                if (this.goodsInvoiceList[j].invoice) {
                    // 获取整体数据结构中的右侧id
                    if (this.goodsInvoiceList[j].invoice["id"] == invoiceItem.id) {
                        // id相当的情况匹配到了同一个右侧对象,将左侧选中的对象push进整体数据结构中
                        console.log(this.goodsInvoiceList[j].goods.indexOf(selectItem));
                        // if(this.goodsInvoiceList[j].goods.indexOf(selectItem) > -1){
                        //     // 说明原对象就和选中的匹配不做处理
                        // }else{
                        //     this.goodsInvoiceList[j].goods.push(selectItem);
                        // }
                        this.goodsInvoiceList[j].goods.push(selectItem);
                    }
                }
            }
            // 如果goodsInvoiceList中goods和invoice都为空则清除
            var invoiceDelete = [];
            for (var _j5 = 0; _j5 < this.goodsInvoiceList.length; _j5++) {
                if (this.goodsInvoiceList[_j5].goods.length == 0 && !this.goodsInvoiceList[_j5].invoice) {
                    this.goodsInvoiceList.splice(_j5, 1);
                }
            }
            for (var _j6 = 0; _j6 < this.goodsInvoiceList.length; _j6++) {
                if (this.goodsInvoiceList[_j6].goods.length == 0 && this.goodsInvoiceList[_j6].invoice) {
                    invoiceDelete = this.goodsInvoiceList.splice(_j6, 1);
                    break; //要加break，否则右边数据多的时候，匹配项只有一条的时候，匹配到右边会清除右边的发票
                }
            }
            if (invoiceDelete.length > 0) {
                for (var _j7 = 0; _j7 < this.goodsInvoiceList.length; _j7++) {
                    if (this.goodsInvoiceList[_j7].goods.length > 0 && !this.goodsInvoiceList[_j7].invoice) {
                        this.goodsInvoiceList[_j7].invoice = invoiceDelete[0].invoice;
                        break;
                    }
                    // 右侧比左侧多的情况
                    if (_j7 == this.goodsInvoiceList.length - 1) {
                        this.goodsInvoiceList.push({
                            goods: [],
                            invoice: invoiceDelete[0].invoice,
                            choose: false
                        });
                        // 这里要加break，否则会陷入死循环
                        break;
                    }
                }
            }
            // goodsList数据结构打乱重新排序
            this.goodsList = [];
            for (var _j8 = 0; _j8 < this.goodsInvoiceList.length; _j8++) {
                if (this.goodsInvoiceList[_j8].goods.length) {
                    for (var _z2 = 0; _z2 < this.goodsInvoiceList[_j8].goods.length; _z2++) {
                        this.goodsList.push(this.goodsInvoiceList[_j8].goods[_z2]);
                    }
                } else {
                    this.goodsList.push({});
                }
            }

            for (var _j9 = 0; _j9 < this.goodsInvoiceList.length; _j9++) {

                if (this.goodsInvoiceList[_j9].invoice) {
                    if (this.goodsInvoiceList[_j9].goods.length > 0) {
                        $('.invoice-table tr').eq(_j9 + 2).css({
                            "height": 50 * this.goodsInvoiceList[_j9].goods.length
                        });
                    } else {
                        $('.invoice-table tr').eq(_j9 + 2).css({
                            "height": 50
                        });
                    }
                }
            }
        },
        back: function back() {
            window.history.go(-1);
        },
        submit: function submit(type) {
            var _this = this;

            // console.log(this.goodsInvoiceList)
            // this.goodsInvoiceList
            var data = {
                array: []
            };
            if (type == 1) {
                data.buttonType = '提交';
            } else {
                data.buttonType = '保存';
            }
            // let arr = [];
            for (var i = 0; i < this.goodsInvoiceList.length; i++) {
                var arr = [];
                var obj = {};
                if (this.goodsInvoiceList[i].goods) {
                    for (var j = 0; j < this.goodsInvoiceList[i].goods.length; j++) {
                        arr.push({
                            ingoodId: this.goodsInvoiceList[i].goods[j].id
                        });
                    }
                }
                if (this.goodsInvoiceList[i].invoice) {
                    obj.ticketId = this.goodsInvoiceList[i].invoice.id;
                    obj.billCode = this.goodsInvoiceList[i].invoice.billCode;
                }
                data.array.push({
                    goods: arr,
                    invoice: obj
                });
            }

            data.customerUid = this.goodsList[0] && this.goodsList[0].customerId;
            var flag = true; //控制未匹配完成不能提交或者保存
            for (var _i4 = 0; _i4 < data.array.length; _i4++) {
                if (!data.array[_i4].goods.length) {
                    flag = false;
                    this.$message({
                        message: '未匹配完，请匹配完成再提交或保存！',
                        type: 'warning'
                    });
                    break;
                }
                if (JSON.stringify(data.array[_i4].invoice) == '{}') {
                    flag = false;
                    this.$message({
                        message: '未匹配完，请匹配完成再提交或保存！',
                        type: 'warning'
                    });
                    break;
                }
            }

            if (flag) {
                var flag1 = true; //控制匹配项右侧重量不能大于左侧重量之和不能提交或者保存
                for (var _i5 = 0; _i5 < this.goodsInvoiceList.length; _i5++) {
                    var outweight = 0;
                    var goodsWeight = parseFloat(this.goodsInvoiceList[_i5].invoice.goodsWeight || '0');
                    for (var _j10 = 0; _j10 < this.goodsInvoiceList[_i5].goods.length; _j10++) {
                        outweight += parseFloat(this.goodsInvoiceList[_i5].goods[_j10].outweight || '0');
                    }
                    if (goodsWeight > outweight) {
                        flag1 = false;
                        this.$message({
                            message: '匹配发票重量不得大于待录票重量！',
                            type: 'warning'
                        });
                        break;
                    }
                }
                if (flag1) {
                    data.array = JSON.stringify(data.array);
                    data.memberId = this.gGetQueryString('memberId');
                    $http('/incomebill/saveIncombillsforS', data).then(function (res) {
                        if (res.data.resultCode == 200) {
                            if (res.data.resultMessage == '1') {
                                if (type == 1) {
                                    _this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                } else if (type == 2) {
                                    _this.$message({
                                        message: '保存成功',
                                        type: 'success'
                                    });
                                }
                                sessionStorage.removeItem('IncomeBill_detailList');
                                sessionStorage.removeItem('invoiceList');
                                setTimeout(function () {
                                    window.location.href = 'income-ticket-waitenter.html';
                                }, 1000);
                            } else {
                                _this.$message({
                                    message: res.data.resultMessage,
                                    type: 'warning'
                                });
                            }
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
            }
        }
    }
});