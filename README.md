## SealRTC-IE-v3

基于 RongRTC-IE-3.0.4.js 的实时音视频会议 Demo

## 注意事项

1、运行此 Demo 前, 必须安装 [IE 插件](https://docs.rongcloud.cn/rtc/rtclib/ie/plugin)

2、运行此 Demo 前, 必须启动 [SealRTC-Server](https://github.com/rongcloud/sealrtc-server), 并将正确的 Server 地址填入 setting.js 中

## 配置说明

**setting.js 配置:**

```js
{
  appkey: 'appkey',
  navi: '导航地址',
  server: 'sealrtc server 地址'
}
```

## 目录结构

```
└── src
    ├── index.html  程序启动页
    ├── setting.js  配置文件
    ├── img  图片资源
    ├── css  样式文件
    │   ├── main.css
    │   └── main.scss
    ├── js
    │   ├── main.js  
    │   ├── login.js  登录
    │   ├── rtc.js  音视频会议
    │   └── common  公共文件
    │       ├── promise.js  Promise 兼容层
    │       ├── service.js  调用接口封装
    │       ├── common.js  应用公用方法
    │       └── utils.js  工具方法
    └── lib
```