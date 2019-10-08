'use strict';

var host = 'http://47.100.247.219:9090';

var $http = function $http(url) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return axios.post('' + host + url, Qs.stringify(data), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
};

/****** 创建axios实例 ******/
var service = axios.create({
    baseURL: host, // api的base_url
    timeout: 5000 // 请求超时时间
});

var loading = void 0;

/****** request拦截器==>对请求参数做处理 ******/
// service.interceptors.request.use(config => {

//     loading  = app.$loading({
//         lock: true,
//         text: '加载中。。。',
//         spinner: 'el-icon-loading',
//         background: 'rgba(255, 255, 255, 0.8)'
//     });

//     console.log(config);

//     config.method === 'post'
//         ? config.data = Qs.stringify({...config.data})
//         : config.params = {...config.params};
//     config.headers['Content-Type'] = 'application/x-www-form-urlencoded';

//     return config;

// }, error => {  //请求错误处理
//     app.$message({
//         message: '请求失败',
//         type: 'warning'
//     });
//     Promise.reject(error);
// });

/****** respone拦截器==>对响应做处理 ******/
// service.interceptors.response.use(
//     response => {  //成功请求到数据
//         setTimeout(() => {
//             loading.close()
//         }, 300);

//         console.log(response)
//         return Promise.resolve(response);            

//         //这里根据后端提供的数据进行对应的处理
//         // if ( response.data.resultCode === '200') {

//         // } else {
//         //     app.$message({
//         //         message: '请求失败',
//         //         type: 'warning'
//         //     });
//         // }
//     },
//     error => {  //响应错误处理
//         // console.log('error');
//         // console.log(error);
//         // console.log(JSON.stringify(error));

//         // let text = JSON.parse(JSON.stringify(error)).response.resultCode === 404
//         //     ? '404'
//         //     : '网络异常，请重试';

//         //     app.$message({
//         //         message: '请求失败',
//         //         type: text
//         //     });

//         // return Promise.reject(error)
//     }
// );


//  function $http (url,data) {
//     return service({
//         url: `${host}${url}`,
//         method: 'post',
//         data
//     })
// };


var gformaterBillType = function gformaterBillType(v) {
    var type = void 0;
    switch (v) {
        case '1':
            type = '已保存';
            break;
        case '2':
            type = '待审核';
            break;
        case '3':
            type = '已撤销';
            break;
        case '4':
            type = '已通过';
            break;
        case '5':
            type = '未通过';
            break;
        case '6':
            type = '待作废';
            break;
        case '7':
            type = '已作废';
            break;
        case '8':
            type = '未作废';
            break;
    }
    return type;
};
var gformaterBillPaperType = function gformaterBillPaperType(v) {
    var type = void 0;
    switch (v) {
        case "":
            type = '全部';
            break;
        case '1':
            type = '增值税专用发票';
            break;
        case '2':
            type = '普通发票';
            break;
    }
    return type;
};

var gformaterBillTypes = function gformaterBillTypes(v) {
    var type = void 0;
    switch (v) {
        case "":
            type = '全部';
            break;
        case '1':
            type = '进项票';
            break;
        case '2':
            type = '销项票';
            break;
    }
    return type;
};
var validator = function validator(v) {
    $('form').bootstrapValidator({
        message: 'This value is not valid',
        submitButtons: '#btn-test',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: [':hidden', ':not(:visible)'],
        // excluded:[":disabled"],
        fields: {

            inCompany: {
                validators: {
                    notEmpty: {
                        message: '来票单位必填'
                    }
                }
            },
            taxRate: {
                validators: {
                    notEmpty: {
                        message: '税率必填'
                    },
                    regexp: { /* 只需加此键值对，包含正则表达式，和提示 */
                        regexp: /^100$|^(\d|[1-9]\d)(\.\d{1,4})*$/,
                        message: '请输入1~100的数字，最多保留四位小数'
                    }
                }
            },
            billCreateDate: {
                validators: {
                    notEmpty: {
                        message: '开票时间必填'
                    }
                }
            },
            billCode: {
                validators: {
                    notEmpty: { /*非空提示*/
                        message: '发票编号必填'
                    },
                    regexp: { /* 只需加此键值对，包含正则表达式，和提示 */
                        regexp: /^\d{8}$/,
                        message: '发票编号必须为8位数字'
                    }
                }

            },
            billTotalAccount: {
                trigger: "change",
                validators: {
                    notEmpty: {
                        message: '发票总额必填'
                    }

                    // callback: {
                    //     message: '发票总额必填',
                    //     callback:function(Code, validator,$field){
                    //         // console.log(Code, validator,$field)
                    //         // console.log(Code)
                    //         if($('#billTotalAccount').val()){
                    //             return true;
                    //         }else{
                    //             return false;                                    
                    //         }
                    //     }
                    // }
                }
            },
            openBank: {
                validators: {
                    notEmpty: {
                        message: '开户银行必填'
                    }
                }
            },
            openAccount: {
                validators: {
                    notEmpty: {
                        message: '银行账号必填'
                    },
                    regexp: {
                        regexp: /^([1-9]{1})(\d{15}|\d{18})$/,
                        message: '请输入正确的银行账号。'
                    }
                }
            },
            lpAddress: {
                validators: {
                    notEmpty: {
                        message: '来票地址必填'
                    }
                }
            },
            phone: {
                validators: {
                    notEmpty: {
                        message: '联系电话必填'
                    },
                    regexp: {
                        regexp: /^((\d{3,4})-)(\d{7,8})(-(\d{3,}))?$/,
                        message: '例：025-88888888-8888，区号必须要输入，没有分机号可不输。'
                    }
                }
            },
            taxpayerCode: {
                validators: {
                    notEmpty: {
                        message: '不是有效的统一社会信用编码！(必填)'
                    },
                    // regexp: {
                    //     regexp: /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
                    //     message: '身份证号码格式不正确，为15位和18位身份证号码！'
                    // },
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
            }
        }
    });
};

Vue.prototype.gGetQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    var q = window.location.pathname.substr(1).match(reg_rewrite);
    if (r != null) {

        return unescape(r[2]);
    } else if (q != null) {
        return unescape(q[2]);
    } else {
        return null;
    }
};

//1-保存未提交，2-提交审核中，3-已撤销，4-审核通过，5-审核未通过，6-待作废，7-作废通过，8-作废未通过