var dom;
var test = {};
var videoTest = {};
var nowPlayer = null;
var userData = {};

/*
* 我的 动漫订阅
* https://space.bilibili.com/ajax/Bangumi/getList?mid=902845
*
* 我的 我的订阅(旧版)
* https://api.bilibili.com/x/web-feed/feed?ps=10&pn=2&type=0
*
* 空间 用户收藏夹
* https://api.bilibili.com/x/v2/fav/folder?vmid=11336264&jsonp=jsonp&callback=_jsonp7w97f2ymphi
*
* 空间 用户首页版块
* https://api.bilibili.com/x/space/channel/index?mid=11336264&guest=false&jsonp=jsonp&callback=_jsonpx036tchreuc
*
* 空间 个人资料 验证 Referer 必须为POST mid=11336264
* https://space.bilibili.com/ajax/member/GetInfo
*
* 空间 个人资料 无需验证referee
* https://api.bilibili.com/cardrich?mid=11336264
*
* 空间 投稿数 和 关注信息
* https://api.bilibili.com/vipinfo/default?mid=11336264&loginid=902845
*
* 空间 最近投稿
* https://space.bilibili.com/ajax/member/getSubmitVideos?mid=11336264&page=1&pagesize=25
*
* 空间 获取用户公告
* https://space.bilibili.com/ajax/settings/getNotice?mid=11336264
*
* 空间 获取用户标签
* https://space.bilibili.com/ajax/member/getTags?mids=11336264
*
* 空间 置顶视频
* https://space.bilibili.com/ajax/top/showTop?mid=11336264&guest=1
*
* 番剧 更多推荐
* https://bangumi.bilibili.com/web_api/season/recommend/6465.json
*
* 番剧 番剧详情
* https://bangumi.bilibili.com/jsonp/seasoninfo/6465.ver?callback=seasonListCallback&jsonp=jsonp&_=1511089954345
*
* 番剧 承包7日榜
* https://bangumi.bilibili.com/sponsor/rankweb/get_sponsor_week_list?season_id=6308&pagesize=7
*
* 番剧 相关视频
* https://api.bilibili.com/x/web-interface/tag/top?pn=1&ps=30&callback=relate_video_callback&jsonp=jsonp&tid=4641922&_=1511098218419
* */

var displayErrorLock = false;

// 显示错误信息
function displayError(title="", info="") {
    console.warn("displayError",title, info);
    if(displayErrorLock){
        console.warn("不报错窗口递归");
        return;
    }
    displayErrorLock = true;
    let xml = `<document>
   <descriptiveAlertTemplate>
      <title>${title}</title>
      <description>${info}</description>
      <row>
         <button id="cancel">
            <text>关闭</text>
         </button>
         <button id="reload">
            <text>重载应用</text>
         </button>
      </row>
   </descriptiveAlertTemplate>
</document>`;
    let parser = new DOMParser();
    let parsed = parser.parseFromString(xml.replace(new RegExp('&', 'g'), '&amp;'), "application/xml");
    parsed.getElementById("cancel").addEventListener("select",function (e) {
        navigationDocument.dismissModal();
    });
    parsed.getElementById("reload").addEventListener("select",function (e) {
        App.reload({});
    });
    // parsed.addEventListener("play",function (e) {
    //     // 显示详细错误信息
    //     // navigationDocument.dismissModal();
    // });
    navigationDocument.presentModal(parsed);
    displayErrorLock = false;
}

// json解析错误拦截
function jsonParse(s) {
    var data = {};
    try{
        var data = JSON.parse(s);
    }catch(exception) {
        displayError("JSON解析错误",s);
    }
    return data;
}

