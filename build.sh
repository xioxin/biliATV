#!/bin/sh

#  build.sh
#  biliATV
#
#  Created by xioxin on 2017/11/20.
#  Copyright © 2017年 xioxin. All rights reserved.

cd DanMuPlayer && git submodule update --init --recursive
cd SGPlayer && sh compile-build.sh tvOS
