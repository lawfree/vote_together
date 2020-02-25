// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  traceUser: true,
  env: 'yun207-test-eg5y0'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event);
  if (event.type == "v_get_openid"){
    return {
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
  }

  else if (event.type == "v_get_vote_detail_1"){
    var vote_id = event.id

    var list_res_1 = [] 
    return new Promise((resolve, reject) => {
      db.collection('tbl_vote').where({
        _id: vote_id
      }).get()
        .then((res) => {
          var temp = res.data[0]
          /* 根据这个表单的作者openid去查作者姓名等 */
          //select v.id,v.title,v.votedesc,v.votetype,v.isanonymous,v.endtime,v.end,u.image,u.name        
          list_res_1[0] = temp._id
          list_res_1[1] = temp.title
          list_res_1[2] = temp.votedesc
          list_res_1[3] = temp.votetype
          list_res_1[4] = temp.isanonymous
          list_res_1[5] = temp.endtime
          list_res_1[6] = temp.end
 
          db.collection(`tbl_user`).where({
            _id: temp.userid
          }).get()
            .then((res2) => {
              console.log(res2.data)
              list_res_1[7] = res2.data[0].avatarUrl
              list_res_1[8] = res2.data[0].name
              console.log(list_res_1)
              resolve(res2)
              //至此投票表单信息和发起人信息拿到   

            })
            resolve(res)
        })
        .catch((err) => {
          console.log(err)
        })
    })

  }
  /*
  SELECT o.id,o.vdesc,COUNT(s.id) sum 
  FROM tbl_voteoption o LEFT JOIN tbl_selectdetail s ON o.id = s.optionid 
  WHERE o.voteid = (传入的id) 
  GROUP BY o.id"; 
  统计了每个选项的票数
  */
  else if (event.type == "v_get_vote_detail_2"){
    var vote_id = event.id
    var oid = []
    var odesc = []
    var ocount = []

    // 查选项详情, 查vdesc
    return new Promise((resolve, reject) => {
      db.collection('tbl_voteoption').where({
        voteid: vote_id
      }).get()
        .then((res) => {
          console.log(res)
          for (let i = 0; i < res.data.length; i++) {
            oid[i] = res.data[i]._id
            odesc[i] = res.data[i].vdesc
            ocount[i] = 0
          }
          console.log(oid, odesc) //写入成功
          var result = []
          result[0] = oid
          result[1] = odesc
          result = asyncFunc3(result) 
          resolve(result)
        })
    })



    function asyncFunc3(result) {
      var vuser = []
      var vuserid = []
      let userid_set = new Set() // 存投票用户userid
      console.log("fun3")
      //查投票详情, 聚集函数找出每个选项获得的票数 
      //其voteid 等于传入的voteid值
      return new Promise((resolve, reject) => {
        db.collection('tbl_selectdetail').where({
          voteid: vote_id
        }).get()
          .then((res0) => {
            console.log(res0)

            for (let i = 0; i < res0.data.length; i++) {
              userid_set.add(res0.data[i].userid)
              for (let j = 0; j < oid.length; j++) {
                if (res0.data[i].optionid == result[0][j])
                  ocount[j]++
              }
            }
            vuserid = [...userid_set]
            console.log(ocount) //ocount get
            console.log(vuserid) //ocount get

            result[2] = ocount
            result[3] = vuserid
            resolve (result)
          })
      })
    }
  }

  //查询做过投票的用户信息
  /*
  select  distinct  u.id,u.name,u.image 
    from tbl_user u left join tbl_selectdetail s  on u.id = s.userid 
    where s.voteid = (传上去的id));
  */
  else if (event.type == "v_get_vote_detail_3"){
    const _ = db.command
    console.log(event.userid)
    return new Promise((resolve, reject)=>{
      db.collection('tbl_user').where({
        _id: _.in(event.userid)
      }).get()
        .then(res => {
          console.log(res)
          resolve(res.data)
        })
    })

  }


  /*投票选项详情页面 */
  else if (event.type == "get_optiondetail_1"){
    
    //先把基于此投票的选项查出来
    /*
      select id,vdesc 
      from tbl_voteoption 
      where voteid = (传上去的id);
    */
    var options_id = []
    var options_vdesc = []

    return new Promise((resolve , reject)=>{
      db.collection('tbl_voteoption').where({
        voteid :event.vid
      }).get()
        .then(res=>{
          console.log(res.data)
          resolve(res.data)
        })
     })

  }
  else if (event.type == "get_optiondetail_2"){
    //储存
    //遍历查出每个选项+选择用户
    // select u.name from tbl_user u left join tbl_selectdetail s on u.id = s.userid where s.optionid = (传上去的);

    const _ = db.command
    const $ = db.command.aggregate
    return new Promise((resolve, reject) => {
      db.collection('tbl_selectdetail')
      
        .aggregate()
        .lookup({
          from: 'tbl_user',
          localField: "userid",
          foreignField: "_id",
          // pipeline: $.pipeline()
          //   .match({
          //     // optionid: _.in(event.options_id)
          //     optionid:_.gt(3) 
          //   })
          //   .done(),
          
          as: 'option_vetor',
        })
        // .match({
        //   optionid: _.in(event.options_id)
        // })
        .end()
        .then(res => {
          console.log(res)
          resolve(res.list)   //传回投票详情及其相应人信息
        })
    })
  }
  else if (event.type == "get_optiondatail_3") {
    /* 根据传上来的userid ,查询tbl_user */
    const _ = db.command
    console.log(event.userids)
    return new Promise((resolve, reject) => {
      db.collection('tbl_user')

        .where({
          _id: _.in(event.userids)
        })
        // .field({
        //   _id: false,
        //   optionid: false,
        //   userid: true,
        //   voteid: false
        // })
        .get()
        .then(res => {
          console.log(res.data)
          resolve(res.data)
        })
    })
  }

  /* 新添加一个选则记录 */
  // foreach(option in opt){
  //   sql = "insert tbl_selectdetail(voteid,userid,optionid) values (voteid,userid,opt)";
  // }
  else if (event.type == "addoption") {
    console.log(event)
    /*
    optionid: ["2"]
    type: "addoption"
    userid: "ot6Qd5CmRiiXpUSWWH_gn_NJUjpw"
    voteid: "0ec685215e4767ec0ff4b76a4744644d"
     */
    const _ = db.command

    /* 对于每一个optionid中的每一项, 需要存到tbl_selectdetail中*/
    var promises = []
    for(let i = 0 ; i < event.optionid.length ; i ++){
      promises[i] =  new Promise((resolve, reject) => {
        db.collection('tbl_selectdetail').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            optionid: event.optionid[i],
            userid:event.userid,
            voteid: event.voteid
          }
        })   
      }).then(res=>{
        console.log(res)
      })
    }
    Promise.all(promises).then(res=>{
      console.log(res)
    })  
  }


  else if (event.type == "endvote") {
    //先把基于此投票的选项查出来
    /*
      将这个id的end 设为2
    	sql =
       update tbl_vote set end = 2
        where id = (传上去的id)
    */
    return new Promise((resolve, reject) => {
      db.collection('tbl_vote').doc(event.voteid).update({
          data:{
            end: 2
          }
      })
        .then(res => {
          console.log(res.data)
          resolve(res.data)
        })
    })

  }

  else if (event.type == "deletevote"){
    /* 将对应的表删除 tbl_vote 
          sql = delete from tbl_vote where id =(传上去)
       还有tbl_voteoption中的对应选项删除
    
     */
    console.log(event)
    //删除 tbl_vote 表
    promises = []
    promises[0] = new Promise((resolve , reject) =>{
      db.collection('tbl_vote')
      .where({
          _id:event.voteid
      })
      .remove()
      .then(res=>{
        console.log(event.id +" 表删除成功")
        resolve(res)
      })
    })

    //删除tbl_voteoption中对应选项
    const _ = db.command
    promises[1 ] = new Promise((resolve , reject) =>{
      db.collection('tbl_voteoption')
      .where({
        _id: _.in(event.optionsid)
      })
      .remove()
      .then(res=>{
        console.log("选项删除成功")
      })
    })

    //删除tbl_selectiondetail中voteid = event.voteid
    promises[2] = new Promise((resolve , reject) =>{
      db.collection('tbl_selectdetail')
      .where({
        voteid : event.voteid
      })
      .remove()
      .then(res=>{
        console.log("选择记录删除成功")
      })
    })

    Promise.all(promises).then(res=>{
      console.log("删除完成")
    })
  }


  /* 查询自己参加的投票*/
  //从tbl_selectdetail 自然连接到 tbl_vote
  else if (event.type == "get_vote_list_join"){
    const _ = db.command
    const $ = db.command.aggregate
    return new Promise((resolve, reject) => {
      db.collection('tbl_selectdetail')
        .aggregate()
        .lookup({
          from: 'tbl_vote',
          localField: "voteid",
          foreignField: "_id",
          // pipeline: $.pipeline()
          //   .match({
          //     // optionid: _.in(event.options_id)
          //     userid: event.userid 
          //   })
          //   .done(),
          as: 'user_vote',
        })
        .match({        //匹配userid 为我们传上去的userid
          userid: event.userid
        })
        .project({
          _id : 0 , // _id 不显示
          user_vote: 1  //只显示查到的vote的信息
        })
        .end()
        .then(res => {
          console.log(res.list)

          resolve(res.list)
          // resolve(res.list)   //传回投票详情及其相应人信息
        })


      // .where({
      //   userid: event.userid
      // }).get()
      //   .then((res) => {
      //     resolve(res)
      //     console.log(res.data)
      //   })
      //   .catch((err) => {
      //     console.log(err)
      //     reject(err)
      //   })
    })
  }

  /////////////////////////////////////////////////////////////////
  /* 存储用户信息 */
  else if (event.type == "v_save_userinfo") {
    return new Promise((resolve, reject) => {
      db.collection('tbl_user').doc(wxContext.OPENID).get()
        .then((res) => {
          console.log(res.data)
          resolve(res)
        })
        .catch((err) => {
          console.log(err)

          db.collection('tbl_user').add({
            data: {
              "_id": wxContext.OPENID,
              "name": event.userinfo.nickName,
              "gender": event.userinfo.gender,
              "avatarUrl": event.userinfo.avatarUrl,
            }
          })
          reject(err)
        })
      
    })
  }
  /* 创建自己的投票单 并存储 */

  else if (event.type == "v_create_vote") {
    console.log('v_create_vote :', event.resdata.votepack.title)
    var  flag_create  = -1 // 当该flag为true时, 表示要建表 
    return new Promise((resolve, reject) => {
      db.collection('tbl_vote').where({
        title: event.resdata.votepack.title
      }).get()
        .then((res) => {
          if (res.data == ""){
            db.collection('tbl_vote').add({
              data: {
                end: 1,
                starttime: event.resdata.votepack.startTime,
                endtime: event.resdata.votepack.endTime,
                image: event.resdata.votepack.image,
                isanonymous: event.resdata.votepack.anonymous,
                title: event.resdata.votepack.title,
                userid: event.resdata.userid,
                votedesc: event.resdata.votepack.text,
                votetype: event.resdata.votepack.voteOptionCount,
                vshow: "2",
                belong: wxContext.OPENID
              }
            })
            console.log("创了表")

            res.data= 1
            resolve(res)
            console.log(res)
          }else{
            // //否则没创建
            console.log("没创表")
            res.data = 0
            // flag_create = 0
            resolve(res)    //传回去, 表示没建表
            console.log(res)
          }
        })
    })

  }
  /* 往 tbl_option中写 */
  else if (event.type == "v_create_option"){
    console.log(event.resdata.votepack.options)

    /* 向tbl_voteoption 中添加该表单的所有选项 */
    var vote_index = 0
    var voteid = ""
    function asyncFunc1(){
      new Promise((resolve, reject) =>{
        db.collection('tbl_vote').where({
          title: event.resdata.votepack.title
        }).get()
        .then((res)=>{
          voteid = res.data[0]._id
          console.log(res)
          console.log(voteid)
          asyncFunc2()
        }) 
      })
    }
    /* 找出tbl_voteoption中最大的那个 */
    var max_index = 0
    function asyncFunc2(){
      const $ = db.command.aggregate
      // var max_i =
        db.collection('tbl_voteoption')
          .aggregate()
          // .max('$_id')
          .sort({
            _id: 1
          })
          .group({
             _id: null,
            max_index: $.last('$_id')
          })
          .end()
          .then(res => {
            console.log(res)
            max_index = res.list[0].max_index
            asyncFunc3()
          })
          .catch(err => console.error(err))

      // })
      // .then(res =>{
      //   console.log(res)
      // })
    }

    function asyncFunc3() {
      new Promise((resolve, reject) => {
        for (var i = 0; i < event.resdata.votepack.options.length; i++) {
          // vote_index += 1
          console.log(vote_index)
          // new Promise((resolve, reject) => {
          db.collection('tbl_voteoption').add({
            data: {
              _id: max_index + i + 1,
              vdesc: event.resdata.votepack.options[i],
              voteid: voteid
            },
            success: function (res2) {
              console.log(max_index + i)
            }
          })
          // }).then((res2) => {
          //   console.log(vote_index)
          // })
        }

      })
    }
    asyncFunc1() 
    //  asyncFunc2()  
  }
  /* 查看 我创建的投票单 */
  else if (event.type == "v_get_vote_list_own") {
    return new Promise((resolve, reject) => {
      db.collection('tbl_vote').where({
        belong: wxContext.OPENID
      }).get()
        .then((res) => {
          resolve(res)
          console.log(res.data)
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
    })
  }
  else if (event.type == "v_get_vote_list") {
    return new Promise((resolve , reject)=>{
      db.collection('tbl_vote')
        .aggregate()
        .lookup({
          from: 'tbl_user',
          localField: "userid",
          foreignField: "_id",
          as: 'vote_creator',
        })
        // .match({        //匹配userid 为我们传上去的userid
        //   userid: event.userid
        // })
        // .project({
        //   _id: 0, // _id 不显示
        //   user_vote: 1  //只显示查到的vote的信息
        // })
        .end()
        .then(res => {
          console.log(res.list)

          resolve(res.list)
        })
    })
    // return new Promise((resolve, reject) => {
    //   db.collection('tbl_vote')
    //   .get()
    //   .then((res) => {
    //     resolve(res)
    //     console.log(res.data)
    //   })
    //   .catch((err) => {
    //     console.log(err)
    //     reject(err)
    //   })
    // })  
  }
  /* 处理已经过期了的投票选单 */
  else if (event.type == "v_endvote") {
    return new Promise((resolve, reject)=>{
      db.collection('tbl_vote').doc(event.end_id).update({
        data:{
          end:2
        }
      })
      .then((res) => {
        resolve()
        console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  else if (event.type == "get_vote_detail"){

 
  }
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}