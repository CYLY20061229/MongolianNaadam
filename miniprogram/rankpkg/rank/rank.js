// const db = wx.cloud.database()
// const app = getApp()

// Page({
//   data: {
//     list: [],        // Top100
//     me: null,        // 我的数据（固定显示）
//     myRank: null,    // 我的名次
//     myOpenid: ''
//   },

//   async onLoad() {
//     const openid = app.globalData.userInfo.openid
//     this.setData({ myOpenid: openid })

//     await this.loadMyRank()
//     await this.loadTop100()
//   },

//   // ① 计算我的真实排名
//   async loadMyRank() {
//     const myOpenid = this.data.myOpenid

//     // 先拿到我的分数
//     const myRes = await db.collection('users')
//       .where({ openid: myOpenid })
//       .get()

//     if (!myRes.data.length) return

//     const me = myRes.data[0]
//     me.isMe = true
//     console.log('me = ', me)

//     // 统计有多少人分数比我高
//     const higherRes = await db.collection('users')
//       .where({
//         bestScore: db.command.gt(me.bestScore)
//       })
//       .count()

//     const myRank = higherRes.total + 1

//     this.setData({
//       me,
//       myRank
//     })
//   },

//   // ② 加载 Top 100
//   async loadTop100() {
//     const myOpenid = this.data.myOpenid

//     const res = await db.collection('users')
//       .orderBy('bestScore', 'desc')
//       .limit(100)
//       .get()

//     let list = res.data.map((item, index) => ({
//       ...item,
//       rank: index + 1,
//       isMe: item.openid === myOpenid
//     }))

//     // 如果我在 Top100，移除我（因为顶部已经显示）
//     list = list.filter(item => item.openid !== myOpenid)

//     this.setData({ list })
//   }
// })
const db = wx.cloud.database()
const app = getApp()
const PENDING_SCORE_SYNC_KEY = 'pendingScoreSync'

function normalizeAvatarUrl(value) {
  return typeof value === 'string' ? value : ''
}

function isCloudFileID(value) {
  return typeof value === 'string' && value.indexOf('cloud://') === 0
}

function isDefaultNickName(nickName) {
  return nickName === '玩家' || /^玩家[0-9a-zA-Z]{4}$/.test(nickName || '')
}

function hasCompleteProfile(user) {
  if (!user) {
    return false
  }

  const nickName = typeof user.nickName === 'string' ? user.nickName.trim() : ''
  const avatar = normalizeAvatarUrl(user.avatar || user.avatarUrl)

  return Boolean(nickName) && !isDefaultNickName(nickName) && Boolean(avatar)
}

function normalizeUser(item, myOpenid) {
  const nickName = typeof item.nickName === 'string' && item.nickName.trim()
    ? item.nickName.trim()
    : '微信用户'

  return {
    ...item,
    avatarUrl: normalizeAvatarUrl(item.avatarUrl),
    avatarText: nickName.slice(0, 1),
    nickName,
    bestScore: Number(item.bestScore) || 0,
    isMe: item.openid === myOpenid
  }
}

function applyLocalProfile(user, cachedUser, myOpenid) {
  if (!user || !cachedUser || user.openid !== myOpenid || !hasCompleteProfile(cachedUser)) {
    return user
  }

  const nickName = cachedUser.nickName.trim()
  const avatarUrl = normalizeAvatarUrl(cachedUser.avatar || cachedUser.avatarUrl)

  return {
    ...user,
    nickName,
    avatarUrl,
    avatarText: nickName.slice(0, 1)
  }
}

function assignRanks(list) {
  let lastScore = null
  let lastRank = 0

  return list.map((item, index) => {
    const rank = item.bestScore === lastScore ? lastRank : index + 1
    lastScore = item.bestScore
    lastRank = rank

    return {
      ...item,
      rank
    }
  })
}

