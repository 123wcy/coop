var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!111',
      msg:'',
      hetong:'111',
    },
    created() {
        this.message = '2333'
        
    },
    mounted() {
    },
    watch: {
        msg(v){
            console.log(v)
        }  
    },
    methods: {
        searchBtn(){
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