#  biliATV

为了搞智能家居需要一个家庭中枢而购买的 AppleTV 从此一发不可收拾 :joy:

国内大部分资源可以直接用 [LazyCat](https://github.com/fuzhuo/LazyCat) 解决

但是[LazyCat](https://github.com/fuzhuo/LazyCat)的喵哩喵哩满足不了我的需求
所以打算自己再写一个 一个完整的bilibili客户端


### 使用技巧
> 长按视频封面可以强制打开视频详情界面 （如果不分P的视频将会直接播放）

### 需要重新安装的更新:
* 2017/12/13 : 修复番剧清晰度解析问题
* 2017/12/14: 修复播放器跳转进度时候的时间和指示器消失的问题



#### todo:


* 页面
    * [x] 登录
    * [x] 我的动态
    * [ ] 我的追番
    * [ ] 我的收藏
    * [ ] 我的历史
    * [x] 番剧timeline
    * [x] 番剧页面
    * [x] 视频详情
    * [ ] 视频详情V2
    * [ ] UP主页面 80%
    * [ ] 热门视频(B站首页)
    * [ ] 搜索
    * [ ] 设置界面
    * [ ] 重构UI框架
    
* 视频地址解析与播放
    * [x] 解析视频地址
    * [x] 解析高清视频地址(默认被我设置为1080p,番剧解析不稳定原因不明清晰度忽高忽低)
    * [x] 解决番剧高清解析偶尔失败的问题
    * [ ] 自定义视频清晰度
    * [x] 播放视频(使用 [DanMuPlayer](https://github.com/fuzhuo/DanMuPlayer) )
    * [ ] 视频地址过期重新获取视频地址并继续播放
    * [ ] 剧集连播
    * [ ] 记录播放位置 再次打开提示还原
    * [ ] 将播放位置提交到B站的历史记录中 方便其他设备继续播放
    * [ ] 加载弹幕


### 关于私有API
项目使用了UIWebView在tvOS中UIWebView是私有API
需要手动修改Xcode文件来解锁,否则无法编译

参考: [tvOSBrowser](https://github.com/steventroughtonsmith/tvOSBrowser)

文件位置:
```
Availability.h 在AppleTV位于： Xcode > Contents > Developer > Platforms > AppleTVOS.platform > Developer > SDKs > AppleTVOS.sdk > usr > include
Availability.h 在AppleTV模拟器位于： Xcode > Contents > Developer > Platforms > AppleTVSimulator.platform > Developer > SDKs > AppleTVSimulator.sdk > usr > include
```

将以下内容 :
```
#define __TVOS_UNAVAILABLE                    __OS_AVAILABILITY(tvos,unavailable)
#define __TVOS_PROHIBITED                     __OS_AVAILABILITY(tvos,unavailable)
```
替换为 :
```
#define __TVOS_UNAVAILABLE_NOTQUITE                    __OS_AVAILABILITY(tvos,unavailable)
#define __TVOS_PROHIBITED_NOTQUITE                     __OS_AVAILABILITY(tvos,unavailable)
```

## 部署方法
由于使用了submodule所以请不要直接下载zip,而是使用git clone
```
git clone https://github.com/xioxin/biliATV.git
cd biliATV && sh build.sh
```




# 感谢
* 感谢[@fuzhuo](https://github.com/fuzhuo)的帮助
* [DanMuPlayer](https://github.com/fuzhuo/DanMuPlayer)
* [tvOSBrowser](https://github.com/steventroughtonsmith/tvOSBrowser)


# 截图
![](https://user-images.githubusercontent.com/5716100/33050348-65c4a9a2-ce9f-11e7-91a0-3b219b08ce05.png)
![](https://user-images.githubusercontent.com/5716100/33050369-86917f7a-ce9f-11e7-9d47-e5936b2107bd.png)
![](https://user-images.githubusercontent.com/5716100/33050453-f0046422-ce9f-11e7-9726-7128e7a5ba73.png)
![](https://user-images.githubusercontent.com/5716100/33050440-e706b460-ce9f-11e7-8241-fff6a41d397b.png)

# 许可证
GPL-3.0


