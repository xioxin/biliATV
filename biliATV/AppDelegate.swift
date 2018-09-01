//
//  AppDelegate.swift
//  BiliATV
//

//  Copyright (c) 2017 xioxin. All rights reserved.
//

import UIKit
import AVKit
import TVMLKit
import AVFoundation

//import SGPlayer

var ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3260.2 Safari/537.36"

@UIApplicationMain
class AppDelegate: UIViewController, UIApplicationDelegate, TVApplicationControllerDelegate {
    
    var window: UIWindow?
    var appController: TVApplicationController?
//    var wProxy: webProxy!
//    var player:SGPlayer!

//    var vlc = VLCVideoView();
    
    
    
    
    
    var tvJsContext: JSContext!

    
    
    // tvBaseURL points to a server on your local machine. To create a local server for testing purposes, use the following command inside your project folder from the Terminal app: ruby -run -ehttpd . -p9001. See NSAppTransportSecurity for information on using a non-secure server.
//    static let tvBaseURL = "https://raw.githubusercontent.com/xioxin/biliATV/master/TVML"
//    static let tvBaseURL = "https://coding.net/u/xin/p/biliATV/git/raw/master/TVML"
    static let tvBaseURL = "https://raw.githubusercontent.com/xioxin/biliATV/dev/TVML"
    
    static let tvBootURL = "\(AppDelegate.tvBaseURL)/application.js"

    
//
//    static let tvBootURL = "\(AppDelegate.tvBaseURL)/application.js"
//

    // MARK: Javascript Execution Helper
    
    func executeRemoteMethod(_ methodName: String, completion: @escaping (Bool) -> Void) {
        
        
        appController?.evaluate(inJavaScriptContext: { (context: JSContext) in
            let appObject : JSValue = context.objectForKeyedSubscript("App")
            
            if appObject.hasProperty(methodName) {
                appObject.invokeMethod(methodName, withArguments: [])
            }
            }, completion: completion)
    }
    
    // MARK: UIApplicationDelegate
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        window = UIWindow(frame: UIScreen.main.bounds)

        
        var cookieProperties = [HTTPCookiePropertyKey: String]()
        cookieProperties[HTTPCookiePropertyKey.name] = "CURRENT_QUALITY" as String
        cookieProperties[HTTPCookiePropertyKey.value] = "80" as String
        cookieProperties[HTTPCookiePropertyKey.domain] = "bilibili.com" as String
        cookieProperties[HTTPCookiePropertyKey.path] = "/" as String
        
        let cookie = HTTPCookie(properties: cookieProperties)
        HTTPCookieStorage.shared.setCookie(cookie!)
        
        // Create the TVApplicationControllerContext for this application and set the properties that will be passed to the `App.onLaunch` function in JavaScript.
        let appControllerContext = TVApplicationControllerContext()

        // The JavaScript URL is used to create the JavaScript context for your TVMLKit application. Although it is possible to separate your JavaScript into separate files, to help reduce the launch time of your application we recommend creating minified and compressed version of this resource. This will allow for the resource to be retrieved and UI presented to the user quickly.
        

//        let homeDir = NSHomeDirectory()
//        print("=======");
//        print(homeDir);
//        URL.init(fileURLWithPath: <#T##String#>)
//        Bundle.main.
        
        if let javaScriptURL = URL(string: AppDelegate.tvBootURL) {
            appControllerContext.javaScriptApplicationURL = javaScriptURL
        }

        appControllerContext.launchOptions["BASEURL"] = AppDelegate.tvBaseURL as NSString

        if let launchOptions = launchOptions {
            for (kind, value) in launchOptions {
                appControllerContext.launchOptions[kind.rawValue] = value
            }
        }

        appController = TVApplicationController(context: appControllerContext, window: window, delegate: self)
        
        UserDefaults.standard.register(defaults: ["UserAgent": ua])
        UserDefaults.standard.synchronize()
        
//        wProxy = webProxy.init()
        
//        self.window!.addSubview(wProxy.webview)
        
