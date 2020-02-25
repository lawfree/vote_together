
var sliderWidth = 100; // 需要设置slider的宽度，用于计算中间位置
const app = getApp();
Page({
  data: {
    userid: null,//用户id
    tabs: ["我发起的", "我参与的", "没想好干啥的"],
    activeIndex: 0,
    sliderOffset: 0,
    votelist: "",
    sliderLeft: 0,
  }, 
  //用户登录
  userLogin: function (e) {
    //如果用户拒绝的话 就提示
    if (e.detail.userInfo == null) {

      wx.showModal({
        title: '提示',
        content: '授权失败，不可执行此操作!',
      })
      return;
    }
    var that = this;

    //如果是第一次授权则进行登录，不然就不进行登录操作--可能造成数据更新问题，但是不影响
    if (app.globalData.userid == null) {
      var userinfo = e.detail.userInfo;
      app.userLogin(userinfo);
      //console.log(userinfo);
      setTimeout(() => {
        that.setData({
          userid: app.globalData.userid,
        });
      }, 2000);
    }

  },
  toVoteDetail: function (e) {
    //跳转投票详情页
    var id = e.currentTarget.id;
    //仅仅我参与模块能提前结束投票
    if (this.data.activeIndex == 1) {
      wx.navigateTo({
        url: '../detail/detail?id=' + id,
      })
    } else {
      wx.navigateTo({
        url: '../detail/detail?admin=true&id=' + id,
      })
    }
  },
  onLoad: function () {
    var that = this;
    wx.showModal({
      title: '小提示',
      content: '有时刷新延时,请手动点来点去刷新~',
    })
    this.setData({
      userid: app.globalData.userid,
    })
    //需要授权才能操作
    if (app.globalData.userid == null) {
      return;
    }
    wx.showLoading({
      title: '加载中...',
    }) 

    var id = app.globalData.userid;

  },
  tabClick: function (e) {
    //需要登录授权才能操作
    if (app.globalData.userid == null) {
      wx.showToast({
        title: '请先登录!',
        duration: 2000,
      })
      return;
    }
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    var a = e.currentTarget.id;
    var id = app.globalData.userid;
    if (a == 0) {
      //获取投票列表_自己发起 调用云函数
      wx.cloud.callFunction({
        name:"v_runDB",
        data:{
          type: "v_get_vote_list_own",
        },
        success(res){
          console.log(res)
          var votelist = res.result.data;
          for (let i = 0; i < votelist.length; i++) {
            votelist[i].starttime = app.processTime(votelist[i].starttime);
            votelist[i].endtime = app.processTime(votelist[i].endtime);
          }

          that.setData({
            votelist: votelist
          })
        },
        fail(){
          console.log("v_get_vote_list_own failed")
        }
      })
      console.log("votelist",this.votelist) 

      wx.hideLoading();
    } else if (a == 1) {
      //获取投票列表_自己参与
      wx.cloud.callFunction({
        name: "v_runDB",
        data: {
          type: "get_vote_list_join",
          userid : id       //登录的个人id
        },
        success(res) {
          var votelist = res.result;
          for (let i = 0 ; i < res.result.length ; i++){
            votelist[i] = res.result[i].user_vote[0]
          }
          for (let i = 0; i < votelist.length; i++) {
            votelist[i].starttime = app.processTime(votelist[i].starttime);
            votelist[i].endtime = app.processTime(votelist[i].endtime);
          }
          console.log(votelist)
          that.setData({
            votelist: votelist
          })
          wx.hideLoading();
        },
        fail() {
          console.log("v_get_vote_list_join failed")
          wx.hideLoading();
        }
      })
    } else {
      //获取投票列表_自己参与
      wx.request({
        url: app.globalData.host + "/wx_graduation_voteforyou/",
        data: {
          "scene": "get_vote_list_audit", "id": id
        },
        success: function (res) {
          console.log(res.data);
          //处理时间
          var votelist = res.data;

          for (let i = 0; i < votelist.length; i++) {
            votelist[i].starttime = app.processTime(votelist[i].starttime);
            votelist[i].endtime = app.processTime(votelist[i].endtime);
          }
          that.setData({
            votelist: votelist,
          })
          wx.hideLoading();
        }, fail: function () {
          wx.hideLoading();
        }
      })
    }
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  }
});