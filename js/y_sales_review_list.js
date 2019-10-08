'use strict';
var app = new Vue({
    el: '#app',
    data: function() {
        return {
        	BaseUrl:'http://47.100.247.219:9090/',
            allcheckbox: false, //全选按钮
            applyDate0:'',
            applyDate1:'',
            incomeMoney: 0, //进项票金额总计
            enteredMoney: 0, //已录进项票金额
            enterSupMoneny: 0,//进项票余额
            checkedItem:[],//已选择项
            tableList: [], //查询表格
            operatingList:'', //弹框列表
            showButton:'', //显示按钮
            reason:'',
            introduct:'' //理由
        }
    },
    created: function() {
        this.message = '2333'
    },
    
    mounted: function() {
    	this.setTime();
        var that = this;
        var nowTime = new Date();
        layui.use('laydate', function () {
            var laydate = layui.laydate;
            var nowTime = new Date();
            var a = laydate.render({
                elem: '#test1',
                type: 'date',
                format: 'yyyy-MM-dd',
                max: 'nowTime',
                done: function done(value, date) {
                    that.applyDateStart = value;
                    b.config.min = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
            var b = laydate.render({
                elem: '#test2',
                type: 'date',
                max: 'nowTime',
                format: 'yyyy-MM-dd',
                done: function done(value, date) {
                    that.applyDateEnd = value;
                    a.config.max = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
        });

    },
    watch: {
        tableList: function(v) {
        },

    },
    methods: {
        allCheck() {
            if (this.allcheckbox) {
                this.tableList = this.tableList.map(val => {
                    val.checked = true
                    return val
                })
                this.checkedItem = this.tableList
            } else {
                this.tableList = this.tableList.map(val => {
                    val.checked = false
                    return val
                })
                this.checkedItem = []
            }

            this.allMoney()
        },
        //查询
        submitBilling: function(res){
        	console.log(this.applyDate0);
        	this.applyDate0 = res.path[2][0].value; //申请时间
        	this.applyDate1 = res.path[2][1].value; //结束时间
        	this.memberName = res.path[2][2].value; //委托会员
        	this.billStatus = res.path[2][3].value; //发票状态
        	this.billPaperType = res.path[2][4].value; //发票类型
        	this.receiveCompany = res.path[2][5].value; //收票单位
        	this.billcode = res.path[2][6].value; //发票编号
        	this.billingRecord(1);
        },
        
         //重置
        resetBut: function(){
	      	this.applyDate0=''; //申请开始
	      	this.applyDate1=''; //申请结束
	      	this.memberName=''; //委托会员
	      	this.billStatus=''; //发票状态
	      	this.billPaperType=''; //发票类型
	      	this.receiveCompany=''; //收票单位
	      	this.billcode='';//发票编码
	      	this.setTime();
      },
      
        //获取最近三个月时间
        setTime: function setTime() {
            var now = new Date();
            this.applyDate1 = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
            var startTime = new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
            this.applyDate0 = startTime.getFullYear() + '-' + (startTime.getMonth() + 1 < 10 ? '0' : '') + (startTime.getMonth() + 1) + '-' + (startTime.getDate() < 10 ? "0" : "") + startTime.getDate();
            this.billingRecord(1);
		},
               
        // 销项票审核列表
        billingRecord: function(pagenum){
        var $this = this;
		var baseUrl = $this.BaseUrl+"outbill/findOutBillsByParas";
		var data=Qs.stringify({
			    pagenum:pagenum,
			    pagesize:10,
                applyDate0:$this.applyDate0,
		        applyDate1:$this.applyDate1,
		        memberName:$this.memberName,
		        billStatus:$this.billStatus,
		        billPaperType:$this.billPaperType,
		        receiveCompany:$this.receiveCompany,
		        billcode:$this.billcode
            });
        console.log(data);
        axios({
		      	url:baseUrl,
		        method: "post",
		        type: "json",
		        data:data,
		        headers: {'content-type': 'application/x-www-form-urlencoded'}
		      })
		      .then(function(res) {
		         console.log(res);
		         $this.page = res.data.resultData.page;  //当前页码
		         $this.pageTotal = res.data.resultData.pageTotal;  //共多少页
		         $this.rows = res.data.resultData.rows;  //每页多少条
		         $this.rowsTotal = res.data.resultData.rowsTotal; //总条数
		         $this.tableList = res.data.resultData.list; //查询表格
		         $('#pagination').pagination({
		            total: res.data.resultData.rowsTotal,
		            onSelectPage:function(pageNumber, pageSize){
		                console.log(pageNumber, pageSize);
		                $this.billingRecord(pageNumber);
		                $(this).pagination('loading');
		                $(this).pagination('loaded');
		            }
		            
		         });
		      })
		      .catch(function() {
		
		      })
        },
        //详情
        detailsPage: function(item){
        	console.log(item);
	      	localStorage.setItem('item',JSON.stringify(item));
	        window.location.href = "y_sales_review_details.html";
        },
        //查看详情
        detailsModelPage: function(){
        	localStorage.setItem('item',JSON.stringify(this.operatingList));
	        window.location.href = "y_sales_review_details.html";
        },
        //通过、不通过、作废、不作废
        operatingModel: function(item,num){
            this.introduct = '';
        	console.log(item);
        	this.operatingList = item;
        	this.showButton = num;
        },
        //模态框通过、不通过     //作废，不作废
        byModel: function(num,byClass){
        	var $this = this;
        	if(num == 1){ //通过 
        		var type = 1;
        	}else{        //不通过
        		var type = 0; 
        	}
        	if(byClass == 1){ //审核通过或审核不通过
        		var baseUrl = $this.BaseUrl+"outbill/adoptOutbillById";
        	}else if(byClass == 2 || byClass ==3 ){ //作废通过或作废不通过
        		var baseUrl = $this.BaseUrl+"outbill/HandleCancelOutbillById";
        	}
			var data=Qs.stringify({
				  outbillId:$this.operatingList.id, //当前选中数据
				  clientType:1,
				  reason:$this.introduct,
				  type:type
	            });
	        console.log(data);
	        if($this.introduct == ''){//没添加理由
	        	if(type == 0){
	        	    var message;
	        	    if(byClass == 1){
                        message = '审核不通过时理由不能为空！';
                        // return;
                    }else if(byClass == 2){
                        message = '审核理由不能为空！';
                        // return;
                    }else{
                        message = '作废原因不能为空！';
                        // return;
                    }
	        		$this.$message({
			          message:message,
			          type: 'warning',
			          duration:2000
			       });
	        	     return;
	        	}
	        	
	        }
	        axios({
		      	url:baseUrl,
		        method: "post",
		        type: "json",
		        data:data,
		        headers: {'content-type': 'application/x-www-form-urlencoded'}
		      })
		      .then(function(res) {
		         console.log(res);
		         if(res.data.resultCode == 200){
		         	$this.$message({
			          message:'操作成功',
			          type: 'success',
			          duration:2000
			        });
			        $('#myModal').modal('hide');
		         	$this.billingRecord(1);
		         }
		      })
		      .catch(function() {
		
		      })
        },
        opeatorFun: function(item) {
            console.log(item)
            
        },

        // 获取理由
        voidClick: function voidClick(data) {
            this.itemData = data;
            var $this = this;
            var baseUrl = $this.BaseUrl+"outbill/HandleCancelOutbillAndReturnReason";
            var data=Qs.stringify({
                id: data.id
            });
            axios({
                url:baseUrl,
                method: "post",
                type: "json",
                data:data,
                headers: {'content-type': 'application/x-www-form-urlencoded'}
            }).then(function(res) {
                if (res.data.resultCode == 200) {
                    console.log(res);
                    $this.reason = res.data.resultData;
                } else {
                    $this.$message({
                        type: 'warning',
                        message: '申请原因请求失败！'
                    });
                }
                })
                .catch(function(err) {
                    $this.$message({
                        type: 'warning',
                        message: '申请原因请求失败！'
                    });
                })
        },









        searchBtn(){
            console.log(axios)
            axios({
                    url: 'http://926-cs-crm-za-crm-fpc.test.za.biz/api/operationlog/v2/queryLogList',
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                        'usercontext': {
                            'tenantId': 1,
                            'deptId': 34001,
                            'userId': 34001,
                            'orgId': 4
                        }
                    },
                    data: {
                        "bizId": 1062003,
                        "fastRecordBizCategoryEnum": "SALES_OPPORTUNITY"
                    },
                    contentType: 'json',
                    dataType: 'json'
                })
                .then(function (res) {
                    console.log(res);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    }
})