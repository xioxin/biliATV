
import UIKit
import AVKit
import TVMLKit
import AVFoundation

class biliModel{
    
    var playUrlData = Dictionary<String, biliPlayDataModel>()
    var videoData = Dictionary<String, biliVideoModel>()
//    var seasonList = Dictionary<String, Any>()
    var biliCardrich = Dictionary<String, biliCardrichModel>()
//    var jsCallback = Dictionary<String,(String)->Void>();
    var videoDataCallback = Dictionary<String,(biliVideoModel)->Void>();
    
    var webView:UIWebView!

    init(_ thisWebView:UIWebView){
        webView = thisWebView;
    }
    
    func getAvData(_ aid:Int,page:Int,callback: @escaping (biliVideoModel)->Void){
        var pageIndex = page;
        if(pageIndex<1){ pageIndex = 1 }
        pageIndex = pageIndex - 1;
        
        if let video = videoData["\(aid)"] {
            if let _ = video.part[pageIndex].playData{
                callback(video)
                return
            }
        }

        var href = "https://www.bilibili.com/video/av\(aid)/";
        self.videoDataCallback["\(aid)#\(page)"] = {
            (data) in
            self.videoDataCallback["\(aid)#\(page)"] = nil;
            callback(data);
        };
        
        if(page>1){
            href = href+"index_\(page).html"
        }
        let url = URL(string: href)
        let request = URLRequest.init(url: url!)
        DispatchQueue.main.async{
            self.webView?.loadRequest(request);
        }
    }
    
    
    
    public func webViewDidStartLoad(_ webView: UIWebView){
        print("webViewDidStartLoad🔥");
    }
    
