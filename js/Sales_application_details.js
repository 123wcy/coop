'use strict';
var app = new Vue({
    el: '#app',
    data: function(){
        return {
        	BaseUrl:'http://47.100.247.219:9090/',
            productWeight:'',//商品重量
            productMoney:'',//商品金额
            incomeMoney:0,//进项票总额
            tableList:[],
            ticketUnit:'', //来票单位
            selectedList:'', //申请开票表格
            customerOnlyId:'', //客户唯一标识
		    companyName:'', //入库日期
		    openBank:'', //开户银行
		    bankAccount:'', //银行账号
		    taxCode:'', //纳税人识别号
		    companyAddr:'', //收票地址
		    phone:'', //电话号码
		    invoiceType:1,//默认发票类型
		    taxRates:'', //税率
		    resultData:'', //提交成功模态框
		    resultTitle:'', //提交成功模态框标题
		    dshjpMoney:'',//待审额借票总额
		    jxpye:'',//进项票余额
        };
    },
    created: function() {

    },
    mounted: function() {
        let money = 0;
        this.selectedList = JSON.parse(localStorage.getItem("selectedList"));  //申请开票表格
        this.listArray = JSON.parse(localStorage.getItem("listArray"));  //获取数据的id
        console.log(this.selectedList,this.listArray);
        if(this.selectedList != null || this.selectedList != undefined){
        	this.inputList();
        }
    },
    watch: {
        msg: function(v){
            console.log(v)
        }  
    },
    methods: {
        //申请开票重量
        applicationWeight: function(item){
            console.log(item);
            if(+item.billingWeight > +item.outweight){
                item.billingWeight = item.outweight;
                var _this = this;
                _this.$message({
                    message: '输入的申请开票重量不能大于左侧相同商品重量',
                    type: 'warning'
                });
            }
            if(item.productWeight != undefined && item.billingWeight <= item.outweight){
                item.productMoney = item.billingWeight*item.productWeight;
                var incomeMoney = this.incomeMoney;
                incomeMoney=0;
                for(var i=0;i<this.selectedList.length;i++){
                    if(this.selectedList[i].productMoney != undefined){
                        incomeMoney+=this.selectedList[i].productMoney;
                        this.incomeMoney = incomeMoney;
                    }
                }
            }
        },
        //商品金额
        productMoneyFun: function(item){
            item.productMoney = item.billingWeight*item.productWeight;
            console.log(this.selectedList);
            var incomeMoney = this.incomeMoney;
            incomeMoney=0;
            for(var i=0;i<this.selectedList.length;i++){
                if(this.selectedList[i].productMoney != undefined){
                    incomeMoney+=this.selectedList[i].productMoney;
                    this.incomeMoney = incomeMoney;
                }
            }
        },
//      //自定义修改开票金额
        totalAmount: function(item){
            console.log(item);
            item.productWeight=item.productMoney/item.billingWeight;
            this.incomeMoney = item.productMoney;
        },


        //保留两位小数
        gitFloat: function gitFloat(value) {
                 if ((value.toString()).indexOf(".") != -1) {
                     value = parseFloat(value);
                     if (value.toString().split(".")[1].length > 2) {
                         this.$message({
                             message: '小数点后最多输入两位',
                             type: 'warning'
                         })
                     }
                     // return Math.round((value ? value : '0')* 100)/100;
                     return parseInt((value ? value : '0')*100)/100;
                     // else{
                     //     return parseFloat( Math.round((value ? value : '0')* 100)/100);
                     // }
                 } else {
                     // return parseFloat(parseFloat(value ? value : '0').toFixed(2));
                     // return Math.round((value ? value : '0')* 100)/100;
                     return parseInt((value ? value : '0')*100)/100;

                 }

        },

        // 四舍五入
        gitFloatl: function gitFloat(value) {
                return parseFloat(parseFloat(value ? value : '0').toFixed(2));
            // return parseFloat( Math.round((value ? value : '0')* 100)/100);
            // return parseInt((value ? value : '0')*100)/100;
        },


        delItem: function(item){
            this.tableList  = this.tableList.filter(val=>{
                if(val.id !== item.id){
                    return val
                }
            })
            localStorage.setItem('waitenterlist',JSON.stringify(this.tableList))
        },
        //删除
        deleteMessage: function(item){
        	var index=this.selectedList.indexOf(item);
             this.selectedList.splice(index, 1);
             this.listArray.splice(index, 1);
        },
        
        //根据客户公司名称查询相关记录信息
        nameQueryRecord: function(){
        	
        },
        
        //获取当前用户信息
        inputList: function(){
            var $this = this;
            $this.ticketUnit=$this.selectedList[0].supply;  //收票单位
            var baseUrl = $this.BaseUrl+"Customer/findCustomerByName";
		    var data=Qs.stringify({
		    	 Uid:$this.selectedList[0].customerId,
           }); 
           if(data == ''){   //说明开票记录页面，编辑功能进入
	           	var data=Qs.stringify({
			    	 Uid:$this.selectedList[0].customerUid,
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
		         $this.customerOnlyId = res.data.resultData.id; //客户唯一标识
		         $this.companyName = res.data.resultData.companyName; //入库日期
		         $this.openBank = res.data.resultData.openBank; //开户银行
		         $this.bankAccount = res.data.resultData.bankAccount; //银行账号
		         $this.taxCode = res.data.resultData.taxCode; //纳税人识别号
		         $this.companyAddr = res.data.resultData.companyAddr; //收票地址
		         $this.phone = res.data.resultData.phone; //电话号码
		         localStorage.removeItem('selectedList');  //使用完成后清楚缓存
		      })
		      .catch(function() {
		
		      })
        },
        
        //发票类型
        getCouponSelected: function(res){
        	console.log(res);
        	this.invoiceType = res.path[1].children[1].value;
        },
        //税率
        inputFunc: function(res){
        	console.log(res);
        	var value = res.path[0].value;
        	if(value >= 0 && value <= 100){
        		this.taxRates = value;
        	}else if(value < 0){
        		this.taxRates = 0;
        	}else if(value > 100){
        		this.taxRates = 100;
        	}
        },
         //银行卡号
        bankCardNumber: function(res){
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
        identifier: function(res){
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
        goAddressNumber: function(res) {
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
              return; 
           	}
           }
        },
        //提交成功或保存成功提示
        open2: function(message) {
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
//      	console.log(this.selectedList);
        	for(var i=0;i<this.selectedList.length;i++){
        		var tail = {
        			detailId:'',
        			outgoodId:this.selectedList[i].id,
        			applyCount:this.selectedList[i].billingWeight,
        			applyPrice:this.selectedList[i].productWeight,
        			applyTotalPrice:this.selectedList[i].productMoney,
        		}
        		outbilldetails.push(tail);
        		if(this.selectedList[i].billingWeight==undefined||this.selectedList[i].productWeight==undefined||this.selectedList[i].productMoney==undefined){
        			$this.open2('销项票信息中不能存在空值');
        			return;
        		}
        	}
            outbilldetails=JSON.stringify(outbilldetails);
            if($this.taxRates==''){
            	$this.open2('税率不能为空');
        	    return;
            }
            var res = /^([1-9]{1})(\d{14}|\d{18})$/;
        	if(!res.test($this.bankAccount)){
                $this.open2('请输入正确的银行卡号');
        	    return;
        	}
            var outbill=JSON.stringify(
                {
                    id:'',
                    receiveCompany:$this.ticketUnit,
                    billPaperType:$this.invoiceType,
                    taxRate:$this.taxRates,
                    openBank:$this.openBank,
                    openAccount:$this.bankAccount,
                    taxpayerCode:$this.taxCode,
                    receiveAddress:$this.companyAddr,
                    phone:$this.phone,
                    billTotalAccount:$this.incomeMoney,
                    customerUid:this.selectedList[0].customerId
                });
            var formData = new FormData();
            formData.append("file",document.querySelector('input[type=file]').files[0]);//收货确认单 选填
            formData.append("outbilldetails",outbilldetails);//销项票明细内容
            formData.append("outbill",outbill);          //销项票内容
            formData.append("buttonType",buttonType);
//          formData.append("memberId","member1");//这边应该是会员token，后期会在cookie中直接获取，这边可不加
//          formData.append("customerUid",  this.selectedList[0].customerId);//由前面页面带入（用于进到本页面访问客户资料接口+此次提交或保存操作
            console.log(formData);
            if($this.openBank!=''&&$this.bankAccount!=''&&$this.taxCode!=''&&$this.companyAddr!=''&&$this.phone!=''){          	
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
					         		window.location.href = "Sales_ticket_list.html";
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
        successBut: function(){
        	window.location.href = "Sales_ticket_list.html";
        },
        //提交成功--补票按钮
        successTicket: function(){
        	window.location.href = "../wu/income-ticket-waitenter.html";
        },
        //新增合同商品
        addContract: function(){
        	localStorage.setItem('determineShow',JSON.stringify(true));
        	localStorage.setItem('listArray',JSON.stringify(this.listArray));
        	console.log(this.listArray);
            window.location.href = "Sales_ticket_list.html";
        },
        //返回
        back: function(){	 
             window.location.href = "Sales_ticket_list.html";     
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
        },
    }
  })