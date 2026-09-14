const app = getApp()
const db = wx.cloud.database()
const { BATTLE_QUESTIONS, getBattleQuestionMap } = require('../../utils/battleQuestions')
const QUESTION_DURATION_SECONDS = 20

const QUESTION_MAP = getBattleQuestionMap()

function normalizeAvatarUrl(value) {
  return typeof value === 'string' ? value : ''
}

function isCloudFileID(value) {
  return typeof value === 'string' && value.indexOf('cloud://') === 0
}

function normalizePlayer(player) {
  if (!player) {
    return null
  }

  return {
    ...player,
    avatarUrl: normalizeAvatarUrl(player.avatarUrl),
    nickName: typeof player.nickName === 'string' ? player.nickName : '玩家'
  }
}

Page({
  data: {
    roomId: '',
    room: null,
    myOpenid: '',
    myPlayer: null,
    opponent: null,
    currentQuestion: null,
    currentQuestionNumber: 0,
    optionStatus: [],
    selectedIndex: null,
    hasAnswered: false,
    isSubmitting: false,
    timeLeft: QUESTION_DURATION_SECONDS,
    timeProgress: 100,
    waitingText: '',
    statusText: '等待题目开始...'
  },

  avatarTempUrlCache: {},

  async onLoad(options) {
    const roomId = options.roomId
    const openid = app.globalData.openid || (await wx.cloud.callFunction({ name: 'login' })).result.openid

    app.globalData.openid = openid

    this.setData({
      roomId,
      myOpenid: openid
    })

    await this.preloadQuestionImages()
    this.startPolling()
  },

  preloadQuestionImages() {
    return new Promise(resolve => {
      wx.cloud.getTempFileURL({
        fileList: BATTLE_QUESTIONS.map(question => question.picture),
        success: res => {
          res.fileList.forEach((file, index) => {
            QUESTION_MAP[BATTLE_QUESTIONS[index].id] = {
              ...QUESTION_MAP[BATTLE_QUESTIONS[index].id],
              picture: file.tempFileURL
            }
          })
          resolve()
        },
        fail: () => resolve()
      })
    })
  },

  startPolling() {
    this.loadRoom()
    this.pollTimer = setInterval(() => {
      this.loadRoom()
    }, 800)
  },

  async loadRoom() {
    try {
      const res = await db.collection('rooms').doc(this.data.roomId).get()
      if (res.data) {
        await this.handleRoomUpdate(res.data)
      }
    } catch (err) {
      console.error('加载对战房间失败', err)
    }
  },

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  },

  async handleRoomUpdate(room) {
    room.players = await this.resolvePlayersAvatar(room.players || [])

    const myPlayer = room.players.find(player => player.openid === this.data.myOpenid) || null
    const opponent = room.players.find(player => player.openid !== this.data.myOpenid) || null
    const currentQuestionId = room.questionIds?.[room.currentQuestionIndex]
    const currentQuestion = currentQuestionId ? QUESTION_MAP[currentQuestionId] : null
    const myAnswer = (room.currentAnswers || []).find(answer => answer.openid === this.data.myOpenid)
    const locallySubmitted = this.submittedQuestionIndex === room.currentQuestionIndex

    this.setData({
      room,
      myPlayer,
      opponent,
      currentQuestion,
      currentQuestionNumber: room.currentQuestionIndex + 1,
      hasAnswered: Boolean(myAnswer) || locallySubmitted,
      isSubmitting: this.data.isSubmitting && !myAnswer,
      waitingText: myAnswer || locallySubmitted ? '已提交，等待对手...' : '',
      statusText: room.status === 'finished' ? '对战已结束' : `第 ${room.currentQuestionIndex + 1} / ${room.totalQuestions} 题`
    })

    if (room.status === 'finished') {
      this.stopTimer()
      this.stopPolling()
      wx.redirectTo({
        url: `/game/result/result?mode=battle&roomId=${this.data.roomId}`
      })
      return
    }

    if (currentQuestion && room.currentQuestionIndex !== this.currentQuestionIndex) {
      this.currentQuestionIndex = room.currentQuestionIndex
      this.submittedQuestionIndex = null
      this.timeoutFinalizedQuestionIndex = null
      this.setData({
        optionStatus: new Array(currentQuestion.options.length).fill(''),
        selectedIndex: null,
        hasAnswered: Boolean(myAnswer),
        isSubmitting: false,
        waitingText: myAnswer ? '已提交，等待对手...' : ''
      })
    }

    this.startTimer(room.questionDeadlineAt)
  },

  async resolvePlayersAvatar(players) {
    const normalizedPlayers = players.map(normalizePlayer).filter(Boolean)
    const cloudFileIDs = normalizedPlayers
      .map(player => player.avatarUrl)
      .filter(fileID => isCloudFileID(fileID) && !this.avatarTempUrlCache[fileID])

    if (cloudFileIDs.length) {
      try {
        const res = await wx.cloud.getTempFileURL({
          fileList: cloudFileIDs
        })
        res.fileList.forEach(file => {
          this.avatarTempUrlCache[file.fileID] = file.tempFileURL || ''
        })
      } catch (err) {
        console.log('对战头像临时链接获取失败', err)
      }
    }

    return normalizedPlayers.map(player => ({
      ...player,
      avatarUrl: isCloudFileID(player.avatarUrl)
        ? this.avatarTempUrlCache[player.avatarUrl] || ''
        : player.avatarUrl
    }))
  },

  startTimer(deadlineAt) {
    if (!deadlineAt) {
      return
    }

    this.stopTimer()

    const tick = () => {
      const timeLeft = Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000))
      const timeProgress = Math.max(0, Math.min(100, (timeLeft / QUESTION_DURATION_SECONDS) * 100))

      this.setData({
        timeLeft,
        timeProgress
      })

      if (timeLeft <= 0) {
        this.stopTimer()
        if (this.data.room?.status === 'playing') {
          if (!this.data.hasAnswered && !this.data.isSubmitting) {
            this.submitAnswer(-1, true)
          } else {
            this.finalizeTimeoutQuestion()
          }
        }
      }
    }

    tick()
    this.timer = setInterval(tick, 500)
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  answer(e) {
    if (this.data.hasAnswered || this.data.isSubmitting || !this.data.currentQuestion) {
      return
    }

    const selectedIndex = Number(e.currentTarget.dataset.i)
    const correctIndex = this.data.currentQuestion.answer
    const optionStatus = new Array(this.data.currentQuestion.options.length).fill('')

    optionStatus[correctIndex] = 'correct'
    if (selectedIndex !== correctIndex) {
      optionStatus[selectedIndex] = 'wrong'
    }

    this.setData({
      optionStatus,
      selectedIndex,
      hasAnswered: true,
      isSubmitting: true,
      waitingText: '已提交，等待对手...'
    })

    this.submitAnswer(selectedIndex, false)
  },

  async submitAnswer(selectedIndex, forceTimeout) {
    const room = this.data.room
    if (!room || (!forceTimeout && this.submittedQuestionIndex === room.currentQuestionIndex)) {
      return
    }

    if (!forceTimeout) {
      this.submittedQuestionIndex = room.currentQuestionIndex
    }

    try {
      let res
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          res = await wx.cloud.callFunction({
            name: 'submitBattleAnswer',
            data: {
              roomId: this.data.roomId,
              questionIndex: room.currentQuestionIndex,
              selectedIndex,
              forceTimeout
            }
          })
          break
        } catch (err) {
          if (attempt >= 2) {
            throw err
          }
          console.log('提交答案失败，准备重试:', err)
        }
      }
      console.log('提交答案成功:', res.result)
      this.setData({
        isSubmitting: false,
        hasAnswered: true,
        waitingText: '已提交，等待对手...'
      })
    } catch (err) {
      console.error('提交答案失败', err)

      await this.loadRoom()

      const latestRoom = this.data.room
      const alreadyAnswered = (latestRoom?.currentAnswers || []).some(
        answer => answer.openid === this.data.myOpenid
      )
      const alreadyMoved = latestRoom && latestRoom.currentQuestionIndex !== room.currentQuestionIndex
      const alreadyFinished = latestRoom?.status === 'finished'

      if (alreadyAnswered || alreadyMoved || alreadyFinished || forceTimeout) {
        this.setData({
          isSubmitting: false,
          hasAnswered: true,
          waitingText: alreadyFinished ? '对战已结束' : '已提交，等待对手...'
        })
        return
      }

      this.submittedQuestionIndex = null
      this.setData({
        isSubmitting: false,
        hasAnswered: false,
        waitingText: '网络不稳，请再点一次'
      })
    }
  },

  finalizeTimeoutQuestion() {
    const room = this.data.room
    if (!room || this.timeoutFinalizedQuestionIndex === room.currentQuestionIndex) {
      return
    }

    this.timeoutFinalizedQuestionIndex = room.currentQuestionIndex
    this.submitAnswer(-1, true)
  },

  onUnload() {
    this.stopTimer()
    this.stopPolling()
  }
})
