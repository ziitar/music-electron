# music-electron

这是一个基础的管理音乐ID3信息的项目，基于electron,UI界面使用[visualizeMusicFrontend项目的electron分支](https://github.com/ziitar/visualizeMusicFrontend/tree/electron)，服务端使用[visualizeMusicBackend](https://github.com/ziitar/visualizeMusicBackend),三者配合可以实现读取音乐ID3信息并搜索网易云音乐对应的ID3数据写入音频文件里。

## 特性功能
   - [x] ID3信息写入
   - [x] 对比库里的歌曲
   - [x] 格式化cue编码
   - [x] 将本地歌曲录入数据库
   - [x] 根据音频文件ID3信息重命名及移动音频文件且入库
   - [x] 支持除整轨音频文件外的其他常用格式,如mp3,flac,acc,wav

## 使用
1. 安装[node](https://nodejs.cn/download/)
2. 下载本项目
```shell
> git clone https://github.com/ziitar/music-electron.git && cd music-electron
```
3. 安装依赖
```
> npm install
```
4. 运行程序
```
> npm start
```

## 配置
可以在config.json配置中设置前端UI界面的地址,也可以通过更改ID3-item字段来更改写入音频文件的ID3字段

## build music-tags.py to executable
for windows cmd
```cmd
> cd py
> python -m venv .venv
> .venv\Scripts\activate.bat
> pip install -r requirements.txt
> pyinstaller music-tags.py
```