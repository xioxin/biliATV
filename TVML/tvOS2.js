var a;
class tvOS_identification{
    constructor() {
        this.uuid = UUID();
    }
}

class tvOS_view extends tvOS_identification{
    constructor() {
        super();
        this.event = {};
        this.element = {};
        this.parsed =null;
    }
    get xml(){
        return '<document></document>';
    }
    get view(){
        if(this.parsed){
            return this.parsed;
        }
        if (!tvOS.parser) {
            tvOS.parser = new DOMParser()
        }
        var parser = tvOS.parser;
        // console.log(this.xml);
        var parsed = parser.parseFromString(this.xml.replace(new RegExp('&', 'g'), '&amp;'), "application/xml");
        this.eventBinding(parsed);
        this.parsed = parsed;
        return parsed;
    }
    eventBinding(parsed){
        var event = this.event;
        var element = this.element;
        if(this.event['select']){
            parsed.addEventListener('select', function (e) {
                var uuid = e.target.getAttribute('data-identifier-uuid');
                if(event['select'][uuid]){
                    element[uuid].event = e;
                    event['select'][uuid](e,element[uuid]);
                }
            })
        }
        /*case change
case highlight
case holdSelect
case play
case select*/
        let autoDataItemEvent = ['change','select','highlight','play','holdselect'];
        autoDataItemEvent.forEach(function (key) {
            parsed.addEventListener(key, function (e) {
                if(e.target && e.target.dataItem){
                    if(e.target.dataItem["on"+key]){
                        e.target.dataItem["on"+key](e);
                    }
                }
            });
        })
    }
    addEvent(type,uuid,handle,element){
        if(!handle)return;
        if(!this.event[type]){
            this.event[type] = {};
        }
        this.element[uuid] = element;
        this.event[type][uuid] = handle;
    }
    display(view=false){
        navigationDocument.pushDocument(view||this.view);
    }
    replaceDocument(newView){
        navigationDocument.replaceDocument(newView.view, this.view);
    }
    dismissModal(){
        navigationDocument.
            dismissModal();
    }
    presentModal(view=false){
        navigationDocument.presentModal(view||this.view);
    }
    removeDocument(view){
        try{
            navigationDocument.removeDocument(view||this.view);
        }catch(error){
            console.warn(error);
        }
    }
}
class tvOS_element extends tvOS_identification{
    constructor(){
        super();
    }
    push(element){
        if(!this.children){
            console.error('父元素无法放入子元素');
            return;
        }
        if(!this.element){
            console.error('子元素无法放入父元素 因为子元素没有名字');
        }
        if(this.allowChildElement && Array.isArray(this.allowChildElement) && this.indexOf(element)!=-1){
            this.children.push(element);
        }else{
            console.error('白名单不允许嵌套');
        }
    }
}

class tvOS_element_button extends tvOS_element{
    constructor(text="",onSelect=null){
        super();
        this.text = text;
        this.onSelect = onSelect;
        this.elementName = 'button';
        this.allowChildElement = ['text'];
        this.allowParentElement = [
            'alertTemplate',
            'banner',
            'descriptiveAlertTemplate',
            'footer',
            'row',
            'separator',
        ];
    }
    get xml(){
        return `<button data-identifier-uuid="${this.uuid}"><text>${this.text}</text></button>`
    }
}

class tvOS_element_buttonLockup extends tvOS_element{
    constructor(text="",badge="",onSelect=null){
        super();
        this.text = text;
        this.badge = badge;
        this.onSelect = onSelect;
    }
    get xml(){
        var temp = "";
        if(this.badge)temp+=`<badge src="${this.badge}"/>`;
        if(this.text)temp+=`<text>${this.text}</text>`;
        return `<buttonLockup data-identifier-uuid="${this.uuid}">${temp}</buttonLockup>`
    }
}


