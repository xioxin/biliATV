//
//  BLPlayer.swift
//  biliATV
//
//  Created by 赵鑫 on 2017/11/15.
//  Copyright © 2017年 xioxin. All rights reserved.
//

import UIKit
import AVKit
import SGPlayer
import AVFoundation

class BLPlayer: AVPlayer {
    
    var player = SGPlayer();
    override init(url:URL) {

//        self.view.addSubview(self.player.view)
//        self.player.view.frame = self.view.frame
//        self.view.insertSubview(self.player.view, at: 0)
//        self.player.view.frame = self.view.frame
//        self.player.view.backgroundColor = UIColor.blue
        self.player.replaceVideo(with: url)
//        self.player.play()
//        self.player.player
        super.init();
        
        
//        let a = AVPlayerLayer.init();
//        a.pixelBufferAttributes
        
//        super.
//        super.
//        super.currentTime()
        self.player.registerNotificationTarget(self, stateAction: #selector(BLPlayer.stateAction), progressAction: #selector(BLPlayer.progressAction), playableAction: #selector(BLPlayer.playableAction), errorAction:#selector(BLPlayer.errorAction))
        
//        self.player.duration
//        self.player.playableTime
        
    }
    override func currentTime() -> CMTime {
        return CMTime.init(seconds: self.player.playableTime.binade, preferredTimescale: CMTimeScale.init(exactly: self.player.playableTime.binade)!)
    }
    
    override func play() {
        self.player.play()
    }
    override func pause() {
        self.player.pause()
    }
    
    func stateAction() {
        print("stateAction")
    }
    func progressAction() {
       print("progressAction")
    }
    func playableAction() {
        print("playableAction")
    }
    func errorAction() {
        print("errorAction")
    }

}