    public func webViewDidFinishLoad(_ webview: UIWebView){
        
        if (webview.isLoading) {
            print("🈲️ 301");
            return;
        }
        
        var videoM = biliVideoModel()
        
        
        print("🔥webViewDidFinishLoad");
        print(webview.stringByEvaluatingJavaScript(from: "document.title") ?? "");
        
//        var thisVideData = Dictionary<String, Any>()
        
        //普通
        let aid = webview.stringByEvaluatingJavaScript(from: "window.aid") ?? "";
        let cid = webview.stringByEvaluatingJavaScript(from: "window.cid") ?? "";
        let mid = webview.stringByEvaluatingJavaScript(from: "window.mid") ?? "";
        
        videoM.aid = Int(aid) ?? 0
        videoM.mid = Int(mid) ?? 0
        
        
        let nowPage = webview.stringByEvaluatingJavaScript(from: "window.pageno") ?? "";
        
        videoM.pageno = Int(nowPage) ?? 0
        
    
        videoM.typeid = Int( webview.stringByEvaluatingJavaScript(from: "window.typeid") ?? "" ) ?? 0
        videoM.totalpage = Int( webview.stringByEvaluatingJavaScript(from: "window.totalpage") ?? "" ) ?? 0
        
        
        videoM.tid = Int(webview.stringByEvaluatingJavaScript(from: "window.tid") ?? "") ?? 0
        videoM.season_id = Int(webview.stringByEvaluatingJavaScript(from: "window.season_id") ?? "") ?? 0
        videoM.season_long_title = webview.stringByEvaluatingJavaScript(from: "window.season_long_title") ?? ""
        videoM.allow_bp = webview.stringByEvaluatingJavaScript(from: "window.allow_bp") ?? ""
        videoM.gift_id = webview.stringByEvaluatingJavaScript(from: "window.gift_id") ?? ""
        videoM.gift_url = webview.stringByEvaluatingJavaScript(from: "window.gift_url") ?? ""
        videoM.first_ep_id = webview.stringByEvaluatingJavaScript(from: "window.first_ep_id") ?? ""
        videoM.wb_url = webview.stringByEvaluatingJavaScript(from: "window.wb_url") ?? ""
        videoM.first_ep_id = webview.stringByEvaluatingJavaScript(from: "window.wb_full_url") ?? ""
 
        //通用
        videoM.wb_title = webview.stringByEvaluatingJavaScript(from: "window.wb_title") ?? ""
        videoM.wb_desc = webview.stringByEvaluatingJavaScript(from: "window.wb_desc") ?? ""
        videoM.wb_info = webview.stringByEvaluatingJavaScript(from: "window.wb_info") ?? ""
        videoM.wb_url = webview.stringByEvaluatingJavaScript(from: "window.wb_url") ?? ""
        videoM.wb_full_url = webview.stringByEvaluatingJavaScript(from: "window.wb_full_url") ?? ""
        videoM.wb_img = webview.stringByEvaluatingJavaScript(from: "window.wb_img") ?? ""
        videoM.wb_summary = webview.stringByEvaluatingJavaScript(from: "window.wb_summary") ?? ""
        
        if(biliCardrich[mid] != nil){
            videoM.cardrich = biliCardrich[mid]!
        }
        
        let videoPartString = webview.stringByEvaluatingJavaScript(from: "JSON.stringify(window.VideoPart.nodedata)");
        
        var videoPart:Array<Dictionary<String,Any>> = [];
        
        do{
            let _videoPart = try JSONSerialization.jsonObject(with: (videoPartString?.data(using: String.Encoding.utf8))!, options: .mutableContainers);
            
            if let _videoPartArray = _videoPart as? Array<Any>{
                for (index,value) in _videoPartArray.enumerated() {
                    //                    print("2");
                    if let _value = value as? Array<String>{
                        let cid = _value[2] as String;
                        
                        var p = biliPartModel()
                        p.page = index+1
                        p.name = _value[0]
                        p.href = _value[1]
                        p.cid = Int(_value[2]) ?? 0
                        
                        if(playUrlData[cid] != nil){
                            p.playData = playUrlData[cid];
                        }
                        videoM.part.append(p);
                    }
                }
            }
            
            if(videoM.part.count == 0){
                var p = biliPartModel()
                p.page = 1
                p.name = videoM.wb_title
                p.href = "/video/av\(aid)/index_\(1).html"
                p.cid = Int(cid) ?? 0
                if(playUrlData[cid] != nil){
                    p.playData = playUrlData[cid];
                }
                videoM.part.append(p);
            }
            
            
        }catch{
            print("Error: (videoPart)")
        }
        //        print("videoPart:");
        //        print(videoPart);
        
        if(videoM.aid != 0){
            videoData[aid] = videoM;
            print("成功");
            print(videoM);
            if(videoDataCallback["\(aid)#\(nowPage)"] != nil){
                //                if (!JSONSerialization.isValidJSONObject(thisVideData)) {
                //                    print("无法解析出JSONString");
                //                }
                //                let data : Data! = try? JSONSerialization.data(withJSONObject: thisVideData, options: []) as Data!
                //                let JSONString = String(data:data as Data,encoding: String.Encoding.utf8)
                videoDataCallback["\(aid)#\(nowPage)"]!(videoM)
            }
        }
        //防止网页中的视频资源加载 销毁播放器
        webview.stringByEvaluatingJavaScript(from: "window.player.destroy()");
    }
}


