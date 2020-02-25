// pages/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    votelist: "",
    //最后刷新时间
    refreshtime: "",
  },

  
  /*跳转投票详情页 */
  toVoteDetail: function (e) {
    var id = e.currentTarget.id;  //这里用的是投票表单的数据库_id作为获取的id,传到detail.js进行处理
    console.log(id)
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    })
  },
  setRefrashTime: function () {
    //获取当前时间-最后刷新时间显示
    var date = new Date().toTimeString();
    date = date.replace(/\s.*/, "")
    console.log(date);

    this.setData({
      refreshtime: date
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("index: onLoad...")

    this.setRefrashTime();

    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    //获取投票列表
    wx.cloud.callFunction({
      name: "v_runDB",
      data: {
        type: "v_get_vote_list",
      },
      success(res) {
        console.log(res.result)
        //处理时间
        var votelist = res.result
        for (var i = 0; i < votelist.length; i++) {
          //如何结束时间到了  设置结束
          if (votelist[i].end == 1) {
            if (new Date(Date.parse(votelist[i].endtime)) < new Date()) {
              console.log(votelist[i]._id)
              wx.cloud.callFunction({
                name: "v_runDB",
                data: {
                  type: "v_endvote",
                  end_id: votelist[i]._id
                },
                success(res) {
                  that.setData({
                    'votemain.end': 2
                  })
                  console.log(res)
                }
              })
            }
          }
          votelist[i].starttime = app.processTime(votelist[i].starttime);
          votelist[i].endtime = app.processTime(votelist[i].endtime);
        }
        that.setData({
          votelist: votelist,
        }) 

        /* v_get_vote_list 失败 */
      }, fail: function () {

        wx.showModal({
          title: '提示',
          content: '系统错误!',
        })
      }, complete: function () {
        wx.hideLoading();
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("index: onReady...")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("index: onShow...")
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("index: onHide...")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("index: onUnload...")


  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    var that = this;
    wx.showLoading({
      title: '刷新中...',
    })
    //获取投票列表
    wx.cloud.callFunction({
      name: "v_runDB",
      data: {
        type: "v_get_vote_list",
      },
      success(res) {
        console.log(res.result)
        //处理时间
        var votelist = res.result
        for (var i = 0; i < votelist.length; i++) {
          //如何结束时间到了  设置结束
          if (votelist[i].end == 1) {
            if (new Date(Date.parse(votelist[i].endtime)) < new Date()) {
              console.log(votelist[i]._id)
              wx.cloud.callFunction({
                name: "v_runDB",
                data: {
                  type: "v_endvote",
                  end_id: votelist[i]._id
                },
                success(res) {
                  that.setData({
                    'votemain.end': 2
                  })
                  console.log(res)
                }
              })
            }
          }
          votelist[i].starttime = app.processTime(votelist[i].starttime);
          votelist[i].endtime = app.processTime(votelist[i].endtime);
        }
        that.setData({
          votelist: votelist,
        })

        that.setRefrashTime();
        wx.stopPullDownRefresh(); //停止下拉刷新
        /* v_get_vote_list 失败 */

        console.log(that.data.votelist)
      }, fail: function () {

        wx.showModal({
          title: '提示',
          content: '系统错误!',
        })
      }, complete: function () {
        wx.hideLoading();
      }
    })

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },





})