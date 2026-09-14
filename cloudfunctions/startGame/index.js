const cloud = require('wx-server-sdk')
const { BATTLE_QUESTIONS } = require('./questionBank')
const QUESTION_DURATION_MS = 20000

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

function pickRandomQuestionIds(questions, count) {
  const ids = questions.map(question => question.id)

  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = ids[i]
    ids[i] = ids[j]
    ids[j] = temp
  }

  return ids.slice(0, count)
}

exports.main = async (event) => {
  const { roomId } = event
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()

  const roomRef = db.collection('rooms').doc(roomId)
  const roomRes = await roomRef.get()
  const room = roomRes.data

  if (!room) {
    throw new Error('房间不存在')
  }

  if (room.hostOpenid !== OPENID) {
    throw new Error('只有房主可以开始游戏')
  }

  if (!room.players || room.players.length !== 2) {
    throw new Error('需要两名玩家才能开始')
  }

  if (!room.players.every(player => player.ready)) {
    throw new Error('请等待双方都准备完成')
  }

  const questionIds = pickRandomQuestionIds(BATTLE_QUESTIONS, 10)
  const now = Date.now()

  await roomRef.update({
    data: {
      status: 'playing',
      questionIds,
      totalQuestions: questionIds.length,
      currentQuestionIndex: 0,
      currentAnswers: [],
      questionDeadlineAt: now + QUESTION_DURATION_MS,
      finishedAt: null,
      result: null,
      players: room.players.map(player => ({
        ...player,
        totalScore: 0,
        correctCount: 0,
        answeredAt: null
      }))
    }
  })

  return { success: true }
}
