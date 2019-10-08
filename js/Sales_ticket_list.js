'use strict';
var app = new Vue({
    el: '#app',
    data:function (){
        return {
        	BaseUrl:'http://47.100.247.219:9090/',
            allcheckbox: false, //全选按钮
            determineShow:false, //确定按钮
            disabled: true, //按钮是否可用
            incomeMoney: 0, //进项票金额总计
            enteredMoney: 0, //已录进项票金额
            overchargedItem:0, //已开销项票重量
            recordedItem:0, //已录进项票重量
            isShow:false,//是否显示确定按钮
            isSelect:false,//是否选中行
            manyCheckList:[], //表示单选或多个选中状态
            listArray:[],//当前勾选列表id
            inquireBox:[], //查询非空值

            page: 1,  //显示的是哪一页
            pageSize:10, //每一页显示的数据条数
            total: 100, //记录总数
            maxPage:9, //最大页数
    
            checkedItem:[],//已选择项
            balanceMoney:'',//进项票余额
            pageTotal:'',//总页码
            rowsTotal:'',//每条显示数
            rows:'',//总条数
            list:[{
            	"contractNumber": "",
            	"name": "",
            	"batch":"",
            	"spec":"",
            	"outweight":"",
            	"price":"",
            	"inweight":"",
            	"outputCount":"",
            	"pendingWeight":"",
            	"outTotalMoney":"",
                "supply": "",
                "warehouse": ""
            }],
            buttonShow:true,
            
	        contractNumber:'',  //合同编号
		    name:'',  //商品名称
		    spec:'',  //规格
		    batch:'', //批号
		    supply:'', //采购商
		    warehouse:'' //仓库
       }
    },
    created:function() {
        this.message = '2333';
        var Cache = JSON.parse(localStorage.getItem("Cache"));  //申请开票页面新增按钮传入
        if(Cache == true){  //表示可以清楚缓存
        	localStorage.removeItem('listArray'); 
        	localStorage.removeItem('Cache'); 
        }
        this.inquireList(1);  //表格数据初始化
    },
    mounted:function() {
        var $this = this; 
        this.determineShow = JSON.parse(localStorage.getItem("determineShow"));   //表示申请开票详情点击新增合同进入
        this.editShow = JSON.parse(localStorage.getItem("editShow"));  //表示申请开票编辑点击新增合同进入
        var listArray = JSON.parse(localStorage.getItem("listArray"));  //新增合同返回选中当前待开列表id
        console.log(listArray,this.determineShow);
        if(this.determineShow != null || this.editShow != null){
        	if(listArray == null){  //表示从编辑页过来，第一次不存在listArray值
        		listArray = [];
        	}
        	$this.listArray = listArray;
        }else{
        	$this.listArray = [];
        }
        if(this.editShow == true){
        	this.editList = JSON.parse(localStorage.getItem("editList"));
        	console.log(this.editList);
        	this.determineShow = true;
        	this.buttonShow = false;
        	$this.disabled = false;  //显示确定按钮可用状态
        }
        window.localStorage.removeItem('determineShow');
    },
    watch: {
        tableList:function (v){
        }
    },
    methods: {
       //销项票左侧菜单按钮
       salesTicketBut: function(){
       	localStorage.removeItem('editShow');
       	localStorage.removeItem('determineShow');
       	this.buttonShow = true;   //隐藏按钮 申请开票和开票记录
		this.disabled =true;  //显示确定按钮可用状态
		this.determineShow = false;
       },
       //查询
       searchs:  function(res){
       	   for(var i=0;i<6;i++){
       	   	  if(res.path[2][i].value !=''){
       	   	  	 this.inquireBox.push(res.path[2][i].value);
       	   	  }
       	   } 
	       this.inquireList(this.page,true); //调取销项票待开列表 
       },
       //重置
       resetBut:  function(){
          	   this.contractNumber='';  //合同编号
	       	   this.name='';  //商品名称
	       	   this.spec='';  //规格
	       	   this.batch=''; //批号
	       	   this.supply=''; //采购商
	       	   this.warehouse=''; //仓库
	       	   this.allcheckbox=false;  //全选按钮
        	   this.listArray=[]; //清空勾选商品id存入数组
	       	   this.inquireList(this.page);//调取默认销项票待开列表 
       },
    	inquireList: function(page,need){
    		console.log(page,need);
        	var $this = this;
		    var baseUrl = $this.BaseUrl+"outbill/findOutBillPIDsByParas";
		    var data=Qs.stringify({
                pagenum:page,
		        pagesize:$this.pageSize,
		        contractNumber:$this.contractNumber,
		        name:$this.name,
		        batch:$this.batch,
		        spec:$this.spec,
		        supply:$this.supply,
		        warehouse:$this.warehouse,
		        //memberId:"U20180001"
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
		         $this.balanceMoney = res.data.resultData.balanceMoney; //进项票余额
		         $this.page = res.data.resultData.page.page; // 当前页码
		         $this.pageTotal = res.data.resultData.page.pageTotal; //总页码
		         $this.rowsTotal = res.data.resultData.page.rowsTotal; //总条数
		         $this.rows = res.data.resultData.page.rows; //每条显示数
		         $this.list = res.data.resultData.page.list; //表格数据
		         
		         var totals= res.data.resultData.page.list.length;
		         if(totals == $this.pageSize){
		         	totals+=1;
		         }
		         $('#pagination').pagination({
		            total:$this.rowsTotal,
		            onSelectPage:function(pageNumber, pageSize){
		                console.log(pageNumber, pageSize);
		                $this.pageSize = pageSize;  //分页切换每页显示条数
		                $this.inquireList(pageNumber);
		                $(this).pagination('loading');
		                $(this).pagination('loaded');
		            }
		        });
		         /*表示详情页进入*/
		         if($this.listArray.length > 0 && $this.determineShow == true && $this.editShow != true){
		         	$this.buttonShow = false;   //隐藏按钮 申请开票和开票记录
		         	$this.disabled = false;  //显示确定按钮可用状态
		         	for(var i=0;i<$this.listArray.length;i++){	
		         		for(var j=0;j<$this.list.length;j++){
		         			if($this.listArray[i] == $this.list[j].id){
			         			$this.list[j].checked = true;
			         			$this.manyCheckList.push($this.list[j]);  //将选中状态存入数组
			         		}
		         		}
		         	}
		         }		
		         /*表示编辑页进入*/
		         if($this.editShow == true && need != true){
		         	for(var i=0;i<$this.editList.length;i++){
		         		$this.manyCheckList.push($this.editList[i]);
		         	}
		         	console.log($this.manyCheckList);
		         	console.log($this.listArray);
		         	$this.buttonShow = false;   //隐藏按钮 申请开票和开票记录
		         	if($this.listArray.length == 0){
		         		$this.disabled = true;  //显示确定按钮不可用状态
		         	}else{
		         		$this.disabled = false;  //显示确定按钮可用状态
		         	}
		         	for(var i=0;i<$this.listArray.length;i++){	
		         		for(var j=0;$this.list.length;j++){
		         			if($this.listArray[i] == $this.list[j].id){
			         			$this.list[j].checked = true;
			         		}
		         		}
		         	}
		         }
		         localStorage.removeItem('listArray');  //数据缓存使用结束后，清除缓存
		      })
		      .catch(function() {
		
		      })
    	},
    	  	
    	//全选
        allCheck:   function(){
            if (this.allcheckbox) {
//          	console.log(this.list[1].id);
                var listArray = this.listArray;
                    listArray = [];
                    for(var i=0;i<this.list.length;i++){
                    	listArray.push(this.list[i].id);
                    }
                this.listArray = listArray;
                console.log(this.listArray);
            	this.allMoney();
                this.disabled = false                
                this.list = this.list.map(val => {
                    val.checked = true
                    return val
                })
                this.checkedItem = this.list
            } else {
            	var listArray = this.listArray;
            	    listArray = [];
            	    this.listArray = listArray;  
            	    console.log(this.listArray);
                this.disabled = true
                this.list = this.list.map(val => {
                    val.checked = false
                    return val
                })
                this.checkedItem = [];
                this.manyCheckList = [];
                
                this.incomeMoney = 0; //待开销项票总额合计
	        	this.enteredMoney = 0; //待开销项票重量合计
	        	this.recordedItem = 0; //已录进项票重量
	        	this.overchargedItem = 0; //已开销项票重量
	        	this.enterSupMoneny= 0; //进项票余额	        	
            }
        },
        //单选
        singleCheck: function(item,index) {
        	console.log(item,index);
        	if(item.checked == true){
        		this.listArray.push(item.id); //勾选商品id存入数组
        		console.log(this.listArray);
        		this.manyCheckList.push(item);  //将选中状态存入数组
        		console.log(this.manyCheckList);
        		this.incomeMoney += parseFloat(item.outweight*item.price);//待开销项票总额合计
        		this.enteredMoney += parseFloat(item.outweight);//待开销项票重量合计
        		this.recordedItem += parseFloat(item.inweight);//已录进项票重量
        		this.overchargedItem += parseFloat(item.outputCount);//已开销项票重量
	        	this.enterSupMoneny += parseFloat(item.inweight-item.outputCount); //进项票余额	        	
	        	console.log(item.inweight-item.outputCount);
	        	console.log(this.balanceMoney);
        	}else{
        		var index=this.manyCheckList.indexOf(item);
        		    this.manyCheckList.splice(index, 1);
        		var id=this.listArray.indexOf(item.id);
        		    this.listArray.splice(id,1);
        		    console.log(this.manyCheckList);
        		    console.log(this.listArray);
	        		this.enterSupMoneny -=item.inweight-item.outputCount; //进项票余额        		
	        		this.incomeMoney -= parseFloat(item.outweight*item.price);//待开销项票总额合计
	        		this.enteredMoney -= parseFloat(item.outweight);//待开销项票重量合计
	        		this.recordedItem -= parseFloat(item.inweight);//已录进项票重量
	        		this.overchargedItem -= parseFloat(item.outputCount);//已开销项票重量
        	}
        	
            let a = this.list.filter(val => {
                return val.checked;
            })
            this.checkedItem = a
            if (a.length !== this.list.length) {
                this.allcheckbox = false
            } else {
                this.allcheckbox = true
            }

            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].checked) {
                    this.disabled = false
                    return;
                } else {
                    this.disabled = true
                }
            }
        },
        //所有选中全选选中
        allMoney:  function(){
        	console.log(this.list);
        	var list = this.list;
        	var incomeMoney = 0;
        	var enteredMoney = 0;
        	var recordedItem = 0;
        	var overchargedItem = 0;
        	var enterSupMoneny = 0;
        	var balanceMoney = 0;
        	for(var i=0;i<this.list.length;i++){
        		var item = this.list[i];
        		this.manyCheckList.push(item); //全选将整个数列存入选中列表
//      		this.listArray.push(item.id);
        		incomeMoney = list[i].outweight*list[i].price;
        		enteredMoney = list[i].outweight;
        		recordedItem = list[i].inweight;
        		overchargedItem = list[i].outputCount;
        		this.incomeMoney +=parseFloat(incomeMoney); //待开销项票总额合计
	        	this.enteredMoney +=parseFloat(enteredMoney); //待开销项票重量合计
	        	this.recordedItem +=parseFloat(recordedItem); //已录进项票重量
	        	this.overchargedItem +=parseFloat(overchargedItem); //已开销项票重量
	        	this.enterSupMoneny += parseFloat(list[i].inweight-list[i].outputCount); //进项票余额
	        	
        	}
        },

        invoiceInput:   function(){  //申请开票
            console.log(this.manyCheckList);
            var supply = this.manyCheckList[0].supply;
            for(var i=0;i<this.manyCheckList.length;i++){
            	if(this.manyCheckList[i].supply != supply){
            		$('#myModal').modal("show");
            	}
            }
            localStorage.setItem('selectedList',JSON.stringify(this.manyCheckList));  //选中的所有数据
            localStorage.setItem('listArray',JSON.stringify(this.listArray));  //选中数据的id
            
            if(this.editShow == true){ //申请开票编辑页面
            	window.location.href = "Sales_billing_edit.html";
            	localStorage.removeItem('editShow');  //清楚申请开票编辑页面数据缓存
            }else{                    //申请开票
            	window.location.href = "Sales_application_details.html";
            	localStorage.removeItem('determineShow');  //清楚申请开票详情页面数据缓存
            }
            
        },
        batchInput:   function(){
            localStorage.setItem('waitenterlist',JSON.stringify(this.manyCheckList))
            window.location.href = 'Sales_billing_record.html'
        },
        Export:   function(){
        	if(this.listArray.length>0){  //有勾选
        		var data=Qs.stringify({
        			id:this.listArray.join(",")
                 }); 
        	}else{                        //没勾选
        		//this.inquireBox
        		var data=Qs.stringify({
        			contractNumber:this.contractNumber,//合同编号
			        name:this.name,//商品名称
			       	spec:this.spec,//规格
			       	batch:this.batch,//批号
			       	supply:this.supply,//采购商
			       	warehouse:this.warehouse,//仓库
			       	id:''
                 });
        	}
        	var $this = this;
        	window.location.href = $this.BaseUrl+"outbill/findOutBillExcelById?" + data;
        },

        async onexport(evt) {
               let arr = [];
               this.list.map(val=>{
                   if(val.checked){
                       arr.push(val)
                   }
               })
               this.list = arr

//          await this.tablexlsx();
            await this.Export();

        },
        tablexlsx:  function(){
            var wb = XLSX.utils.table_to_book(document.getElementById('out-table'));
            var wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'binary'
            });
            console.log(wb, 111)
            saveAs(new Blob([this.s2ab(wbout)], {
                type: 'application/octet-stream'
            }), 'sheetjs.xlsx');
        },

        s2ab: function (s) {
            if (typeof ArrayBuffer !== 'undefined') {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            } else {
                var buf = new Array(s.length);
                for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }
        }
    }
})