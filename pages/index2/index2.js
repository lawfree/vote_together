// pages/index2/index2.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  
  /* 第一个云函数 */
  qiuhe(){
    wx.cloud.callFunction({
      name:"twoSum",
      data:{
        a: 1,
        b: 2
      },
      success(res){
        console.log( "方法调用成功!" , res)
      },
      fail(res){
        console.log( "方法调用失败!", res)
      }
    })
  },

  /* 响应前端来的getopenid函数 */
  getopenid(){
    wx.cloud.callFunction({
      name:"getOpenid",
      success(res){
        /* 获取openid */
        console.log("getOpenid successed!", res.result.openid)
      },
      fail(res){
        console.log("getOpenid failed!", res)
      }
    })
  },

  /* 数据库获得数据 */
  getData_db(){
    wx.cloud.database().collection("users").get({
      success(res) {
        /* 获取openid */
        console.log("getData_db successed!", res.data[0].city)
      },
      fail(res) {
        console.log("getData_db failed!", res)
      }
    })
  },

  /* 云函数获得数据 */
  getData_cloud(){
    wx.cloud.callFunction({
      name:"getData",
      success(res) {
        /* 获取openid */
        console.log("getData_cloud successed!", res)
      },
      fail(res) {
        console.log("getData_cloud failed!", res)
      }
    })
  }
})