Page({
  data: {
    list: [],
    me: null,
    myRank: null,
    myOpenid: '',
    loading: true,
    error: '',
    emptyText: ''
  },

  async onLoad() {
    await this.loadLeaderboard()
  },

  async onShow() {
    if (this.hasLoadedOnce) {
      await this.loadLeaderboard()
    }
  },

  async loadLeaderboard() {
    this.setData({
      loading: true,
      error: '',
      emptyText: ''
    })

    try {
      let openid = app.globalData.openid
      const cachedUser = wx.getStorageSync('userInfo') || app.globalData.userInfo || null
      const shouldShowMeCard = hasCompleteProfile(cachedUser)

      if (!openid) {
        const res = await wx.cloud.callFunction({ name: 'login' })
        openid = res.result.openid
        app.globalData.openid = openid
      }

      this.setData({ myOpenid: openid })
      await this.trySyncPendingScore()

      const [myRes, topRes] = await Promise.all([
        db.collection('users').where({ openid }).get(),
        db.collection('users')
          .orderBy('bestScore', 'desc')
          .limit(100)
          .get()
      ])

      const meRecord = myRes.data.length
        ? normalizeUser(myRes.data[0], openid)
        : null
      const mergedMeRecord = applyLocalProfile(meRecord, cachedUser, openid)
      const me = shouldShowMeCard ? mergedMeRecord : null

      let myRank = null
      if (meRecord) {
        const higherRes = await db.collection('users').where({
          bestScore: db.command.gt(meRecord.bestScore)
        }).count()
        myRank = higherRes.total + 1
      }

      const rankedTopList = assignRanks(
        topRes.data
          .map(item => normalizeUser(item, openid))
          .map(item => applyLocalProfile(item, cachedUser, openid))
      )

      const displayList = rankedTopList
      const [resolvedMe, resolvedList] = await Promise.all([
        this.resolveUserAvatar(me),
        this.resolveUsersAvatar(displayList)
      ])

      this.hasLoadedOnce = true
      this.setData({
        me: resolvedMe,
        myRank,
        list: resolvedList,
        loading: false,
        emptyText: rankedTopList.length ? '' : '还没有排行榜数据，先去玩一局吧'
      })
    } catch (err) {
      console.log('加载排行榜失败', err)
      this.setData({
        loading: false,
        error: '排行榜加载失败，请稍后重试'
      })
    }
  },

  async trySyncPendingScore() {
    const pending = wx.getStorageSync(PENDING_SCORE_SYNC_KEY)
    if (!pending || !pending.nickName) {
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'submitScore',
        data: {
          score: Number(pending.score) || 0,
          avatarUrl: normalizeAvatarUrl(pending.avatarUrl),
          nickName: pending.nickName
        }
      })

      if (res.result?.errCode || res.result?.code === -1) {
        throw new Error(res.result.errMsg || '分数上传失败')
      }

      wx.removeStorageSync(PENDING_SCORE_SYNC_KEY)
    } catch (err) {
      console.log('排行榜页补传分数失败', err)
    }
  },

  async resolveUsersAvatar(list) {
    const cloudFileIDs = list
      .map(item => item.avatarUrl)
      .filter(fileID => isCloudFileID(fileID))

    const avatarMap = {}

    if (cloudFileIDs.length) {
      try {
        const res = await wx.cloud.getTempFileURL({
          fileList: [...new Set(cloudFileIDs)]
        })
        res.fileList.forEach(file => {
          avatarMap[file.fileID] = file.tempFileURL || ''
        })
      } catch (err) {
        console.log('排行榜头像临时链接获取失败', err)
      }
    }

    return list.map(item => ({
      ...item,
      avatarUrl: isCloudFileID(item.avatarUrl)
        ? avatarMap[item.avatarUrl] || ''
        : item.avatarUrl
    }))
  },

  async resolveUserAvatar(user) {
    if (!user) {
      return null
    }

    const [resolvedUser] = await this.resolveUsersAvatar([user])
    return resolvedUser || null
  },

  retryLoad() {
    this.loadLeaderboard()
  },

  goEditProfile() {
    wx.navigateTo({
      url: `/game/result/result?mode=profile&redirect=${encodeURIComponent('/rankpkg/rank/rank')}`
    })
  }
})
