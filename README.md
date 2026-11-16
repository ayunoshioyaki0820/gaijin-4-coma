# 外人4コマメーカー

ブラウザだけで動く静的サイトです(サーバー不要)。公開フォルダは `public/` です。

## 本物の素材を入れる
- 冷めた4人の画像 → `public/assets/reactions/calm/`
- 盛り上がる4人の画像 → `public/assets/reactions/hype/`
- 画像は1コマ分(横長16:9推奨)。jpg / png / webp / gif / avif。ファイル名が素材名になり、名前順に並びます。
- 追加したら `node tools/make-manifest.mjs` を実行すると `reactions.json` が更新されます(Cloudflare Pagesのビルドコマンドにも設定できます)。
- 素材が1枚でも入ると、内蔵の仮イラストは非表示になります。
- 利用許諾を確認できた画像だけを入れてください。

## Cloudflare Pagesで公開
### Gitと連携する場合(おすすめ)
1. このフォルダをGitHubなどにpush
2. Cloudflare Pages → Create a project → Connect to Git
3. Framework preset: None / Build command: `node tools/make-manifest.mjs` / Build output directory: `public`
4. 以降は画像を足してpushするだけで自動反映されます。

### ドラッグ&ドロップで公開する場合
1. 手元で `node tools/make-manifest.mjs` を実行
2. Pages → Create a project → Direct Upload で `public` フォルダを丸ごとアップロード

## ローカルで確認
`public` 内で `npx serve` または `python3 -m http.server` を実行して開きます。
(index.html をダブルクリックで開くと、素材の読み込みと画像の書き出しができません)