struct biliVideoModel {
    var aid:Int = 0
    var mid:Int = 0
    var pageno:Int = 0
    var typeid:Int = 0
    var totalpage:Int = 0;
    var tid = 0
    var season_id = 0
    var season_long_title = ""
    var allow_bp = ""
    var gift_id = ""
    var gift_url = ""
    var first_ep_id = ""
    var wb_title = ""
    var wb_desc = ""
    var wb_info = ""
    var wb_url = ""
    var wb_full_url = ""
    var wb_img = ""
    var wb_summary = ""
    var cardrich:biliCardrichModel = biliCardrichModel();
    var part = Array<biliPartModel>();
    var _dic: [String: Any] {
        
        var dic = Dictionary<String,Any>()
        dic["aid"] = aid
        dic["mid"] = mid
        dic["pageno"] = pageno
        dic["typeid"] = typeid
        dic["totalpage"] = totalpage
        dic["tid"] = tid
        dic["season_id"] = season_id
        dic["season_long_title"] = season_long_title
        dic["allow_bp"] = allow_bp
        dic["gift_id"] = gift_id
        dic["gift_url"] = gift_url
        dic["first_ep_id"] = first_ep_id
        dic["wb_title"] = wb_title
        dic["wb_desc"] = wb_desc
        dic["wb_info"] = wb_info
        dic["wb_url"] = wb_url
        dic["wb_full_url"] = wb_full_url
        dic["wb_img"] = wb_img
        dic["wb_summary"] = wb_summary
        dic["cardrich"] = cardrich._dic
        var _part = Array<Any>();
        for (index,p) in part.enumerated() {
            _part.append(p._dic)
        }
        dic["part"] = _part
        
        return dic
    }
    
}

struct biliCardrichModel{
    var mid = 0
    var name = ""
    var sex = ""
    var face = ""
    var fans = 0
    var sign = ""
    var _dic: [String: Any] {
        return [
            "mid":mid,
            "name":name,
            "sex":sex,
            "face":face,
            "fans":fans,
            "sign":sign
        ]
    }
}

struct biliPartModel{
    var page = 0
    var name = ""
    var href = ""
    var cid = 0
    var playData:biliPlayDataModel?
    
    var _dic: [String: Any] {
        var dic = Dictionary<String,Any>()
        dic["page"] = page
        dic["name"] = name
        dic["href"] = href
        dic["cid"] = cid
        
        if playData != nil {
            dic["playData"] = playData?._dic
        }
        
        return dic
    }
    
}


struct biliPlayDataModel {
    var cid = 0
    var from = ""
    var result = ""
    var format = ""
    var timelength = 0
    var accept_quality = Array<Int>();
    var durl = Array<biliDUrlModel>();
    var seek_param = ""
    var quality = 0
    var accept_format = ""
    var seek_type = ""
    
    var _dic: [String: Any] {
        
        var _durl = Array<Any>();
        for (_,d) in durl.enumerated(){
            _durl.append(d._dic)
        }
        
        return [
            "cid":cid,
            "from":from,
            "result":result,
            "format":format,
            "timelength":timelength,
            "accept_quality":accept_quality,
            "durl":_durl,
            "seek_param ":seek_param ,
            "quality":quality,
            "accept_format":accept_format,
            "seek_type":seek_type
        ]
    }
    
}

struct biliDUrlModel{
    var size = 0
    var backup_url = Array<String>()
    var order = 0
    var length = 0
    var url = ""
    
    var _dic: [String: Any] {
        return [
            "size":size,
            "backup_url":backup_url,
            "order":order,
            "length":length,
            "url":url
        ]
    }
    
}





class urlCacheHack : URLCache {
    
    var bili:biliModel!
    
    func setModel(_ _bili:biliModel) {
        bili = _bili
    }
    
