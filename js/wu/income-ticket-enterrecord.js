'use strict';

var app = new Vue({
  el: "#app",
  data: function data() {
    return {
      allcheckbox: false, //全选按钮
      checkedItem: [], //已选择项
      page: 1, //显示的是哪一页
      pageSize: 10, //每一页显示的数据条数
      total: 0, //记录总数
      searchList: {
        applyDateStart: '', //录入开始时间
        applyDateEnd: '', //录入结束时间
        billCreateDateStart: '', //开票开始时间
        billCreateDateEnd: '', //开票结束时间
        billStatus: '', //发票状态
        billPaperType: '', //发票类型
        inCompany: '', //来票单位
        billCode: '', //发票编号
        pagenum: '1', //当前页码
        pagesize: '10', //每页条数
        clientType: null, //客户端类型
        memberId: 'U20180003' //会员UID
      },
      enterrecordList: [],
      delCode: '', //删除发票编号
      delItem: '', //删除发票信息
      voidItem: '', //作废发票信息
      reason: '', //作废理由
      maxDate: ''
    };
  },
  created: function created() {
    var now = new Date();
    this.maxDate = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
    this.setTime();
  },
  mounted: function mounted() {
    this.searchBtn();
    this.pageInit();
      var that = this;
      layui.use('laydate', function () {
          var laydate = layui.laydate;
          var nowTime = new Date();
          var a = laydate.render({
              elem: '#startTime',
              type: 'date',
              max: 'nowTime',
              format: 'yyyy-MM-dd',
              done: function done(value, date) {
                  that.searchList.applyDateStart = value;
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
                  that.searchList.applyDateEnd = value;
                  a.config.max = {
                      year: date.year,
                      month: date.month - 1, //关键
                      date: date.date
                  };
              }
          });

          var c = laydate.render({
              elem: '#startTimel',
              type: 'date',
              max: 'nowTime',
              format: 'yyyy-MM-dd',
              done: function done(value, date) {
                  that.searchList.billCreateDateStart = value;
                  d.config.min = {
                      year: date.year,
                      month: date.month - 1, //关键
                      date: date.date
                  };
              }
          });
          var d = laydate.render({
              elem: '#endTimel',
              type: 'date',
              max: 'nowTime',
              format: 'yyyy-MM-dd',
              done: function done(value, date) {
                  that.searchList.billCreateDateEnd = value;
                  c.config.max = {
                      year: date.year,
                      month: date.month - 1, //关键
                      date: date.date
                  };
              }
          });
      });
  },

  watch: {},
  methods: {
    setTime: function setTime() {
      var now = new Date();
      this.searchList.applyDateEnd = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
      var startTime = new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
      this.searchList.applyDateStart = startTime.getFullYear() + '-' + (startTime.getMonth() + 1 < 10 ? '0' : '') + (startTime.getMonth() + 1) + '-' + (startTime.getDate() < 10 ? "0" : "") + startTime.getDate();
    },

    // 控制若开始时间超过结束时间时，默认结束时间为开始时间，若结束时间早于开始时间，默认开始时间为结束时间
    selectTime: function selectTime() {
      if (this.searchList.applyDateStart && this.searchList.applyDateEnd) {
        if (this.searchList.applyDateStart > this.searchList.applyDateEnd) {
          console.log(111, this.searchList.applyDateStart, this.searchList.applyDateEnd);
          this.searchList.applyDateEnd = this.searchList.applyDateStart;
        }
        if (this.searchList.applyDateEnd < this.searchList.applyDateStart) {
          this.searchList.applyDateStart = this.searchList.applyDateEnd;
        }
      }
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
          // console.log(pageNumber, pageSize, that.total)
          that.searchList.pagenum = pageNumber;
          that.searchList.pagesize = pageSize;
          that.searchBtn();
          $(this).pagination('loading');
          $(this).pagination('loaded');
        }
      });
    },
    allCheck: function allCheck() {
      if (this.allcheckbox) {
        this.enterrecordList = this.enterrecordList.map(function (val) {
          val.checked = true;
          return val;
        });
        this.checkedItem = this.enterrecordList;
      } else {
        this.enterrecordList = this.enterrecordList.map(function (val) {
          val.checked = false;
          return val;
        });
        this.checkedItem = [];
      }
    },

    //单选
    singleCheck: function singleCheck(item) {
      var a = this.enterrecordList.filter(function (val) {
        return val.checked;
      });
      this.checkedItem = a;
      if (a.length !== this.enterrecordList.length) {
        this.allcheckbox = false;
      } else {
        this.allcheckbox = true;
      }
    },
    resetBtn: function resetBtn() {
      this.searchList = {
        applyDateStart: '', //录入开始时间
        applyDateEnd: '', //录入结束时间
        billCreateDateStart: '', //开票开始时间
        billCreateDateEnd: '', //开票结束时间
        billStatus: '', //发票状态
        billPaperType: '', //发票类型
        inCompany: '', //来票单位
        billCode: '', //发票编号
        pagenum: '1', //当前页码
        pagesize: '10' //每页条数
      };
      this.setTime();
      this.searchBtn();
    },
    back: function back() {
        window.location.href = 'income-ticket-waitenter.html';
    },


    //删除
    toDel: function toDel(item) {
      this.delItem = item;
    },


    // 删除接口
    del: function del() {
      var _this = this;

      var id = this.delItem.id;
      $http('/incomebill/deleteIncomeBillById', { incomebillId: id }).then(function (res) {
        if (res.data.resultCode == 200) {
          _this.$message({
            message: '操作成功！',
            type: 'success'
          });
          _this.searchBtn();
          $('#delModal').modal('hide');
        }
      }).catch(function (err) {
        console.log(err);
      });
    },

    //编辑
    toEdit: function toEdit(item) {
      // 到进项票录入查询接口
      // sessionStorage.setItem('recordDetail', JSON.stringify(item))
      window.location.href = 'income-ticket-entering.html?from=record&id=' + item.id;
    },


    // 详情
    toDetail: function toDetail(item) {
      // console.log(item)//到详情查询接口
      var id = item.id;
      window.location.href = 'income-ticket-enterdetail.html?id=' + id;
    },


    // 撤销
    toCancel: function toCancel(item) {
      this.delItem = item;
    },


    // 撤销接口
    cancel: function cancel() {
      var _this2 = this;

      var id = this.delItem.id;
      $http('/incomebill/revokeIncomeBillById', { incomebillId: id }).then(function (res) {
        if (res.data.resultCode == 200) {
          _this2.$message({
            message: '操作成功！',
            type: 'success'
          });
          _this2.searchBtn();
          $('#cancelModal').modal('hide');
        }
      }).catch(function (err) {
        console.log(err);
      });
    },


    // 申请作废
    toVoid: function toVoid(item) {
      this.voidItem = item;
    },


    // 申请作废接口
    void1: function void1() {
      var _this3 = this;

      if (this.reason) {
        var id = this.voidItem.id;
        var data = {
          incomebillId: id,
          reason: this.reason
        };
        $http('/incomebill/cancelIncomeBillById', data).then(function (res) {
          if (res.data.resultCode == 200) {
            _this3.$message({
              message: '操作成功！',
              type: 'success'
            });
            _this3.searchBtn();
            $('#voidModal').modal('hide');
          }
        }).catch(function (err) {
          console.log(err);
        });
      } else {
        this.$message({
          message: '作废原因未填写！',
          type: 'warning'
        });
      }
    },

    // 查询接口
    searchBtn: function searchBtn() {
      var _this4 = this;

      this.allcheckbox = false;
      $http('/incomebill/findIncomeBillByParas', this.searchList).then(function (res) {
        if (res.data.resultCode == 200) {
          _this4.enterrecordList = res.data.resultData.list;
          _this4.dealStatus();
          _this4.enterrecordList.map(function (val) {
            val.billStatus = gformaterBillType(val.billStatus);
            val.billPaperType = gformaterBillPaperType(val.billPaperType);
            // return val;
          });
          _this4.total = res.data.resultData.rowsTotal; //总页码
          _this4.pageInit();
        }
      }).catch(function (err) {
        console.log(err);
      });
    },
    dealStatus: function dealStatus() {
      var _this5 = this;

      this.enterrecordList.map(function (val) {
        switch (val.billStatus) {
          case '1': //已保存
          case '3': //已撤销
          case '5':
            //未通过
            val.btnlist = [{
              'text': '删除',
              'fun': _this5.toDel,
              'modal': 'delModal'
            }, {
              'text': '详情',
              'fun': _this5.toDetail
            }, {
              'text': '编辑',
              'fun': _this5.toEdit
            }];
            break;
          case '2':
            //待审核
            val.btnlist = [{
              'text': '撤销',
              'fun': _this5.toCancel
            }, {
              'text': '详情',
              'fun': _this5.toDetail
            }];
            break;
          case '4':
            //已通过
            val.btnlist = [{
              'text': '详情',
              'fun': _this5.toDetail
            }, {
              'text': '申请作废',
              'fun': _this5.toVoid,
              'modal': 'voidModal'
            }];
            break;
          case '4.5': //审核通过已超时
          case '6': //待作废
          case '7':
            //已作废
            val.btnlist = [{
              'text': '详情',
              'fun': _this5.toDetail
            }];
            break;
          case '8':
            //未作废
            val.btnlist = [{
              'text': '详情',
              'fun': _this5.toDetail
            }, {
              'text': '申请作废',
              'fun': _this5.toVoid,
              'modal': 'voidModal'
            }];
        }
      });
    },

    // 导出接口
    onexport: function onexport() {
      var exportData = {};
      if (!this.checkedItem.length) {
        exportData.applyDateStart = this.searchList.applyDateStart;
        exportData.applyDateEnd = this.searchList.applyDateEnd;
        exportData.billCreateDateStart = this.searchList.billCreateDateStart;
        exportData.billCreateDateEnd = this.searchList.billCreateDateEnd;
        exportData.billStatus = this.searchList.billStatus;
        exportData.inCompany = this.searchList.inCompany;
        exportData.billCode = this.searchList.billCode;
        exportData.billPaperType = this.searchList.billPaperType;
        exportData.id = null;
        exportData.clientType = null;
        exportData.memberId = 'U20180003';
      } else {
        var ids = [];
        this.checkedItem.map(function (val) {
          ids.push(val.id);
        });
        exportData.Ids = ids.join(',');
        exportData.memberId = 'U20180003';
      }
      console.log(exportData);
      window.location.href = 'http://47.100.247.219:9090/incomebill/importIncomeBillToExcel?' + Qs.stringify(exportData);
    }
  }
});