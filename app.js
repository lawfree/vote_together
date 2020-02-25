//app.js
App({
  onLaunch: function () {
    /* 云开发环境的初始化 */
    wx.cloud.init({
      // env:'lowfree-yun1-qysrj',
      env:'yun207-test-eg5y0',
    })
  },
  
  globalData: {
    userInfo: null,
    openid: null,
    userid: null,     //这是自定义用于标识创建的投票的
    avatarUrl: './user-unlogin.png',
    // userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },
  
  //用户登录
  userLogin: function (userinfo) {
    if (this.globalData.userid != null){
      wx.showToast({
        title: '已登录!',
        duration: 2000,
      })   
     
    }else{
      wx.showLoading({
        title: '登陆中...',
    }) 

      // /* 返回openid */
      // wx.cloud.callFunction({
      //   name: "run_DB",
      //   data: {
      //     type: "v_get_openid",
      //   },
      //   success(res) {
      //     console.log(res)
      //   },
      //   fail() {
      //     console.log("v_get_openid is faild!")
      //   }
      // })



      // 获取用户信息
      wx.getSetting({ 
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                console.log("getUserInfo is ok!")
                userinfo = res.userInfo
                console.log(userinfo)
              }
            })
          }
        }
      })  
      
      // //处理userinfo中的表情
      userinfo.nickName = this.fliteremoji(userinfo.nickName);
      var userId =null
      var that= this


      /* 存储用户的信息到数据库 */
      wx.cloud.callFunction({
        name: "v_runDB",
        data: {  
          type: "v_save_userinfo",
          userinfo    //将userinfo传过去即可
        },   
        success(res) {
          console.log('callFunction v_save_userinfo success: ', res.result.data._id) 
          that.globalData.userid = res.result.data._id
        },
        fail() {
          console.log('callFunction v_save_userinfo fail ! ')
        },
      })
      console.log(this.globalData.userid)


      //登录注册_没有用户的id 
      wx.login({
        success: function (res) {
          console.log(res)
          // = userId     //这里不能用this来访问外部的globalData
          wx.showToast({
            title: '登陆成功!',
            duration: 2000,
          })   
        }, 
        fail: function () {
          wx.hideLoading();
          console.log("userLogin failed")
          wx.showToast({
            title: '登陆失败!',
            duration: 2000,
          })     
        },
      })

      wx.hideLoading();

    }
  },

  //process 处理时间
  processTime: function (e) {
    var time = new Date(e).toLocaleString().replace(/:\d{1,2}$/, " ");
    time = time.replace(/^\d{4}\//, " ");
    time = time.replace(/\//, "-");
    // console.log(time);
    return time;
  },

  fliteremoji: function (str) {
    str = str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    return str;
  },
})