function myHome(setDocument) {
    setDocument(tvOS.template.loading("加载中个人信息.."));
    ajax.get('https://api.bilibili.com/x/web-interface/nav',function (data) {
        console.warn(data);
        data = jsonParse(data);
        var myhome;
        if(data.code != 0){
            myhome = new tvOS.template.compilation('个人中心','尚未登录',data.message,'https://static.hdslb.com/images/akari.jpg',[
                // new tvOS.element.buttonLockup('登录','resource://button-add')
            ],[
                new tvOS.element.listItemLockup(1,'登录','二维码',function () {
                    openLogin(function (s) {
                        if(s){
                            myHome(setDocument);
                        }
                    });
                })
            ]);
        }else{
            userData = data.data;
            console.warn(data);
            var name =userData.uname;
            if(userData.vipStatus){
                name +=` <badge src="https://static.hdslb.com/images/base/vip-16-icon.png" width='32' height='32' alt="大会员" accessibility="" /> `
            }
            myhome = new tvOS.template.compilation('个人中心',name,'',userData.face,[
                // new tvOS.element.buttonLockup('登录','resource://button-add')
            ],[
                new tvOS.element.listItemLockup(0,'动态','',function () {
                    openDynamic();
                }),
                new tvOS.element.listItemLockup(0,'收藏夹','',function () {}),
                new tvOS.element.listItemLockup(0,'历史','',function () {}),
                new tvOS.element.listItemLockup(0,'我的首页','',function () {
                    openUser(userData.mid);
                }),
                new tvOS.element.listItemLockup(0,'退出登录','',function () {
                    ajax.get('https://account.bilibili.com/login?act=exit',function () {
                        myHome(setDocument);
                    })
                }),
            ]);
            //myhome.customHeaderInAfter=`<badge src="https://static.hdslb.com/images/base/vip-16-icon.png" width='32' height='32'/>`;
            myhome.headerRow = [];
            myhome.headerRow.push(` Lv${userData.level_info.current_level} `);
            myhome.headerRow.push(` 硬币:${userData.money} `);
            myhome.headerRow.push(` B币:${userData.wallet.bcoin_balance} `);
        }

        // navigationDocument.replaceDocument(myhome.view,loadingBox.view);
        // myhome.display();
        setDocument(myhome);
    });
    /**/
    // return loadingBox;
}
function timeline(setDocument) {
    setDocument(tvOS.template.loading("加载番剧信息..."));
    ajax.get('https://bangumi.bilibili.com/web_api/timeline_global',function (data) {
        data = jsonParse(data);
        console.warn(data);
        var tilelineData = data.result;
        var listView = tvOS.template.custom('');



        var dayShelf = "";

        var week = [
            '',
            "周一",
            "周二",
            "周三",
            "周四",
            "周五",
            "周六",
            "周日",
        ];


        tilelineData.forEach(function (day) {
            dayShelf+=`<shelf ${day.is_today?"autoHighlight='autoHighlight'":''} id="day-${day.date}">
             <header><title>${day.is_today?"今天":day.date} ${week[day.day_of_week]}</title></header>
             <prototypes>
                <lockup binding="@autoHighlight:{autoHighlight};" prototype="bangumi">
                    <img binding="@src:{cover};" width="200" height="300"/>
                    <title binding="textContent:{title};" />
                    <description  binding="textContent:{description};" style="font-size: 30;color:#fff" />
                </lockup>
                <lockup binding="@autoHighlight:{autoHighlight};" prototype="bangumi_published">
                    <img binding="@src:{cover};" width="200" height="300"/>
                    <title binding="textContent:{title};" style="color:#fb7299" />
                    <description  binding="textContent:{description};" style="font-size: 30;color:#fff" />
                </lockup>
                <lockup binding="@autoHighlight:{autoHighlight};" prototype="bangumi_delay">
                    <img binding="@src:{cover};" width="200" height="300"/>
                    <title binding="textContent:{title};" />
                    <description  binding="textContent:{description};" style="font-size: 30;color:#fff" />
                </lockup>
            </prototypes>
            <section binding="items:{timeline};" />
         </shelf>`
        });

        listView.xml = `<document>
   <stackTemplate>
      <banner>
         <title>番剧</title>
      </banner>
      <collectionList>
         ${dayShelf}
      </collectionList>
   </stackTemplate>
</document>
`;

        var view = listView.view;

        tilelineData.forEach(function (day) {
            let shelf = view.getElementById("day-"+day.date);
            let section = shelf.getElementsByTagName("section").item(0);
            section.dataItem = new DataItem()
            var index = 0;
            let newItems = day.seasons.map((result) => {
                var type = "bangumi";
                if(result.delay){
                    type = "bangumi_delay"
                }
                if(result.is_published){
                    type = "bangumi_published"
                }
                let objectItem = new DataItem(type, result.season_id);
                objectItem.cover = result.cover;
                objectItem.title = result.title;
                if(result.delay){
                    objectItem.title = "[本周停更] "+ result.title;
                }
                objectItem.pub_index = result.pub_index;
                objectItem.pub_time = result.pub_time;
                objectItem.autoHighlight = false;
                if(day.is_today && index==0){
                    objectItem.autoHighlight = 'autoHighlight';
                }

                objectItem.description = `${result.pub_index} ${result.pub_time}`;

                objectItem.onselect = function (e) {
                    console.warn(e,result);
                    openBangumi(result.season_id);
                };
                index++;
                return objectItem;
            });
            section.dataItem.setPropertyPath("timeline", newItems);

        });
        // console.log('view',view.getElementsByTagName("shelf").item(6));
        // view.getElementsByTagName("shelf").item(6).attributes.item().autoHighlight = true;
        // view.getElementsByTagName("shelf").item(6).getElementsByTagName("lockup").item(0).attributes.item().autoHighlight = true;
        test.bb = view;
        setDocument(listView);
    });
}
function openSearchView(setDocument) {
    var view = tvOS.template.custom(`<document>
   <searchTemplate>
      <searchField/>
      <shelf>
         <header>
            <title>Popular</title>
         </header>
         <section>
            <lockup>
               <img src="path to images on your server/Car_Movie_250x375_A.png" width="182" height="274" />
               <title>Movie 1</title>
            </lockup>
            <lockup>
               <img src="path to images on your server/Car_Movie_250x375_B.png" width="182" height="274" />
               <title>Movie 2</title>
            </lockup>
            <lockup>
               <img src="path to images on your server/Car_Movie_250x375_C.png" width="182" height="274" />
               <title>Movie 3</title>
            </lockup>
         </section>
      </shelf>
   </searchTemplate>
</document>`);
    setDocument(view);
}

