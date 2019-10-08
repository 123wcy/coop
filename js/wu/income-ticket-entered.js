'use strict';

var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            allcheckbox: false, //全选按钮
            incomeMoney: 0, //进项票金额总计
            // enterSupMoneny: 0,//进项票余额
            disabled: true, //按钮是否可用
            checkedItem: [], //已选择项
            searchList: {
                inCompany: '', //来票单位
                billCreateDateStart: '', //开票时间
                billCreateDateEnd: '',
                billPaperType: '', //发票类型
                billCode: '', //发票编号
                type: '0', //发票状态
                pagenum: 1, //第几页
                pagesize: 10 //每页多少条

            },
            total: 0, //记录总条数
            invoiceList: [],

            editList: [{
                "id": "",
                "name": "",
                "spec": "",
                "goodsWeight": "",
                "inCompany": "",
                "billCode": "",
                "billPaperType": "",
                "billMoney": "",
                "billCreateDate": "",
                "type": "",
                "memberId": "",
                "states": "",
                "openBank": "",
                "openAccount": "",
                "taxpayerCode": "",
                "lpAddress": "",
                "phone": "",
                "taxRate": ""
            }],
            editBillCode: '', //编辑的发票编号
            timer: null,
            maxDate: ''
        };
    },
    created: function created() {
        var now = new Date();
        this.maxDate = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        if (sessionStorage.getItem("goodsList")) {
            this.searchList.inCompany = JSON.parse(sessionStorage.getItem("goodsList"))[0].supply;
        }
    },
    mounted: function mounted() {
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
                    that.searchList.billCreateDateStart = value;
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
                    that.searchList.billCreateDateEnd = value;
                    a.config.max = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
        });

        this.searchBtn();
        this.pageInit();
    },

    watch: {
        invoiceList: function invoiceList(v) {}
    },
    methods: {
        // 控制若开始时间超过结束时间时，默认结束时间为开始时间，若结束时间早于开始时间，默认开始时间为结束时间
        selectTime: function selectTime() {
            if (this.searchList.billCreateDateStart && this.searchList.billCreateDateEnd) {
                if (this.searchList.billCreateDateStart > this.searchList.billCreateDateEnd) {
                    this.searchList.billCreateDateEnd = this.searchList.billCreateDateStart;
                }
                if (this.searchList.billCreateDateEnd < this.searchList.billCreateDateStart) {
                    this.searchList.billCreateDateStart = this.searchList.billCreateDateEnd;
                }
            }
        },
        pageInit: function pageInit() {
            var that = this;
            $('#pagination').pagination({
                total: that.total,
                onSelectPage: function onSelectPage(pageNumber, pageSize) {
                    // console.log(pageNumber, pageSize,that.total)
                    that.searchList.pagenum = pageNumber;
                    that.searchList.pagesize = pageSize;
                    that.searchBtn();
                    $(this).pagination('loading');
                    $(this).pagination('loaded');
                }
            });
        },
        checkboxChecked: function checkboxChecked() {
            var _this2 = this;

            if (sessionStorage.getItem("invoiceList")) {
                this.checkedItem = JSON.parse(sessionStorage.getItem("invoiceList"));
                // console.log(this.checkedItem)
                this.invoiceList.map(function (val) {
                    _this2.checkedItem.map(function (val1) {
                        if (val.billCode == val1.billCode && val.type == '未匹配') {
                            return val.checked = true;
                        }
                    });
                });
                var a = this.invoiceList.filter(function (val) {
                    return val.type == "未匹配";
                });
                if (this.checkedItem.length == a.length) {
                    this.allcheckbox = true;
                }
                this.disabled = false;
                this.allMoney();
            } else {
                this.disabled = true;
            }
        },
        allCheck: function allCheck() {
            if (this.allcheckbox && this.invoiceList.length) {
                this.checkedItem = this.invoiceList.filter(function (val) {
                    if (val.type == '未匹配') {
                        val.checked = true;
                        return val;
                    }
                });
                this.disabled = false;
                // this.checkedItem = this.invoiceList
            } else {
                this.invoiceList.map(function (val) {

                    if (val.type == '未匹配') {
                        val.checked = false;
                        return val;
                    }
                });
                this.checkedItem = [];
                this.disabled = true;
            }

            this.allMoney();
        },

        //单选
        singleCheck: function singleCheck(item) {
            this.allMoney();
            if (item.checked) {
                this.invoiceList.map(function (val) {
                    if (item.billCode == val.billCode && val.type == '未匹配') {
                        val.checked = true;
                    }
                });
            } else {
                this.invoiceList.map(function (val) {
                    if (item.billCode == val.billCode && val.type == '未匹配') {
                        val.checked = false;
                    }
                });
            }
            var a = this.invoiceList.filter(function (val) {
                return val.checked;
            });
            this.checkedItem = a;
            var b = this.invoiceList.filter(function (val) {
                return val.type == '未匹配';
            });
            if (a.length !== b.length) {
                this.allcheckbox = false;
            } else {
                this.allcheckbox = true;
            }

            for (var i = 0; i < this.invoiceList.length; i++) {
                if (this.invoiceList[i].checked) {
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

            this.invoiceList.map(function (val) {
                if (val.checked) {
                    incomeMoney += +val.billMoney;
                } else {
                    incomeMoney = 0;
                }
            });
            this.incomeMoney = incomeMoney.toFixed(2);
        },
        resetBtn: function resetBtn() {
            this.searchList = {
                inCompany: this.searchList.inCompany, //来票单位
                billCreateDateStart: '', //开票时间
                billCreateDateEnd: '',
                billPaperType: '', //发票类型
                billCode: '', //发票编号
                type: '', //发票状态
                pagenum: 1, //第几页
                pagesize: 10 //每页多少条
            };
            this.searchBtn();
        },
        back: function back() {
            window.history.go(-1);
        },
        toBatchEnter: function toBatchEnter() {
            if (this.checkedItem.length) {
                sessionStorage.setItem('invoiceList', JSON.stringify(this.checkedItem));
                window.location.href = 'income-ticket-batchenter.html';
            }
        },


        // 查询接口
        searchBtn: function searchBtn() {
            var _this3 = this;

            // console.log(this.searchList)
            $http('/incomebill/findMatchInBillByPara', this.searchList).then(function (res) {
                if (res.data.resultCode == 200) {
                    if (res.data.resultData) {
                        _this3.invoiceList = res.data.resultData.list;
                        _this3.invoiceList.map(function (val) {
                            if (val.type == '1') {
                                val.type = '已匹配';
                            } else if (val.type == '0') {
                                val.type = '未匹配';
                            }
                            val.billPaperType = gformaterBillPaperType(val.billPaperType);
                        });
                        _this3.checkboxChecked();
                        _this3.total = res.data.resultData.rowsTotal; //总页码
                        _this3.pageInit();
                    }
                }
            }).catch(function (err) {
                console.log(err);
            });
        },

        // 文件上传接口
        fileinput: function fileinput() {
            var _this = this;
            var formData = new FormData();
            var file = $('#file-Portrait');
            if (!file.val()) {
                this.$message({
                    message: '请选择需要导入的excel文件!',
                    type: 'warning'
                });

                return false;
            } else {
                formData.append("file", file[0].files[0]);
            }
            $.ajax({
                url: "http://47.100.247.219:9090/incomebill/import",
                type: 'POST',
                data: formData,
                processData: false, //告诉jquery不要去处理发送的数据
                contentType: false, //告诉jQuery不要去设置Conten-Type请求头
                success: function success(response) {
                    _this.$message({
                        message: response.resultData,
                        type: 'success'
                    });
                    $('#uploadModal').modal('hide');
                    _this.searchBtn();
                }
            });
        },

        // 下载模板
        downLoad: function downLoad() {
            // window.location.href = 'http://47.100.247.219:9090/incomebill/dowload'
        },


        // 删除一行商品按钮
        delClick: function delClick(item) {
            // console.log(this.editList, item)
            this.editList = this.editList.filter(function (val) {
                if (val.flag !== item.flag) {
                    return val;
                }
            });
        },

        //增加明细
        addClick: function addClick() {
            // let len = this.editList.detailList.length
            var timestamp = new Date().getTime();
            // let editList = [];
            this.editList.push({
                flag: 'flag' + timestamp,
                id: '',
                name: '',
                spec: '',
                goodsWeight: '',
                inCompany: this.editList[0].inCompany,
                billCode: this.editList[0].billCode,
                billPaperType: this.editList[0].billPaperType,
                billMoney: this.editList[0].billMoney,
                billCreateDate: this.editList[0].billCreateDate,
                openBank: this.editList[0].openBank,
                openAccount: this.editList[0].openAccount,
                taxpayerCode: this.editList[0].taxpayerCode,
                lpAddress: this.editList[0].lpAddress,
                phone: this.editList[0].phone,
                taxRate: this.editList[0].taxRate

            });
            // this.editList = this.editList.concat(editList)
            // this.editList = JSON.stringify(arr);
        },

        // 编辑查询接口
        editClick: function editClick(item) {
            var _this4 = this;

            // console.log(item)
            // this.editList = item
            this.editBillCode = item.billCode;
            $http('/incomebill/findTicketByCode', { billCode: this.editBillCode }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this4.editList = res.data.resultData;
                    _this4.editList.map(function (val, i) {
                        val.billCreateDate = val.billCreateDate.split(' ')[0];
                        // val.billPaperType = gformaterBillPaperType(val.billPaperType);
                        val.flag = 'flag' + i;
                    });
                    // console.log( this.editList);
                }
            }).catch(function (err) {
                console.log(err);
            });
        },

        // 编辑发票确定按钮
        editSubmit: function editSubmit() {
            var _this5 = this;

            var data = {};
            data.code = this.editBillCode;
            data.list = JSON.stringify(this.editList);
            $http('/incomebill/updateTicketByCode', data).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this5.$message({
                        message: res.data.resultData,
                        type: 'success'
                    });
                    $('#myModal').modal('hide');
                    _this5.searchBtn();
                }
            }).catch(function (err) {
                console.log(err);
            });
        },

        //删除发票接口
        delInvoice: function delInvoice() {
            var _this6 = this;

            $http('/incomebill/deleteTicketByCode', { billCode: this.editBillCode }).then(function (res) {
                if (res.data.resultCode == 200) {
                    _this6.$message({
                        message: '操作成功！',
                        type: 'success'
                    });
                    $('#myModal').modal('hide');
                    _this6.searchBtn();
                }
            }).catch(function (err) {
                console.log(err);
            });
        }
    }
});