# MENON App 外殼（Capacitor）

這個資料夾把網頁版遊戲（repo 根目錄的 `index.html`）包成 iOS / Android App。遊戲本體不用另外改，更新網頁版後重新同步就好。

- App ID：`io.github.tg4424.menon`
- 已裝外掛：App、Browser、Haptics、SplashScreen（SystemBars 內建在 Capacitor 8 核心）、RevenueCat（`@revenuecat/purchases-capacitor`）
- 登入回跳網址 `io.github.tg4424.menon://auth` 已在 iOS（Info.plist）和 Android（AndroidManifest.xml）設定好

## 在 Mac 上打包

需要：Node 22 以上、Xcode（iOS）、Android Studio（Android）。

```bash
cd native
npm install
npm run ios       # 複製最新遊戲檔、同步，然後用 Xcode 打開
npm run android   # 同上，用 Android Studio 打開
```

只想更新遊戲內容、不開 IDE：`npm run sync`。

## 還沒做的事

- RevenueCat：要在 RevenueCat 後台建好 App 和商品，拿到 iOS / Android 的公開 API key，遊戲程式裡再呼叫 `Purchases.configure()`。
- Supabase：確認 Supabase Auth 的 Redirect URLs 裡有 `io.github.tg4424.menon://auth`，沒有的話要加。
- App 圖示和啟動畫面：可用 `@capacitor/assets` 從一張 1024×1024 圖產生。
