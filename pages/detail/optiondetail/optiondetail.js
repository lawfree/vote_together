
// pages/detail/optiondetail/optiondetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: [],
    options_vdesc: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取投票id
    var vid = options.id;
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    //获取选项信息，投票者
    var options_id = []
    var options_vdesc = []
    var res_names = new  Array()
    var temp = ""
    wx.cloud.callFunction({
      name: "v_runDB",
      data: {
        type: "get_optiondetail_1",
        vid: vid
      },
      success(res) {
       
        for(let i = 0 ; i < res.result.length ; i++){
          options_id[i] = res.result[i]._id
          options_vdesc[i] = res.result [i].vdesc 
        }
        console.log(options_id )    //选项信息 - id
        console.log(options_vdesc)  //选项信息 - vdesc
        that.setData({
          options_vdesc : options_vdesc
        })
        //根据投票id去找到userid      
        wx.cloud.callFunction({ 
          name : "v_runDB",
          data:{
            type : "get_optiondetail_2",
            options_id :options_id
          },success(res0){
            // console.log(res0.result[0].optionid)    //选票详情 以及对应的人信息
            // console.log(options_id[0])
            // console.log(res0.result[0].option_vetor[0].name)
            //下面进行和当前投票选项options_id进行比对, 

            for(let i = 0 ; i < options_id.length ; i++){
              /* 先初始化res_names二维数组 */
              res_names[i] = []
              let k = 0
              for (let j = 0; j < res0.result.length; j++) {
                if(res0.result[j].optionid == options_id[i]){
                  res_names[i][k] = res0.result[j].option_vetor[0].name
                  k +=1
                }
              }
              k = 0  
            }
            console.log(res_names)
            var temp_detail = []
            /* 规整detail,方便view层获取数据 */
            for (let i = 0; i < options_vdesc.length ; i ++){
              temp_detail[i] = []
              temp_detail[i][0] = options_vdesc[i]
              temp_detail[i][1] = res_names[i]
              // temp_detail[i][2] = res_names[i].length //获取每个选项几个人参与
            }
            that.setData({
              detail : temp_detail
            })
            console.log(detail)

            wx.hideLoading()
          },fail(){
            console.log("wrong")
          } 
        })
      }
    })
    
    
    
    wx.request({
      url: app.globalData.host + "/wx_graduation_voteforyou/",
      data: { "scene": "get_optiondetail", "id": vid },
      success: function (e) {
        //console.log(e.data);

        that.setData({
          detail: e.data,
        }),

          wx.hideLoading();
      }, fail: function () {
        wx.hideLoading();
      }
    })
  },




  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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

  }
})