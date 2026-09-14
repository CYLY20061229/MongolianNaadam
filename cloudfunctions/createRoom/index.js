const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const nickName = event.nickName || '房主'
  const avatarUrl = event.avatarUrl || ''

  const res = await db.collection('rooms').add({
    data: {
      hostOpenid: OPENID,
      status: 'waiting',
      totalQuestions: 10,
      currentQuestionIndex: -1,
      questionIds: [],
      currentAnswers: [],
      questionDeadlineAt: null,
      players: [
        {
          openid: OPENID,
          nickName,
          avatarUrl,
          ready: true,
          totalScore: 0,
          correctCount: 0,
          answeredAt: null
        }
      ],
      createdAt: Date.now(),
      finishedAt: null,
      result: null
    }
  })

  return {
    roomId: res._id
  }
}
