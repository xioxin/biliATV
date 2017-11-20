#  biliATV

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
    * [ ] UP主页面
    * [ ] 热门视频(B站首页)
    * [ ] 搜索
    
* 视频解析与播放
    * [x] 解析视频地址
    * [x] 播放视频(使用 [DanMuPlayer](https://github.com/fuzhuo/DanMuPlayer))
    * [ ] 地址过期重新获取
    * [ ] 剧集连播
    * [ ] 记录播放位置
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

# Thanks

* [DanMuPlayer](https://github.com/fuzhuo/DanMuPlayer)
* [tvOSBrowser](https://github.com/steventroughtonsmith/tvOSBrowser)

