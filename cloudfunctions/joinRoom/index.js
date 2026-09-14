const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { roomId, nickName, avatarUrl } = event
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()

  const roomRef = db.collection('rooms').doc(roomId)
  const roomRes = await roomRef.get()
  const room = roomRes.data

  if (!room) {
    throw new Error('房间不存在')
  }

  const players = room.players || []

  if (room.status !== 'waiting') {
    throw new Error('游戏已经开始，不能加入')
  }

  if (players.some(player => player.openid === OPENID)) {
    const nextPlayers = players.map(player => {
      if (player.openid !== OPENID) {
        return player
      }

      return {
        ...player,
        nickName: nickName || player.nickName || '挑战者',
        avatarUrl: avatarUrl || player.avatarUrl || ''
      }
    })

    await roomRef.update({
      data: {
        players: nextPlayers
      }
    })

    return { joined: true, roomId }
  }

  if (players.length >= 2) {
    throw new Error('房间已满')
  }

  await roomRef.update({
    data: {
      players: db.command.push({
        openid: OPENID,
        nickName: nickName || '挑战者',
        avatarUrl: avatarUrl || '',
        ready: false,
        totalScore: 0,
        correctCount: 0,
        answeredAt: null
      })
    }
  })

  return {
    joined: true,
    roomId
  }
}
