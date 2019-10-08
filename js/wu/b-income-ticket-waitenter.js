'use strict';

var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            allcheckbox: false, //全选按钮
            disabled: true, //按钮是否可用
            incomeMoney: 0, //进项票金额总计
            enteredMoney: 0, //已录进项票金额
            enterSupMoneny: 0, //进项票余额

            isShow: false, //是否显示确定按钮
            isSelect: false, //是否选中行
            isSupply: true, //供应商提示还是委托会员提示
            checkedItem: [], //已选择项

            // page: 1,  //显示的是哪一页
            // pageSize: 10, //每一页显示的数据条数
            total: 0, //记录总数
            // maxPage:9, //最大页数
            searchList: {
                contractNumber: '', //合同编号
                name: '', //商品名称
                spec: '', //规格
                batch: '', //批号
                supply: '', //供应商
                warehouse: '', //仓库
                pagenum: '1', //当前页码
                pagesize: '10', //每页条数
                // clientType: null,//客户端类型
                memberId: '' //会员UID
            },
            goodsList: []
        };
    },
    created: function created() {
        this.searchList.memberId = this.gGetQueryString('memberId');
        this.searchBtn();
    },
    mounted: function mounted() {
        // let enterSupMoneny = 0;
        // this.goodsList.map(val => {
        //     enterSupMoneny += (+val.inweight - +val.outputCount) * +val.price
        // })
        // this.enterSupMoneny = enterSupMoneny.toFixed(2)


        if (window.location.href.indexOf('entering') != -1) {
            this.isShow = true;
        }
        if (window.location.href.indexOf('batch') != -1) {
            this.isShow = true;
        }
        // console.log(this.gGetQueryString('memberId'))
        if (!this.isShow) {
            if (sessionStorage.getItem('editData')) {
                sessionStorage.removeItem('editData');
            }
            if (sessionStorage.getItem('IncomeBill_detailList')) {
                sessionStorage.removeItem('IncomeBill_detailList');
            }
        }
    },

    watch: {
        goodsList: function goodsList(v) {}
    },

    methods: {
        // 重置按钮
        resetBtn: function resetBtn() {
            this.searchList = {
                contractNumber: '', //合同编号
                name: '', //商品名称
                spec: '', //规格
                batch: '', //批号
                supply: '', //供应商
                warehouse: '', //仓库
                pagenum: '1', //当前页码
                pagesize: '10' //每页条数
            };
            this.searchBtn();
        },
        pageInit: function pageInit() {
            var that = this;
            $('#pagination').pagination({
                total: that.total,
                onSelectPage: function onSelectPage(pageNumber, pageSize) {
                    that.searchList.pagenum = pageNumber;
                    that.searchList.pagesize = pageSize;
                    that.searchBtn();
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
            this.allMoney();
        },

        //单选
        singleCheck: function singleCheck(item) {
            this.allMoney();
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

        //所有选中全选选中
        allMoney: function allMoney() {
            var incomeMoney = 0;
            var enteredMoney = 0;

            this.goodsList.map(function (val) {
                if (val.checked) {
                    incomeMoney += +val.outweight * +val.price;
                    enteredMoney += +val.inweight * +val.price;
                }
            });
            this.incomeMoney = incomeMoney.toFixed(2);
            this.enteredMoney = enteredMoney.toFixed(2);
        },


        // 检查按钮是否能用
        checkeBtnStatus: function checkeBtnStatus() {
            var _this2 = this;

            if (sessionStorage.getItem("IncomeBill_detailList")) {
                this.checkedItem = JSON.parse(sessionStorage.getItem("IncomeBill_detailList"));
                // console.log(this.checkedItem)
                this.goodsList.map(function (val) {
                    _this2.checkedItem.map(function (val1) {
                        if (val.id == val1.id) {
                            return val.checked = true;
                        }
                    });
                });
                if (this.checkedItem.length == this.goodsList.length) {
                    this.allcheckbox = true;
                }
                this.disabled = false;
                this.allMoney();
            } else {
                this.disabled = true;
            }
            if (sessionStorage.getItem("editData")) {
                var checkedItem = JSON.parse(sessionStorage.getItem("editData")).IncomeBill_detailList;
                // console.log(this.checkedItem)
                this.goodsList.map(function (val) {
                    checkedItem.map(function (val1) {
                        if (val.id == val1.goodId) {
                            return val.checked = true;
                        }
                    });
                });
                this.checkedItem = this.goodsList.filter(function (val) {
                    return val.checked;
                });
                if (this.checkedItem.length) {
                    this.disabled = false;
                    if (this.checkedItem.length == this.goodsList.length) {
                        this.allcheckbox = true;
                    }
                } else {
                    this.disabled = true;
                }

                // this.disabled = false;
                this.allMoney();
            } else {
                // this.disabled = true;
            }
        },

        // 发票录入按钮
        invoiceInput: function invoiceInput() {
            var _this3 = this;

            var flag = true;
            this.checkedItem.map(function (val) {
                _this3.checkedItem.map(function (val1) {
                    if (val1.supply != val.supply) {
                        flag = false;
                        _this3.isSupply = true;
                    }
                    if (val1.memberName != val.memberName) {
                        flag = false;
                        _this3.isSupply = false;
                    }
                });
            });

            if (flag) {
                sessionStorage.setItem('IncomeBill_detailList', JSON.stringify(this.checkedItem));
                window.location.href = 'b-income-ticket-entering.html';
            } else {
                $('#myModal').modal("show");
            }
        },

        // 批量录入按钮
        batchInput: function batchInput() {
            var _this4 = this;

            var flag = true;
            this.checkedItem.map(function (val) {
                _this4.checkedItem.map(function (val1) {
                    if (val1.supply != val.supply) {
                        flag = false;
                        _this4.isSupply = true;
                    }
                    if (val1.memberName != val.memberName) {
                        flag = false;
                        _this4.isSupply = false;
                    }
                });
            });
            if (flag) {
                sessionStorage.setItem('IncomeBill_detailList', JSON.stringify(this.checkedItem));
                window.location.href = 'b-income-ticket-entered.html?memberId=' + this.checkedItem[0].memberId;
            } else {
                $('#myModal').modal("show");
            }
        },


        // 录票记录按钮，跳转到录票记录页面
        toEnterRecord: function toEnterRecord() {
            window.location.href = '../Salesman/b-income-ticket-enterrecord.html';
        },
        onexport: function onexport() {

            var exportData = {};
            if (!this.checkedItem.length) {
                exportData.contractNumber = this.searchList.contractNumber;
                exportData.name = this.searchList.name;
                exportData.batch = this.searchList.batch;
                exportData.spec = this.searchList.spec;
                exportData.supply = this.searchList.supply;
                exportData.warehouse = this.searchList.warehouse;
                exportData.id = null;
                exportData.clientType = null;
                exportData.memberId = this.searchList.memberId;
            } else {
                var ids = [];
                this.checkedItem.map(function (val) {
                    ids.push(val.id);
                });
                exportData.id = ids.join(',');
                exportData.memberId = this.searchList.memberId;
            }
            this.exportExcell(exportData);
        },
        sure: function sure() {
            var _this5 = this;

            var flag = true;
            this.checkedItem.map(function (val) {
                _this5.checkedItem.map(function (val1) {
                    if (val1.supply != val.supply) {
                        flag = false;
                        _this5.isSupply = true;
                    }
                    if (val1.memberName != val.memberName) {
                        flag = false;
                        _this5.isSupply = false;
                    }
                });
            });
            if (sessionStorage.getItem('IncomeBill_detailList')) {
                var getGoods = JSON.parse(sessionStorage.getItem('IncomeBill_detailList'));
                this.checkedItem.map(function (val) {
                    getGoods.map(function (val1) {
                        if (val1.supply != val.supply) {
                            flag = false;
                            _this5.isSupply = true;
                        }
                        if (val1.memberName != val.memberName) {
                            flag = false;
                            _this5.isSupply = false;
                        }
                    });
                });
            }
            // 点击确定时，判断已选商品的供应商是否和编辑发票的供应商一样，一样的话才能跳转页面
            if (sessionStorage.getItem('editData')) {
                var supply = JSON.parse(sessionStorage.getItem('editData')).IncomeBill.inCompany;
                this.checkedItem.map(function (val) {
                    if (val.supply != supply) {
                        flag = false;
                        _this5.isSupply = true;
                    }
                });
            }
            if (flag) {
                sessionStorage.setItem('IncomeBill_detailList', JSON.stringify(this.checkedItem));
                if (window.location.href.indexOf('entering') != -1) {
                    window.location.href = 'b-income-ticket-entering.html';
                } else {
                    window.location.href = 'b-income-ticket-batchenter.html';
                }
            } else {
                $('#myModal').modal("show");
            }
        },

        // sure2(){
        //     window.location.href = `b-income-ticket-batchenter.html`
        // },


        //导出接口
        exportExcell: function exportExcell(data) {
            window.location.href = 'http://47.100.247.219:9090/incomebill/findInBillExcelById?' + Qs.stringify(data);
        },


        // 查询接口
        searchBtn: function searchBtn() {
            var _this = this;
            this.allcheckbox = false;
            // console.log(_this.searchList)

            $http('/incomebill/findInBillPIDsByParas', _this.searchList).then(function (res) {
                // console.log(res)
                if (res.data.resultCode == 200) {
                    _this.goodsList = res.data.resultData.page.list;
                    _this.searchList.memberId = res.data.resultData.page.list[0].memberId;
                    _this.enterSupMoneny = res.data.resultData.balanceMoney; //进项票余额
                    _this.total = res.data.resultData.page.rowsTotal; //总页码

                    _this.pageInit();
                    _this.allMoney();
                    _this.checkeBtnStatus();
                }
            }).catch(function (err) {
                console.log(err);
            });
        }
    }
});