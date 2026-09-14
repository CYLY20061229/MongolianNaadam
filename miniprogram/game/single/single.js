const app = getApp()
const QUESTION_DURATION_SECONDS = 20
const questions = [
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/1.png',
    options: ['A', 'B', 'C','D'],
    answer: 2
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/2.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/3.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/4.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/5.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/6.png',
    options: ['A', 'B', 'C','D'],
    answer: 0},
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/7.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/8.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/9.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/10.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/11.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/12.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/13.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/14.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/15.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/16.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/17.png',
    options: ['A', 'B', 'C','D'],
    answer: 3
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/18.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/19.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/20.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/21.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/22.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/23.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/24.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/25.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/26.png',
    options: ['A', 'B', 'C','D'],
    answer: 2
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/27.png',
    options: ['A', 'B', 'C','D'],
    answer: 3
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/28.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/29.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/30.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/31.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/32.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/33.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/34.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/35.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/36.png',
    options: ['A', 'B', 'C','D'],
    answer: 2
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/37.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/38.png',
    options: ['A', 'B', 'C','D'],
    answer: 2
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/39.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/40.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/41.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/42.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/43.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/44.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/45.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/46.png',
    options: ['A', 'B', 'C','D'],
    answer: 3
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/47.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/48.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/49.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/50.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/51.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/52.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/53.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/54.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/55.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/56.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/57.png',
    options: ['A', 'B', 'C','D'],
    answer: 2
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/58.png',
    options: ['A', 'B', 'C','D'],
    answer: 3
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/59.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/60.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/61.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/62.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/63.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/64.png',
    options: ['A', 'B', 'C','D'],
    answer: 2
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/65.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/66.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/67.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/68.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/69.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/70.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/71.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/72.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/73.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/74.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/75.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/76.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/77.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/78.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/79.png',
    options: ['A', 'B', 'C','D'],
    answer: 1
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/80.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/81.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/82.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/83.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/84.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/85.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  },
  {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/86.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/87.png',

    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/88.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/89.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/90.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }, {
    picture: 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/91.png',
    options: ['A', 'B', 'C','D'],
    answer: 0
  }
]

Page({
  data: {
    gameState: 'ready',
    index: 0,
    questionNumber: 0,
    time: QUESTION_DURATION_SECONDS,
    timeState: 'normal',
    timerPrompt: '稳定发挥',
    score: 0,
    avatar: '',
    nickName:'',
    question: {},
    optionStatus: [], // 👈 每个选项的状态
    showResult: false,
    hasUserInfo: false,
    lock: false,
    wrongCount: 0,      // 👈 答错次数
    reviveCount: 3, 
    bestScore: 0,
    comboCount: 0,
    comboVisible: false,
    comboText: '',
    comboDisplay: '--'
  },

  clearGameLoop() {
    clearInterval(this.timer)
    this.timer = null

    if (this.answerTimeout) {
      clearTimeout(this.answerTimeout)
      this.answerTimeout = null
    }
  },

  clearComboFeedback() {
    if (this.comboTimeout) {
      clearTimeout(this.comboTimeout)
      this.comboTimeout = null
    }

    if (this.data.comboVisible || this.data.comboText) {
      this.setData({
        comboVisible: false,
        comboText: ''
      })
    }
  },

  stopAudio() {
    if (app.globalData.bgm) {
      app.globalData.bgm.pause()
    }

    if (this.rightAudio) {
      this.rightAudio.stop()
    }

    if (this.wrongAudio) {
      this.wrongAudio.stop()
    }
  },

  destroyAudio() {
    if (this.rightAudio) {
      this.rightAudio.destroy()
      this.rightAudio = null
    }

    if (this.wrongAudio) {
      this.wrongAudio.destroy()
      this.wrongAudio = null
    }
  },

  onLoad() {

    if (app.globalData.bgm) {
      app.globalData.bgm.play()
    }
    const user = wx.getStorageSync('userInfo')

    if (user) {
      this.setUser(user)
      app.globalData.userInfo = user
      
    } else {
      // this.setData({
      //   gameState: 'auth'
      // })
      // // 延迟一点再弹授权
      // setTimeout(() => {
      //   this.getUserInfo()
      // }, 500)
      
    }
    this.setData({
      gameState: 'playing'
    })

    this.resetGame()
    this.initAudio()

    
  },
  initAudio() {

    this.rightAudio = wx.createInnerAudioContext()
    this.wrongAudio = wx.createInnerAudioContext()
  
    this.rightAudio.volume = 1
    this.wrongAudio.volume = 1
  
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/audio/right.mp3'
      ],
      success: res => {
        this.rightAudio.src = res.fileList[0].tempFileURL
      }
    })
  
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/audio/wrong.mp3'
      ],
      success: res => {
        this.wrongAudio.src = res.fileList[0].tempFileURL
      }
    })
  },

