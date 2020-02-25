const DB = wx.cloud.database().collection("list")
let name = ""
let age = ""
let id =""
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /* 获取用户输入的name */
  addName(event){
    console.log(event.detail.value)   /* 查看到用户输入的数值保存在detail.value中 */
    name = event.detail.value
  },
  /* 获取用户输入的age */
  addAge(event) {
    console.log(event.detail.value)   /* 查看到用户输入的数值保存在detail.value中 */
    age = event.detail.value
  },

  /*添加数据 */
  addData(){
    DB.add({
      data:{
        //name:"lowfree1",
        //age:23
        /* 将前用户输入的name 和 age 上传到数据库 */
        name: name,
        age : age
      },
      success(res){
        console.log("add successed!",res)
      },
      fail(res){
        console.log("add failed!" ,res)
      }
    })
  },

  /* 查询数据 */
  getData(){
    DB.get({
      success(res){
        console.log("query successed!", res)
      }    

    })
  },

  /* 删除数据 */
  delDataInput(event){
    console.log("要删的id:",event.detail.value)
    id = event.detail.value
  },

  delData(){
    DB.doc(id).remove({
      success(res) {
        console.log("del successed!", res)
      },
      fail(res) {
        console.log("del failed!", res)
      }
    })
  },

  /* 更新数据 */
  //要更新的id
  updateDataInput(event){
    console.log("要更新的id:" , event.detail.value)
    id = event .detail.value
  },
  //要更新的年龄
  updateAge(event){
    age = event.detail.value
  },

  upData(){
    DB.doc(id).update({
      data: {
        age: age
      },
      success(res){
        console.log("upd successed!", res)
      },
      fail(res) {
        console.log("upd failed!", res)
      }
    })
  }
})