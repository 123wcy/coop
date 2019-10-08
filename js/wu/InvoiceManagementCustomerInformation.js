"use strict";
var app = new Vue({
    el: "#app",
    data: function data() {
        return {
            isShow:false,
            reload:true,
            loading:false,
            allcheckbox: false, //全选按钮
            selectionsIds:[],//已选择项
            page: 1, //显示的是哪一页
            pageSize: 10, //每一页显示的数据条数
            total: 0, //记录总数
            show: false, //是否展示无数据提示信息
            searchList: {
                companyName: '',
                companyAddr: '',
                connector: '',
                pagenum: '1',
                pagesize: '10',

            },
            enterrecordList: [],
            itemData:{},//点击每一项的数据
            memberId :'',
            virAccNo :'',
            uid :'',
            paramId:'',
            addCustomerInfo: {
                companyName:'',
                companyAddr:'',
                phone:'',
                taxCode:'',
                openBank:'',
                bankAccount:'',
                connector:'',
                connectPhone:'',
            },
        }
    },
    created: function created() {

        var params = {
            pagenum: this.page,
            pagesize: this.pageSize
        };
    },
    mounted: function mounted() {
        if (window.location.href.indexOf('entering') != -1) {
            this.isShow = true;
        };
        this.searchBtn();
        this.pageInit();
        $('#recordPopover_modal').on('hidden.bs.modal', function () {
            $("#content").data('bootstrapValidator').destroy();
            $('#content').data('bootstrapValidator', null);
            $("#content")[0].reset(); //重置表单，此处用jquery获取Dom节点时一定要加[0]
            this.addtest(); //要重新绑定验证
        });
    },
    methods: {
        // 分页
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


        // 重置
        reset: function reset() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.searchList)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var k = _step.value;

                    Vue.delete(this.searchList, k);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            };
            this.pageInit();
            $('#pagination').pagination({
                refresh: true,
                pageSize: 10,
                pageNumber: 1,
                total: this.total
            });
            this.searchBtn();
        },


        // 全选
        allCheck: function allCheck() {
            if (this.allcheckbox && this.enterrecordList.length) {
                this.disabled = false;
                this.enterrecordList = this.enterrecordList.map(function (val) {
                    val.checked = true;
                    return val;
                });
                this.selectionsIds = this.enterrecordList;
            } else {
                this.disabled = true;
                this.enterrecordList = this.enterrecordList.map(function (val) {
                    val.checked = false;
                    return val;
                });
                this.selectionsIds = [];
            }
        },

        // 单选
        singleCheck: function singleCheck(item) {
            var a = this.enterrecordList.filter(function (val) {
                return val.checked;
            });
            this.selectionsIds = a;
            if (a.length !== this.enterrecordList.length) {
                this.allcheckbox = false;
            } else {
                this.allcheckbox = true;
            }

            for (var i = 0; i < this.enterrecordList.length; i++) {
                if (this.enterrecordList[i].checked) {
                    this.disabled = false;
                    return;
                } else {
                    this.disabled = true;
                }
            }
        },


        // 查询接口
        searchBtn: function searchBtn() {
            var _this2 = this;

            var _this = this;
            this.show = false;
            this.allcheckbox = false;
            $http('/Customer/findCustomersByParas', this.searchList).then(function (res) {

                if (res.data.resultCode == "200") {
                    _this.enterrecordList = res.data.resultData.list;
                    _this.memberId = _this.enterrecordList.memberId;
                    _this.virAccNo = _this.enterrecordList.virAccNo;
                    _this.uid = _this.enterrecordList.uid;
                    // console.log(res);
                    if (!_this.enterrecordList.length) {
                        // _this.show = true;
                        _this.$message('没有找到符合条件的内容!');
                    }

                    _this2.total = res.data.resultData.rowsTotal; //总页码
                    // this.pageSize =  res.data.resultData.rows;
                    console.log(res);
                    console.log('a', _this.total);
                    _this.pageInit();
                }
            }).catch(function (err) {
                // alert("222");
                console.log(err);
            });
        },


        // 修改
        val: function val(id) {
            var testData = {};
            $http('/Customer/findCustomerByid?id=' + id + '').then(function (res) {
                if (res.data.resultCode == "200") {
                    var data = res.data.resultData;
                    $("#namel").val(data.companyName);
                    $("#addressl").val(data.companyAddr);
                    $("#numberl").val(data.phone);
                    $("#keyl").val(data.taxCode);
                    $("#depositl").val(data.openBank);
                    $("#accountl").val(data.bankAccount);
                    $("#Contactsl").val(data.connector);
                    $("#mobilel").val(data.connectPhone);
                    testData.memberId = data.memberId;
                    testData.virAccNo = data.virAccNo;
                    testData.uid = data.uid;
                }
            }).catch(function (err) {
                console.log(err);
            });
            testData.paramId = id;
            this.valtest(testData);
        },

        // 修改验证
        valtest: function valtest(data) {
            var esthis = this;
            $('#contentl').bootstrapValidator({
                message: '这个值没有被验证',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    namel: {
                        validators: {
                            notEmpty: {
                                message: '公司名称不能为空！'
                            }
                        }
                    },
                    addressl: {
                        // message: '用户名还没有验证',
                        validators: {
                            notEmpty: {
                                message: '公司地址不能为空！'
                            }
                        }
                    },
                    numberl: {
                        validators: {
                            notEmpty: {
                                message: '联系电话不能为空！'
                            },
                            regexp: {
                                regexp: /^((\d{3,4})-)(\d{7,8})(-(\d{3,}))?$/,
                                message: '例：025-88888888-8888，区号必须要输入，没有分机号可不输！'
                            }
                        }
                    },
                    keyl: {
                        validators: {
                            notEmpty: {
                                message: '纳税人识别码不能为空！'
                            },
                            callback: { /*自定义，可以在这里与其他输入项联动校验*/
                                message: '不是有效的统一社会信用编码！(必填)',
                                callback: function callback(Code, validator, $field) {
                                    var patrn = /^[0-9A-Z]+$/;
                                    //18位校验及大写校验
                                    if (Code.length != 18 || patrn.test(Code) == false) {
                                        message: '不是有效的统一社会信用编码！(必填)';
                                        return false;
                                    } else {
                                        var Ancode; //统一社会信用代码的每一个值
                                        var Ancodevalue; //统一社会信用代码每一个值的权重
                                        var total = 0;
                                        var weightedfactors = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]; //加权因子
                                        var str = '0123456789ABCDEFGHJKLMNPQRTUWXY';
                                        //不用I、O、S、V、Z
                                        for (var i = 0; i < Code.length - 1; i++) {
                                            Ancode = Code.substring(i, i + 1);
                                            Ancodevalue = str.indexOf(Ancode);
                                            total = total + Ancodevalue * weightedfactors[i];
                                            //权重与加权因子相乘之和
                                        }
                                        var logiccheckcode = 31 - total % 31;
                                        if (logiccheckcode == 31) {
                                            logiccheckcode = 0;
                                        }
                                        var Str = "0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,W,X,Y";
                                        var Array_Str = Str.split(',');
                                        logiccheckcode = Array_Str[logiccheckcode];

                                        var checkcode = Code.substring(17, 18);
                                        if (logiccheckcode != checkcode) {
                                            message: '不是有效的统一社会信用编码！(必填)';
                                            return false;
                                        } else {
                                            // console.info("yes");
                                        }
                                        return true;
                                    }
                                }
                            }
                        }
                    },
                    depositl: {
                        validators: {
                            notEmpty: {
                                message: '开户银行不能为空！'
                            }
                        }
                    },
                    accountl: {
                        validators: {
                            notEmpty: {
                                message: '银行账号不能为空！'
                            },
                            regexp: {
                                regexp: /^([1-9]{1})(\d{15}|\d{18})$/,
                                message: '请输入正确的银行账号！'
                            }
                        }
                    },
                    Contactsl: {},
                    mobilel: {
                        validators: {
                            regexp: {
                                regexp: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/,
                                message: '请输入11位手机号码！'
                            }

                        }
                    }
                }
            }).on('success.form.bv', function (e) {
                e.preventDefault();
                var $form = $(e.target);
                // Get the BootstrapValidator instance
                var bv = $form.data('bootstrapValidator');
                var list = {
                    "id": data.paramId,
                    "companyName": $('#namel').val(),
                    "companyAddr": $('#addressl').val(),
                    "phone": $('#numberl').val(),
                    "taxCode": $('#keyl').val(),
                    "openBank": $('#depositl').val(),
                    "bankAccount": $('#accountl').val(),
                    "connector": $('#Contactsl').val(),
                    "connectPhone": $('#mobilel').val(),
                    "memberId": data.memberId,
                    "virAccNo": data.virAccNo,
                    "uid": data.uid

                };
                // Use Ajax to submit form data
                $http('/Customer/updateCutomer', list).then(function (res) {
                    if (res.data.resultCode == "200") {
                        $("#contentl")[0].reset(); //重置表单，此处用jquery获取Dom节点时一定要加[0]
                        $("#contentl").data('bootstrapValidator').resetForm(); //清除当前验证的关键之处
                        $("#edit_modal").modal("hide");
                        esthis.reset();
                        esthis.$message({
                            message: '修改成功',
                            type: 'success'
                        });
                    } else {
                        esthis.$message.error('添加失败');
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            });
        },


        // 取消
        cancel: function cancel() {
            $("#contentl").data('bootstrapValidator').resetForm();
        },


        // 添加
        add: function add() {

            this.addtest();
        },

        // 添加验证
        addtest: function addtest() {
            // $("#content")[0].reset();//重置表单，此处用jquery获取Dom节点时一定要加[0]
            // $("#content").data('bootstrapValidator').resetForm();
            var addthis = this;
            $('#content').bootstrapValidator({
                message: '这个值没有被验证',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    name: {
                        validators: {
                            notEmpty: {
                                message: '公司名称不能为空！'
                            }

                        }
                    },
                    address: {
                        // message: '用户名还没有验证',
                        validators: {
                            notEmpty: {
                                message: '公司地址不能为空！'
                            }
                        }
                    },
                    number: {
                        validators: {
                            notEmpty: {
                                message: '联系电话不能为空！'
                            },
                            regexp: {
                                regexp: /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/,
                                message: '例：025-88888888-8888，区号必须要输入，没有分机号可不输！'
                            }
                        }
                    },
                    key: {
                        validators: {
                            notEmpty: {
                                message: '纳税人识别码不能为空！'
                            },
                            callback: { /*自定义，可以在这里与其他输入项联动校验*/
                                message: '不是有效的统一社会信用编码！(必填)',
                                callback: function callback(Code, validator, $field) {
                                    var patrn = /^[0-9A-Z]+$/;
                                    //18位校验及大写校验
                                    if (Code.length != 18 || patrn.test(Code) == false) {
                                        message: '不是有效的统一社会信用编码！(必填)';
                                        return false;
                                    } else {
                                        var Ancode; //统一社会信用代码的每一个值
                                        var Ancodevalue; //统一社会信用代码每一个值的权重
                                        var total = 0;
                                        var weightedfactors = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]; //加权因子
                                        var str = '0123456789ABCDEFGHJKLMNPQRTUWXY';
                                        //不用I、O、S、V、Z
                                        for (var i = 0; i < Code.length - 1; i++) {
                                            Ancode = Code.substring(i, i + 1);
                                            Ancodevalue = str.indexOf(Ancode);
                                            total = total + Ancodevalue * weightedfactors[i];
                                            //权重与加权因子相乘之和
                                        }
                                        var logiccheckcode = 31 - total % 31;
                                        if (logiccheckcode == 31) {
                                            logiccheckcode = 0;
                                        }
                                        var Str = "0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,W,X,Y";
                                        var Array_Str = Str.split(',');
                                        logiccheckcode = Array_Str[logiccheckcode];

                                        var checkcode = Code.substring(17, 18);
                                        if (logiccheckcode != checkcode) {
                                            message: '不是有效的统一社会信用编码！(必填)';
                                            return false;
                                        } else {
                                            // console.info("yes");
                                        }
                                        return true;
                                    }
                                }
                            }
                        }
                    },
                    deposit: {
                        validators: {
                            notEmpty: {
                                message: '开户银行不能为空！'
                            }
                        }
                    },
                    account: {
                        validators: {
                            notEmpty: {
                                message: '银行账号不能为空！'
                            },
                            regexp: {
                                regexp: /^([1-9]{1})(\d{14}|\d{18})$/,
                                message: '请输入正确的银行账号！'
                            }
                        }
                    },
                    Contacts: {},
                    mobile: {
                        validators: {
                            regexp: {
                                regexp: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/,
                                message: '请输入11位手机号码！'
                            }

                        }
                    }
                }
            }).on('success.form.bv', function (e) {
                // Prevent form submission
                e.preventDefault();
                // Get the form instance

                var $form = $(e.target);
                // Get the BootstrapValidator instance
                var bv = $form.data('bootstrapValidator');
                var list = {
                    "companyName": $('#name').val(),
                    "companyAddr": $('#address').val(),
                    "phone": $('#number').val(),
                    "taxCode": $('#key').val(),
                    "openBank": $('#deposit').val(),
                    "bankAccount": $('#account').val(),
                    "connector": $('#Contacts').val(),
                    "connectPhone": $('#mobile').val()
                };
                // Use Ajax to submit form data
                $http('/Customer/saveCustomer', list).then(function (res) {
                    if (res.data.resultCode == "200") {
                        $("#content")[0].reset(); //重置表单，此处用jquery获取Dom节点时一定要加[0]
                        $("#content").data('bootstrapValidator').resetForm(); //清除当前验证的关键之处
                        $("#recordPopover_modal").modal("hide");
                        addthis.reset();
                        addthis.$message({
                            message: '添加成功',
                            type: 'success'
                        });
                    } else {
                        addthis.$message.error('添加失败');
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            });
        },


        // 返回
        back: function back() {
            window.history.go(-1);
        },


        //确定
        sure: function sure() {
            if (this.selectionsIds.length == 1) {
                if (window.location.href.indexOf('from=Salentering') != -1) {
                    window.location.href = '../wu/b-income-ticket-entering.html?uid=' + this.selectionsIds[0].uid + '&companyName=' + this.selectionsIds[0].companyName;
                } else {
                    window.location.href = '../wu/income-ticket-entering.html?uid=' + this.selectionsIds[0].uid + '&companyName=' + this.selectionsIds[0].companyName;
                }
            } else if (this.selectionsIds.length > 1) {
                this.$message({
                    message: '最多选择一条数据',
                    type: 'error'
                });
            } else {
                this.$message({
                    message: '请选择一条数据',
                    type: 'error'
                });
            }
        },


        // 导出接口
        onexport: function onexport() {
            var exportData = {};
            var ids = [];
            this.selectionsIds.map(function (val) {
                ids.push(val.id);
            });
            exportData.selectionsIds = ids.join(',');
            exportData.companyName = this.searchList.companyName;
            exportData.companyAddr = this.searchList.companyAddr;
            exportData.connector = this.searchList.connector;

            this.exportExcell(exportData);

            console.log(exportData.selectionsIds);
            console.log(exportData);
        },
        exportExcell: function exportExcell(data) {
            alert(data.selectionsIds);
            window.location.href = 'http://47.100.247.219:9090/Customer/outPutCustomerExcel?' + Qs.stringify(data);
        }
    }
});