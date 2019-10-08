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
            loading: false,
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
                pagesize: '10' //每页条数
                // clientType: null,//客户端类型
                // memberId: 'U20180003'//会员UID
            },
            goodsList: []
        };
    },
    created: function created() {
        this.searchBtn();
    },
    mounted: function mounted() {

        if (window.location.href.indexOf('entering') != -1) {
            this.isShow = true;
        }
        if (window.location.href.indexOf('enteringback') != -1) {
            this.isShow = false;
        }
        if (window.location.href.indexOf('batch') != -1) {
            this.isShow = true;
        }
        if (!this.isShow && window.location.href.indexOf('?') == -1) {
            if (sessionStorage.getItem('editData')) {
                sessionStorage.removeItem('editData');
            }
            if (sessionStorage.getItem('goodsList')) {
                sessionStorage.removeItem('goodsList');
            }
        }
    },

    watch: {
        goodsList: function goodsList(v) {}
    },

    methods: {
        pageInit: function pageInit() {
            var that = this;
            $('#pagination').pagination({
                total: that.total,
                onSelectPage: function onSelectPage(pageNumber, pageSize) {
                    console.log(pageNumber, pageSize, that.total);
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

        // 检查按钮是否能用
        checkeBtnStatus: function checkeBtnStatus() {
            var _this = this;

            if (sessionStorage.getItem("goodsList")) {
                this.checkedItem = JSON.parse(sessionStorage.getItem("goodsList"));
                // console.log(this.checkedItem)
                this.goodsList.map(function (val) {
                    _this.checkedItem.map(function (val1) {
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
            var _this2 = this;

            var flag = true;
            this.checkedItem.map(function (val) {
                _this2.checkedItem.map(function (val1) {
                    if (val1.supply != val.supply) {
                        flag = false;
                    }
                });
            });
            if (flag) {
                sessionStorage.setItem('goodsList', JSON.stringify(this.checkedItem));
                window.location.href = 'income-ticket-entering.html';
            } else {
                $('#myModal').modal("show");
            }
        },

        // 批量录入按钮
        batchInput: function batchInput() {
            var _this3 = this;

            var flag = true;
            this.checkedItem.map(function (val) {
                _this3.checkedItem.map(function (val1) {
                    if (val1.supply != val.supply) {
                        flag = false;
                    }
                });
            });
            if (flag) {
                sessionStorage.setItem('goodsList', JSON.stringify(this.checkedItem));
                window.location.href = 'income-ticket-entered.html';
            } else {
                $('#myModal').modal("show");
            }
        },


        // 录票记录按钮，跳转到录票记录页面
        toEnterRecord: function toEnterRecord() {
            window.location.href = 'income-ticket-enterrecord.html';
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
                exportData.memberId = 'U20180003';
            } else {
                var ids = [];
                this.checkedItem.map(function (val) {
                    ids.push(val.id);
                });
                exportData.id = ids.join(',');
                exportData.memberId = 'U20180003';
            }
            // console.log(exportData)
            this.exportExcell(exportData);
        },
        sure: function sure() {
            var _this4 = this;

            var flag = true;
            this.checkedItem.map(function (val) {
                _this4.checkedItem.map(function (val1) {
                    if (val1.supply != val.supply) {
                        flag = false;
                    }
                });
            });
            if (sessionStorage.getItem('goodsList')) {
                var getGoods = JSON.parse(sessionStorage.getItem('goodsList'));
                this.checkedItem.map(function (val) {
                    getGoods.map(function (val1) {
                        if (val1.supply != val.supply) {
                            flag = false;
                        }
                    });
                });
            }
            // 点击确定时，判断已选商品的供应商是否和编辑发票的供应商一样，一样的话才能跳转页面
            if (sessionStorage.getItem('editData')) {
                // console.log(sessionStorage.getItem('editData'),'aq')
                var supply = JSON.parse(sessionStorage.getItem('editData')).IncomeBill.inCompany;
                // console.log(supply,'ar')
                this.checkedItem.map(function (val) {
                    if (val.supply != supply) {
                        flag = false;
                    }
                });
            }

            if (flag) {
                sessionStorage.setItem('goodsList', JSON.stringify(this.checkedItem));
                if (window.location.href.indexOf('entering') != -1) {
                    window.location.href = 'income-ticket-entering.html';
                } else {
                    window.location.href = 'income-ticket-batchenter.html';
                }
            } else {
                $('#myModal').modal("show");
            }
        },


        //导出接口
        exportExcell: function exportExcell(data) {
            window.location.href = 'http://47.100.247.219:9090/incomebill/findInBillExcelById?' + Qs.stringify(data);
        },


        // 查询接口
        searchBtn: function searchBtn() {
            var _this5 = this;

            this.loading = true;
            this.allcheckbox = false;
            $http('/incomebill/findInBillPIDsByParas', this.searchList).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this5.loading = false;
                    _this5.goodsList = res.data.resultData.page.list;
                    _this5.enterSupMoneny = res.data.resultData.balanceMoney; //进项票余额
                    _this5.total = res.data.resultData.page.rowsTotal; //总页码
                    _this5.pageInit();
                    _this5.allMoney();
                    _this5.checkeBtnStatus();
                }
            }).catch(function (err) {
                _this5.loading = false;
                console.log(err);
            });
        }
    }
});