getRandomQuestion() {
  const i = Math.floor(Math.random() * questions.length)
  return questions[i]
},
getTimerPrompt(timeState) {
  if (timeState === 'critical') {
    return '最后冲刺'
  }

  if (timeState === 'warning') {
    return '加快速度'
  }

  return '稳定发挥'
},
getTimeState(time) {
  if (time <= 5) {
    return 'critical'
  }

  if (time <= 10) {
    return 'warning'
  }

  return 'normal'
},
loadQuestion() {
  const i = Math.floor(Math.random() * questions.length)
  const q = questions[i]

  wx.cloud.getTempFileURL({
    fileList: [q.picture],
    success: res => {

      const newQuestion = Object.assign({}, q, {
        picture: res.fileList[0].tempFileURL
      })

      // console.log('图片地址：', newQuestion.picture)

      this.setData({
        question: newQuestion,
        optionStatus: new Array(q.options.length).fill(''),
        showResult: false,
        lock: false,
        time: QUESTION_DURATION_SECONDS,
        timeState: this.getTimeState(QUESTION_DURATION_SECONDS),
        timerPrompt: this.getTimerPrompt(this.getTimeState(QUESTION_DURATION_SECONDS)),
        questionNumber: this.data.questionNumber + 1
      })
    },
    fail: err => {
      console.log('获取图片失败：', err)
    }
  })
  },
  
  startTimer() {
    this.clearGameLoop()
    this.timer = setInterval(() => {
      if (this.data.time <= 0) {
        this.clearGameLoop()
        this.revealAnswer()
        return
      }
      const nextTime = this.data.time - 1
      const timeState = this.getTimeState(nextTime)

      this.setData({
        time: nextTime,
        timeState,
        timerPrompt: this.getTimerPrompt(timeState)
      })
    }, 1000)
  },setUser(user) {
    this.setData({
      hasUserInfo: true,
    avatar: user.avatar,
    nickName: user.nickName
    })
  },

  // getUserInfo() {

  //   const app = getApp()
  
  //   wx.getUserProfile({
  //     desc: '用于排行榜展示',
  //     success: res => {
  
  //       const user = {
  //         avatar: res.userInfo.avatarUrl,
  //         nickName: res.userInfo.nickName
  //       }
  
  //       wx.setStorageSync('userInfo', user)
  //       app.globalData.userInfo = user
  //       this.setUser(user)
  
  //       this.setData({
  //         gameState: 'playing'
  //       })
  
  //       this.resetGame()
  //     }
  //   })
  // },
  answer(e) {
    if (this.data.lock) return
  
    const selected = e.currentTarget.dataset.i
    const correct = this.data.question.answer
    const status = this.data.optionStatus.slice()
  
    status[correct] = 'correct'
  
    let wrongCount = this.data.wrongCount
    let score = this.data.score
    let comboCount = this.data.comboCount
  
    if (selected !== correct) {
      status[selected] = 'wrong'
      wrongCount += 1
      comboCount = 0
      // if(wrongCount<=this.data.reviveCount){
      //   this.enterReviveState()}
      if (this.wrongAudio?.src) {
        this.wrongAudio.stop()
        this.wrongAudio.play()
      }
    
    } else {
      score += 10
      comboCount += 1
      if (this.rightAudio?.src) {
        this.rightAudio.stop()
        this.rightAudio.play()
      }
    }
  
    this.setData({
      optionStatus: status,
      lock: true,
      wrongCount,
      score,
      comboCount,
      comboVisible: false,
      comboText: '',
      comboDisplay: comboCount > 1 ? `${comboCount}连击` : '--'
    })

    if (selected === correct) {
      this.showComboFeedback(comboCount)
    }
  
    this.clearGameLoop()
  
    // setTimeout(() => {

    //   if (wrongCount > this.data.reviveCount) {
    //     this.endGame()
    //   } else {
    //     this.next()
    //   }
    // }, 1000)
    this.answerTimeout = setTimeout(() => {
      if (wrongCount > this.data.reviveCount) {
        this.endGame()
      } else if (selected !== correct) {
        this.enterReviveState()
      } else {
        this.next()
      }
    }, 1000)
  }
