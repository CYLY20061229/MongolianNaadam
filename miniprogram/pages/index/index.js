const app = getApp()

Page({
  data: {
    hasUserInfo: false,
    user: {
      avatar: '',
      nickName: ''
    },
    hasProfile: false,
    imgLogo: '',
    img1: '',
    img2: '',
    img3: ''
  },

  onLoad() {
    
  
    // if (app.globalData.userInfo) {
    //   this.setUser(app.globalData.userInfo)
    // }
  
    this.clickAudio = wx.createInnerAudioContext()
    this.clickAudio.volume = 1
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/logo.PNG',
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/1.PNG',
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/2.PNG',
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/3.PNG',
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/icon/kid.png'
      ],
      success: res => {
        this.setData({
          imgLogo: res.fileList[0].tempFileURL,
          img1: res.fileList[1].tempFileURL,
          img2: res.fileList[2].tempFileURL,
          img3: res.fileList[3].tempFileURL,
          kid: res.fileList[4].tempFileURL,
        })
      },
      fail: err => {
        console.log('获取图片失败', err)
      }
    })
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/audio/click.mp3'
      ],
      success: res => {
        const url = res.fileList[0].tempFileURL
        console.log('click音效地址:', url)
        this.clickAudio.src = url
      },
      fail: err => {
        console.log('获取 click 音效失败', err)
      }
    })
  },
  onShow() {
    const user = wx.getStorageSync('userInfo') || app.globalData.userInfo
    const nickName = typeof user?.nickName === 'string' ? user.nickName.trim() : ''
    const avatar = typeof (user?.avatar || user?.avatarUrl) === 'string' ? (user.avatar || user.avatarUrl) : ''

    this.setData({
      hasProfile: Boolean(nickName || avatar),
      user: {
        avatar,
        nickName
      }
    })
  },
  playClick() {
    if (this.clickAudio) {
      this.clickAudio.stop()
      this.clickAudio.play()
    }
  },
  // setUser(user) {
  //   this.setData({
  //     hasUserInfo: true,
  //     user: {
  //       avatar: user.avatar,
  //       nickName: user.nickName
  //     }
  //   })
  // },

  // getUserInfo() {
  //   wx.getUserProfile({
  //     desc: '用于排行榜和对战展示',
  //     success: res => {
  //       const user = {
  //         avatar: res.userInfo.avatarUrl,
  //         nickName: res.userInfo.nickName
  //       }

  //       wx.setStorageSync('userInfo', user)
  //       app.globalData.userInfo = user
  //       this.setUser(user)
  //     },
  //     fail: () => {
  //       wx.showToast({
  //         title: '需要授权才能继续',
  //         icon: 'none'
  //       })
  //     }
  //   })
  // },

  goSingle() {
    this.playClick();
    wx.navigateTo({ url: '/game/single/single' })
  },

  goRoom() {
    this.playClick();
    wx.navigateTo({ url: '/game/room/room' })
  },

  goRank() {
    this.playClick();
    wx.navigateTo({ url: '/rankpkg/rank/rank' })
  },

  goEditProfile() {
    this.playClick()
    wx.navigateTo({
      url: `/game/result/result?mode=profile&redirect=${encodeURIComponent('/pages/index/index')}`
    })
  }
})