function openLogin(callback=function () {}) {
    ajax.get("https://passport.bilibili.com/qrcode/getLoginUrl",function (data) {
        data = jsonParse(data);
        data = data.data;
        var oauthKey = data.oauthKey;

        console.warn(data);
        var getinfo = function () {
            console.log(oauthKey);
            ajax.post('https://passport.bilibili.com/qrcode/getLoginInfo',{
                oauthKey:oauthKey,
                gourl:"https://www.bilibili.com/",
            },function (data) {
                console.warn(data);
                data = jsonParse(data);
                if(data.status){
                    clearInterval(timer);
                    modalDom.getElementsByTagName('text').item(2).innerHTML = "登录中...";
                    ajax.get(data.data.url,function (data) {
                        // console.warn(data);
                        modal.dismissModal();
                        callback(true);
                    })
                }else{
                    modalDom.getElementsByTagName('text').item(2).innerHTML = data.message;
                }
            });
        }

        var timer = setInterval(getinfo,3000);
        setTimeout(getinfo,100);


        var modal = new tvOS.template.descriptiveAlert('登录账号',`https://pan.baidu.com/share/qrcode?w=300&h=300&url=${encodeURIComponent(data.url)}`,"使用bilibili手机客户端扫描上方二维码",[
            new tvOS.element.button("刷新二维码",function (e,button) {
                // modal.dismissModal();
                openLogin(callback);
            }),
            new tvOS.element.button("取消",function (e,button) {
                clearInterval(timer);
                modal.dismissModal();
                callback(false)
            })
        ],' ',false);
        var modalDom = dom = modal.view;
        // loadingBox.dismissModal();
        modal.presentModal(dom);
    });
}
function openDynamic() {
    var loading = tvOS.template.loading('加载中');
    loading.display();

    openVideoList("我的动态",function (page,callback) {
        ajax.get("https://api.bilibili.com/x/web-feed/feed?ps=10&pn=1",function (data) {
            data = jsonParse(data);
            console.warn('我的动态',data);
            if(data.code==0){
                data = data.data;
                let items = [];
                data.forEach(function (d) {
                    var objectItem = false
                    if(d.type == 0){
                        objectItem = new DataItem('video', d.archive.aid);
                        objectItem.cover = d.archive.pic;
                        objectItem.title = d.archive.title;
                        objectItem.class = d.archive.tname;
                        objectItem.face = d.archive.owner.face;
                        objectItem.user = d.archive.owner.name;
                    }else if(d.type == 1){
                        objectItem = new DataItem('video', d.bangumi.aid);
                        objectItem.cover = d.bangumi.cover;
                        objectItem.title = d.bangumi.title;
                        objectItem.class = '';
                        objectItem.face = '';
                        objectItem.user = '';
                    }else{
                        console.warn("未知数据类型",d);
                    }
                    if(objectItem)items.push(objectItem);
                });
                callback(items);
            }else{
                displayError(`加载错误 错误ID${data.code}`,)
            }
            callback(false)
        })
    },`<lockup prototype="video">
    <img binding="@src:{cover};" width="300" height="200"/>
    <overlay style="margin:0px;padding:5px;" >
        <text style="font-size:22px;tv-position:bottom-left;color: rgba(255, 255, 255, 0.9);" binding="textContent:{class};"></text>
    </overlay>
    <title binding="textContent:{title};" />
    <row>
        <img style="border-radius: circle;" binding="@src:{face};" width="32" height="32" />
        <text binding="textContent:{user};"></text>
    </row>
</lockup>`)

}
function openUser(mid) {
    ajax.get(`https://api.bilibili.com/cardrich?mid=${mid}`,function (data) {
        data = jsonParse(data);
        if(data.code == 0){
            data = data.data.card;
            var up = data;

            var regtime = new Date();
            regtime.setTime(data.regtime*1000);
            var regtime_text = `${regtime.getFullYear()}-${regtime.getMonth()}-${regtime.getDate()}`

            var nameplate = "无";
            var nameplate_icon = "";

            if(data.nameplate){
                nameplate = data.nameplate.name;
                nameplate_icon = data.nameplate.image;
                //image_small
            }

            var page = tvOS.template.custom('');
            page.xml = `<document>
    <productTemplate>
        <background>
        </background>
        <banner>
            <infoList>
                <info>
                    <header>
                        <title>UID</title>
                    </header>
                    <text>${data.mid}</text>
                </info>
                <info>
                    <header>
                        <title>性别</title>
                    </header>
                    <text>${data.sex}</text>
                </info>
                <info>
                    <header>
                        <title>位置</title>
                    </header>
                    <text>${data.place}</text>
                </info>
                <info>
                    <header>
                        <title>注册于</title>
                    </header>
                    <text>${regtime_text}</text>
                </info>
                <info>
                    <header>
                        <title>勋章</title>
                    </header>
                    <text>${nameplate}</text>
                </info>
            </infoList>
            <stack>
                <title>${data.name}</title>
                <row>
                    <text>${data.sign}</text>
                </row>
                <description id="description_more"></description>
                <row>
                    <buttonLockup id="follow_button">
                        <badge src="resource://button-rated" />
                        <title>大概没关注</title>
                    </buttonLockup>
                    
                    <buttonLockup>
                        <badge src="resource://button-preview" />
                        <title>视频</title>
                    </buttonLockup>
                    <buttonLockup>
                        <!--<badge src="resource://button-rated" />-->
                        <title>专栏</title>
                    </buttonLockup>
                    <buttonLockup>
                        <!--<badge src="resource://button-rated" />-->
                        <title>收藏</title>
                    </buttonLockup>
                    <buttonLockup>
                        <!--<badge src="resource://button-rated" />-->
                        <title>订阅</title>
                    </buttonLockup>
                </row>
            </stack>
            <heroImg src="${data.face}" />
        </banner>
    </productTemplate>
</document>`;

            test.uv = page.view;
            page.display();

            var productTemplate = page.view.getElementsByTagName('productTemplate').item(0);
            //填充公告
            // https://space.bilibili.com/ajax/settings/getNotice?mid=11336264
            ajax.get(`https://space.bilibili.com/ajax/settings/getNotice?mid=${mid}`,function (data) {
                data = jsonParse(data);
                if(data.status){
                    var notice = data.data.notice;
                    page.view.getElementById("description_more").textContent = notice;
                }
            });


            //https://api.bilibili.com/x/space/channel/index?mid=11336264&guest=false
            //确保顺序 所以放到 TA的投稿执行完成之后执行
            ajax.get(`https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${mid}&page=1&pagesize=25`,function (data) {
                data = jsonParse(data);
                if(data.status){
                    var list = data.data.vlist;
                    var title = "TA的投稿";
                    if(!list)return;
                    var listKey = `list_up`;
                    up.archiveCount = data.data.count;

                    var shelf = page.view.createElement('shelf');
                    shelf.innerHTML = `
            <header>
                <title>${title} <text id="archiveCount">(${up.archiveCount?up.archiveCount:"?"})</text></title>
            </header>
            <prototypes>
                <lockup prototype="video">
                    <img binding="@src:{cover};" width="300" height="187"/>
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
                <lockup prototype="video-more">
                    <img src="${tvBaseURL}/images/more400.png" width="187" height="187" />
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
            </prototypes>
            <section id="${listKey}" binding="items:{${listKey}};" />`;
                    // test.shelf = shelf;
                    var section =  shelf.getElementsByTagName("section").item(0);
                    section.dataItem = new DataItem();
                    var datalist = list.map((av) => {
                        let objectItem = new DataItem('video', av.aid);
                        objectItem.cover = autoUrl2Https(av.pic);
                        objectItem.title = av.title;
                        objectItem.description = av.description;
                        objectItem.onselect = function (e) {
                            openVideo(av.aid)
                        };
                        objectItem.onholdselect = function (e) {
                            openVideo(av.aid,true);
                        };
                        return objectItem;
                    });
                    let moreButtonItem = new DataItem('video-more', up.mid);
                    moreButtonItem.title="更多";
                    moreButtonItem.onselect = function (e) {
                        openUserVideo(up.mid,`${up.name}的投稿 (${up.archiveCount})`);
                    };
                    datalist.push(moreButtonItem);

                    section.dataItem.setPropertyPath(listKey,datalist );
                    console.warn(section.dataItem);

                    let existShelf = productTemplate.getElementsByTagName("shelf");
                    if(existShelf.length == 0){
                        productTemplate.appendChild(shelf);
                    }else{
                        existShelf.item(0).insertBefore(shelf);
                    }
                }
            });

            //获取up的首页版块
            ajax.get(`https://api.bilibili.com/x/space/channel/index?mid=${mid}&guest=false`,function (data){
                data = jsonParse(data);
                console.warn('index',data);
                if(data.code == 0){
                    let channels = data.data;
                    console.warn('channels',channels);
                    channels.forEach(function (channel) {
                        let title = `${channel.name} (${channel.count})`;
                        let cid = channel.cid;
                        let listKey = "userChannel_"+cid;
                        let list = channel.archives;
                        if(!list)return
                        var shelf = page.view.createElement('shelf');
                        shelf.innerHTML = `
            <header>
                <title>${title}</title>
            </header>
            <prototypes>
                <lockup prototype="video">
                    <img binding="@src:{cover};" width="300" height="187"/>
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
                <lockup prototype="video-more">
                    <img src="${tvBaseURL}/images/more400.png" width="187" height="187" />
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
            </prototypes>
            <section id="${listKey}" binding="items:{${listKey}};" />`;
                        let section =  shelf.getElementsByTagName("section").item(0);
                        section.dataItem = new DataItem();
                        let datalist = list.map((av) => {
                            let objectItem = new DataItem('video', av.aid);
                            objectItem.cover = autoUrl2Https(av.pic);
                            objectItem.title = av.title;
                            objectItem.description = av.description;
                            objectItem.onselect = function (e) {
                                openVideo(av.aid)
                            };
                            objectItem.onholdselect = function (e) {
                                openVideo(av.aid,true);
                            };
                            return objectItem;
                        });
                        let moreButtonItem = new DataItem('video-more', up.mid);
                        moreButtonItem.title="更多";
                        moreButtonItem.onselect = function (e) {
                            openUserChannelVideo(up.mid,cid,title);
                            // openVideo(av.aid)
                        };
                        // moreButtonItem.description="更多";
                        datalist.push(moreButtonItem);
                        section.dataItem.setPropertyPath(listKey,datalist);
                        productTemplate.appendChild(shelf);
                    })
                }
            });

            // ajax.get(`https://api.bilibili.com/vipinfo/default?mid=${mid}&loginid=902845`)

            let follow_button = page.view.getElementById("follow_button");
            let follow_button_badge = follow_button.getElementsByTagName("badge").item(0);
            let follow_button_title = follow_button.getElementsByTagName("title").item(0);

            follow_button.addEventListener("select",function () {

            })


            ajax.get(`https://api.bilibili.com/vipinfo/default?mid=${mid}&loginid=${userData.mid}`,function (data) {
                data = jsonParse(data);
                if(data.code == 0){
                    up.archiveCount = data.data.archiveCount;
                    up.following = data.data.following;
                    let archiveCountBox = page.view.getElementById("archiveCount");
                    if(archiveCountBox){
                        archiveCountBox.textContent = ` (${up.archiveCount})`
                    }

                    test.follow_button_badge = follow_button_badge;
                    if(up.following){

                        // follow_button.removeChild(follow_button_badge);
                        // follow_button_badge = page.view.createElement('badge');
                        // follow_button_badge.src = "resource://button-rated";
                        // follow_button_title.insertBefore(follow_button_badge);

                        follow_button_title.textContent = "已关注";
                    }else{
                        // follow_button.removeChild(follow_button_badge);
                        // follow_button_badge = page.view.createElement('badge');
                        // follow_button_badge.src = "resource://button-rate";
                        // follow_button_title.insertBefore(follow_button_badge);
                        follow_button_title.textContent = "未关注";
                    }
                }
            })





            // test.uv.appendChild(test.uv.createElement('shelf'))

        }
    })
}
function openUserVideo(mid,title) {
    openVideoList(title,function (page,callback) {
        ajax.get(`https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${mid}&page=${page}&pagesize=25`,function (data) {
            data = jsonParse(data);
            if(data.status){
                var list = data.data.vlist;
                if(!list){
                    callback(false);
                }
                var datalist = list.map((av) => {
                    let item = new DataItem('video', av.aid);;
                    item.aid = av.aid;
                    item.cover = autoUrl2Https(av.pic);
                    item.title = av.title;
                    item.description = av.description;
                    item.onselect = function (e) {
                        openVideo(av.aid)
                    };
                    objectItem.onholdselect = function (e) {
                        openVideo(av.aid,true);
                    };
                    return item;
                });
                callback(datalist);
            }else{
                return false;
            }
        })
    })
}
function openUserChannelVideo(mid,cid,title) {
    openVideoList(title,function (page,callback) {
        ajax.get(`https://api.bilibili.com/x/space/channel/video?mid=${mid}&cid=${cid}&pn=${page}&ps=30&order=0`,function (data) {
            data = jsonParse(data);
            if(data.code == 0){
                var list = data.data.list.archives;
                if(!list){
                    callback(false);
                }
                var datalist = list.map((av) => {
                    if(av.state<0)return;
                    let item = {};
                    item.id = av.aid;
                    item.aid = av.aid;
                    item.cover = autoUrl2Https(av.pic);
                    item.title = av.title;
                    item.description = av.description;
                    item.onselect = function (e) {
                        openVideo(av.aid)
                    };
                    item.onholdselect = function (e) {
                        openVideo(av.aid,true);
                    };
                    return item;
                });
                callback(datalist);
            }else{
                return false;
            }
        })
    })
    //
}
function openBangumi(sid) {
    ajax.get(`https://bangumi.bilibili.com/jsonp/seasoninfo/${sid}.ver?callback=seasonListCallback&jsonp=jsonp`,function (data) {
        function seasonListCallback(data) {
            if(data.code == 0){
                var result = data.result;
                console.log(result);
                var page = tvOS.template.custom('');

                var tags = "";
                var actor = "";

                result.tags.forEach(function (tag) {
                    tags+=`<textBadge>${tag.tag_name}</textBadge>`
                });
                result.actor.forEach(function (a) {
                    actor+=`<text>${a.actor}</text>`
                });

                var index_show = "";
                if(result.media && result.media.episode_index && result.media.episode_index.index_show){
                    index_show = result.media.episode_index.index_show
                }

                page.xml = `<document>
    <productTemplate>
        <background>
        </background>
        <banner>
            <infoList>
                <info>
                    <header>
                        <title>Actor</title>
                    </header>
                    ${actor};
                </info>
            </infoList>
            <stack>
                <title>${result.bangumi_title}</title>
                <row>
                    <text>${result.pub_time}</text>
                    <text>${index_show}</text>
                    ${tags}
                </row>
                <description id="description_more" allowsZooming="true" moreLabel="more">${result.evaluate}
                ${result.staff}</description>
                <row>
                    <buttonLockup id="play_button">
                        <badge src="resource://button-preview" />
                        <title>播放</title>
                    </buttonLockup>
                </row>
            </stack>
            <heroImg src="${result.cover}" />
        </banner>
        <shelf>
            <header>
                <title>剧集</title>
            </header>
            <prototypes>
                <lockup prototype="bangumi">
                    <img binding="@src:{cover};" width="300" height="187"/>
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
            </prototypes>
            <section id="bangumi" binding="items:{bangumi};" />
        </shelf>
        <shelf>
            <header>
                <title>承包榜 7日</title>
            </header>
            <prototypes>
                <lockup prototype="tuhao" style="border-radius: circle;">
                    <img style="border-radius: circle;" binding="@src:{cover};" width="150" height="150"/>
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
            </prototypes>
            <section id="tuhao" binding="items:{tuhao};" />
        </shelf>
        <shelf>
            <header>
                <title>更多推荐</title>
            </header>
            <prototypes>
                <lockup prototype="moreVideo">
                    <img binding="@src:{cover};" width="250" height="333"/>
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
            </prototypes>
            <section id="moreVideo" binding="items:{moreVideo};" />
        </shelf>
        <shelf>
            <header>
                <title>相关视频</title>
            </header>
            <prototypes>
                <lockup prototype="tagVideo">
                    <img binding="@src:{cover};" width="300" height="187"/>
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
            </prototypes>
            <section id="tagVideo" binding="items:{tagVideo};" />
        </shelf>
    </productTemplate>
</document>`;

                page.view.getElementById("description_more").addEventListener("select",function (e) {
                    let desc = tvOS.template.descriptiveAlert([result.bangumi_title,result.jp_title],'',`${index_show}\r\n\r\n${result.evaluate}\r\n\r\n${result.staff}`);
                    // desc.background = result.cover;
                    desc.presentModal();
                    // tvOS.template.compilation(result.bangumi_title,result.jp_title,`${result.evaluate}\r\n${result.staff}`).display();
                });
                page.view.getElementById("play_button").addEventListener("select",function (e) {
                    playDMAV(result.episodes[0].av_id*1,result.episodes[0].page*1)
                });
                var bangumiSection = page.view.getElementById("bangumi")
                bangumiSection.dataItem = new DataItem();
                bangumiSection.dataItem.setPropertyPath("bangumi", result.episodes.map((av) => {
                    let objectItem = new DataItem('bangumi', av.av_id);
                    objectItem.cover = av.cover;
                    objectItem.title = av.index_title;
                    objectItem.description = `第${av.index}话`;
                    if(av.is_new){
                        objectItem.description = `NEW 第${av.index}话`;
                    }
                    objectItem.onselect = function (e) {
                        playDMAV(av.av_id*1,av.page*1)
                    };
                    return objectItem;
                }));



                page.display();



                //加载相关视频
                ajax.get("https://api.bilibili.com/x/tag/info?tag_name="+encodeURI(result.title),function (tagData) {
                    tagData = jsonParse(tagData);
                    console.log('tagData',tagData);
                    if(tagData.code == 0){
                        let tagId  = tagData.data.tag_id;
                        ajax.get(`https://api.bilibili.com/x/web-interface/tag/top?pn=1&ps=30&tid=${tagId}`,function (tagVideo) {
                            tagVideo = jsonParse(tagVideo);
                            console.log('tagVideo',tagVideo);
                            if(tagVideo.code == 0){
                                tagVideo = tagVideo.data;
                                var tagVideoSection = page.view.getElementById("tagVideo");
                                tagVideoSection.dataItem = new DataItem();
                                tagVideoSection.dataItem.setPropertyPath("tagVideo", tagVideo.map((av) => {
                                    let objectItem = new DataItem('tagVideo', av.aid);
                                    objectItem.cover = av.pic;
                                    objectItem.title = av.title;
                                    var up = '';
                                    if(av.owner && av.owner.name){
                                        up = av.owner.name;
                                    }

                                    objectItem.description = `UP:${up}  T:${av.tname}`;
                                    objectItem.onselect = function (e) {
                                        openVideo(av.aid*1);
                                    };
                                    objectItem.onholdselect = function (e) {
                                        openVideo(av.aid,true);
                                    };
                                    return objectItem;
                                }));
                            }
                        })
                    }
                })

                //加载土豪
                ajax.get(`https://bangumi.bilibili.com/sponsor/rankweb/get_sponsor_week_list?season_id=${sid}&pagesize=7`,function (tuhao) {
                    tuhao = jsonParse(tuhao);
                    if(tuhao.code == 0){
                        console.log("tuhao",tuhao);
                        tuhao = tuhao.result;
                        var tuhaoList = tuhao.list;

                        var tuhaoSection = page.view.getElementById("tuhao");
                        tuhaoSection.dataItem = new DataItem();
                        tuhaoSection.dataItem.setPropertyPath("tuhao", tuhaoList.map((tuhao) => {
                            let objectItem = new DataItem('tuhao', tuhao.uid);
                            objectItem.cover = tuhao.face;
                            objectItem.title = tuhao.uname;
                            objectItem.onselect = function (e) {
                                openUser(tuhao.uid);
                            };
                            return objectItem;
                        }));
                    }
                })
                //加载更多推荐
                ajax.get(`https://bangumi.bilibili.com/web_api/season/recommend/${sid}.json`,function (more) {
                    more = jsonParse(more);
                    if(more.code == 0){
                        // console.log("tuhao",more);
                        more = more.result.list;
                        var moreSection = page.view.getElementById("moreVideo");
                        moreSection.dataItem = new DataItem();
                        moreSection.dataItem.setPropertyPath("moreVideo", more.map((video) => {
                            let objectItem = new DataItem('moreVideo', video.season_id);
                            objectItem.cover = video.cover;
                            objectItem.title = video.title;
                            objectItem.onselect = function (e) {
                                openBangumi(video.season_id);
                            };
                            return objectItem;
                        }));
                    }
                })

            }
        }
        eval(data);
    })
}
function openVideoList(title,pageProcessing,prototypes='') {
    if(!prototypes)prototypes = `<lockup prototype="video">
    <img binding="@src:{cover};" width="200" height="300"/>
    <title binding="textContent:{title};" />
    <description  binding="textContent:{description};" style="font-size: 30;color:#fff" />
</lockup>`;
    var listView = tvOS.template.custom(`<document>
   <stackTemplate>
      <banner>
         <title>${title}</title>
      </banner>
      <collectionList>
         <grid>
            <prototypes>
                ${prototypes}
            </prototypes>
            <section id="video" binding="items:{video};" />
         </grid>
      </collectionList>
   </stackTemplate>
</document>`);
    var section = listView.view.getElementById("video");
    test.section = section;

    var loding = tvOS.template.loading(title+",加载中...");
    loding.display();

    section.dataItem = new DataItem();
    var dataItems = [];


    var nowPage = 0;
    var end = false;

    function getNextPage() {
        nowPage++;
        pageProcessing(nowPage,function (list) {
            if(list){
                list.forEach(function (v) {
                    dataItems.push(v);
                });
                section.dataItem.setPropertyPath("video",dataItems);
            }else{
                end = true;
            }
        });
        if(loding){
            loding.replaceDocument(listView)
            loding = null;
        }
    }
    getNextPage();
}





