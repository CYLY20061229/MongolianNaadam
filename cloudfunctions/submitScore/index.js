// const cloud = require('wx-server-sdk')
// cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// exports.main = async (event, context) => {
//   const { score, nickName, avatarUrl } = event
//   const { OPENID } = cloud.getWXContext()
//   const db = cloud.database()

//   const user = await db.collection('users')
//     .where({ _openid: OPENID })
//     .get()

//   if (user.data.length === 0) {
//     // 新用户
//     return db.collection('users').add({
//       data: {
//         _openid: OPENID,
//         nickName,
//         avatarUrl,
//         bestScore: score,
//         updateTime: new Date()
//       }
//     })
//   } else {
//     const old = user.data[0]
//     if (score > old.bestScore) {
//       return db.collection('users').doc(old._id).update({
//         data: {
//           bestScore: score,
//           nickName,
//           avatarUrl,
//           updateTime: new Date()
//         }
//       })
//     }
//   }

//   return { msg: 'score not higher' }
// }
// submitScore/index.js
// submitScore/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log('=== 开始执行云函数 ===')
  console.log('event 参数:', event)
  console.log('event.userInfo:', event.userInfo)
  
  const { score, nickName, avatarUrl } = event
  const db = cloud.database()
  const nextScore = Number(score) || 0
  
  try {
    // 获取 OPENID
    const { OPENID } = cloud.getWXContext()
    console.log('OPENID:', OPENID)
    console.log('event.userInfo.openId:', event.userInfo?.openId)
    
    // 使用 event 中的 openId（更可靠）
    const openid = event.userInfo?.openId || OPENID
    console.log('最终使用的 openid:', openid)
    
    // 1. 查询现有用户
    console.log('开始查询用户...')
    const queryResult = await db.collection('users')
      .where({
        openid: openid  // 使用自定义字段
      })
      .get()
    
    console.log('查询结果:', queryResult)
    console.log('找到用户数:', queryResult.data.length)
    
    if (queryResult.data.length === 0) {
      // 新用户
      console.log('创建新用户记录...')
      const addResult = await db.collection('users').add({
        data: {
          openid: openid,
          nickName: nickName || '微信用户',
          avatarUrl: avatarUrl || '',
          bestScore: nextScore,
          updateTime: db.serverDate(),
          createTime: db.serverDate()
        }
      })
      console.log('添加结果:', addResult)
      return {
        code: 0,
        msg: '新用户记录创建成功',
        data: addResult
      }
    } else {
      // 老用户
      const oldUser = queryResult.data[0]
      console.log('现有用户数据:', oldUser)
      console.log(`当前分数: ${nextScore}, 历史最高: ${oldUser.bestScore}`)

      const bestScore = nextScore > oldUser.bestScore ? nextScore : oldUser.bestScore
      console.log('同步用户分数和资料...')
      const updateResult = await db.collection('users')
        .doc(oldUser._id)
        .update({
          data: {
            bestScore,
            nickName: nickName || oldUser.nickName,
            avatarUrl: avatarUrl || oldUser.avatarUrl,
            updateTime: db.serverDate()
          }
        })
      console.log('更新结果:', updateResult)

      return {
        code: 0,
        msg: nextScore > oldUser.bestScore ? '分数更新成功' : '资料同步成功',
        data: updateResult,
        bestScore
      }
    }
  } catch (err) {
    console.error('!!! 云函数执行出错 !!!')
    console.error('错误详情:', err)
    console.error('错误堆栈:', err.stack)
    
    throw err
  }
}
