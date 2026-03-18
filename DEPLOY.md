# 公開手順（GitHub + Cloudflare・独自ドメインなし）

独自ドメインを使わず、GitHub 連携で Cloudflare に公開する手順です。  
公開後の URL は **`https://＜プロジェクト名＞.pages.dev`** になります。

---

## 前提

- [Cloudflare](https://dash.cloudflare.com/sign-up) のアカウント
- [GitHub](https://github.com) のアカウント
- このリポジトリを GitHub にプッシュ済みであること

---

## 1. リポジトリを GitHub にプッシュ

まだの場合のみ実行してください。

```bash
cd d:\04_github_dev\kaokensyou
git init
git add .
git commit -m "Initial commit: Face Habit Viewer MVP"
```

GitHub で新規リポジトリ（例: `kaokensyou`）を作成し、表示される手順に従ってプッシュします。

```bash
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git branch -M main
git push -u origin main
```

---

## 2. Cloudflare Pages にデプロイ（フロント）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログインする。
2. 左メニュー **Workers & Pages** を開く。
3. **Create** → **Pages** → **Connect to Git** を選ぶ。
4. **GitHub** を選び、表示に従って GitHub と Cloudflare を連携する（必要な場合はリポジトリへのアクセスを許可する）。
5. **Select a repository** でこのプロジェクトのリポジトリを選ぶ。
6. **Begin setup** でビルド設定を入力する。
   - **Project name**: 任意（例: `face-habit-viewer`）。これが `https://face-habit-viewer.pages.dev` のような URL になる。
   - **Production branch**: `main`（デフォルトのままでよい）。
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
7. **Save and Deploy** を押す。
8. ビルドが終わると、**View site** の URL（例: `https://face-habit-viewer.pages.dev`）でサイトが公開される。

---

## 3. Worker（API）をデプロイ

同じ Cloudflare アカウントで、API 用の Worker をデプロイします。

1. ターミナルでプロジェクトのルートにいることを確認する。
2. 初回のみ Wrangler でログインする。

   ```bash
   npx wrangler login
   ```

   ブラウザが開くので、Cloudflare にログインして許可する。

3. Worker をデプロイする。

   ```bash
   npm run worker:deploy
   ```

4. 成功すると、Worker 用の URL（例: `https://face-habit-viewer-api.<サブドメイン>.workers.dev`）が表示される。  
   この段階では API は **Worker の URL** でのみ動きます。

---

## 4. 同じドメイン（pages.dev）で `/api` を動かす（推奨）

`pages.dev` は通常「あなたの Zone（管理ドメイン）」ではないため、**Worker の Route 追加で Zone が選べず設定できない**ことがあります（今回の詰まりポイント）。

その場合は **Cloudflare Pages Functions を `/api/*` のプロキシ**として使い、同一ドメインを実現します（独自ドメイン不要）。

### 4-A. Pages Functions プロキシ（推奨・Zone不要）

このリポジトリには、既に `functions/api/[...path].ts` を追加済みです。  
`https://＜プロジェクト名＞.pages.dev/api/*` へのアクセスを、Worker（`workers.dev`）へ転送します。

#### 設定手順

1. Cloudflare Dashboard → **Workers & Pages** → **Pages** → 対象プロジェクトを開く
2. **Settings** → **Environment variables**（または **Variables**）を開く
3. 変数を追加
   - **Name**: `WORKER_API_ORIGIN`
   - **Value**: `https://face-habit-viewer-api.<あなたのサブドメイン>.workers.dev`
4. 保存して再デプロイ（必要なら）

これで、ブラウザから `https://＜プロジェクト名＞.pages.dev/api/health` を開くと、Worker の `/api/health` へ転送されます。

### 4-B. Worker Route（Zone が選べる場合のみ）

もし Cloudflare の UI で `pages.dev` の Zone が選べる場合は、従来どおり Worker の Route を追加しても構いません。

---

## 5. 動作確認

- ブラウザで `https://＜プロジェクト名＞.pages.dev` を開く。
- カメラ許可を出して解析を試す。
- （手順 4 を実施した場合）開発者ツールの Network で `https://＜プロジェクト名＞.pages.dev/api/health` にリクエストが飛んでいれば、同一ドメインで API が動いています。

---

## トラブルシューティング

| 現象 | 確認すること |
|------|----------------|
| ビルドが失敗する | Cloudflare のビルドログでエラーを確認。`npm run build` がローカルで通るか確認。 |
| カメラが使えない | 本番は **HTTPS** 必須。`*.pages.dev` は HTTPS なので問題ないはず。ブラウザのサイト設定でカメラがブロックされていないか確認。 |
| `/api` が 404 になる | 手順 4 の Route が正しく設定されているか、Route の URL が自分の Pages の URL と一致しているか確認。 |
| Wrangler ログインが通らない | `npx wrangler login` を再度実行し、ブラウザで許可する。 |

---

## まとめ

- **フロント**: GitHub 連携で Cloudflare Pages に自動デプロイ。URL は `https://＜プロジェクト名＞.pages.dev`。
- **API**: `npm run worker:deploy` で Worker をデプロイし、Pages のドメインに ` /api/*` の Route を追加すると、同じドメインで API が使える。
- 独自ドメインは不要。GitHub に push するたびに Pages が再ビルド・再デプロイされる。