function openVideo(aid,notAutoPlay=0) {
    var loading = tvOS.template.loading(`加载 AV${aid}`);
    loading.display();
    getAvData(aid,1,function (data) {
        var video = data;
        if(notAutoPlay==0 && data.part.length == 1){
            loading.removeDocument();
            playDMAV(data.aid,1,data);
            return;
        }
        var page = tvOS.template.custom(`<document>
    <productTemplate>
        <background>
        </background>
        <banner>
            <infoList>
                <info>
                    <header>
                        <title>UP主</title>
                    </header>
                    <text>AAAAAA</text>
                </info>
                <info>
                    <header>
                        <title>播放量</title>
                    </header>
                    <text>BBBBBB</text>
                </info>
                <info>
                    <header>
                        <title>上传时间</title>
                    </header>
                    <text>BBBBBB</text>
                </info>
            </infoList>
            <stack>
                <title>${data.wb_title}</title>
                <!--<row>-->
                    <!--<text>UP主：</text>-->
                <!--</row>-->
                <description id="description_more" allowsZooming="true" moreLabel="more">${data.wb_desc}</description>
                <row>
                    <buttonLockup id="play_button">
                        <badge src="resource://button-preview" />
                        <title>播放</title>
                    </buttonLockup>
                    <buttonLockup id="play_button">
                        <badge src="${data.cardrich.face}" />
                        <title>${data.cardrich.name}</title>
                    </buttonLockup>
                </row>
            </stack>
            <heroImg src="${data.wb_img}" />
        </banner>
        <shelf>
            <header>
                <title>剧集</title>
            </header>
            <prototypes>
                <lockup prototype="video">
                    <img binding="@src:{cover};" width="300" height="187"/>
                    <title style="font-size: 30;" binding="textContent:{title};" />
                    <description binding="textContent:{description};" style="text-align: center;font-size: 25;color:#fff" />
                </lockup>
            </prototypes>
            <section id="video" binding="items:{video};" />
        </shelf>
    </productTemplate>
</document>`);
        var section = page.view.getElementById("video")
        section.dataItem = new DataItem();
        section.dataItem.setPropertyPath("video", data.part.map((p) => {
            let objectItem = new DataItem('video', p.page);
            objectItem.cover = video.wb_img;
            objectItem.title = p.name;
            objectItem.description = `P${p.page}`;
            objectItem.onselect = function (e){
                playDMAV(data.aid,p.page)
            };
            return objectItem;
        }));
        loading.replaceDocument(page);
    });
}

