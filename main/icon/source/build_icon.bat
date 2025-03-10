chcp 65001
rem 透過electron-icon-builder可以產生windows與macos icon
rem windows icon為.ico,macos icon為.icns
rem 透過npm install -g electron-icon-builder指令可安裝electron-icon-builder
rem 請準備一張大小為1024x1024的png進行icon產生
rem macos的icon設計可能留一些邊界呈現更好
rem 因此可能要替windows跟macos各準備一個png分別產生
electron-icon-builder --input=./app-1024x1024.png --output=./ouput