class tvOS_element_menuItem extends tvOS_element{
    constructor(text="",onSelect=null){
        super();
        this.text = text;
        this.onSelect = onSelect;
        this.id = '';
        this.dataIdentifier = '';
        this.hasDocument = false;
    }
    get xml(){
        return `<menuItem id="${this.id}" data-identifier="${this.dataIdentifier}" data-identifier-uuid="${this.uuid}"><title>${this.text}</title></menuItem>`
    }
    get menuItemDocument(){
        return this.event.target.parentNode.getFeature("MenuBarDocument");
    }
    setDocument(view){
        if(!this.event){
            return;
        }
        var menuItemDocument = this.menuItemDocument;
        // console.error('menuItemDocument',menuItemDocument.getDocument());
        test.menuItemDocument = menuItemDocument;
        if(menuItemDocument)menuItemDocument.setDocument(view.view, this.event.target);
        this.hasDocument = true;
    }
}
class tvOS_element_listItemLockup extends tvOS_element{
    constructor(ordinal="",title="",decorationLabel="",onSelect=null){
        super();
        this.ordinal = ordinal;
        this.minLength = 2;
        this.onSelect = onSelect;
        this.title = title;
        this.decorationLabel = decorationLabel;
    }
    get xml(){
        var temp = "";
        if(this.ordinal)temp+=`<ordinal minLength="2">${this.ordinal}</ordinal>`
        if(this.title)temp+=`<title>${this.title}</title>`
        if(this.decorationLabel)temp+=`<decorationLabel>${this.decorationLabel}</decorationLabel>`
        return `<listItemLockup data-identifier-uuid="${this.uuid}">${temp}</listItemLockup>`
    }
}

function ArrayTemplateHelper(data,Handle) {
    var temp = '';
    if(data)if(Array.isArray(data)){
        data.forEach(function (d) {
            temp+=Handle(d);
        })
    }else{
        temp+=Handle(data);
    }
    return temp;
}


class tvOS_template_alert extends tvOS_view {
    constructor(title = "", description = "", button = [], footText = []) {
        super();
        this.title       = title;
        this.description = description;
        this.button      = button;
        this.background  = '';
        this.footText    = footText;
    }

    get xml() {
        var temp = '';
        if (this.background) temp += `<background><img src="${this.background}" /></background>`;
        temp += ArrayTemplateHelper(this.title, (data) => `<title>${data}</title>`);
        temp += ArrayTemplateHelper(this.description, (data) => `<description>${data}</description>`);
        temp += ArrayTemplateHelper(this.button, (button) => {
            if (button) {
                this.addEvent('select', button.uuid, button.onSelect,button);
                return button.xml;
            }
            return '';
        });
        temp += ArrayTemplateHelper(this.footText, (text) => `<text>${text}</text>`);
        return `<document><alertTemplate>${temp}</alertTemplate></document>`
    }

    addButton(button) {
        this.buttons.push(button);
    }

    setTitle(button) {
        this.buttons.push(button);
    }
}
class tvOS_template_descriptiveAlert extends tvOS_view {
    constructor(title = "", image="", description = "", button = [], footText = [],buttonRot=true) {
        super();
        this.title       = title;
        this.description = description;
        this.image = image;
        this.imageWith = 500;
        this.imageHeight = 500
        this.button      = button;
        this.background  = '';
        this.footText    = footText;
        this.buttonRot = buttonRot;
        this.imageAfter = '';
    }

    get xml() {
        var temp = '';
        var background = "";

        if (this.background) background = `<background><img src="${this.background}" /></background>`;
        var title = ArrayTemplateHelper(this.title, (data) => `<title>${data}</title>`);
        var description = ArrayTemplateHelper(this.description, (data) => `<description>${data}</description>`);
        var buttons = ArrayTemplateHelper(this.button, (button) => {
            if (button) {
                this.addEvent('select', button.uuid, button.onSelect,button);
                return button.xml;
            }
            return '';
        });
        var img = ArrayTemplateHelper(this.image, (data) => `<img src="${data}" width="${this.imageWith}" height="${this.imageHeight}" />`);
        if(this.buttonRot)buttons = `<row>${buttons}</row>`;
        var footText = ArrayTemplateHelper(this.footText, (text) => `<text>${text}</text>`);
        return `<document><descriptiveAlertTemplate>
${background}
${title}
${img}
${this.imageAfter}
${description}
${temp}
${buttons}
${footText}
</descriptiveAlertTemplate></document>`
    }

    addButton(button) {
        this.buttons.push(button);
    }

    setTitle(button) {
        this.buttons.push(button);
    }
}

