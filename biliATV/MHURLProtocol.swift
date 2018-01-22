
import Foundation

class MHURLProtocol: URLProtocol {
    
    
    open override class func canInit(with request: URLRequest) -> Bool {
        
        //只修改 whitelist.js 这个文件
        if(request.url?.absoluteString.range(of: "/player/js/whitelist.js") != nil){
            return true
        }
        return false
    }
    
    
    open override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        return request
    }
    
    
    /// 开始加载时自动调用
    override func startLoading() {
        
        
        //从本地缓中读取数据
        let datas = """
console.log("quality hack");
            window.MediaSource=function(){
this.addEventListener = window.MediaSource.addEventListener;
this.isTypeSupported = window.MediaSource.isTypeSupported;
};
            window.MediaSource.addEventListener = function(){}
            window.MediaSource.isTypeSupported = function(){return !0};
window.REFERRER_LIST = [
];
"""
        let data = datas.data(using: String.Encoding.utf8)
        let mimeType = "application/javascript";
//        let encoding = cachedResponse.value(forKey: "encoding") as! String!
        
        //创建一个NSURLResponse 对象用来存储数据。
        let response = URLResponse(url: self.request.url!, mimeType: mimeType,
                                   expectedContentLength: data!.count,
                                   textEncodingName: "utf-8")
        
        //将数据返回到客户端。然后调用URLProtocolDidFinishLoading方法来结束加载。
        //（设置客户端的缓存存储策略.NotAllowed ，即让客户端做任何缓存的相关工作）
        self.client!.urlProtocol(self, didReceive: response,
                                 cacheStoragePolicy: .notAllowed)
        self.client!.urlProtocol(self, didLoad: data!)
        self.client!.urlProtocolDidFinishLoading(self)
        
    }
    
    
    override func stopLoading() {
//        connection?.cancel()
    }
    
    /// 获取最新数据
    private func loadRequest() {
//        var connectionRequest = request
//        connection = NSURLConnection(request: connectionRequest, delegate: self)
    }
    
    
    
}
