const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { roomId, nickName, avatarUrl } = event
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()

  const roomRef = db.collection('rooms').doc(roomId)
  const roomRes = await roomRef.get()
  const room = roomRes.data
  const players = room.players || []

  const nextPlayers = players.map(player => {
    if (player.openid !== OPENID) {
      return player
    }

    return {
      ...player,
      nickName: nickName || player.nickName || '玩家',
      avatarUrl: avatarUrl || player.avatarUrl || '',
      ready: true
    }
  })

  await roomRef.update({
    data: {
      players: nextPlayers
    }
  })

  return {
    success: true
  }
}
