//
//  playerUIViewController.swift
//  biliATV
//
//  Created by 赵鑫 on 2017/11/15.
//  Copyright © 2017年 xioxin. All rights reserved.
//

import UIKit
//import SGPlayer

class playerUIViewController: UIViewController, VLCMediaPlayerDelegate {
    @IBOutlet weak var videoView: UIView!
    
    
    var mediaPlayer = VLCMediaPlayer()

    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        NotificationCenter.default.addObserver(self, selector: #selector(playerUIViewController.rotated), name: NSNotification.Name.UIDeviceOrientationDidChange, object: nil)

        //Setup movieView
        self.videoView.backgroundColor = UIColor.gray
//        self.videoView.frame = UIScreen.screens[0].bounds
        
        //Add tap gesture to movieView for play/pause
        let gesture = UITapGestureRecognizer(target: self, action: #selector(playerUIViewController.movieViewTapped(_:)))
        self.videoView.addGestureRecognizer(gesture)
        
        //Add movieView to view controller
//        self.view.addSubview(self.videoView)

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    override func viewDidAppear(_ animated: Bool) {
        
        //Playing multicast UDP (you can multicast a video from VLC)
        //let url = NSURL(string: "udp://@225.0.0.1:51018")
        
        //Playing HTTP from internet
        let url = URL(string: "http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_30mb.mp4")
        
        print("play 啊啊啊Ｏ(≧口≦)Ｏ")
        //Playing RTSP from internet
        //        let url = URL(string: "rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov")
        

        let media = VLCMedia(url: url!)
        mediaPlayer.media = media
        
        
        mediaPlayer.delegate = self
        mediaPlayer.drawable = self.videoView
        mediaPlayer.play()
        
    }
    
    func rotated() {
        
        let orientation = UIDevice.current.orientation
        
        if (UIDeviceOrientationIsLandscape(orientation)) {
            print("Switched to landscape")
        }
        else if(UIDeviceOrientationIsPortrait(orientation)) {
            print("Switched to portrait")
        }
        
        //Always fill entire screen
        self.videoView.frame = self.view.frame
        
    }
    
    func movieViewTapped(_ sender: UITapGestureRecognizer) {
        
        if mediaPlayer.isPlaying {
            mediaPlayer.pause()
            
            let remaining = mediaPlayer.remainingTime
            let time = mediaPlayer.time
            
            print("Paused at \(time) with \(remaining) time remaining")
        }
        else {
            mediaPlayer.play()
            print("Playing")
        }
        
    }

}