    override func storeCachedResponse(_ cachedResponse: CachedURLResponse, for request: URLRequest) {
        
        let url = request.url?.absoluteString ?? ""
        
        //        print("🔗url:\(url)");
        
        var query = Dictionary<String,String>();
        let queryItems = URLComponents.init(string: url)?.queryItems
        if queryItems != nil  {
            for item in queryItems! {
                query[item.name] = item.value ?? ""
            }
        }
        
        
        if((url.range(of: "bilibili.com/playurl")) != nil){
            let cid = query["cid"] ?? ""
            var data = String.init(data: cachedResponse.data, encoding: String.Encoding.utf8)!;
            if((data.range(of: "callbackfunction(")) != nil){
                data = data.replacingOccurrences(of: "callbackfunction(", with: "", options: String.CompareOptions.literal, range: nil);
                //                data = data.remove(at: data.index(before: data.endIndex))
                data = data.substring(to: data.index(data.endIndex, offsetBy: -2));
                //                data = String.init(data.remove(at: data.index(before: data.endIndex)))
                
            }
      
            let jsonData = data.data(using: String.Encoding.utf8)!;
            do{
                let playDataRew = try JSONSerialization.jsonObject(with: jsonData, options: .mutableContainers)
                
                var playData = biliPlayDataModel()
                
                if let playDataD = playDataRew as? Dictionary<String,Any> {
                    
                    playData.cid = Int(cid) ?? 0;
                    playData.from   = playDataD["from"] as? String ?? ""
                    playData.result = playDataD["result"] as? String ?? ""
                    playData.format = playDataD["format"] as? String ?? ""
                    playData.timelength = playDataD["timelength"] as? Int ?? 0
                    playData.accept_quality = playDataD["timelength"] as? Array<Int> ?? Array<Int>();
//                    playData.durl = Array<DUrl>();
                    playData.seek_param = playDataD["seek_param"] as? String ?? ""
                    playData.quality = playDataD["quality"] as? Int ?? 0
                    playData.accept_format = playDataD["accept_format"] as? String ?? ""
                    playData.seek_type = playDataD["seek_type"] as? String ?? ""
                    
                    if let durls = playDataD["durl"] as? Array<Dictionary<String,Any>>{
                        for (index,d) in durls.enumerated() {
                            var durl = biliDUrlModel();
                            durl.size = d["size"] as? Int ?? 0
                            durl.backup_url = d["backup_url"] as? Array<String> ?? Array<String>()
                            durl.order = d["order"] as? Int ?? 0
                            durl.length = d["length"] as? Int ?? 0
                            durl.url = d["url"] as? String ?? ""
                            playData.durl.append(durl)
                        }
                    }
                }
                
                self.bili.playUrlData[cid] = playData
                
            }catch {
                print("Error: (playUrlData)")
            }
            
        }
        
//        if((url.range(of: "bilibili.com/web_api/get_ep_list")) != nil){
//            let season_id = query["season_id"] ?? ""
//            do{
//                bili.seasonList[season_id] = try JSONSerialization.jsonObject(with: cachedResponse.data, options: .mutableContainers)
//            }catch{
//                print("Error: (seasonList)")
//            }
//        }
        
        
        
        if((url.range(of: "api.bilibili.com/cardrich")) != nil){
            let mid = query["mid"] ?? ""
            let callback = query["callback"] ?? ""
            var data = String.init(data: cachedResponse.data, encoding: String.Encoding.utf8)!;
            
            if callback != ""{
                data = data.replacingOccurrences(of: callback+"(", with: "", options: String.CompareOptions.literal, range: nil);
                //data = String.init(data.remove(at: data.index(before: data.endIndex)))
                data = data.substring(to: data.index(data.endIndex, offsetBy: -2));
                //                print(data);
            }
            
            do{
                if let userCardrich = try JSONSerialization.jsonObject(with: data.data(using: String.Encoding.utf8)!, options: .mutableContainers) as? Dictionary<String,Any>{
                    if let _data = userCardrich["data"] as? Dictionary<String,Any>{
                        
                        if let card = _data["card"] as? Dictionary<String,Any>{
                            
                            var user = biliCardrichModel()
                            user.mid = card["mid"] as? Int ?? 0
                            user.name = card["name"] as? String ?? ""
                            user.sex = card["sex"] as? String ?? ""
                            user.face = card["face"] as? String ?? ""
                            user.sign = card["sign"] as? String ?? ""
                            user.fans = card["fans"] as? Int ?? 0
                            bili.biliCardrich[mid] = user;
                        }
                    }
                }
            }catch{
                print("Error: (userCardrich)")
            }
        }
    }
    
    
}
