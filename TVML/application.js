var dom;
var test = {};
var videoTest = {};
var nowPlayer = null;

/*
*
* 动漫订阅
* https://space.bilibili.com/ajax/Bangumi/getList?mid=902845
*
* */

evaluateScripts([tvBaseURL+'/tvOS2.js'], function (success) {

    if (success) {



        function myHome(setDocument) {
            setDocument(tvOS.template.loading("加载中个人信息.."));
            ajax.get('https://api.bilibili.com/x/web-interface/nav',function (data) {
                console.warn(data);
                data = JSON.parse(data);
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
                    var userData = data.data;
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
        function openLogin(callback=function () {}) {

            ajax.get("https://passport.bilibili.com/qrcode/getLoginUrl",function (data) {
                data = JSON.parse(data);
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
                        data = JSON.parse(data);
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
            ajax.get("https://api.bilibili.com/x/web-feed/feed?ps=100",function (data) {
                data = JSON.parse(data);
                if(data.code==0){
                    data = data.data;

                    var buttons = '';
                    var listView = tvOS.template.custom('');

                    data.forEach(function (d) {

                        let uuid = listView.buttonSelect(function (e,data) {
                            console.log('d',d,e);
                            var aid = 0;
                            if(d.type == 0){
                                aid = d.archive.aid;
                                if(aid){
                                    //getBiliPlayURL("https://www.bilibili.com/video/av"+aid);
                                    openVideo(aid);
                                }
                            }else if(d.type == 1){
                                aid = d.bangumi.aid;
                            }


                            // https://bangumi.bilibili.com/anime/6427/play

                        });

                        if(d.type == 0){
                            buttons+=`<lockup data-identifier-uuid="${uuid}">
                  <img  src="${d.archive.pic}" width="300" height="200" />
                  <overlay style="margin:0px;padding:5px;" >
                                                        <text style="font-size:22px;tv-position:bottom-left;color: rgba(0, 0, 0, 0.9);"> ${d.archive.tname}</text>

        </overlay>
                  <title>${d.archive.title}</title>
                  <row>
                        <img style="border-radius: circle;" src="${d.archive.owner.face}" width="32" height="32" />
                        <text> ${d.archive.owner.name}</text>
                    </row>
               </lockup>`;
                        }else if(d.type == 1){
                            buttons+=`<lockup data-identifier-uuid="${uuid}">
                  <img src="${d.bangumi.cover}" width="300" height="200" />
                  <title>${d.bangumi.title}</title>
               </lockup>`;
                        }

                    })


                    var temp = `<document>
   <stackTemplate>
      <banner>
         <title>个人动态</title>
      </banner>
      <collectionList>
         <grid>
            <section>
               ${buttons}
            </section>
         </grid>
      </collectionList>
   </stackTemplate>
</document>
`;
                    listView.xml = (temp);
                    loading.replaceDocument(listView);

                }



            })


        }


        function timeline(setDocument) {
            setDocument(tvOS.template.loading("加载番剧信息..."));
            ajax.get('https://bangumi.bilibili.com/web_api/timeline_global',function (data) {
                data = JSON.parse(data);
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
                    dayShelf+=`<shelf id="day-${day.date}">
             <header><title>${day.is_today?"今天":day.date}  ${week[day.day_of_week]}</title></header>
             <prototypes>
                <lockup binding="@onSelect:{select};" prototype="bangumi">
                    <img binding="@src:{cover};" width="200" height="300"/>
                    <title binding="textContent:{title};" />
                    <description  binding="textContent:{description};" style="font-size: 30;color:#fff" />
                </lockup>
                <lockup binding="@onSelect:{select};" prototype="bangumi_published">
                    <img binding="@src:{cover};" width="200" height="300"/>
                    <title binding="textContent:{title};" style="color:#fb7299" />
                    <description  binding="textContent:{description};" style="font-size: 30;color:#fff" />
                </lockup>
                <lockup binding="@onSelect:{select};" prototype="bangumi_delay">
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
         <title>Available Action Movies</title>
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

                        objectItem.description = `${result.pub_index} ${result.pub_time}`;

                        objectItem.onselect = function (e) {
                            console.warn(e,result);
                            openBangumi(result.season_id);
                        };
                        return objectItem;
                    });
                    section.dataItem.setPropertyPath("timeline", newItems);

                });
                console.log('view',view.getElementsByTagName("shelf").item(6));
                test.s6 = view.getElementsByTagName("shelf").item(6);
                test.bb = view;
                setDocument(listView);
            });
        }
        
        function openBangumi(sid=6465) {
            //更多推荐
            //https://bangumi.bilibili.com/web_api/season/recommend/6465.json
            //https://bangumi.bilibili.com/jsonp/seasoninfo/6465.ver?callback=seasonListCallback&jsonp=jsonp&_=1511089954345
            ajax.get(`https://bangumi.bilibili.com/jsonp/seasoninfo/${sid}.ver?callback=seasonListCallback&jsonp=jsonp`,function (data) {
                function seasonListCallback(data) {
                    if(data.code == 0){
                        var result = data.result;
                        console.log(result);
                        var page = tvOS.template.custom('');
                        page.xml = `<document>
    <productTemplate>
        <background>
        </background>
        <banner>
            <infoList>
                <info>
                    <header>
                        <title>Director</title>
                    </header>
                    <text>John Appleseed</text>
                </info>
                <info>
                    <header>
                        <title>Actors</title>
                    </header>
                    <text>Anne Johnson</text>
                    <text>Tom Clark</text>
                    <text>Maria Ruiz</text>
                </info>
            </infoList>
            <stack>
                <title>WWDC Road Trip</title>
                <row>
                    <text><badge src="resource://tomato-fresh"/> 99%</text>
                    <text>1hr 54min</text>
                    <text>Comedy</text>
                    <text>2015</text>
                    <badge src="resource://mpaa-pg" class="badge" />
                    <badge src="resource://cc" class="badge" />
                </row>
                <description allowsZooming="true" moreLabel="more">An aspiring developer gets a ticket to WWDC, but can't afford to fly there. Now he needs to get across country in time for the keynote, and the only person who can help him is his slacker roommate.</description>
                <text>Language information can go here</text>
                <row>
                    <buttonLockup>
                        <badge src="resource://button-preview" />
                        <title>Preview</title>
                    </buttonLockup>
                    <buttonLockup type="buy">
                        <text>$9.99</text>
                        <title>Buy</title>
                    </buttonLockup>
                </row>
            </stack>
            <heroImg src="path to images on your server/Car_Movie_720x1080.png" />
        </banner>
        <shelf>
            <header>
                <title>Viewers Also Watched</title>
            </header>
            <section>
                <lockup>
                    <img src="path to images on your server/Car_Movie_250x375_A.png" width="150" height="226" />
                    <title>Turn</title>
                </lockup>
                <lockup>
                    <img src="path to images on your server/Car_Movie_250x375_B.png" width="150" height="226" />
                    <title>Road</title>
                </lockup>
                <lockup>
                    <img src="path to images on your server/Car_Movie_250x375_C.png" width="150" height="226" />
                    <title>Helicopter</title>
                </lockup>
            </section>
        </shelf>
        <shelf>
            <header>
                <title>Reviews & Ratings</title>
            </header>
            <section>
                <ratingCard>
                    <title>4.1 / 5</title>
                    <ratingBadge value="0.7"></ratingBadge>
                    <description>Average of 2,241 iTunes user ratings and reviews.</description>
                </ratingCard>
                <ratingCard>
                    <title><badge src="resource://tomato-fresh" /> 99%</title>
                    <text>Tomatometer</text>
                    <infoTable>
                        <info>
                            <header>
                                <title>175</title>
                            </header>
                            <text>Reviews</text>
                        </info>
                        <info>
                            <header>
                                <title>173</title>
                            </header>
                            <text>Fresh</text>
                        </info>
                        <info>
                            <header>
                                <title>2</title>
                            </header>
                            <text>Rotten</text>
                        </info>
                    </infoTable>
                </ratingCard>
                <reviewCard>
                    <badge src="resource://tomato-fresh-m" />
                    <title>WWDC Review</title>
                    <description>Brief review here</description>
                    <text>Ravi Patel June, 8 2015</text>
                </reviewCard>
            </section>
        </shelf>
        <shelf>
            <header>
                <title>Cast and Crew</title>
            </header>
            <section>
                <monogramLockup>
                    <monogram firstName="Anne" lastName="Johnson"/>
                    <title>Anne Johnson</title>
                    <subtitle>Actor</subtitle>
                </monogramLockup>
                <monogramLockup>
                    <monogram firstName="Tom" lastName="Clark"/>
                    <title>Tom Clark</title>
                    <subtitle>Actor</subtitle>
                </monogramLockup>
                <monogramLockup>
                    <monogram firstName="Maria" lastName="Ruiz"/>
                    <title>Maria Ruiz</title>
                    <subtitle>Actor</subtitle>
                </monogramLockup>
            </section>
        </shelf>
        <productInfo>
            <infoTable>
                <header>
                    <title>Information</title>
                </header>
                <info>
                    <header>
                        <title>Studio</title>
                    </header>
                    <text>Apple</text>
                </info>
                <info>
                    <header>
                        <title>Runtime</title>
                    </header>
                    <text>1:54</text>
                </info>
                <info>
                    <header>
                        <title>Format</title>
                    </header>
                    <text>Widescreen</text>
                </info>
            </infoTable>
            <infoTable>
                <header>
                    <title>Languages</title>
                </header>
                <info>
                    <header>
                        <title>Primary</title>
                    </header>
                    <text>English (Dolby 5.1), Subtitles, CC</text>
                </info>
                <info>
                    <header>
                        <title>Additional</title>
                    </header>
                    <text>Cantonese (Subtitles)</text>
                </info>
            </infoTable>
            <infoTable style="tv-line-spacing:10;">
                <header>
                    <title>Accessibility</title>
                </header>
                <info>
                    <header>
                        <textBadge>SDH</textBadge>
                    </header>
                    <text>Subtitles for the deaf and Hard of Hearing (SDH) refer to subtitles in the original lanuage with the addition of relevant non-dialog information.</text>
                </info>
            </infoTable>
        </productInfo>
    </productTemplate>
</document>`;
                        page.display();

                    }
                }
                eval(data);
            })
        }



        // test id 14356253
        function getVideoData(id=14356253,page=1,_callback=function (data) {}) {
            var loading = tvOS.template.loading(`加载 AV${id}`);
            loading.display();
            getAvData(id,page,function (data) {
                // var _data = JSON.parse(JSON.stringify(data)) ;
                setTimeout(function () {
                    _callback(data,loading);
                },1)
            });
            return loading
        }




        test.getVideoData = getVideoData;






        function openVideo(aid,type=0) {

            getVideoData(aid,1,function (data,loading) {

                videoTest[aid] = data;

                if(data.part.length == 1){
                    loading.removeDocument();
                    playDMAV(data.aid,1,data);
                    return;
                }

                console.warn(aid,data);
                var info = tvOS.template.custom();

                var buttons = "";
                data.part.forEach(function (p) {
                    let uuid = info.buttonSelect(function (e) {
                        playDMAV(data.aid,p.page);
                    });
                    buttons+=`<listItemLockup data-identifier-uuid="${uuid}">
            <ordinal style="tv-position:left;" minLength="4">P${p.page}</ordinal>
            <title>${p.name}</title>
            <!--<decorationLabel>${toTime(p.duration)}</decorationLabel>-->
            <relatedContent>
               <lockup>
                 <img src="${data.wb_img}" width="857" height="482" />
                 <title>${data.wb_title}</title>
                 <description>${data.wb_desc}</description>
              </lockup>
            </relatedContent>
         </listItemLockup>`;
                });
                info.xml = `<document>
<listTemplate>
   <banner>
               <title>${data.wb_title}</title>
   </banner>
   <list>
      <header>
                  <img src="${data.cardrich.face}" width="200" height="200" />
                  <title style="text-align: right;tv-text-style: title3;">${data.cardrich.name}</title>
      </header>
      <section>
         ${buttons}
      </section>
   </list>
</listTemplate>
</document>
`;
                loading.replaceDocument(info);



            });

        }

        test.openVideo = openVideo;
        test.open2 = function () {
            // getAvData(14356253,1,function(data){console.warn(data)})
            getVideoData(14356253,1,function (data) {
                console.warn(data)
            })
        };

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
            tvOS.element.menuItem('热门',function (e,menuItem) {
                if(!menuItem.hasDocument){
                    // openBangumi();
                }
            }),
            tvOS.element.menuItem('分区',function (e,menuItem) {
                menuItem.setDocument(testView('22222'));
            }),
            tvOS.element.menuItem('搜索',function (e,menuItem) {
                menuItem.setDocument(testView('22222'));
            })
        ]);
        var barView = bar.view;
        test.barView = barView;
        test.bar = bar;
        console.log(barView);
        bar.display(barView);

// new tvOS_template_stack().display();





        function testView (testInfo){
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





    } else {
        console.log('Missing it all!')
    }



});


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