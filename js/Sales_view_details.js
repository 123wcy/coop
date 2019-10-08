'use strict';

var app = new Vue({
    el: '#app',
    data: function(){
        return {
        	baseUrl:'http://47.100.247.219:9090/',
            message: 'Hello Vue!111',
            msg:'11',
            hetong:'111',
            Outbill:{},
            Out_hisList:[],
            tableData:[],
            billPaperType:'', //发票类型默认
            reason:'', //撤销或申请作废理由
            editNum:'',//选中状态
            modelTitle:'',
            updatedate:'',
            modelCenter:'',
            confirmBut:'' //model框确认按钮name
          };
      
    },
    created: function() {
        this.message = '2333';
        this.item = JSON.parse(localStorage.getItem("item"));
        console.log(this.item);
        if(this.item != null || this.item!=undefined){
        	this.detailsList(this.item.id);
        }else{
        	this.item = [];
        }
    },
    mounted: function() {

    },
    watch: {
       billPaperType: function(res){
       	  console.log(res);
       	  this.billPaperType = res;
       }
    },
    methods: {
    	//详情表格
    	detailsList: function(id){
        var $this = this;
		var baseUrl = $this.baseUrl+"outbill/findOutBillDetail";
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
    	//确认申请作废
      descArea: function(){
      	if(this.reason.length > 0){
      		this.revokeOrcancel();
      		$('#myModal').modal('hide');
            $('#myModal2').modal('hide');
      	}else{
            this.$message({
                message: '申请作废理由不能为空！',
                type: 'warning',
                duration: 2000
            });
            return;
		}
      },
      //确认撤销
      confirmCancellation: function(){
      		this.revokeOrcancel();
      		$('#myModal').modal('hide');
      },
      //撤销，申请作废，编辑
      compileOutBillById: function(res){
      	var selectedList=[this.item];
      	this.editNum = res;
      	if(res == 1){
      		$('#myModal2').modal('show');
      	}else if(res == 2){
      		this.modelTitle = "确定撤销";
      		this.modelCenter = 2;
      		this.confirmBut = '确定撤销';
      		$('#myModal').modal('show');
      	}else if(res == 3){
      		var recordTrue = true;
      		this.item.supply = this.item.receiveCompany;
      		localStorage.setItem('selectedList',JSON.stringify(selectedList));
      		localStorage.setItem('recordTrue',JSON.stringify(recordTrue));
      		window.location.href = "Sales_billing_edit.html";
      	}else if(res){
      		window.location.href = "Sales_billing_record.html";
      	}
      },
      //撤销或申请作废
      revokeOrcancel: function(){
      	var $this = this;
      	var id = $this.item.id; //获取进行操作数据
      	var num = $this.editNum; //获取选中状态
      	if(num == 1){
      		var baseUrl = $this.baseUrl+"outbill/cancelOutBillById";  //申请作废
      		var data=Qs.stringify({
			  outbillId:id,
			  reason:$this.reason
            });
      	}else if(num == 2){
      		var baseUrl = $this.baseUrl+"outbill/revokeOutBillById";  //撤销
      		var data=Qs.stringify({
      			outbillId:id
      		});
      	}
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
		         if(res.data.resultCode == '200'){
		         	$this.detailsList($this.item.id);

                     $this.$message({
                                 message:"操作成功",
                                 type: 'success',
                                 duration:2000
                             });

		         }
		      })
		      .catch(function() {
		
		      })
      },
    	//提交
    	submit: function(index){
    		var $this = this;
            var baseUrl = $this.baseUrl+"outbill/saveorupdateOutbill";
        	var outbilldetails = [];
            var tail = {
        			detailId:'',
        			outgoodId:this.tableData[0].outgoodId,
        			applyCount:this.tableData[0].applyCount,
        			applyPrice:this.tableData[0].applyPrice,
        			applyTotalPrice:this.tableData[0].applyTotalPrice,
        	}
        	outbilldetails.push(tail);
            outbilldetails=JSON.stringify(outbilldetails);
            var outbill=JSON.stringify(
                {
                    id:'',
                    receiveCompany:this.Outbill.receiveCompany,
                    billPaperType:this.billPaperType,
                    taxRate:this.Outbill.taxCode,
                    openBank:this.Outbill.openBank,
                    openAccount:this.Outbill.openAccount,
                    taxpayerCode:this.Outbill.taxpayerCode,
                    receiveAddress:this.Outbill.receiveAddress,
                    phone:this.Outbill.phone,
                    billTotalAccount:this.Outbill.billTotalAccount
                });
            var formData = new FormData();
            formData.append("file",'');//收货确认单 选填
            formData.append("outbilldetails",outbilldetails);//销项票明细内容
            formData.append("outbill",outbill);          //销项票内容
            formData.append("buttonType",'提交');
            formData.append("memberId","member1");//这边应该是会员token，后期会在cookie中直接获取，这边可不加
            formData.append("customerUid",  this.Outbill.customerUid);//由前面页面带入（用于进到本页面访问客户资料接口+此次提交或保存操作
            axios({
				url:baseUrl,
				method: "post",
				data:formData,
			})
			.then(function(res) {
				console.log(res);
				var resultData = res.data.resultData;
				$this.resultData = resultData;
			    if(index == 1){
			        $this.resultTitle = 3;
			    }else{
			        $this.resultTitle = res.data.resultMessage;
			    }
				if(res.data.resultCode == 200){
				    $('#myModal').modal("show");
				        setTimeout(function(){
				        localStorage.setItem('Cache',JSON.stringify(true));
				        window.location.href = "Sales_ticket_list.html";
				    },1000);
				}
			})
			.catch(function() {
				
			})
	    },
	    //下载附件
	    DownloadText: function(){
	    	window.location.href = this.Outbill.receiveBill;
	    },
        checkChange: function(v){
            console.log(v)

        },
        back: function(){
            window.history.go(-1)
        },
        searchBtn: function(){
            console.log(axios)
            axios({
                url:'http://926-cs-crm-za-crm-fpc.test.za.biz/api/operationlog/v2/queryLogList',
                headers: {
                  'content-type': 'application/json;charset=UTF-8',
                  'usercontext':{'tenantId':1,'deptId':34001,'userId':34001,'orgId':4}
                },
                data:{
                    "bizId":1062003,
                    "fastRecordBizCategoryEnum":"SALES_OPPORTUNITY"
                },  
                contentType: 'json',
                dataType: 'json'
            })
            .then(function(res){
                console.log(res);
            })
            .catch(function(err){
                console.log(err);
            });
        }
    }
  })