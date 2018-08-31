//
//  BILWebView.m
//  biliATV
//
//  Created by Xummer on 2018/8/29.
//  Copyright © 2018 xioxin. All rights reserved.
//

#import "BILWebView.h"
#import <objc/runtime.h>
#import "biliATV-Swift.h"

@interface BILWebView ()
@property (nonatomic, weak) id mDelegate;
@end

@implementation BILWebView

- (instancetype)init {
    self = [super init];
    if (!self) {
        return nil;
    }
    
    Class myClazz = NSClassFromString(@"UIWebView");
    
    _realView = [[myClazz alloc] init];
    
    [self addSubview:_realView];
    
    return self;
}

- (void)setDelegate:(id)delegate {
    self.mDelegate = delegate;
    [[self class] addProtocolToClass:[self class]];
    [self.realView performSelector:@selector(setDelegate:) withObject:self];
}

- (id)delegate {
    return _mDelegate;
}

- (id)forwardingTargetForSelector:(SEL)aSelector {
    if ([self respondsToSelector:aSelector]) {
        return self;
    }
    else {
        return self.realView;
    }
}

- (NSMethodSignature *)methodSignatureForSelector:(SEL)selector {
    // We only get here if `forwardingTargetForSelector:` returns nil.
    // In that case, our weak target has been reclaimed. Return a dummy method signature to keep `doesNotRecognizeSelector:` from firing.
    // We'll emulate the Obj-c messaging nil behavior by setting the return value to nil in `forwardInvocation:`, but we'll assume that the return value is `sizeof(void *)`.
    // Other libraries handle this situation by making use of a global method signature cache, but that seems heavier than necessary and has issues as well.
    // See https://www.mikeash.com/pyblog/friday-qa-2010-02-26-futures.html and https://github.com/steipete/PSTDelegateProxy/issues/1 for examples of using a method signature cache.
    if ([self respondsToSelector:selector]) {
        return [super methodSignatureForSelector:selector];
    }
    else {
        return [self.realView methodSignatureForSelector:selector];
    }
    
}

- (void)webViewDidStartLoad:(id)webView {
    webProxy *del = self.mDelegate;
    if (del) {
        [del webViewDidStartLoad:self];
    }
}

- (void)webViewDidFinishLoad:(id)webView {
    webProxy *del = self.mDelegate;
    if (del) {
        [del webViewDidFinishLoad:self];
    }
}

- (void)webView:(id)webView didFailLoadWithError:(NSError *)error {
    webProxy *del = self.mDelegate;
    if (del) {
        [del webView:self didFailLoadWithError:error];
    }
}

+ (void)addProtocolToClass:(Class)cls {
    if (!cls) {
        return;
    }
    Protocol *protocol = objc_getProtocol([@"UIWebViewDelegate" UTF8String]);
    if (protocol) {
        class_addProtocol(cls, protocol);
    }
}
@end
