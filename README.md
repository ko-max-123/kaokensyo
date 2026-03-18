# Face Habit Viewer

面接・会話練習時の表情・顔の向き・視線の傾向を可視化するWebアプリ（MVP）です。  
**診断や合否判定を行うものではなく**、ご自身のクセを把握するための補助ツールです。

## 使用技術

- **フロントエンド**: React 18 + TypeScript + Vite
- **顔解析**: MediaPipe Face Landmarker（`@mediapipe/tasks-vision`）
- **グラフ**: Chart.js + react-chartjs-2
- **ルーティング**: react-router-dom
- **状態管理**: Zustand
- **ローカル保存**: IndexedDB（idb）
- **API**: Cloudflare Workers（疎通・バージョン用）

## ローカル起動方法

### 前提

- Node.js 18+
- npm

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

- **HTTPS**: カメラ利用のため、本番では HTTPS 必須です。ローカルでは `http://localhost` でカメラが使える環境が多いです。
- **API プロキシ**: 開発時は Vite が `/api` を `http://localhost:8787` にプロキシします。API を使う場合は別ターミナルで Worker を起動してください。

### 3. Worker（API）のローカル起動（任意）

```bash
npm run worker:dev
```

`http://localhost:8787` で Worker が起動します。  
`GET /api/health` → `{ "status": "ok", "service": "face-habit-viewer-api" }`  
`GET /api/version` → `{ "version": "0.1.0" }`

## 本番デプロイ方法（GitHub 連携・独自ドメインなし）

**GitHub 連携で公開する手順**は **[DEPLOY.md](./DEPLOY.md)** にまとめています。

1. リポジトリを GitHub にプッシュ
2. Cloudflare Pages で「Connect to Git」→ リポジトリ選択 → ビルドコマンド `npm run build`・出力 `dist`
3. `npm run worker:deploy` で API 用 Worker をデプロイ
4. Worker の Triggers で `https://＜プロジェクト名＞.pages.dev/api/*` にルートを追加

公開後の URL は `https://＜プロジェクト名＞.pages.dev` です。

## カメラ権限に関する注意

- 解析には**カメラへのアクセス**が必要です。ブラウザの許可ダイアログで「許可」を選択してください。
- 映像は**サーバーに送信されません**。ブラウザ内でのみ処理され、保存されるのは**数値ログと集計結果のみ**で、動画は保存しません。

## 保存データについて

- セッション結果は**ブラウザ内の IndexedDB** にのみ保存されます。
- クラウドには送信されません。エクスポート（CSV/JSON）で明示的にダウンロードした場合のみ、データが端末外に持ち出されます。

## 免責事項

本サービスは、面接や会話練習時の表情・顔向き・視線傾向を可視化するための**補助ツール**です。  
表示される値は**近似的な指標**であり、心理状態・人格・適性・採用結果等を判定するものではありません。  
「視線追跡」ではなく「**視線の近似評価**」「**カメラ方向への向きやすさ**」としてご利用ください。

## 環境変数

- フロント: ビルド時に必要な環境変数はありません。
- Worker: `wrangler.toml` の `[vars]` で `APP_VERSION` を設定可能です。

## Git / GitHub に含めないもの

`.gitignore` で除外しています。主なものは次のとおりです。

| 種類 | 例 | 理由 |
|------|-----|------|
| 依存パッケージ | `node_modules/` | `npm install` で再現可能・巨大 |
| ビルド成果物 | `dist/` | CI / Pages で毎回生成 |
| 秘密情報 | `.env`, `.dev.vars` | API キー等の漏洩防止 |
| ローカル状態 | `.vite/`, `.wrangler/` | キャッシュ・開発用 |
| 旧フォルダ | `web/` | ルートが本番アプリ（二重管理防止） |

既に誤って `node_modules` 等をコミットしている場合は、インデックスから外します。

```bash
git rm -r --cached node_modules dist .vite
git reset HEAD -- web/
```

## スクリプト一覧

| コマンド | 説明 |
|----------|------|
| `npm run dev` | Vite 開発サーバー起動 |
| `npm run build` | TypeScript ビルド + Vite 本番ビルド |
| `npm run preview` | 本番ビルドのプレビュー |
| `npm run worker:dev` | Wrangler で Worker をローカル起動 |
| `npm run worker:deploy` | Worker を Cloudflare にデプロイ |
| `npm run test` | Vitest を watch モードで実行 |
| `npm run test:run` | Vitest を 1 回実行 |
