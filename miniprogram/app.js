App({
  globalData: {
    userInfo: null,
    openid: null,
    bgm: null
  },

  onLaunch() {
    console.log('App 启动了')

    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-7guzclow2433464f',
        traceUser: true
      })
    }

    const user = wx.getStorageSync('userInfo')
    if (user) {
      this.globalData.userInfo = user
    }

    // ✅ 先创建 audio 对象
    const bgm = wx.createInnerAudioContext()
    bgm.loop = true
    bgm.volume = 0.4
    this.globalData.bgm = bgm

    // ✅ 把 cloud:// 转成 https
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/audio/bgm.wav'
      ],
      success: res => {
        const url = res.fileList[0].tempFileURL
        console.log('BGM 临时地址:', url)
        bgm.src = url
      },
      fail: err => {
        console.log('获取 BGM 失败:', err)
      }
    })

    // 获取 openid
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        this.globalData.openid = res.result?.openid
      },
      fail: err => {
        console.log('获取 openid 失败:', err)
      }
    })
  }
})