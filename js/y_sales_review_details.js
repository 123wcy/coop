'use strict';
var app = new Vue({
    el: '#app',
    data: function() {
        return {
        	baseUrl:'http://47.100.247.219:9090/',
            message: 'Hello Vue!111',
            msg:'11',
            hetong:'111',
            Outbill:{},
            Out_hisList:[],
            tableData:[],
            billPaperType:'', //发票类型
            reason:'', //撤销或申请作废理由
            editNum:'',//选中状态
            modelTitle:'',
            introduct:'', //理由
            updatedate:''
          };
      
    },
    created: function() {
        this.message = '2333';
        this.item = JSON.parse(localStorage.getItem("item"));
        if(this.item != null || this.item != undefined){
        	this.detailsList(this.item.id);
        }else{
        	this.item = [];
        }
    },
    mounted: function() {
        
    },
    watch: {
       
    },
    methods: {
    	//详情表格
    	detailsList: function(id){
        var $this = this;
		var baseUrl = $this.baseUrl+"outbill/findOutBillDetail"; //outbill/findOutBillDetail
		var data=Qs.stringify({
			    OutbillId:id
            });
        axios({
		      	url:baseUrl,
		        method: "post",
		        type: "json",
		        data:data,
		        headers: {'content-type': 'application/x-www-form-urlencoded'}
		      })
		      .then(function(res) {
		         console.log(res);
		         $this.tableData = res.data.resultData.Out_detailList; //表格
		         $this.Outbill = res.data.resultData.Outbill; //销项票文本框
		         $this.Out_hisList = res.data.resultData.Out_hisList; //左上角状态
		         $this.updatedate = res.data.resultData.Outbill[0].updatedate;
		         $this.member = res.data.resultData.member;
		      })
		      .catch(function() {
		
		      })
    	},
    	//返回
    	goBack: function(){
    		window.location.href = "y_sales_review_list.html";
    	},
       //模态框通过、不通过     //作废，不作废功能
        byModel: function(num,byClass){
        	var $this = this;
        	if(num == 1){ //通过 
        		var type = 1;
        	}else{        //不通过
        		var type = 0; 
        	}
        	if(byClass == 1){ //审核通过或审核不通过
        		var baseUrl = $this.baseUrl+"outbill/adoptOutbillById";
        	}else if(byClass == 2 || byClass ==3 ){ //作废通过或作废不通过
        		var baseUrl = $this.baseUrl+"outbill/HandleCancelOutbillById";
        	}
			var data=Qs.stringify({
				  outbillId:$this.item.id, //当前选中数据
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
//		         	window.location.href = "y_sales_review_details.html";
                    $this.detailsList($this.item.id);
		         }
		      })
		      .catch(function() {
		
		      })
        },
        //下载附件文件
        DownloadText: function(){
        	window.location.href = this.Outbill.receiveBill;
        },
        checkChange: function(v){
            console.log(v)

        },
        back: function(){
            window.history.go(-1)
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
    }
  })