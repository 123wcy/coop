'use strict';
var app = new Vue({
    el: '#app',
    data: function() {
        return {
        	BaseUrl:'http://47.100.247.219:9090/',
            allcheckbox: false, //全选按钮
            incomeMoney: 0, //进项票金额总计
            enteredMoney: 0, //已录进项票金额
            enterSupMoneny: 0,//进项票余额
            pagenum:1, //当前页码
            checkedItem:[],//已选择项
            tableList: [],
            listArray:[],//当前勾选列表id
            modelTitle:'',
            reason:'', //撤销或申请作废理由
            modalBut:'', //关闭模态框
            editItem:'', //进行操作数据
      	    editNum:'', //选中状态

      	    applyDateStart:'', //申请开始
      	    applyDateEnd:'', //申请结束
      	    billCreateDateStart:'', //开票开始
      	    billCreateDateEnd:'', //开票结束
      	    receiveCompany:'', //收票单位
      	    billCode:'', //发票编号
      	    modelCenter:'', //控制模态框显示内容
            billPaperType:'',
            billStatus:'',
      	    thisDeleteId:'' //即将删除的id
        }
    },
    created: function() {
        this.message = '2333'
    },

    mounted: function() {
        this.setTime();
    	var that = this;
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

            var c = laydate.render({
                elem: '#test3',
                type: 'date',
                format: 'yyyy-MM-dd',
                max: 'nowTime',
                done: function done(value, date) {
                    that.billCreateDateStart = value;
                    d.config.min = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
            var d = laydate.render({
                elem: '#test4',
                type: 'date',
                max: 'nowTime',
                format: 'yyyy-MM-dd',
                done: function done(value, date) {
                    that.billCreateDateEnd = value;
                    c.config.max = {
                        year: date.year,
                        month: date.month - 1, //关键
                        date: date.date
                    };
                }
            });
        })
    },
    watch: {
        tableList: function(v) {
        }
    },
    methods: {
      //返回
      backList: function(){
      	 window.location.href = "Sales_ticket_list.html";
      },
      //查询
      submitBilling: function(res){
      	console.log(this.applyDateStart);
      	 this.billStatus = res.path[2][4].value; //状态
      	 this.billPaperType = res.path[2][7].value; //发票类型
      	 this.billingRecord(1);
      },
      //重置
      resetBut: function(){
      	this.billCreateDateStart=''; //开票开始
      	this.billCreateDateEnd=''; //开票结束
      	this.receiveCompany=''; //收票单位
      	this.billCode=''; //发票编号
	    this.billPaperType = '';
	    this.billStatus = '';
		this.setTime();
      },
      //获取最近三个月时间
	  setTime: function setTime() {
		var now = new Date();
		this.applyDateEnd = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
		var startTime = new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
		this.applyDateStart = startTime.getFullYear() + '-' + (startTime.getMonth() + 1 < 10 ? '0' : '') + (startTime.getMonth() + 1) + '-' + (startTime.getDate() < 10 ? "0" : "") + startTime.getDate();
		this.billingRecord(1);
	  },
      //查询开票记录
      billingRecord: function(pagenum){
      	var $this = this;
		var baseUrl = $this.BaseUrl+"outbill/findOutBillByParas";
		var data=Qs.stringify({
			    pagenum:pagenum,
			    pagesize:10,
                applyDateStart:$this.applyDateStart,
		        applyDateEnd:$this.applyDateEnd,
		        billCreateDateStart:$this.billCreateDateStart,
		        billStatus:$this.billStatus,
		        receiveCompany:$this.receiveCompany,
		        billCode:$this.billCode,
		        billPaperType:$this.billPaperType
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

		         $('#pagination').pagination({  //分页功能
		            total: $this.rowsTotal,
		            onSelectPage:function(pageNumber, pageSize){
		                console.log(pageNumber, pageSize);
		                $this.billingRecord(pageNumber);
		                $(this).pagination('loading');
		                $(this).pagination('loaded');
		            }
		        });
		          console.log($this.tableList);
		      })
		      .catch(function() {

		      })
      },
      //模态框，确定按钮
      descArea: function(){
          // alert('ff');
          var _this = this;
      	if(_this.reason.length > 0){
            _this.revokeOrcancel();
      		$('#myModal').modal('hide');
      		$('#myModal2').modal('hide');
      	}else{
            // if(this.reason == ''){//没添加理由
            _this.$message({
                    message: '申请作废理由不能为空！',
                    type: 'warning',
                    duration: 2000
                });
                return;
            // }
        }
      },
      //确认撤销
      descAreaCancel: function(){
      	this.revokeOrcancel();
        $('#myModal').modal('hide');
      },
      //删除
      deleteOutBillById: function(item,num){
      	console.log(item);
      	var $this = this;
      	$this.editItem = item; //即将进行操作数据
      	$this.editNum = num; //选中状态
      	var id = item.id;
      	if(num == 1){
      		$this.modelTitle = "确认删除";
      		$this.modelCenter = 1;
      		$('#myModal').modal('show');
      		$this.thisDeleteId = id;
      	}else if(num == 2){
      		$this.modelTitle = "确认撤销";
      		$this.modelCenter = 2;
      	}else if(num == 3){
      		$this.modelCenter = 3;
      	}

      },
      //撤销或申请作废
      revokeOrcancel: function(){
      	var $this = this;
      	var id = $this.editItem.id; //获取进行操作数据
      	var num = $this.editNum; //获取选中状态
      	if(num == 2){
      		$this.modelTitle = "确认撤销";
      		var baseUrl = $this.BaseUrl+"outbill/revokeOutBillById";  //撤销
      		var data=Qs.stringify({
      			outbillId:id
      		});
      	}else if(num == 3){
      		$this.modelTitle = "申请作废理由";
      		var baseUrl = $this.BaseUrl+"outbill/cancelOutBillById";  //申请作废
      		var data=Qs.stringify({
			  outbillId:id,
			  reason:$this.reason
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
		         if(res.data.resultCode == 200){
		         	$this.billingRecord(1);
		         }
		      })
		      .catch(function() {

		      })
      },
      //确认删除
      confirmDeletion: function(){
      	    var $this = this;
        	var baseUrl = $this.BaseUrl+"outbill/deleteOutBillById";  //删除
      		var data=Qs.stringify({outbillId:$this.thisDeleteId});
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
		         if(res.data.resultCode == 200){
		         	$.messager.show({
						title:'提示',
						msg:'删除成功',
						timeout:2000,
						showType:'slide'
					});
		         	$('#myModal').modal('hide');
		         	$this.modelCenter = '';
		         	$this.billingRecord(1);
		         }
		      })
		      .catch(function() {

		      })
      },
      //取消
      modelDismiss: function(){
		$('#myModal').modal('hide');
		$('#myModal2').modal('hide');
      	this.modelCenter = '';
      },
       //查看详情
      seeDetails: function(){
      	$('#myModal').modal('hide');
		this.modelCenter = '';
      	this.detailsPage(this.editItem);
      },
      //编辑
      compileBreak: function(item){
      	 var selectedList=[item];
      	 var recordTrue= true;
      	 localStorage.setItem('selectedList',JSON.stringify(selectedList));
      	 localStorage.setItem('recordTrue',JSON.stringify(recordTrue));
      	 window.location.href = "Sales_billing_edit.html";
      },
      //详情
      detailsPage: function(item){
      	console.log(item);
      	localStorage.setItem('item',JSON.stringify(item));
        window.location.href = "Sales_view_details.html";
      },
      //全选
        allCheck: function() {
            if (this.allcheckbox) {
            	var listArray = this.listArray;
                    listArray = [];
                    for(var i=0;i<this.tableList.length;i++){
                    	listArray.push(this.tableList[i].id)
                    }
                this.listArray = listArray;
                console.log(this.listArray);
                this.disabled = false
                this.tableList = this.tableList.map(val => {
                    val.checked = true
                    return val
                })
                this.checkedItem = this.tableList
            } else {
            	var listArray = this.listArray;
            	    listArray = [];
            	    this.listArray = listArray;
            	    console.log(this.listArray);
                this.disabled = true
                this.tableList = this.tableList.map(val => {
                    val.checked = false
                    return val
                })
                this.checkedItem = []
            }
            this.allMoney()
        },
        //单选
        singleCheck: function(item) {
//          this.allMoney()
            if(item.checked == true){
            	this.listArray.push(item.id); //勾选商品id存入数组
            }else{
            	var id=this.listArray.indexOf(item.id);
        		    this.listArray.splice(id,1);
            }
            let a = this.tableList.filter(val => {
                return val.checked;
            })
            this.checkedItem = a
            if (a.length !== this.tableList.length) {
                this.allcheckbox = false
            } else {
                this.allcheckbox = true
            }

            for (let i = 0; i < this.tableList.length; i++) {
                if (this.tableList[i].checked) {
                    this.disabled = false
                    return;
                } else {
                    this.disabled = true
                }
            }
        },
         //所有选中全选选中
        allMoney: function() {
            let incomeMoney = 0;
            let enteredMoney = 0;

            this.tableList.map(val => {
                if (val.checked) {
                    incomeMoney += +val.outweight * +val.price
                    enteredMoney += +val.inweight * +val.price
                }
            })
            this.incomeMoney = incomeMoney.toFixed(2)
            this.enteredMoney = enteredMoney.toFixed(2)
        },
		// 导出
        Export: function(){
            if(this.listArray.length>0){  //有勾选
                var data=Qs.stringify({
                    Ids:this.listArray.join(",")
                });
            }else{                        //没勾选
                var listArray = this.listArray;
                listArray = [];
                for(var i=0;i<this.tableList.length;i++){
                    listArray.push(this.tableList[i].id)
                }
                var data=Qs.stringify({
                    ids:listArray
                });
            }
            console.log(data);
            var $this = this;
            window.location.href = $this.BaseUrl+"outbill/findOutBillFile?" + data;
        },
        onexport(evt) {
            this.Export();
        },

              tablexlsx: function() {
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
			        },

		        sure: function(){
		            window.location.href = `income-ticket-entered.html`
		        }
      
    }
})