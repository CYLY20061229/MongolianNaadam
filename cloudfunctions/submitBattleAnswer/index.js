const cloud = require('wx-server-sdk')
const { QUESTION_MAP } = require('./questionBank')
const QUESTION_DURATION_MS = 20000

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

function buildResult(players) {
  const sorted = [...players].sort((a, b) => {
    if ((b.totalScore || 0) !== (a.totalScore || 0)) {
      return (b.totalScore || 0) - (a.totalScore || 0)
    }

    return (b.correctCount || 0) - (a.correctCount || 0)
  })

  const [first, second] = sorted
  const isTie = Boolean(
    first &&
    second &&
    (first.totalScore || 0) === (second.totalScore || 0)
  )

  return {
    winnerOpenid: isTie ? '' : (first && first.openid) || '',
    isTie
  }
}

function buildTimeoutAnswers(room, existingAnswers, now) {
  const answeredOpenids = existingAnswers.map(answer => answer.openid)
  const timeoutAnswers = room.players
    .filter(player => !answeredOpenids.includes(player.openid))
    .map(player => ({
      openid: player.openid,
      selectedIndex: -1,
      isCorrect: false,
      awardedScore: 0,
      answeredAt: now,
      timeout: true
    }))

  return existingAnswers.concat(timeoutAnswers)
}

function buildQuestionUpdate(room, questionIndex, nextPlayers, nextAnswers, now) {
  const isQuestionFinished = nextAnswers.length >= room.players.length
  const isLastQuestion = questionIndex >= room.totalQuestions - 1
  const updateData = {
    players: nextPlayers,
    currentAnswers: nextAnswers
  }

  if (isQuestionFinished && isLastQuestion) {
    const result = buildResult(nextPlayers)
    updateData.status = 'finished'
    updateData.finishedAt = now
    updateData.battleWinnerOpenid = result.winnerOpenid
    updateData.battleIsTie = result.isTie
  } else if (isQuestionFinished) {
    updateData.currentQuestionIndex = questionIndex + 1
    updateData.currentAnswers = []
    updateData.questionDeadlineAt = now + QUESTION_DURATION_MS
  }

  return updateData
}

exports.main = async (event) => {
  const { roomId, questionIndex, selectedIndex, forceTimeout } = event
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()
  const now = Date.now()

  console.log('submitBattleAnswer event:', {
    roomId,
    questionIndex,
    selectedIndex,
    forceTimeout,
    openid: OPENID
  })

  return db.runTransaction(async transaction => {
    const roomRef = transaction.collection('rooms').doc(roomId)
    const roomRes = await roomRef.get()
    const room = roomRes.data

    if (!room) {
      throw new Error('房间不存在')
    }

    if (room.status !== 'playing') {
      return { success: true, ignored: true, status: room.status }
    }

    if (room.currentQuestionIndex !== questionIndex) {
      return {
        success: true,
        ignored: true,
        currentQuestionIndex: room.currentQuestionIndex
      }
    }

    const playerIndex = room.players.findIndex(player => player.openid === OPENID)
    if (playerIndex === -1) {
      throw new Error('玩家不在房间中')
    }

    const currentAnswers = room.currentAnswers || []
    const isDeadlinePassed = Boolean(room.questionDeadlineAt && now >= room.questionDeadlineAt)

    if (currentAnswers.some(answer => answer.openid === OPENID)) {
      if (forceTimeout && isDeadlinePassed) {
        const nextAnswers = buildTimeoutAnswers(room, currentAnswers, now)
        const updateData = buildQuestionUpdate(room, questionIndex, room.players, nextAnswers, now)

        await roomRef.update({
          data: updateData
        })

        return {
          success: true,
          timeoutFinalized: true,
          duplicate: true
        }
      }

      return { success: true, ignored: true, duplicate: true }
    }

    const questionId = room.questionIds[questionIndex]
    const question = QUESTION_MAP[questionId]

    if (!question) {
      throw new Error('题目不存在')
    }

    const isCorrect = selectedIndex === question.answer
    const existingCorrectCount = currentAnswers.filter(
      answer => answer.isCorrect
    ).length
    const awardedScore = isCorrect ? (existingCorrectCount === 0 ? 100 : 60) : 0

    const nextPlayers = room.players.map((player, index) => {
      if (index !== playerIndex) {
        return player
      }

      return {
        ...player,
        totalScore: (player.totalScore || 0) + awardedScore,
        correctCount: (player.correctCount || 0) + (isCorrect ? 1 : 0),
        answeredAt: now
      }
    })

    let nextAnswers = currentAnswers.concat({
      openid: OPENID,
      selectedIndex,
      isCorrect,
      awardedScore,
      answeredAt: now
    })

    if (forceTimeout && isDeadlinePassed) {
      nextAnswers = buildTimeoutAnswers(room, nextAnswers, now)
    }

    const updateData = buildQuestionUpdate(room, questionIndex, nextPlayers, nextAnswers, now)

    await roomRef.update({
      data: updateData
    })

    return {
      success: true,
      awardedScore,
      isCorrect,
      timeoutFinalized: Boolean(forceTimeout && isDeadlinePassed),
      nextQuestionIndex: typeof updateData.currentQuestionIndex === 'number'
        ? updateData.currentQuestionIndex
        : questionIndex
    }
  })
}