        return true
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and stop playback
        executeRemoteMethod("onWillResignActive", completion: { (success: Bool) in
            // ...
        })
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
        executeRemoteMethod("onDidEnterBackground", completion: { (success: Bool) in
            // ...
        })
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
        executeRemoteMethod("onWillEnterForeground", completion: { (success: Bool) in
            // ...
        })
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        executeRemoteMethod("onDidBecomeActive", completion: { (success: Bool) in
            // ...
        })
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
        executeRemoteMethod("onWillTerminate", completion: { (success: Bool) in
            // ...
        })
    }
    
    // MARK: TVApplicationControllerDelegate
    
    func appController(_ appController: TVApplicationController, didFinishLaunching options: [String: Any]?) {
        print("\(#function) invoked with options: \(options ?? [:])")
    }
    
    func appController(_ appController: TVApplicationController, didFail error: Error) {
        print("\(#function) invoked with error: \(error)")
        
        let title = "Error Launching Application"
        let message = error.localizedDescription
        let alertController = UIAlertController(title: title, message: message, preferredStyle:.alert )
        
        self.appController?.navigationController.present(alertController, animated: true, completion: {
            // ...
        })
    }
    
    func appController(_ appController: TVApplicationController, didStop options: [String: Any]?) {
        print("\(#function) invoked with options: \(options ?? [:])")
    }
    
    
  
    
    //call this method once after setting up your appController.
    func appController(_ appController: TVApplicationController, evaluateAppJavaScriptIn jsContext: JSContext){
        self.tvJsContext = jsContext;
        //print("appController TVApplicationController")
 
//        DMPlayer
        DMPlayer.setup(jsContext, controller: appController.navigationController)
      
//        let getAvData : @convention(block) (Int,Int,JSValue ) -> Void = {
//            (aid : Int,page:Int, callback: JSValue ) -> Void in
        
            
////            self.Scallback = callback;
//            self.wProxy.bili.getAvData(aid,page: page){
//                    data in
//                let _data = data;
//                let dataDic = _data._dic;
//                callback.context.objectForKeyedSubscript("setTimeout").call(withArguments: [
//                    callback,0,dataDic])
//                }
//            }
//
        
        let saveUserCookie : @convention(block) () -> Void = {
            () -> Void in
            
            print("saveUserCookie");
            
            if let cookies: Array = HTTPCookieStorage.shared.cookies(for: NSURL(string: "https://www.bilibili.com")! as URL)
            {
                let data: Data = NSKeyedArchiver.archivedData(withRootObject: cookies)
                UserDefaults.standard.set(data, forKey: "UserCookie")
                
                print("cookie保存成功")
                
            }else{
                print("保存cookie信息失败")
            }
            
        }
        
        let getUserCookie : @convention(block) () -> Void = {
            () -> Void in
            
            print("getUserCookie2");
            
            if let cookiesdata:Data = UserDefaults.standard.object(forKey: "UserCookie") as? Data{
                if cookiesdata.count > 0 {
                    let cookies: Array<HTTPCookie> = NSKeyedUnarchiver.unarchiveObject(with: cookiesdata) as! Array<HTTPCookie>
                    if(cookies.count == 0){
                        print("getUserCookie 0条数据")
                    }
                    for cookie in cookies {
                        HTTPCookieStorage.shared.setCookie(cookie)
                        print("getUserCookie 已设置 \(cookie.name)")
                    }
                }else{
                    print("getUserCookie 数据长度为0")
                }
                
            }
            
            
        }
        
        
//
//
//
//         self.tvJsContext.setObject(unsafeBitCast(getAvData, to: AnyObject.self), forKeyedSubscript: "getAvData" as (NSCopying & NSObjectProtocol))
        self.tvJsContext.setObject(unsafeBitCast(saveUserCookie, to: AnyObject.self), forKeyedSubscript: "saveUserCookie" as (NSCopying & NSObjectProtocol))
        self.tvJsContext.setObject(unsafeBitCast(getUserCookie, to: AnyObject.self), forKeyedSubscript: "getUserCookie" as (NSCopying & NSObjectProtocol))
        
        
        
        self.tvJsContext.evaluateScript("var ua = '\(ua)';");
        self.tvJsContext.evaluateScript("var tvBaseURL = '\(AppDelegate.tvBaseURL)';");
//        self.tvJsContext.evaluateScript("run();");


    }
}
//
//@objc class webProxy: NSObject {
//    var webview:BILWebView!
//    var bili:biliModel!
//
//    override init() {
//        webview = BILWebView.init()
//
//        bili = biliModel(webview)
//        let cacheHack:urlCacheHack = urlCacheHack.init()
//        cacheHack.setModel(bili)
//        URLCache.shared = cacheHack
//
//        URLProtocol.registerClass(MHURLProtocol.self)
//
//        super.init()
//
//        webview.setDelegate(self);
//    }
//
//    @objc public func webViewDidStartLoad(_ webView: BILWebView){
//        return bili!.webViewDidStartLoad(webview)
//    }
//
//    @objc public func webViewDidFinishLoad(_ webview: BILWebView){
//        return bili!.webViewDidFinishLoad(webview)
//    }
//
//    @objc public func webView(_ webView: BILWebView, didFailLoadWithError error: Error){
//        return bili!.webViewDidFinishLoad(webview)
//    }
//}


