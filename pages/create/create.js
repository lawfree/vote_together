var util = require('../../utils/util.js')
// pages/create/create.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    optionList: [
      {
        icon: ''
      },
      {
        icon: ''
      }
    ],

    showAddBtn: 1,

    date: "请选择",
    time: "请选择",

    //错误信息
    errormsg: "",
    //是否展示错误信息
    showerrormsg: false,

    //投票内容表单
    votepack: {
      title: "",
      text: "",
      options: "",
      voteOptionCount: 1,   //投票的可选 选项数
      startTime: "",
      endTime: "",          //结束时间
      anonymous: 1,         //1不匿名 2匿名
      image: "",           
    }
  },

  resdata:{
    "scene": "wx_vote_save", 
    "userid": app.globalData.userid,
    "votepack": Page.votepack ,
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (e) {
    console.log("create: onLoad...")
    // if (app.globalData.userid == null) {
    //   var userinfo = e.detail.userInfo;
    //   app.userLogin(userinfo);
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("create: onReady...")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("create: onShow...")
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("create: onHide...")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("create: onUnload...")
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

  },

  /* 事件响应: 增删选项 */
  recordValue: function (e) {
    let _optionList = this.data.optionList;
    let _index = e.target.dataset.index;
    let value = e.detail.value;
    _optionList[_index].value = value;

    this.setData({ optionList: _optionList });
  },
  addOption: function (e) {
    let _optionList = this.data.optionList;

    _optionList.push({ icon: '/images/common/5.png' })
    this.setData({ optionList: _optionList });

    // 选项大于15个后移除添加按钮
    if (_optionList.length >= 15) {
      this.setData({ showAddBtn: 0 });
    }
  },
  delOption: function (e) {
    let _index = e.target.dataset.index;
    let _optionList = this.data.optionList;

    _optionList.splice(_index, 1);

    this.setData({ showAddBtn: 1 });    // 当到达15个点击删除到小于15个时, add按钮应该出现
    this.setData({ optionList: _optionList });    
  },

  /* 事件响应绑定: 投票类型,结束日期时间,匿名 */
  //单选多选
  bindVoteTypeChange: function (e) {
    this.setData({
      voteTypeIndex: e.detail.value
    })
  },
  //结束时间
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value,
    })
  },
  //结束日期
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value,
    })
  },

  chooseImage: function (e) {

    var that = this;
    //ios系统上传图片失败——暂未解决，屏蔽 ，，接受不到数据或不能使用wx.uploadfile
    var system = wx.getSystemInfoSync().system;
    system = system.replace(/\s.*/,"");
    console.log(system);
    var regex = /ios/i;
    if (regex.test(system)){
       wx.showModal({
         title: '提示',
         content: '上传图片业务对于ios系统暂未开放!',
       });
       return;
    }
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      count: 1, // 最多可以选择的图片张数
      success: function (res) {
        console.log("选择成功",res);
        wx.showLoading({
          title: '上传中...',
        })
        var tempFilePaths = res.tempFilePaths[0];
        // 上传
        var timeStamp = Date.parse(new Date())
        wx.cloud.uploadFile({
          cloudPath: timeStamp +'_info.png',
          filePath: tempFilePaths, // 文件路径
          success: res => {
            // get resource ID
            console.log("成功",res.fileID)
            that.setData({
              'votepack.image': res.fileID,
            })
            wx.hideLoading();
          },
          fail: err => {
            // handle error
          }
        })

      }
    })
  },


  /* 发送到后端的信息 */
  //设置匿名
  set_anonymous: function (e) {
    var checked = e.detail.value;
    var check_int = 1;
    if (checked) {
      check_int = 2;
    }
    this.setData({
      'votepack.anonymous': check_int,
    })
  },
  //设置选项数
  set_option_count: function (e) {
    var voteOptionCount = e.detail.value;


    if (e.detail.value > this.data.optionList.length) {
      wx.showToast({
        title: '不能多于选项',
        duration: 2000,
      })
      return;
    }

    this.setData({
      'votepack.voteOptionCount': voteOptionCount,
    })

    console.log("voteOptionCount:" + voteOptionCount);
  },
  //设置title内容
  set_title_text: function (e) {
    var title = e.detail.value;
    title = app.fliteremoji(title);

    console.log("title:" + title);

    this.setData({
      'votepack.title': title,
    })
  },
  //设置描述内容
  set_content: function (e) {
    var content = e.detail.value;
    //console.log("content:" + content);
    content = app.fliteremoji(content);
    this.setData({
      'votepack.text': content,
    })
  },


  //保存投票
  saveVote: function (e) {
    //如果用户拒绝的话 就提示
    if (e.detail.userInfo == null) {
      wx.showModal({
        title: '提示',
        content: '授权失败，不可执行此操作!',
      })
      return;
    }
    var that = this;


    //如果是第一次授权则进行登录，否则不登录操作
    if (app.globalData.userid == null) {
      var userinfo = e.detail.userInfo;
      app.userLogin(userinfo);

      setTimeout(() => {
        if (app.globalData.userid != null) {
          that.saveVote2();
        }
      }, 2000);
       return;
    }
    that.saveVote2();
  },
  

  saveVote2: function () {
    wx.showLoading({
      title: '发布中...',
    })
    this.resdata.userid = app.globalData.userid
    

    //记录错误信息
    var errormsg = "格式错误:";

    //发起的投票信息
    var votepack = this.data.votepack;

    //获取选项信息
    var options = this.data.optionList;

    /*将选项信息解析成选项数组*/
    //现将json数组转化为字符串,以‘~，’作为分割符，如果选项中存在 ~， 会出错...
    var opts = "";

    var length = options.length - 1;

    var status = 200;//记录状态200选项格式正确 500错误

    /* 依次遍历选项键值对 */
    options.forEach((value, index) => {
      let val = value.value;
      //判断选项格式，15个字以内
      if (val == undefined || val == "" || val.length > 40) {
        status = 500; 
      }
      if (index != length) {
        opts = opts + val + "~,";
      } else {
        opts = opts + val;
      }

    })
    //因为js foreach不能用return...遇到问题也不能结束
    if (status == 500) {
      errormsg = errormsg + "选项的格式错误（为空，长度不合法）,";

    };

    //字符串到数组
    var options = opts.split("~,");

    //添加到投票信息中
    votepack.options = options;


    //处理结束日期
    var endTime = this.data.date + " " + this.data.time;
    votepack.endTime = endTime;

    //console.log(endTime);
    //比较时间是否合法

    //匹配中文-没有选择日期 
    if (/[\u4E00-\u9FA5\uF900-\uFA2D]+/.test(endTime)) {
      //结束..显示错误信息
      errormsg = errormsg + "没有选择结束日期,";
    }
    //判断日期是否合法，不能在开始时间之前
    if (new Date(Date.parse(endTime)) < new Date()) {
      errormsg = errormsg + "结束日期不能早于开始时间,";
    }

    //匹配标题和内容
    var title_length = votepack.title.length;
    if (title_length > 15 || title_length < 1) {
      errormsg = errormsg + "标题格式不正确,";
    }
    var text_length = votepack.text.length;
    //console.log("xx" + text_length);
    if (text_length > 80 || text_length < 2) {
      errormsg = errormsg + "投票描述格式不正确,";
    }
    if (errormsg != "格式错误:") {
      console.log(errormsg);
      this.setData({
        errormsg: errormsg,
        showerrormsg: true,
      })

      wx.hideLoading();

      return;
    } else {
      //检查完成
      //加上创建时间
      // var create_date = new Date().toTimeString();
      var create_date = util.formatTime(new Date())
      // create_date = create_date.replace(/\s.*/, "")
      console.log(create_date);
      votepack.startTime = create_date
      //..保存操作
      //避免上次错误，这里正确却还没有隐藏
      this.setData({
        errormsg: "",
        showerrormsg: false,
        
      })
      this.resdata.votepack = votepack
      console.log(this.resdata)

      var resdata = this.resdata
      var create_option = -1
      wx.cloud.callFunction({
        name: "v_runDB",
        data:{
          type: "v_create_vote",         
          resdata:resdata,        //这里同样不能用this
        },       
        complete: res => {
          console.log('callFunction v_create_vote result: ', res)
          if (res.result.data == 1) {
            /* 往tbl_option 中添加  */
            wx.cloud.callFunction({
              name:"v_runDB",
              data:{
                type: "v_create_option",
                resdata:resdata
              }, 
              complete:res2=>{
                console.log("v_create_option:" , res2)
                wx.showModal({
                  title: '提示',
                  content: '投票发起成功,下拉刷新',
                  complete: function () {
                    //跳转投票详情页
                    wx.switchTab({
                      url: '../index/index',
                    })
                  }
                })
              }
            }) 
          }
          else{
            wx.showModal({
              title: '提示',
              content: '该投票已创建,回去刷个新看看吧',
              complete: function () {
                //跳转投票详情页
                wx.switchTab({
                  url: '../index/index',
                })
              }
            })
          } 
        }  
      }) 
      wx.hideLoading();
    }

  },
})