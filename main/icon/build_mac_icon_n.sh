mkdir tmp.iconset
sips -z 16 16 app-mac-1024x1024.png --out "./tmp.iconset/icon_16x16.png"
sips -z 32 32 app-mac-1024x1024.png --out "./tmp.iconset/icon_32x32.png"
sips -z 128 128 app-mac-1024x1024.png --out "./tmp.iconset/icon_128x128.png"
sips -z 256 256 app-mac-1024x1024.png --out "./tmp.iconset/icon_256x256.png"
sips -z 512 512 app-mac-1024x1024.png --out "./tmp.iconset/icon_512x512.png"
iconutil -c icns tmp.iconset -o app.icns