class tvOS_template_menuBar extends tvOS_view{
    constructor(menuItems = []) {
        super();
        this.menuItems = menuItems;
    }
    get xml() {
        var temp = '';
        temp += ArrayTemplateHelper(this.menuItems, (menuItem) => {
            if (menuItem) {
                this.addEvent('select', menuItem.uuid, menuItem.onSelect,menuItem);
                return menuItem.xml;
            }
            return '';
        });
        return `<document><menuBarTemplate><menuBar>${temp}</menuBar></menuBarTemplate></document>`;
    }
    get view(){
        var parsed = super.view;
        this.MenuBarDocument = parsed.getElementsByTagName('menuBar').item(0).getFeature("MenuBarDocument");
        // test.b = this.MenuBarDocument;

        return parsed;
    }

    getDocument(){
        return this.MenuBarDocument.getDocument();
    }
    getSelectedItem(){
        return this.MenuBarDocument.getSelectedItem();
    }
    setDocument(view){
        return this.MenuBarDocument.setDocument(view.view);
    }
    setSelectedItem(menuItem){
        return this.MenuBarDocument.setSelectedItem(menuItem);
    }

}
class tvOS_template_loading extends tvOS_view{
    constructor(title = '') {
        super();
        this.title = title;
    }
    get xml() {
        return `<document><loadingTemplate><activityIndicator><title>${this.title}</title></activityIndicator></loadingTemplate></document>`;
    }

}

class tvOS_template_compilation extends tvOS_view{
    constructor(title='',subtitle='',description='',heroImg='',buttons=[],listItemLockup=[]) {
        super();
        this.background  = '';
        this.title = title;
        this.subtitle = subtitle;
        this.headerRow = '';
        this.description = description;
        this.theme = '';//light
        this.heroImg =heroImg;
        this.buttons = buttons;
        this.listItemLockup = listItemLockup;
        this.customHeader = "";
        this.customHeaderInAfter = "";
        this.customHeaderAfter = "";
    }
    get xml() {

        var head = "";
        if(this.customHeader){
            head = this.customHeader;
        }else{
            if(this.title)head+=`<title>${this.title}</title>`;
            if(this.subtitle)head+=`<subtitle>${this.subtitle}</subtitle>`;

            if(this.headerRow) {
                head+= "<row>"+ArrayTemplateHelper(this.headerRow, (item) => `<text>${item}</text>`)+"</row>";
            }
            if(this.customHeaderInAfter){
                head+=this.customHeaderInAfter;
            }

        }
        head = `<header>${head}</header>`;

        var section1 = "";

        if(this.description)section1+=`<section><description>${this.description}</description></section>`;

        var listItemLockup= '';

        listItemLockup += ArrayTemplateHelper(this.listItemLockup, (item) => {
            if (item) {
                this.addEvent('select', item.uuid, item.onSelect,item);
                return item.xml;
            }
            return '';
        });


        var buttonLockup = "";

        buttonLockup += ArrayTemplateHelper(this.buttons, (item) => {
            if (item) {
                this.addEvent('select', item.uuid, item.onSelect,item);
                return item.xml;
            }
            return '';
        });

        /*
        * <buttonLockup>
                     <badge src="resource://button-add"/>
                     <title>Add</title>
                  </buttonLockup>*/

        return `<document>
   <compilationTemplate theme="${this.theme}">
      <list>
         <relatedContent>
            <itemBanner>
               <heroImg src="${this.heroImg}" />
               <row>
                    ${buttonLockup}
               </row>
            </itemBanner>
         </relatedContent>
         ${head}
         ${this.customHeaderAfter}
         ${section1}
         <section>
            ${listItemLockup}
         </section>
      </list>
   </compilationTemplate>
</document>
`;
    }

}

class tvOS_template_custom extends tvOS_view{
    constructor(xml="") {
        super();
        this.customXml = xml;
    }
    get xml() {
        return this.customXml;
    }
    set xml(xml){
        this.customXml = xml;
    }
    buttonSelect(callback){
        let uuid = UUID();
        this.addEvent('select', uuid, callback,{});
        return uuid;
    }
}