function initBar(){
    var bar = tvOS.template.menuBar([
        tvOS.element.menuItem('我的',function (e,menuItem) {
            if(!menuItem.hasDocument){
                myHome(function (v) {
                    menuItem.setDocument(v);
                });
            }
        }),
        tvOS.element.menuItem('追番',function (e,menuItem) {
            if(!menuItem.hasDocument){
                timeline(function (v) {
                    menuItem.setDocument(v);
                });
            }
        }),
        // tvOS.element.menuItem('热门',function (e,menuItem) {
        //     if(!menuItem.hasDocument){
        //         // openBangumi();
        //     }
        // }),
        // tvOS.element.menuItem('分区',function (e,menuItem) {
        //     // menuItem.setDocument(testView('22222'));
        // }),
        tvOS.element.menuItem('搜索',function (e,menuItem) {
            if(!menuItem.hasDocument){
                openSearchView(function (v){
                    menuItem.setDocument(v);
                });
            }
        })
    ]);
    var barView = bar.view;
    bar.display(barView);
}
function testView(testInfo){
    let button = new tvOS.element.button('测试',function () {
        // var alert3 = new tvOS.template.alert('333333'||'测试标题',['描述1','description2'],[button,button2],['footTexts1','footTexts2']);
        // alert3.presentModal();


    });
    let button2 = new tvOS.element.button('测试',function () {
        console.warn('测试按钮2')
    });
    var alert = new tvOS.template.alert(testInfo||'测试标题',['描述1','description2'],[button,button2],['footTexts1','footTexts2']);
    return alert;
}
function playDMAV(id=14356253,page=1,data=null) {
    var _play = function (data,page) {
        let part = data.part[page-1];
        if(part){
            // let timeMap = [];
            var video_url = '';

            if(part.playData.durl.length>1){
                part.playData.durl.forEach(function (durl) {
                    if(video_url)video_url+=";";
                    video_url += `%${durl.length/1000}%${durl.url}`;
                });
                video_url = 'edl://'+video_url;
            }else{
                video_url = part.playData.durl[0].url;
            }


            let videoList = new DMPlaylist();
            let video = new DMMediaItem('video', video_url);
            video.url = video_url;
            video.artworkImageURL = data.wb_img;
            video.options = {headers:{
                "User-Agent": ua,
                "referer": data.wb_full_url
            }};
            video.title = `P${part.page}:${part.name} - ${data.wb_desc}`;
            video.description = data.wb_summary;
            videoList.push(video);
            console.log(videoList);
            if(nowPlayer)nowPlayer.stop();
            let myPlayer = new DMPlayer();
            nowPlayer = myPlayer;
            console.log(myPlayer);
            myPlayer.playlist = videoList;
            // myPlayer.addEventListener('timeBoundaryDidCross', (listener, extraInfo) => {
            //     console.log("bound: " + listener.boundary);
            // }, {});

            // myPlayer.addEventListener('timeDidChange', function(listener,extraInfo) {
            //     console.log("time: " + listener.time);
            // },{interval: 1});
            // myPlayer.addEventListener('stateDidChange', function(listener, extraInfo) {
            //     console.log("state: " + listener.state);
            // },{});
            // myPlayer.addDanMu(msg="This is a test", color=0xFF0000, fontSize=25, style=0);
            myPlayer.play()
        }
    }
    if(data && data.part && data.part[page-1] && data.part[page-1].playData){
        _play(data,page);
        return;
    }

    getAvData(id,page,function (data) {
        setTimeout(function () {
            console.log(data);
            _play(data,page);
        },1)
    });

}







App.onError = function (message, sourceURL, line){
    // console.log(message, sourceURL, line);
    displayError("发生错误",`${message}\r\n\r\n${sourceURL} : ${line}`);
};






evaluateScripts([tvBaseURL+'/tvOS2.js'], function (success) {
    if(success){
        // let view = new videoList();
        //
        // view.title = 1010;
        // view.pageDataProxy.list.push("aaa");
        // view.display();
        //
        //
        // test.newVideo = function (title="title1") {
        //     let d = new DataItem("video",UUID());
        //     d.cover = "https://avatars0.githubusercontent.com/u/5716100";
        //     d.title = title;
        //     d.description = "";
        //     return d;
        // };
        //
        // test.list = [
        //     test.newVideo("ceshi")
        // ];
        //
        // let view = new videoList("title111",test.list);
        //
        //
        // test.add = function () {
        //     view.list.push(test.newVideo(UUID()));
        // };
        //
        // // test.section.dataItem.touchPropertyPath
        //
        // // view.dataItem.title = "测试标题3";
        //
        // view.display();

        initBar();
    }else{
        displayError("加载外部JS文件出现错误!",tvBaseURL+'/tvOS2.js');
    }
});
