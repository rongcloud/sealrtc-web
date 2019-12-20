## SealRTC-v3

基于 RongRTC.3.0.0.js 的实时音视频会议 Demo

## 使用说明

1. 执行 npm install, 安装 eslint 等工具
2. 必须使用 HTTPS 站点或 localhost 运行 Demo, 端口不限
3. Demo 启动页为 src/index.html

## 目录结构

```
├── package.json
└── src
    ├── config.js  配置文件
    ├── index.html  程序启动页
    ├── css  资源文件
    │   ├── img  图片资源
    │   ├── main.css
    │   └── main.scss
    ├── js
    │   ├── utils.js  工具方法
    │   ├── common.js  程序相关工具方法
    │   ├── login.js  登录
    │   ├── main.js  音视频会议
    │   ├── whiteboard.js 白板逻辑方法
    │   └── locale  多语言
    │       ├── en.js  英文配置
    │       └── zh.js  中文配置
    ├── videos 自定义视频文件
    ├── lib
    │   ├── RongRTC.3.0.0.js  
    │   ├── frameImage.js  获取 stream 帧图片
    │   └── screenshare.js  屏幕共享
    ├── whiteboard
    │   ├── imgs 图片资源 
    │   ├── index.css
    │   ├── index.js
    │   └── whiteboard.html 白板启动页
    └── plugin
        └── screenshare-addon.zip  屏幕共享插件
```