# Cursor実装プロンプト: 面接・会話練習向け 表情・視線クセ可視化Webサービス（MVP）

あなたはシニアのフルスタックエンジニアです。
このリポジトリに、以下の要件を満たす Web アプリを実装してください。

## 最重要ルール
- いまから実装を開始してください
- 不足情報があっても止まらず、妥当な仮定で進めてください
- まず動くMVPを完成させてください
- 解析はブラウザ側で行ってください
- 独自AIモデルは作らないでください
- 学習処理は不要です
- 外部有料APIは使わないでください
- まずは単一ユーザー・ローカル保存前提で実装してください
- 動画ファイル自体は保存しないでください
- 保存するのは数値ログ・集計結果のみです
- 実装後、README にローカル起動手順とデプロイ手順を必ず記載してください

---

# 1. 作るもの

面接や会話練習時に、カメラ映像から以下を可視化するWebサービスを作成してください。

- 顔が正面を向いているか
- 顔が左右・上下どちらに偏っているか
- 視線の近似方向
- 目の開き
- まばたき回数
- 口の開き
- 口角上昇（簡易スマイル指標）
- 眉の動き
- 上記の時系列グラフ
- セッション終了後の集計表示
- CSV / JSON ダウンロード
- ローカル履歴保存

このアプリは「診断」ではなく「クセの可視化」です。
UI上の表現もその方針にしてください。
「視線追跡」という言葉は使わず、「視線の近似評価」「カメラ方向への向きやすさ」としてください。

---

# 2. 技術スタック（固定）

以下を使用してください。

- フロントエンド: React + TypeScript + Vite
- API/サーバー: Cloudflare Workers
- デプロイ前提: Cloudflare
- 顔解析: `@mediapipe/tasks-vision`
- グラフ: `chart.js` + `react-chartjs-2`
- ルーティング: `react-router-dom`
- 状態管理: `zustand`
- IndexedDB ラッパー: `idb`
- テスト: `vitest`, `@testing-library/react`
- E2E は任意だが、余裕があれば Playwright 追加

## パッケージ例
必要なら以下をインストールしてください。

```bash
npm i @mediapipe/tasks-vision chart.js react-chartjs-2 react-router-dom zustand idb
npm i -D @cloudflare/vite-plugin wrangler vitest @testing-library/react @testing-library/jest-dom jsdom typescript