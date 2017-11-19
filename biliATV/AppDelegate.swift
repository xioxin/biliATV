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
class AppDelegate: UIViewController, UIApplicationDelegate, TVApplicationControllerDelegate,UIWebViewDelegate {
    
    var window: UIWindow?
    var appController: TVApplicationController?
    var webview:UIWebView!
    var webviewJSContext:JSContext!
//    var player:SGPlayer!

//    var vlc = VLCVideoView();
    
    
    
    
    
    var bili:biliModel!
    var tvJsContext: JSContext!

    
    
    // tvBaseURL points to a server on your local machine. To create a local server for testing purposes, use the following command inside your project folder from the Terminal app: ruby -run -ehttpd . -p9001. See NSAppTransportSecurity for information on using a non-secure server.
//    static let tvBaseURL = "https://raw.githubusercontent.com/xioxin/biliATV/master/TVML"
    static let tvBaseURL = "https://coding.net/u/xin/p/biliATV/git/raw/master/TVML"
    
    static let tvBootURL = "\(AppDelegate.tvBaseURL)/application.js"

    
//    static let tvBaseURL = "http://192.168.1.5:80/biliATV/TVML/"
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

        // Create the TVApplicationControllerContext for this application and set the properties that will be passed to the `App.onLaunch` function in JavaScript.
        let appControllerContext = TVApplicationControllerContext()

        // The JavaScript URL is used to create the JavaScript context for your TVMLKit application. Although it is possible to separate your JavaScript into separate files, to help reduce the launch time of your application we recommend creating minified and compressed version of this resource. This will allow for the resource to be retrieved and UI presented to the user quickly.
        

        let homeDir = NSHomeDirectory()
        print("=======");
        print(homeDir);
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
        
        let webViewClass : AnyObject.Type = NSClassFromString("UIWebView")!
        let webViewObject : NSObject.Type = webViewClass as! NSObject.Type
    
        
        webview = webViewObject.init() as! UIWebView
//        webview.bounds = UIScreen.main.bounds;

        

        
        bili = biliModel(webview)
        let cacheHack:urlCacheHack = urlCacheHack.init()
        cacheHack.setModel(bili)
        URLCache.shared  = cacheHack
        
        webview.delegate = self;
        webview.frame = UIScreen.main.bounds
        
        
//        let url = URL(string: "https://www.bilibili.com/video/av14356253/")
//        let request = URLRequest.init(url: url!)
//        self.webview.loadRequest(request);
        
        
        self.view.addSubview(webview as! UIView)

        
//        self.player = SGPlayer.init()
//
//        self.player.view.frame = self.view.frame
//        self.player.replaceVideo(with: URL(string: "http://www.sample-videos.com/video/flv/720/big_buck_bunny_720p_1mb.flv"));
//        self.player.play()
   
        
        //self.player.decoder = SGPlayerDecoder.byFFmpeg()
//        self.player.view.frame = self.view.frame
        
//        self.player.tap
        //UIViewController
//        appController?.navigationController.pushViewController(UIViewController, animated: <#T##Bool#>)(self.player., animated: true)
        
        return true
    }
    
    
    
    public func webViewDidStartLoad(_ webView: UIWebView){
        return bili!.webViewDidStartLoad(webview)
    }
    
    public func webViewDidFinishLoad(_ webview: UIWebView){
        return bili!.webViewDidFinishLoad(webview)
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
      
        let getAvData : @convention(block) (Int,Int,JSValue ) -> Void = {
            (aid : Int,page:Int, callback: JSValue ) -> Void in
            
            
//            self.Scallback = callback;
            self.bili.getAvData(aid,page: page){
                    data in
                let _data = data;
                let dataDic = _data._dic;
                callback.context.objectForKeyedSubscript("setTimeout").call(withArguments: [
                    callback,0,dataDic])
                }
            }
       
         self.tvJsContext.setObject(unsafeBitCast(getAvData, to: AnyObject.self), forKeyedSubscript: "getAvData" as (NSCopying & NSObjectProtocol))
        
        
        
        self.tvJsContext.evaluateScript("var ua = '\(ua)';");
        self.tvJsContext.evaluateScript("var tvBaseURL = '\(AppDelegate.tvBaseURL)'");
//        self.tvJsContext.evaluateScript("run();");
        
//        let d = DMMediaItem();
//        d.options
//        unsafeBitCast(<#T##x: T##T#>, to: <#T##U.Type#>)
        
        //jsContext.setObject(getAvData, forKeyedSubscript: <#(NSCopying & NSObjectProtocol)!#>);
        //jsContext.setObject(<#T##object: Any!##Any!#>, forKeyedSubscript: <#T##(NSCopying & NSObjectProtocol)!#>)
        
    }
}

