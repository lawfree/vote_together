//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    votemain:{},
    optioninfo:[],
    optionsid:[],
    userinfo:[],
    admin:false, 
    option:[],//储存选项id
    userid:null,
  },
  //删除投票
  deletevote:function(e){
    
    var that =this;

    wx.showModal({
      title: '提示',
      content: '确认删除投票？',
      success:function(res){
        if(res.confirm){
          that.deletevote1();
        }
      },
    })
  },
  //审核投票通过
  aduitvote:function(){
  },
  deletevote1:function(){
    var that = this;
    var id = this.data.votemain._id;
    var optionsid = this.data.optionsid   //将该选项的所有id也要传上去
    wx.showModal({
      title: '确认删除提示',
      content: '[' + that.data.votemain.title + '] 将被删除',

      success: function (res) {
        if (res.cancel) {
          //点击取消,
          return
        } else {
          //点击确定
          //调用结束投票的云函数
          wx.showLoading({
            title: '加载中..',
          })

          wx.cloud.callFunction({
            name: "v_runDB",
            data: {
              type: "deletevote",  
              voteid: id,  //传上去的投票表单id 即voteid
              optionsid : optionsid
            },
            success(res) {
              console.log(res)
              wx.hideLoading();
              wx.showToast({
                title: '提前结束成功!',
              })

              wx.navigateBack({
                delta: 1  // 返回上一级页面。
              })

            }, fail: function () {
              wx.hideLoading();
              wx.showToast({
                title: '错误!',
              })
            }
          })
        }
      },
    })

    wx.showLoading({
      title: '加载中..',
    })

  },
  //提前结束投票
  endvote:function(){
    var that = this;
    var id = this.data.votemain._id;
    wx.showModal({
      title: '确认结束提示',
      content: '[' + that.data.votemain.title + '] 将无法再进行投票',

      success: function (res) {
        if (res.cancel) {
          //点击取消,
          return
        } else {
          //点击确定
          //调用结束投票的云函数
          wx.showLoading({
            title: '加载中..',
          })

          wx.cloud.callFunction({
            name: "v_runDB",
            data: {
              type: "endvote",  //添加投票信息
              voteid: id,  //传上去的投票表单id 即voteid,之前已经将表单所有信息放在了votemian中
            },
            success(res) {

              wx.hideLoading();
              wx.showToast({
                title: '提前结束成功!', 
              })

              wx.navigateBack({
                delta: 1  // 返回上一级页面。
              })

            }, fail: function () {
              wx.hideLoading();
              wx.showToast({
                title: '错误!',
              })
            }
          })
        }
      },
    })
  },
  //查看投票详情
  openVotedetail:function(){
    //投票id
    var vid = this.data.votemain._id;

    wx.navigateTo({
      url: './optiondetail/optiondetail?id='+vid +'&admin=' + this.data.admin,
    })
  },
  radioChange:function(e){

    this.data.option[0] = e.detail.value;

    console.log(this.data.option[0]);
  },
  checkboxChange:function(e){
    var value = e.detail.value;
    
    if(value.length > this.data.votemain.votetype){
      wx.showModal({
        title: '提示',
        content: '您仅可勾选 ' + this.data.votemain.votetype +" 个选项,此勾选无效",
      })
      return ;
    }

    this.data.option = value;
    
   // console.log(this.data.option);
  },
  //保存投票
  saveVoteres:function(e){
    console.log(e);
    //判断是否选择
    if(this.data.option.length<=0){
      wx.showModal({
        title: '提示',
        content: '您还没有选择!',
        
      })

      return;
    }
   
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
    console.log("马上投票", app.globalData.userid, this.data.option )
    if (app.globalData.userid == null) {
      var userinfo = e.detail.userInfo;
      app.userLogin(userinfo);
      setTimeout(() => {

        //判断是否已经投过票了
        var cid = app.globalData.userid;
        var z = 0;
        for (let i = 0; i < that.data.userinfo.length; i++) {
          if (cid == that.data.userinfo[i]._id) {
            z = 1;
            break;
          }
        }
        if (z == 1) {
          wx.showModal({
            title: '提示',
            content: '您已经投过一次票了，不能重复投票!',
          })
          return;
        }
 //       that.saveVoteres2();
      }, 2000);
      return;
    }

    //判断是否已经投过票了
    var cid = app.globalData.userid;
    var z = 0;
    for (let i = 0; i < that.data.userinfo.length; i++) {
      if (cid == that.data.userinfo[i]._id) {    //前面已有投票用户集合, 存在性检验即可
        z = 1;
        break;
      }
    }
    if (z == 1) {
      wx.showModal({
        title: '提示',
        content: '您已经投过一次票了，不能重复投票!',
      })
      return;
    }
  
   that.saveVoteres2();  
  },
  saveVoteres2:function(){
    wx.showLoading({
      title: '投票中...',
      })
      var that =this;
  
    wx.cloud.callFunction({
      name: "v_runDB",
      data: {
        type: "addoption",  //添加投票信息
        voteid: that.data.votemain._id,  //传上去的投票表单id 即voteid,之前已经将表单所有信息放在了votemian中
        userid: app.globalData.userid,
        optionid: that.data.option   //储存的选项id
      },
      success(res) {         
        wx.hideLoading();
        wx.switchTab({
          url: '../index/index',
        })
        wx.showToast({
          title: '投票成功!',
        })
        },fail:function(){
          wx.hideLoading();
          wx.showToast({
            title: '错误!',
          })
        }
      })
  },
  onShow:function(){
    if (app.globalData.userid == null) {
      wx.showModal({
        title: '提示',
        content: '请先在[我的]里面登录才能看信息哦!',
        success: function (res) {
          if (res.cancel) {
            //点击取消,
            wx.switchTab({
              url: '../involved/involved' ,
            })
          } else {
            //点击确定
            wx.switchTab({
              url: '../involved/involved',
            })
          } 
        },
        complete: function () {

        }
      })
    }
  },

  onLoad: function(e){
    var admin = e.admin;
    this.setData({
      admin: admin,
      userid: app.globalData.userid,
    })
    console.log(this.dataadmin, this.data.userid);

    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    var  id = e.id;
    console.log(e);

    var temp_optioninfo =[]


    /* 获取投票信息 */
    wx.cloud.callFunction({
      name: "v_runDB",
      data: {
        type: "v_get_vote_detail_1",  //先获取投票表单信息
        id:id,  //传上去的投票表单 即voteid
      },
      success(res) {
         console.log(res)
        that.setData({
          votemain: res.result.data[0],
        })
        wx.cloud.callFunction({
          name:"v_runDB" ,
          data:{
            type: "v_get_vote_detail_2",
            id : id,
          },
          success(res2){
            console.log(res2.result)
            that.setData({
              optionsid:res2.result[0]    //存放所有选项id
            })
            for(let i = 0  ; i < res2.result[0].length ; i ++){
              temp_optioninfo[i] = []
              temp_optioninfo[i][0] = res2.result[0][i]
              temp_optioninfo[i][1] = res2.result[1][i]
              temp_optioninfo[i][2] = res2.result[2][i]
            }

          //处理optioninfo process组件   
          //计算总投票选择次数_面对多选投票人数不起作用
          var count = 0;
            for (let i = 0; i < temp_optioninfo.length;i++){
              count = count + temp_optioninfo[i][2]   
           };

            for (let i = 0; i < temp_optioninfo.length; i++) {
              let rate = (temp_optioninfo[i][2] / count * 100) + "";
             let k = rate.indexOf(".");
             if(k == -1){
               k = rate.length; 
             }
             rate = rate.substring(0, k + 3);
            // console.log(rate);
              temp_optioninfo[i][3] = rate;   //将第四个位置作为存放百分比的位置
            // console.log(optioninfo[i].rate);
           }
  
            that.setData({
              optioninfo: temp_optioninfo
            })
            console.log(that.data.optioninfo)

            /* 将res2.result[3] 作为data传上去 */
            wx.cloud.callFunction({ 
              name:"v_runDB",
              data:{
                type: "v_get_vote_detail_3",
                userid: res2.result[3]
              },
              success(res3){
                console.log(res3.result)
                that.setData({
                  userinfo : res3.result 
                })
              }
            })
          }
        })
        wx.hideLoading();
      }, 
      /*  失败 */
      fail: function () {
 
        wx.showModal({
          title: '提示',
          content: '系统错误!找不到信息!',
        })
        wx.hideLoading();
      }, complete: function () {
      } 
    }) 

    },
   onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '投票：' + this.data.votemain.title,
      path: '/pages/detail/detail?id='+this.data.votemain._id,
      success: function (res) {
        // 转发成功
        console.log(path)
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