,  
resetGame() {
  this.clearGameLoop()

  this.setData({
    index: 0,
    questionNumber: 0,
    time: QUESTION_DURATION_SECONDS,
    timeState: this.getTimeState(QUESTION_DURATION_SECONDS),
    timerPrompt: this.getTimerPrompt(this.getTimeState(QUESTION_DURATION_SECONDS)),
    score: 0,
    wrongCount: 0,
    comboCount: 0,
    comboVisible: false,
    comboText: '',
    comboDisplay: '--',
    lock: false,
    paused: false,
    gameState: 'playing',
    optionStatus: []
  })

  this.clearComboFeedback()
  this.loadQuestion()
  this.startTimer()
}
,
revealAnswer() {
  console.log("调用显示正确函数")
  const status = [...this.data.optionStatus]
  status[this.data.question.answer] = 'correct'

  const wrongCount = this.data.wrongCount+1
  console.log(wrongCount,"错误次数")
  
  if (this.wrongAudio?.src) {
    this.wrongAudio.stop()
    this.wrongAudio.play()
  }
  this.setData({
    optionStatus: status,
    lock: true,
    wrongCount,
    comboCount: 0,
    comboVisible: false,
    comboText: '',
    comboDisplay: '--'
  })
  this.answerTimeout = setTimeout(() => {
    if (wrongCount > this.data.reviveCount) {
      console.log("调用结束函数")
      this.endGame()
    } else {
      this.enterReviveState()
      this.next()
    }
  }, 1000)
}
,
  startGame() {
    if (!this.data.hasUserInfo) {
      this.setData({ showAuth: true })
      return
    }
    this.enterGame()
  }
,  
  // 游戏结束时调用
  gameOver() {
    console.log('score submission will be handled on result page')
  }
  
,

next() {
  this.loadQuestion()
  this.startTimer()
}
,
getComboText(comboCount) {
  if (comboCount >= 8) {
    return `${comboCount}连击 火力全开`
  }

  if (comboCount >= 5) {
    return `${comboCount}连击 势不可挡`
  }

  if (comboCount >= 3) {
    return `${comboCount}连击 真厉害`
  }

  return `${comboCount}连击`
},

showComboFeedback(comboCount) {
  if (comboCount < 2) {
    return
  }

  if (this.comboTimeout) {
    clearTimeout(this.comboTimeout)
    this.comboTimeout = null
  }

  this.setData({
    comboVisible: true,
    comboText: this.getComboText(comboCount),
    comboDisplay: `${comboCount}连击`
  })

  this.comboTimeout = setTimeout(() => {
    this.setData({
      comboVisible: false
    })
    this.comboTimeout = null
  }, 900)
},

endGame() {
  this.clearGameLoop()
  this.clearComboFeedback()
  this.setData({
    gameState: 'ended',
    comboVisible: false
  })
  const user = app.globalData.userInfo
  if (!user) {
    wx.redirectTo({
      url: `/game/result/result?score=${this.data.score}`
    })
    return
  }
  const bestScore = Math.max(
    user.bestScore || 0,
    this.data.score
  )

  // 更新全局最高分
  app.globalData.userInfo.bestScore = bestScore

  // 提交云数据
  this.gameOver()

  // 👉 跳转结算页
  wx.redirectTo({
    url: `/game/result/result?score=${this.data.score}&best=${bestScore}`
  })
},
askRevive() {
  this.clearGameLoop()   // ✅ 停止倒计时
  if (this.data.wrongCount> this.data.reviveCount) {
    console.log("在askRevive中调用endgame1")
    this.endGame()
    return
  }
  this.setData({
    lock: true   // ✅ 锁住操作
  })

  wx.showModal({
    title: '答错了',
    content: '分享即可复活继续挑战',
    confirmText: '去分享',
    success: res => {
      if (res.confirm) {
        this.setData({
          showShare: true   // 控制显示分享按钮
        })
      } else {
        console.log("在askRevive中调用endgame2")
        this.endGame()
      }
    }
  })
}
,onShareAppMessage() {

  if (this.data.gameState !== 'reviving') {
    return {
      title: '来挑战高分吧',
      path: '/game/single/single'
    }
  }

  this.setData({
    gameState: 'playing',
    time: QUESTION_DURATION_SECONDS,
    timeState: this.getTimeState(QUESTION_DURATION_SECONDS),
    timerPrompt: this.getTimerPrompt(this.getTimeState(QUESTION_DURATION_SECONDS))
  })

  this.loadQuestion()
  this.startTimer()

  return {
    title: '我正在挑战高分，来试试？',
    path: '/game/single/single'
  }
},
enterReviveState() {
  this.clearGameLoop()
console.log("此时的错误数量",this.data.wrongCount)
  if (this.data.wrongCount >this.data.reviveCount) {
    console.log("在enterRevive中调用endgame")
    this.endGame()
    return
  }

  this.setData({
    gameState: 'reviving'
  })
},
onHide() {
  if (this.data.gameState === 'playing') {
    this.clearGameLoop()
    this.setData({
      paused: true
    })
  }
  this.clearComboFeedback()
  this.stopAudio()
},
onShow() {
  if (this.data.gameState === 'playing' && this.data.paused) {
    this.startTimer()
    this.setData({
      paused: false
    })
  }
},
onUnload() {
  this.clearGameLoop()
  this.clearComboFeedback()
  this.stopAudio()
  this.destroyAudio()
}
})
