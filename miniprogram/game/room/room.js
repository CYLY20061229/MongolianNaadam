const app = getApp()
const db = wx.cloud.database()

function normalizeAvatarUrl(value) {
  return typeof value === 'string' ? value : ''
}

function isCloudFileID(value) {
  return typeof value === 'string' && value.indexOf('cloud://') === 0
}

function buildPlayerProfile(openid) {
  const cached = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
  const suffix = openid ? openid.slice(-4) : '0000'

  return {
    nickName: cached.nickName || `玩家${suffix}`,
    avatarUrl: normalizeAvatarUrl(cached.avatar || cached.avatarUrl)
  }
}

function isDefaultProfile(user) {
  if (!user || !user.nickName) {
    return true
  }

  return user.nickName === '玩家' || /^玩家[0-9a-zA-Z]{4}$/.test(user.nickName)
}

function isDefaultNickName(nickName) {
  return nickName === '玩家' || /^玩家[0-9a-zA-Z]{4}$/.test(nickName || '')
}

Page({
  data: {
    roomId: '',
    room: null,
    myOpenid: '',
    isHost: false,
    myReady: false,
    canInvite: false,
    canStart: false,
    waitingStartText: '',
    loadingText: '正在进入房间...',
    errorText: ''
  },

  avatarTempUrlCache: {},

  async onLoad(options) {
    const roomId = options.roomId || ''
    this.setData({
      roomId,
      loadingText: roomId ? '正在加入好友房间...' : '正在创建房间...',
      errorText: ''
    })

    const cachedUser = wx.getStorageSync('userInfo') || app.globalData.userInfo
    if (isDefaultProfile(cachedUser) || !(cachedUser.avatar || cachedUser.avatarUrl)) {
      const target = roomId
        ? `/game/room/room?roomId=${roomId}`
        : '/game/room/room'
      const redirect = encodeURIComponent(target)
      wx.redirectTo({
        url: `/game/result/result?mode=profile&redirect=${redirect}`
      })
      return
    }

    try {
      const loginRes = await wx.cloud.callFunction({ name: 'login' })
      const myOpenid = loginRes.result.openid
      app.globalData.openid = myOpenid

      const profile = buildPlayerProfile(myOpenid)

      this.setData({ myOpenid })

      if (roomId) {
        console.log('加入房间，提交资料:', profile)
        await wx.cloud.callFunction({
          name: 'joinRoom',
          data: {
            roomId,
            nickName: profile.nickName,
            avatarUrl: profile.avatarUrl
          }
        })
      } else {
        console.log('创建房间，提交资料:', profile)
        const res = await wx.cloud.callFunction({
          name: 'createRoom',
          data: {
            nickName: profile.nickName,
            avatarUrl: profile.avatarUrl
          }
        })

        this.setData({ roomId: res.result.roomId })
      }

      await this.syncMyProfileToRoom()
      this.startPolling()
    } catch (err) {
      console.error('进入房间失败', err)
      this.setData({
        loadingText: '',
        errorText: err.errMsg || err.message || '进入房间失败，请重新打开邀请链接'
      })
    }
  },

  startPolling() {
    this.loadRoom()
    this.pollTimer = setInterval(() => {
      this.loadRoom()
    }, 1000)
  },

  async loadRoom() {
    try {
      const res = await db.collection('rooms').doc(this.data.roomId).get()
      const room = res.data

      if (!room) {
        return
      }

      room.players = await this.resolvePlayersAvatar(room.players || [])

      const me = room.players.find(player => player.openid === this.data.myOpenid)
      const isHost = room.hostOpenid === this.data.myOpenid
      const playerCount = room.players.length
      const allReady = playerCount === 2 && room.players.every(player => player.ready)
      const canInvite = isHost && playerCount < 2
      const canStart = isHost && allReady
      const waitingStartText = isHost && playerCount === 2 && !allReady
        ? '等待对方准备'
        : ''

      this.setData({
        room,
        isHost,
        myReady: Boolean(me?.ready),
        canInvite,
        canStart,
        waitingStartText,
        loadingText: '',
        errorText: ''
      })

      if (me && isDefaultNickName(me.nickName)) {
        this.syncMyProfileToRoom()
      }

      if (room.status === 'playing') {
        this.stopPolling()
        wx.redirectTo({
          url: `/game/battle/battle?roomId=${this.data.roomId}`
        })
      }
    } catch (err) {
      console.error('加载房间失败', err)
    }
  },

  async resolvePlayersAvatar(players) {
    const normalizedPlayers = players.map(player => ({
      ...player,
      avatarUrl: normalizeAvatarUrl(player.avatarUrl),
      nickName: typeof player.nickName === 'string' ? player.nickName : '玩家'
    }))

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
        console.log('房间头像临时链接获取失败', err)
      }
    }

    return normalizedPlayers.map(player => ({
      ...player,
      avatarUrl: isCloudFileID(player.avatarUrl)
        ? this.avatarTempUrlCache[player.avatarUrl] || ''
        : player.avatarUrl
    }))
  },

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  },

  async ready() {
    const profile = buildPlayerProfile(this.data.myOpenid)

    await wx.cloud.callFunction({
      name: 'updateReady',
      data: {
        roomId: this.data.roomId,
        nickName: profile.nickName,
        avatarUrl: profile.avatarUrl
      }
    })
  },

  async syncMyProfileToRoom() {
    if (!this.data.roomId || !this.data.myOpenid) {
      return
    }

    const profile = buildPlayerProfile(this.data.myOpenid)
    console.log('同步玩家资料到房间:', {
      roomId: this.data.roomId,
      openid: this.data.myOpenid,
      profile
    })

    try {
      await wx.cloud.callFunction({
        name: 'updatePlayerProfile',
        data: {
          roomId: this.data.roomId,
          nickName: profile.nickName,
          avatarUrl: profile.avatarUrl
        }
      })
      return
    } catch (err) {
      console.log('云函数同步资料失败，尝试客户端同步:', err)
    }

    try {
      const res = await db.collection('rooms').doc(this.data.roomId).get()
      const room = res.data
      const nextPlayers = (room.players || []).map(player => {
        if (player.openid !== this.data.myOpenid) {
          return player
        }

        return {
          ...player,
          nickName: profile.nickName,
          avatarUrl: profile.avatarUrl
        }
      })

      await db.collection('rooms').doc(this.data.roomId).update({
        data: {
          players: nextPlayers
        }
      })
    } catch (err) {
      console.log('客户端同步资料失败:', err)
    }
  },

  retryEnterRoom() {
    this.onLoad({
      roomId: this.data.roomId
    })
  },

  async startGame() {
    try {
      await wx.cloud.callFunction({
        name: 'startGame',
        data: { roomId: this.data.roomId }
      })
    } catch (err) {
      wx.showToast({
        title: err.errMsg || '开始失败',
        icon: 'none'
      })
    }
  },

  copyRoomId() {
    wx.setClipboardData({
      data: this.data.roomId
    })
  },

  onUnload() {
    this.stopPolling()
  },

  onShareAppMessage() {
    if (!this.data.roomId) {
      wx.showToast({
        title: '房间还没准备好',
        icon: 'none'
      })
    }

    return {
      title: '来和我一起双人对战答题吧',
      path: `/game/room/room?roomId=${this.data.roomId}`
    }
  }
})