class videoList extends tvOS_view{
    constructor(title="",list = []) {
        super();
        this.pageData = {
            title:title,
            list:list,
        };
        this.list = list;


this.prototypes = `<lockup prototype="video">
    <img binding="@src:{cover};" width="200" height="300"/>
    <title binding="textContent:{title};" />
    <description  binding="textContent:{description};" style="font-size: 30;color:#fff" />
</lockup>`;
    }
    get title(){
        return this.pageData.title;
    }
    set title(title){
        this.pageData.title = title;
        if(this.parsed)this.parsed.getElementsByTagName("title").item(0).textContent = title;
    }
    set list(list){
        var $this = this;
        this.pageData.list = list;
        this.listProxy = new Proxy(this.pageData.list, {
            set: function (target, key, value, receiver) {
                if(key!="length"){
                    // console.log("set ",key);
                    if($this.section&&$this.section.dataItem)$this.section.dataItem.touchPropertyPath("video");
                }
                return Reflect.set(target, key, value, receiver);
            }
        });
    }
    get list(){
        return this.listProxy;
    }
    get view(){
        let parsed = super.view;
        if(!this.section){
            this.section = parsed.getElementsByTagName("section").item(0);
            this.section.dataItem = new DataItem();
            this.section.dataItem.setPropertyPath("video",this.pageData.list);
        }
        return parsed;
    }
    get xml() {
        return `<document>
   <stackTemplate>
      <banner>
         <title>${this.title}</title>
      </banner>
      <collectionList>
         <grid>
            <prototypes>
                ${this.prototypes}
            </prototypes>
            <section id="video" binding="items:{video};" />
         </grid>
      </collectionList>
   </stackTemplate>
</document>`;
    }

}






var tvOS = {
    template : {
        alert:function (title="",description="",button=[],footText=[]) {
            return new tvOS_template_alert(title,description,button,footText);
        },
        menuBar:function (menuItems=[]) {
            return new tvOS_template_menuBar(menuItems);
        },
        descriptiveAlert:function (title = "", image="", description = "", button = [], footText = [],buttonRot=true) {
            return new tvOS_template_descriptiveAlert(title,image, description, button, footText,buttonRot);
        },
        loading:function (title = "") {
            return new tvOS_template_loading(title);
        },
        compilation:function (title='',subtitle='',description='',heroImg='',buttons=[],listItemLockup=[]) {
            return new tvOS_template_compilation(title,subtitle,description,heroImg,buttons,listItemLockup);
        },
        custom:function (xml="") {
            return new tvOS_template_custom(xml);
        }
    },
    element : {
        button : function (text='',onSelect) {
            return new tvOS_element_button(text,onSelect);
        },
        menuItem:function (text,onSelect) {
            return new tvOS_element_menuItem(text,onSelect);
        },
        buttonLockup:function (text="",badge="",onSelect=null) {
            return new tvOS_element_buttonLockup(text,badge,onSelect)
        },
        listItemLockup:function (ordinal="",title="",decorationLabel="",onSelect=null) {
            return new tvOS_element_listItemLockup(ordinal,title,decorationLabel,onSelect)
        }
    }
};

var xh;
function ajax (url, method,data, callback) {
    console.log('ajax',url,method,data,callback);
    if (typeof method === 'undefined') {
        method = 'GET'
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(method, url, false);
    xmlhttp.onreadystatechange = function () {
        // If readyState = 4 (done) then.
        if (xmlhttp.readyState === 4) {
            // If status is 200 (Found)
            if (xmlhttp.status === 200) {
                // If type of callback is none
                if (typeof callback === 'undefined') {
                    return xmlhttp.responseText
                } else { // Or function
                    xh = xmlhttp
                    // console.warn(xmlhttp);
                    callback(xmlhttp.responseText)
                }
            } else {
                console.warn('http err',xmlhttp.status,xmlhttp.response);
                return false
            }
        }
    };
    var postData = "";

    for(var i in data){
        if(postData)postData+='&'
        postData+=`${i}=${encodeURIComponent(data[i])}`;
    }

    if(method == "GET"){
        postData = '';
    }else{
        xmlhttp.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
    }
    xmlhttp.setRequestHeader("Referer","https://www.bilibili.com/");
    xmlhttp.setRequestHeader("X-Requested-With" , "XMLHttpRequest");
    xmlhttp.setRequestHeader("User-Agent" , "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.9 Safari/537.36");

    // console.log(postData);
    xmlhttp.send(postData);
}
ajax.post = function (url, data, callback) {
    ajax(url,"POST",data,callback);
}
ajax.get = function (url, callback) {
    ajax(url, "GET", {}, callback);
};

function autoUrl2Https(url) {
    if(!url)return "";
    if(url.substr(0,2) == "//"){
        return "https:"+url;
    }
    return url;
}


function toTime(time) {
    var a = parseInt(time/60);
    var b = parseInt(time%60);
    if(a<10){a='0'+a};
    if(b<10){b='0'+b};

    return `${a}:${b}`;
}