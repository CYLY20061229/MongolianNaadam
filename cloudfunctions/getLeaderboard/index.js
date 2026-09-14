const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { score, nickName, avatarUrl } = event
  const { OPENID } = cloud.getWXContext()

  const res = await db.collection('leaderboard')
    .where({ _openid: OPENID })
    .get()

  // 没有记录 → 新建
  if (res.data.length === 0) {
    await db.collection('leaderboard').add({
      data: {
        nickName,
        avatarUrl,
        bestScore: score,
        updateTime: new Date()
      }
    })
    return { msg: 'new user' }
  }

  const old = res.data[0]
  // 只有更高才更新
  if (score > old.bestScore) {
    await db.collection('leaderboard')
      .doc(old._id)
      .update({
        data: {
          bestScore: score,
          updateTime: new Date()
        }
      })
    return { msg: 'updated' }
  }

  return { msg: 'no update' }
}
