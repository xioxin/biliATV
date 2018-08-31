//
//  BILWebView.h
//  biliATV
//
//  Created by Xummer on 2018/8/29.
//  Copyright © 2018 xioxin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface BILWebView : UIView
@property (nonatomic, strong) id realView;

- (void)setDelegate:(id)delegate;

- (id)delegate;

- (UIScrollView *)scrollView;

- (void)loadRequest:(NSURLRequest *)request;

- (void)loadHTMLString:(NSString *)string baseURL:(nullable NSURL *)baseURL;

- (NSURLRequest *)request;

- (BOOL)isLoading;

- (void)reload;
- (void)stopLoading;

- (void)goBack;
- (void)goForward;

- (NSString *)stringByEvaluatingJavaScriptFromString:(NSString *)script;
@end
