'use strict';

var app = new Vue({
    el: '#app',
    data:  function(){
        return {
        	BaseUrl:'http://47.100.247.219:9090/',
            applyPrice:'',//申请开票单价
            applyTotalPrice:'',//申请开票金额
            billTotalAccount:0,//开票总额
            tableList:[],
           // billPaperType:'',
            Outbill:[],
            receiveCompany:'', //收票单位
            selectedList:[], //申请开票表格
            customerOnlyId:'', //客户唯一标识
		    companyName:'', //入库日期
		    openBank:'', //开户银行
		    openAccount:'', //银行账号
		    taxRate:'', //税率
		    receiveAddress:'', //收票地址
		    phone:'', //电话号码
//		    Outbill:'',//默认发票类型
		    taxpayerCode:'', //纳税人识别号
		    resultData:'', //提交成功模态框
		    resultTitle:'', //提交成功模态框标题
		    Out_detailList:'', //表格诗句
//		    outgoodId:'',//商品id
        };
    },
    created:  function() {
//      this.tableList = JSON.parse(localStorage.getItem("waitenterlist"))
    },
    mounted:  function() {
        let money = 0;
//      this.tableList.map(val=>{
//          console.log(val.height)
//          money += +val.height * +val.single 
//      })
        this.listArray  = JSON.parse(localStorage.getItem("listArray")); //申请开票数据中的下标
        this.selectedList = JSON.parse(localStorage.getItem("selectedList"));  //申请开票表格
        var recordTrue = JSON.parse(localStorage.getItem("recordTrue"));  //表示从开票记录编辑进入
        console.log(this.selectedList);
        if(this.listArray!=null || this.listArray!=undefined){
		        	var list = this.selectedList;
					    for(var i = 0; i < list.length; i++){
					        if(list[i].outgoodId == undefined){
					            list[i].outgoodId = list[i].id;
					        }
					        for(var j = i+1; j < list.length; j++){
					        	
							    if(list[j].outgoodId==list[i].outgoodId || list[j].id==list[i].outgoodId){
							        list.splice(j,1);
							        j--;
							    }
							}
					        if(list[i].applyTotalPrice!=null){
					        	this.billTotalAccount+=Number(list[i].applyTotalPrice); //计算总金额
					        }
					    }
					console.log(list);
				    this.Out_detailList = list;
				    this.Outbill = JSON.parse(localStorage.getItem("Outbill"));
		}
        console.log(recordTrue);
        if(recordTrue == true){  //表示从开票记录编辑进入
        	this.inputList();
        	localStorage.removeItem('recordTrue');  //使用完成后清楚缓存
        }
			
    },
    watch: {
        msg:  function(v){
            console.log(v)
        }  
    },
    methods: {
    	//申请开票重量
    	 applicationWeight:  function(item){
    	 	console.log(item);
    	 	if(parseInt(item.applyCount) > parseInt(item.outweight)){
    	 		item.applyCount = item.outweight
    	 	}
    	 	if(item.applyPrice != undefined && item.applyCount <= item.outweight){
    	 	  item.applyTotalPrice = item.applyCount*item.applyPrice;
    	 	  var thisMaxMoney = 0;
              for(var i=0;i<this.Out_detailList.length;i++){
	            	if(this.Out_detailList[i].applyTotalPrice != undefined){
	            		thisMaxMoney+=Number(this.Out_detailList[i].applyTotalPrice);
	            		this.billTotalAccount = thisMaxMoney;
	            	}
              }
    	 	}
        },
        //商品金额
        productMoneyFun:  function(item){
            item.applyTotalPrice = item.applyCount*item.applyPrice;
            console.log(this.Out_detailList);
            var thisMaxMoney = 0;
            for(var i=0;i<this.Out_detailList.length;i++){
            	if(this.Out_detailList[i].applyTotalPrice != undefined){
            		thisMaxMoney+=Number(this.Out_detailList[i].applyTotalPrice);
            		this.billTotalAccount = thisMaxMoney;
            	}
            }
        },
//      //自定义修改开票金额
        totalAmount:  function(item){
        	console.log(item);
        	if(item.applyCount>0){
        		item.applyPrice=item.applyTotalPrice/item.applyCount;
        		var thisMaxMoney = 0;
	        	for(var i=0;i<this.Out_detailList.length;i++){
	        		console.log(this.Out_detailList[i].applyTotalPrice);
		            	if(this.Out_detailList[i].applyTotalPrice != undefined){
		            		thisMaxMoney+=Number(this.Out_detailList[i].applyTotalPrice);
		            		this.billTotalAccount = thisMaxMoney;
		            	}
	            }
        	}
        },
        delItem:  function(item){
            this.tableList  = this.tableList.filter(val=>{
                if(val.id !== item.id){
                    return val
                }
            })
            localStorage.setItem('waitenterlist',JSON.stringify(this.tableList))
        },
        //删除
        deleteMessage:  function(item,index){
        	console.log(item);
        	console.log(this.listArray);
        	if(this.listArray!=null || this.listArray!=undefined){
        		var indexId=this.listArray.indexOf(item.id);
	        	if(indexId != -1){
	        		this.listArray.splice(indexId, 1);
	        	}
        	}
        	var index=this.Out_detailList.indexOf(item);
            this.Out_detailList.splice(index, 1);
            //重新計算总额
            var thisMaxMoney = 0;
        	for(var i=0;i<this.Out_detailList.length;i++){
        		console.log(this.Out_detailList[i].applyTotalPrice);
	            if(this.Out_detailList[i].applyTotalPrice != undefined){
	            	thisMaxMoney+=Number(this.Out_detailList[i].applyTotalPrice);
	            	this.billTotalAccount = thisMaxMoney;
	            }
            }
        },
        
        //根据客户公司名称查询相关记录信息
        nameQueryRecord:  function(){
        	
        },
        
        //获取当前用户信息
        inputList: function(){
            var $this = this;
            $this.ticketUnit=$this.selectedList[0].supply;  //收票单位
            var baseUrl = $this.BaseUrl+"outbill/findOutBillDetail";
            for(var i =0;i<$this.selectedList.length;i++){
            	if($this.selectedList[i].id != undefined){
            		var data=Qs.stringify({
				    	 OutbillId:$this.selectedList[i].id,		    	 
		            }); 
            	}
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
		         $this.customerOnlyId = res.data.resultData.Outbill.id; //客户唯一标识
		         $this.Out_detailList = res.data.resultData.Out_detailList; //表格
		         for(var i= 0;i<res.data.resultData.Out_detailList.length;i++){
		         		$this.Out_detailList[i].supply=res.data.resultData.Outbill.receiveCompany;
		         }
//		         $this.Out_detailList[0].outgoodId=14;
		         $this.Outbill = res.data.resultData.Outbill; //发票类型
		         
		         var Out_detailList = res.data.resultData.Out_detailList;
		         for(var i=0;i<Out_detailList.length;i++){
		         	 let billTotalAccount = Number($this.billTotalAccount);
		         	 let applyTotalPrice = Number(Out_detailList[i].applyTotalPrice);
		         	 billTotalAccount+=applyTotalPrice;
		         	 $this.billTotalAccount = billTotalAccount;
		         }
		         localStorage.removeItem('selectedList');  //使用完成后清楚缓存
		      })
		      .catch(function() {
		
		      })
        },
        
        //发票类型
        getCouponSelected:  function(res){
        	console.log(res);
        	this.Outbill.billPaperType = res.path[1].children[1].value;
        },
        //税率
        inputFunc:  function(res){
        	console.log(res);
        	var value = res.path[0].value;
        	if(value >= 0 && value <= 100){
        		this.taxCode = value;
        	}else if(value < 0){
        		this.taxCode = 0;
        	}else if(value > 100){
        		this.taxCode = 100;
        	}
        },
        //银行卡号
        bankCardNumber:  function(res){
        	console.log(res);
        	var value =res.path[0].value;
        	var res = /^([1-9]{1})(\d{14}|\d{18})$/;
        	if(!res.test(value)){
        		this.$message({
		          message:'请输入正确的银行卡号',
		          type: 'success',
		          duration:2000
		        });
              return false; 
        	}
        },
        //纳税识别号
        identifier:  function(res){
        	console.log(res);
        	var value =res.path[0].value;
        	var res = /^[A-Z]{9}[0-9]{9}$/;
        	if(!res.test(value)){
        		this.$message({
		          message:'请输入正确的纳税识别号',
		          type: 'success',
		          duration:2000
		        });
              return false; 
        	}
        },
        //电话
        goAddressNumber:  function(res) {
           console.log(res);
           var value = res.path[0].value;
           if(value !=''){
           	var res=/^0\d{2,3}-\d{7,8}$/;
           	if(!res.test(value)){
           	  this.$message({
		          message:'请输入正确的手机号或者座机号格式为：0000-0000000',
		          type: 'success',
		          duration:2000
		      });
              return false; 
           	}
           }
        },
        //提交成功或保存成功提示
        open2:  function(message) {
	        this.$message({
	          message:message,
	          type: 'success',
	          duration:2000
	        });
	    },
        
        //提交
        submit: function(buttonType,index){
        	var $this = this;
            var baseUrl = $this.BaseUrl+"outbill/saveorupdateOutbill";
        	var outbilldetails = [];
        	$this.resultTitle = '';  //赋值前清空状态
        	console.log(this.selectedList);
        	for(var i=0;i<this.Out_detailList.length;i++){
        		var tail = {
        			detailId:this.Out_detailList[i].detailId,
        			outgoodId:this.Out_detailList[i].outgoodId,
        			applyCount:this.Out_detailList[i].applyCount,
        			applyPrice:this.Out_detailList[i].applyPrice,
        			applyTotalPrice:this.Out_detailList[i].applyTotalPrice,
        		}
        		outbilldetails.push(tail);
        	}
            outbilldetails=JSON.stringify(outbilldetails);
            console.log(outbilldetails);
            if($this.Outbill.taxRate==''){
            	$this.open2('税率不能为空');
        	    return;
            }
            var res = /^([1-9]{1})(\d{14}|\d{18})$/;
        	if(!res.test($this.Outbill.openAccount)){
                $this.open2('请输入正确的银行卡号');
        	    return;
        	}
            var outbill=JSON.stringify(
                {
                    id:this.Outbill.id,                   
                    receiveCompany:$this.Outbill.receiveCompany,
                    billPaperType:$this.Outbill.billPaperType,
                    taxRate:$this.Outbill.taxRate,
                    openBank:$this.Outbill.openBank,
                    openAccount:$this.Outbill.openAccount,
                    taxpayerCode:$this.Outbill.taxpayerCode,
                    receiveAddress:$this.Outbill.receiveAddress,
                    phone:$this.Outbill.phone,
                    billTotalAccount:$this.billTotalAccount,
                    memberId:$this.Outbill.memberId,
                    customerUid:this.Outbill.customerUid
                });
            console.log(outbill);
            console.log(buttonType);
            console.log(document.querySelector('input[type=file]').files[0]);
            var formData = new FormData();
            formData.append("file",document.querySelector('input[type=file]').files[0]);//收货确认单 选填
            formData.append("outbilldetails",outbilldetails);//销项票明细内容
            formData.append("outbill",outbill);          //销项票内容
            formData.append("buttonType",buttonType);
            if($this.Outbill.openBank!=''&&$this.Outbill.openAccount!=''&&$this.Outbill.taxpayerCode!=''&&$this.Outbill.receiveAddress!=''&&$this.Outbill.phone!=''){          	
		            axios({
				      	url:baseUrl,
				        method: "post",
				        data:formData,
				      })
				      .then(function(res) {
				         console.log(res);
				         $this.resultData = res.data.resultData;
			             if(index == 1){
			             	$this.resultTitle = 3;
			             }else{
			             	$this.resultTitle = res.data.resultMessage;
			             }
				         if(res.data.resultMessage >= 1){
				         	if(res.data.resultData==null || res.data.resultData.length==0){
				         		if($this.resultTitle == 1){
				         			var success = '提交成功'
				         		}else if($this.resultTitle == 3){
				         			var success = '保存成功'
				         		}
				         		$this.open2(success);
				         		setTimeout(function(){
					         		localStorage.setItem('Cache',JSON.stringify(true));
					         		window.location.href = "Sales_billing_record.html";
					         	},1500);
				         	}else if(res.data.resultData.length>0){
				         		$('#myModal').modal("show");
				         	}
				         }else{  //调取失败
				         	$this.open2(res.data.resultMessage);
				         }
				      })
				      .catch(function() {
				
				      })
            }
        },
        //提交成功--确定按钮
        successBut:  function(){
        	window.location.href = "Sales_ticket_list.html";
        },
        //提交成功--补票按钮
        successTicket:  function(){
        	window.location.href = "../wu/income-ticket-waitenter.html";
        },
        //新增合同商品
        addContract:  function(){
        	if(this.listArray != undefined){
        		localStorage.setItem('listArray',JSON.stringify(this.listArray));
        	}
        	localStorage.setItem('editShow',JSON.stringify(true));
        	localStorage.setItem('editList',JSON.stringify(this.Out_detailList));
        	localStorage.setItem('Outbill',JSON.stringify(this.Outbill));
        	console.log(this.Out_detailList);
            window.location.href = "Sales_ticket_list.html";
        },
        //返回
        back:  function(){	 
             window.location.href = "Sales_billing_record.html";     
        },
        searchBtn:  function(){
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
        },
    }
  })