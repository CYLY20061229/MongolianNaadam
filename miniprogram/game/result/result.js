const app = getApp()
const db = wx.cloud.database()
const PENDING_SCORE_SYNC_KEY = 'pendingScoreSync'

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

function isDefaultNickName(nickName) {
  return nickName === '玩家' || /^玩家[0-9a-zA-Z]{4}$/.test(nickName || '')
}

Page({
  data: {
    mode: 'single',
    score: 0,
    best: 0,
    avatar: '',
    nickName: '',
    imgScore: '',
    imgBest: '',
    imgBack: '',
    showLoginModal: false,
    battleSummary: null,
    battleResultLoading: false,
    battleResultError: '',
    displayAvatar: '',
    profileError: '',
    savingProfile: false,
    scoreSyncing: false,
    scoreSyncError: '',
    posterGenerating: false,
    posterTempFilePath: '',
    posterError: ''
  },

  async onLoad(options) {
    const mode = options.mode || 'single'
    this.redirectTarget = decodeURIComponent(options.redirect || '')

    this.setData({ mode })
    this.loadImages()

    if (mode === 'profile') {
      this.setData({
        showLoginModal: true
      })
      this.loadUserDraft()
      return
    }

    if (mode === 'battle') {
      await this.loadBattleResult(options.roomId)
      return
    }

    const score = Number(options.score) || 0
    this.setData({ score })
    await this.trySyncPendingScore()
    await this.loadUser()
    await this.loadBestScore(score)
  },

  loadUserDraft() {
    const user = wx.getStorageSync('userInfo') || {}
    this.setData({
      avatar: normalizeAvatarUrl(user.avatar || user.avatarUrl),
      nickName: isDefaultNickName(user.nickName) ? '' : user.nickName || ''
    })
    this.syncDisplayAvatar()
  },

  loadImages() {
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/score.PNG',
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/bestscore.PNG',
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/back.png'
      ],
      success: res => {
        this.setData({
          imgScore: res.fileList[0].tempFileURL,
          imgBest: res.fileList[1].tempFileURL,
          imgBack: res.fileList[2].tempFileURL
        })
      }
    })
  },

  async loadUser() {
    const user = wx.getStorageSync('userInfo')

    if (!user || !user.nickName) {
      this.setData({
        showLoginModal: true
      })
      return
    }

    this.setData({
      avatar: normalizeAvatarUrl(user.avatar || user.avatarUrl),
      nickName: user.nickName
    })
    this.syncDisplayAvatar()

    await this.submitScore()
  },

  async loadBattleResult(roomId) {
    if (!roomId) {
      this.setData({
        battleResultError: '没有找到对战房间'
      })
      return
    }

    this.setData({
      battleResultLoading: true,
      battleResultError: ''
    })

    let openid = app.globalData.openid

    if (!openid) {
      const res = await wx.cloud.callFunction({ name: 'login' })
      openid = res.result.openid
      app.globalData.openid = openid
    }

    try {
      const roomRes = await db.collection('rooms').doc(roomId).get()
      const room = roomRes.data
      const players = room.players || []
      const sortedPlayers = [...players].sort((a, b) => {
        if ((b.totalScore || 0) !== (a.totalScore || 0)) {
          return (b.totalScore || 0) - (a.totalScore || 0)
        }

        return (b.correctCount || 0) - (a.correctCount || 0)
      })
      const fallbackWinnerOpenid = sortedPlayers[0]?.openid || ''
      const fallbackTie = sortedPlayers.length === 2 &&
        (sortedPlayers[0].totalScore || 0) === (sortedPlayers[1].totalScore || 0)
      const winnerOpenid = room.battleWinnerOpenid || room.result?.winnerOpenid || (fallbackTie ? '' : fallbackWinnerOpenid)
      const isTie = Boolean(room.battleIsTie || room.result?.isTie || fallbackTie)
      const me = await this.resolvePlayerAvatar(
        normalizePlayer(players.find(player => player.openid === openid) || null)
      )
      const opponent = await this.resolvePlayerAvatar(
        normalizePlayer(players.find(player => player.openid !== openid) || null)
      )
      const winner = await this.resolvePlayerAvatar(
        normalizePlayer(players.find(player => player.openid === winnerOpenid) || null)
      )
      const isWinner = Boolean(me && winnerOpenid === me.openid)

      this.setData({
        battleResultLoading: false,
        battleSummary: {
          title: isTie ? '平局' : isWinner ? '你赢了' : '再来一局',
          subtitle: isTie ? '双方总分相同，难分高下' : isWinner ? '你答得更快，拿下这场对战' : '这次对手更快，下次继续冲',
          winnerTitle: isTie ? '本局平局' : '胜利者',
          winner,
          isTie,
          me,
          opponent
        }
      })
    } catch (err) {
      console.log('加载对战结算失败', err)
      this.setData({
        battleResultLoading: false,
        battleResultError: '结算加载失败，请返回首页'
      })
    }
  },

  onInputName(e) {
    this.setData({
      nickName: e.detail.value
    })
  },

  onChooseAvatar(e) {
    this.setData({
      avatar: normalizeAvatarUrl(e.detail.avatarUrl)
    })
    this.syncDisplayAvatar()
  },

  async syncDisplayAvatar() {
    const displayAvatar = await this.resolveAvatarForDisplay(this.data.avatar)
    this.setData({
      displayAvatar: displayAvatar || ''
    })
  },

  async resolveAvatarForDisplay(avatar) {
    const value = normalizeAvatarUrl(avatar)

    if (!isCloudFileID(value)) {
      return value
    }

    try {
      const res = await wx.cloud.getTempFileURL({
        fileList: [value]
      })
      return res.fileList?.[0]?.tempFileURL || ''
    } catch (err) {
      console.log('头像临时链接获取失败', err)
      return ''
    }
  },

  async resolvePlayerAvatar(player) {
    if (!player) {
      return null
    }

    return {
      ...player,
      avatarUrl: await this.resolveAvatarForDisplay(player.avatarUrl)
    }
  },

  async getOpenid() {
    if (app.globalData.openid) {
      return app.globalData.openid
    }

    const res = await wx.cloud.callFunction({ name: 'login' })
    const openid = res.result?.openid || ''
    app.globalData.openid = openid
    return openid
  },

  buildScorePayload(scoreOverride) {
    return {
      score: typeof scoreOverride === 'number' ? scoreOverride : this.data.score,
      avatarUrl: normalizeAvatarUrl(this.data.avatar),
      nickName: this.data.nickName
    }
  },

  savePendingScoreSync(payload) {
    wx.setStorageSync(PENDING_SCORE_SYNC_KEY, {
      ...payload,
      updatedAt: Date.now()
    })
  },

  clearPendingScoreSync(expectedScore) {
    const pending = wx.getStorageSync(PENDING_SCORE_SYNC_KEY)
    if (!pending) {
      return
    }

    if (typeof expectedScore !== 'number' || Number(pending.score) <= expectedScore) {
      wx.removeStorageSync(PENDING_SCORE_SYNC_KEY)
    }
  },

  async trySyncPendingScore() {
    const pending = wx.getStorageSync(PENDING_SCORE_SYNC_KEY)
    if (!pending || !pending.nickName) {
      return
    }

    try {
      await this.callSubmitScore({
        score: Number(pending.score) || 0,
        avatarUrl: normalizeAvatarUrl(pending.avatarUrl),
        nickName: pending.nickName
      })
      this.clearPendingScoreSync(Number(pending.score) || 0)
    } catch (err) {
      console.log('补传历史分数失败', err)
    }
  },

  async uploadAvatarIfNeeded(openid) {
    const avatar = normalizeAvatarUrl(this.data.avatar)

    if (!avatar || isCloudFileID(avatar) || avatar.indexOf('http') === 0) {
      return avatar
    }

    const res = await wx.cloud.uploadFile({
      cloudPath: `avatars/${openid || 'guest'}_${Date.now()}.png`,
      filePath: avatar
    })

    return res.fileID
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const avatar = normalizeAvatarUrl(res.tempFiles?.[0]?.tempFilePath)
        this.setData({ avatar })
        this.syncDisplayAvatar()
      },
      fail: err => {
        console.log('选择头像失败', err)
      }
    })
  },

  async confirmLogin() {
    if (!this.data.nickName) {
      this.setData({
        profileError: '请输入昵称'
      })
      return
    }

    if (!this.data.avatar) {
      this.setData({
        profileError: '请选择头像'
      })
      return
    }

    try {
      this.setData({
        savingProfile: true,
        profileError: ''
      })

      const openid = await this.getOpenid()
      const avatar = await this.uploadAvatarIfNeeded(openid)

      const user = {
        openid,
        nickName: this.data.nickName,
        avatar
      }

      wx.setStorageSync('userInfo', user)
      app.globalData.userInfo = user

      this.setData({
        avatar,
        savingProfile: false,
        showLoginModal: false
      })
      await this.syncDisplayAvatar()
      await this.syncProfileToCloud()

      if (this.data.mode === 'profile' && this.redirectTarget) {
        wx.redirectTo({
          url: this.redirectTarget
        })
        return
      }

      await this.submitScore()
    } catch (err) {
      console.log('保存用户资料失败', err)
      this.setData({
        savingProfile: false,
        profileError: '头像保存失败，请重试'
      })
    }
  },

  cancelLogin() {
    if (this.data.mode === 'profile') {
      wx.navigateBack({
        delta: 1
      })
      return
    }

    this.setData({
      showLoginModal: false
    })
  },

  async callSubmitScore(payload) {
    let lastError = null

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const res = await wx.cloud.callFunction({
          name: 'submitScore',
          data: payload
        })

        if (res.result?.errCode || res.result?.code === -1) {
          throw new Error(res.result.errMsg || '分数上传失败')
        }

        return res.result || {}
      } catch (err) {
        lastError = err
        if (attempt >= 2) {
          break
        }
      }
    }

    throw lastError || new Error('分数上传失败')
  },

  async submitScore() {
    if (!this.data.nickName) {
      return
    }

    if (this.scoreSubmittedFor === this.data.score) {
      return
    }

    try {
      this.setData({
        scoreSyncing: true,
        scoreSyncError: ''
      })

      await this.callSubmitScore({
        score: this.data.score,
        avatarUrl: normalizeAvatarUrl(this.data.avatar),
        nickName: this.data.nickName
      })

      this.scoreSubmittedFor = this.data.score
      this.clearPendingScoreSync(this.data.score)
      await this.loadBestScore(this.data.score)
    } catch (err) {
      console.log('提交分数失败', err)
      this.savePendingScoreSync(this.buildScorePayload())
      this.setData({
        scoreSyncError: '分数同步失败，请返回后重试'
      })
    } finally {
      this.setData({
        scoreSyncing: false
      })
    }
  },

  async syncProfileToCloud() {
    const openid = await this.getOpenid()
    let score = Number(this.data.score) || 0

    try {
      const res = await db.collection('users').where({ openid }).get()
      if (res.data.length) {
        score = Math.max(score, Number(res.data[0].bestScore) || 0)
      }
    } catch (err) {
      console.log('同步资料前查询用户失败', err)
    }

    try {
      await this.callSubmitScore(this.buildScorePayload(score))
      this.clearPendingScoreSync(score)
    } catch (err) {
      console.log('同步资料到云端失败', err)
      this.savePendingScoreSync(this.buildScorePayload(score))
    }
  },

  async loadBestScore(currentScore) {
    const openid = app.globalData.openid

    if (!openid) {
      return
    }

    try {
      const res = await db.collection('users').where({ openid }).get()
      if (!res.data.length) {
        return
      }

      const bestScore = res.data[0].bestScore || 0
      this.setData({
        best: Math.max(bestScore, currentScore)
      })
    } catch (err) {
      console.log('查询最高分失败', err)
    }
  },

  restart() {
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },

  getPosterTitle() {
    if (this.data.score >= 200) {
      return '头脑风暴王者'
    }

    if (this.data.score >= 100) {
      return '答题高手'
    }

    return '继续冲击更高分'
  },

  getPosterSubtitle() {
    return `${this.data.nickName || '我'}在头脑那达慕拿下了 ${this.data.score} 分`
  },

  getImageInfo(src) {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(null)
        return
      }

      wx.getImageInfo({
        src,
        success: resolve,
        fail: reject
      })
    })
  },

  drawRoundedRect(ctx, x, y, width, height, radius, fillColor) {
    const r = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + width - r, y)
    ctx.arcTo(x + width, y, x + width, y + r, r)
    ctx.lineTo(x + width, y + height - r)
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
    ctx.lineTo(x + r, y + height)
    ctx.arcTo(x, y + height, x, y + height - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
    if (fillColor) {
      ctx.setFillStyle(fillColor)
      ctx.fill()
    }
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = String(text || '').split('')
    let line = ''
    let lines = 0

    chars.forEach((char, index) => {
      const testLine = line + char
      const metrics = ctx.measureText(testLine)
      const isLastChar = index === chars.length - 1

      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, y + lines * lineHeight)
        line = char
        lines += 1
        return
      }

      line = testLine

      if (isLastChar && lines < maxLines) {
        ctx.fillText(line, x, y + lines * lineHeight)
      }
    })
  },

  async generatePoster() {
    if (this.data.posterGenerating) {
      return this.posterGeneratingPromise || ''
    }

    this.posterGeneratingPromise = new Promise(async (resolve, reject) => {
      try {
      this.setData({
        posterGenerating: true,
        posterError: ''
      })

      const avatarInfo = await this.getImageInfo(this.data.displayAvatar)
      const scoreIconInfo = await this.getImageInfo(this.data.imgScore)
      const bestIconInfo = await this.getImageInfo(this.data.imgBest)

      const ctx = wx.createCanvasContext('scorePoster', this)
      const width = 750
      const height = 1334

      ctx.setFillStyle('#f5f1ea')
      ctx.fillRect(0, 0, width, height)

      ctx.setTextAlign('center')

      ctx.setFillStyle('#7c1619')
      ctx.setFontSize(42)
      ctx.fillText('本局战绩', width / 2, 132)

      if (avatarInfo?.path) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(width / 2, 268, 76, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(avatarInfo.path, width / 2 - 76, 192, 152, 152)
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.setFillStyle('rgba(124, 22, 25, 0.12)')
        ctx.arc(width / 2, 268, 76, 0, Math.PI * 2)
        ctx.fill()
        ctx.setFillStyle('#7c1619')
        ctx.setFontSize(44)
        ctx.fillText((this.data.nickName || '我').slice(0, 1), width / 2, 282)
      }

      ctx.setFillStyle('#2f2a28')
      ctx.setFontSize(36)
      ctx.fillText(this.data.nickName || '玩家', width / 2, 398)

      const cardTop = 540
      const cardWidth = 220
      const cardHeight = 240
      const leftCardX = 124
      const rightCardX = 406
      // this.drawRoundedRect(ctx, leftCardX, cardTop, cardWidth, cardHeight, 24, '#faf8f4')
      // this.drawRoundedRect(ctx, rightCardX, cardTop, cardWidth, cardHeight, 24, '#faf8f4')

      if (scoreIconInfo?.path) {
        ctx.drawImage(scoreIconInfo.path, 184, 480, 94, 230)
      }
      if (bestIconInfo?.path) {
        ctx.drawImage(bestIconInfo.path, 464, 450, 100, 280)
      }

      ctx.setFillStyle('#7c1619')
      ctx.setFontSize(40)
      ctx.fillText(String(this.data.score), 234, 788)
      ctx.fillText(String(this.data.best), 516, 788)

      ctx.setFillStyle('#7d6a64')
      ctx.setFontSize(28)
      // ctx.fillText('本局得分', 234, 786)
      // ctx.fillText('历史最高', 516, 786)

      ctx.setFillStyle('#f1ebe1')
      ctx.fillRect(122, 900, 506, 2)

      ctx.setFillStyle('#7c1619')
      ctx.setFontSize(28)
      ctx.fillText('晒出你的战绩，邀请朋友一起挑战', width / 2, 970)

      ctx.setFillStyle('#8c5c22')
      ctx.setFontSize(24)
      this.wrapText(ctx, '在小程序里继续冲击更高分，看看谁才是真正的头脑王者。', width / 2, 1034, 470, 34, 2)

      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'scorePoster',
          x: 0,
          y: 0,
          width,
          height,
          destWidth: width,
          destHeight: height,
          success: res => {
            this.setData({
              posterGenerating: false,
              posterTempFilePath: res.tempFilePath
            })
            wx.previewImage({
              urls: [res.tempFilePath],
              current: res.tempFilePath
            })
            this.posterGeneratingPromise = null
            resolve(res.tempFilePath)
          },
          fail: err => {
            console.log('生成海报失败', err)
            this.setData({
              posterGenerating: false,
              posterError: '海报生成失败，请重试'
            })
            this.posterGeneratingPromise = null
            reject(err)
          }
        }, this)
      })
      } catch (err) {
        console.log('准备海报资源失败', err)
        this.setData({
          posterGenerating: false,
          posterError: '海报资源加载失败，请重试'
        })
        this.posterGeneratingPromise = null
        reject(err)
      }
    })

    return this.posterGeneratingPromise
  },

  async savePoster() {
    let posterPath = this.data.posterTempFilePath

    if (!posterPath) {
      posterPath = await this.generatePoster()
    }

    try {
      await wx.saveImageToPhotosAlbum({
        filePath: posterPath
      })
    } catch (err) {
      console.log('保存海报失败', err)
      this.setData({
        posterError: '保存失败，请检查相册权限'
      })
    }
  },

  async sharePoster() {
    let posterPath = this.data.posterTempFilePath

    if (!posterPath) {
      posterPath = await this.generatePoster()
    }

    wx.previewImage({
      urls: [posterPath],
      current: posterPath
    })
  }
})
