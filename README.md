# sealrtc-web

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 配置 AppKey 和 Demo Server

**1、开发配置**
配置文件位置: `/public/config.js`
```js
开发模式可通过 location.serach 字段配置 appkey 、 Demo Server( rtcs ), 
/**
   * 解析 location.search 字段
   * 【必填】
   * 1. appkey
   * 2. rtcs: sealrtc-server api 地址
   */
```
**2、部署配置**
配置文件位置: `/public/config.js`

```js 
直接修改配置文件中字段
defaultAppkey: AppKey
defaultRTCS: Demo Server
```
**3、常见问题**

>Q1: 是 root 用户，npm install 安装依赖仍出现权限问题
>A1: 使用 npm install --unsafe -perm 


