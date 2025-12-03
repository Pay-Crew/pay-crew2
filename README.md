# pay-crew2

[![Test](https://github.com/Pay-Crew/pay-crew2/actions/workflows/test.yaml/badge.svg)](https://github.com/Pay-Crew/pay-crew2/actions/workflows/test.yaml)
[![Docs](https://github.com/Pay-Crew/pay-crew2/actions/workflows/docs.yaml/badge.svg)](https://github.com/Pay-Crew/pay-crew2/actions/workflows/docs.yaml)
![GitHub Release](https://img.shields.io/github/v/release/Pay-Crew/pay-crew2)
![GitHub License](https://img.shields.io/github/license/Pay-Crew/pay-crew2)
![Vitest](https://img.shields.io/badge/-vitest-6e9f18?style=flat&logo=vitest&logoColor=ffffff)
[![RenovateBot](https://img.shields.io/badge/RenovateBot-1A1F6C?logo=renovate&logoColor=fff)](#)

## ドキュメント

https://pay-crew.github.io/pay-crew2/

## セットアップ

0. いくつかのツールをインストール

- docker-compose
- Docker
- Node.js
- pnpm
- vscode
- vscode extensions
  - `astro-build.astro-vscode`
  - `esbenp.prettier-vscode`
  - `dbaeumer.vscode-eslint`
  - `clinyong.vscode-css-modules`

1. このレポジトリをクローン

```sh
git clone https://github.com/Pay-Crew/pay-crew2.git
cd pay-crew2
```

2. レポジトリのルートに`.env`ファイルを作成

`.env.example`を参考に適当な値を設定してください。

3. コンテナを起動

```sh
sudo docker compose up -d
```

4. 以下のコマンドを実行

```sh
pnpm i && pnpm run setup:generate && pnpm run backend:generate && pnpm run backend:migrate
```

## docker-compose の操作 (基本操作のみ掲載)

- 起動

```sh
sudo docker compose up -d
```

- コンテナに入る

```sh
sudo docker exec -it postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

<POSTGRES_USER> と <POSTGRES_DB> には、.env ファイルで設定した値を入力する。

例: .env の設定例を使っている場合は以下のようになる。

```sh
sudo docker exec -it postgres psql -U postgres -d sample
```

- 停止

```sh
sudo docker compose down
```

- クリーンアップ

```sh
docker compose down --rmi all --volumes
```

## API情報の更新

1. `openapi.json`を更新

```sh
pnpm run backend:openapi
```

2. `openapi-react-query`を実行して、コードを生成

```sh
pnpm run frontend:openapi
```

## 開発時のデータベースの中身を確認する

Drizzle Studioというものを利用することで、ブラウザ上でデータベースの中身を確認することができる。

以下のコマンドでDrizzle Studioを起動できる。

```sh
pnpm run backend:studio
```

## 本番環境 (Xata Lite) のマイグレーション

1. `products/backend/.env`を本番環境のURLに変更

2. 以下のコマンドを実行

```sh
pnpm run backend:migrate
```

3. `products/backend/.env`を開発環境のURLに戻す

## 技術スタック

### Frontend (products/frontend)

- TypeScript
- CSS Modules
- Vite + React
- React Router (for routing)
- react-hook-form (for form handling)
  - validator: Zod (with @hookform/resolvers)
- typescript-react-query (type safe tiny wrapper for @tanstack/react-query)
- msw (mocking API)
- Sentry (for error tracking)

#### [Live Demo](https://pay-crew2.yukiosada.work/)
- https://pay-crew2.yukiosada.work/

#### [Source Code](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/frontend/)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/frontend/

#### [Details](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/frontend/README.md)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/frontend/README.md

#### [Vitest UI Report](https://pay-crew.github.io/pay-crew2/vitest/frontend/)
- https://pay-crew.github.io/pay-crew2/vitest/frontend/

#### [Coverage Report](https://pay-crew.github.io/pay-crew2/coverage/frontend/)
- https://pay-crew.github.io/pay-crew2/coverage/frontend/

### Backend (products/backend)

- TypeScript
- Hono (Web Framework)
- @hono/zod-openapi (for validation and OpenAPI spec generation)
- fetch API (for calling Webhook)
- Drizzle (ORM)

#### [Web UI for OpenAPI](https://pay-crew2-api.yukiosada.work/docs)
- https://pay-crew2-api.yukiosada.work/docs

#### [OpenAPI Spec](https://pay-crew2-api.yukiosada.work/openapi)
- https://pay-crew2-api.yukiosada.work/openapi

#### [Source Code](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/backend/)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/backend/

#### [Details](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/backend/README.md)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/backend/README.md

#### [Vitest UI Report](https://pay-crew.github.io/pay-crew2/vitest/backend/)
- https://pay-crew.github.io/pay-crew2/vitest/backend/

#### [Coverage Report](https://pay-crew.github.io/pay-crew2/coverage/backend/)
- https://pay-crew.github.io/pay-crew2/coverage/backend/

### Validator (products/validator)

- TypeScript
- Zod

#### [Source Code](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/validator/)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/validator/

#### [Details](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/validator/README.md)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/validator/README.md

#### [Vitest UI Report](https://pay-crew.github.io/pay-crew2/vitest/validator/)
- https://pay-crew.github.io/pay-crew2/vitest/validator/

#### [Coverage Report](https://pay-crew.github.io/pay-crew2/coverage/validator/)
- https://pay-crew.github.io/pay-crew2/coverage/validator/

### Notify (products/notify)

- TypeScript
- Cloudflare Workers
- Discord Webhook

#### [Source Code](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/notify/)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/notify/

#### [Details](https://github.com/Pay-Crew/pay-crew2/tree/dev/products/notify/README.md)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/products/notify/README.md

### Database

- development
  - PostgreSQL with docker-compose
- production
  - Xata Lite

### Docs (docs)

- Astro

#### [Docs](https://github.com/Pay-Crew/pay-crew2/tree/dev/docs/)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/docs/

#### [Details](https://github.com/Pay-Crew/pay-crew2/tree/dev/docs/README.md)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/docs/README.md

### Setup (setup)

- TypeScript

#### [Source Code](https://github.com/Pay-Crew/pay-crew2/tree/dev/setup/)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/setup/

#### [Details](https://github.com/Pay-Crew/pay-crew2/tree/dev/setup/README.md)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/setup/README.md

#### [Vitest UI Report](https://pay-crew.github.io/pay-crew2/vitest/setup/)
- https://pay-crew.github.io/pay-crew2/vitest/setup/

#### [Coverage Report](https://pay-crew.github.io/pay-crew2/coverage/setup/)
- https://pay-crew.github.io/pay-crew2/coverage/setup/

## CI/CD

- GitHub Actions with Nix

#### [CI/CD](https://github.com/Pay-Crew/pay-crew2/tree/dev/.github/workflows/)
- https://github.com/Pay-Crew/pay-crew2/tree/dev/.github/workflows/

## テストツール

- Vitest

## 開発ツール

> [!WARNING]
> このプロジェクトは、 pnpmのみサポートしています。 npmやyarnなどはサポートしていません。

- pnpm (with workspace feature)
- turbo (monorepo management tool)
- Nix (optional tool)

## システム構成図 ~ 開発環境 ~

```mermaid
graph LR;
    db[("Database (PostgreSQL)")]
    drizzle["Drizzle (ORM)"]
    hono["Hono (Web API)"]
    discord["Discord Webhook"]
    slack["Slack Webhook"]
    frontend["Vite + React"]
    idp{{"Identity Provider (Google, GitHub, etc.)"}}
    server(["Server (Discord)"])
    workspace(["Workspace (Slack)"])
    user["User"]

    subgraph "Docker"
        db
    end
    db <--> drizzle
    subgraph "Backend (Localhost)"
        drizzle
        drizzle <--> hono
    end
    subgraph "Notify (Localhost)"
        discord
        slack
    end
    hono --> discord
    discord --fetch--> hono
    hono --> slack
    slack --fetch--> hono
    hono <--> frontend
    subgraph "Frontend (Localhost)"
        frontend
    end
    idp <-.authentication.-> user
    idp <--check token--> hono
    frontend -.redirect.-> idp
    user <--with token--> frontend
    user -.without token.-> frontend
    discord --notification--> server
    slack --notification--> workspace
    server --notification--> user
    workspace --notification--> user
```

## システム構成図 ~ 本番環境 ~

```mermaid
graph LR;
    db[("Database (Xata Lite)")]
    hyperdrive(("Hyperdrive"))
    drizzle["Drizzle (ORM)"]
    hono["Hono (Web API)"]
    discord["Discord Webhook"]
    slack["Slack Webhook"]
    frontend["Vite + React"]
    idp{{"Identity Provider (Google, GitHub, etc.)"}}
    server(["Server (Discord)"])
    workspace(["Workspace (Slack)"])
    user["User"]

    db <--> hyperdrive
    hyperdrive <--> drizzle
    subgraph "Backend (Cloudflare Workers)"
        drizzle
        drizzle <--> hono
    end
    subgraph "Notify (Cloudflare Workers)"
        discord
        slack
    end
    hono --> discord
    discord --polling--> hono
    hono --> slack
    slack --polling--> hono
    hono <--> frontend
    subgraph "Frontend (Cloudflare Workers)"
        frontend
    end
    idp <-.authentication.-> user
    idp <--check token--> hono
    frontend -.redirect.-> idp
    user <--with token--> frontend
    user -.without token.-> frontend
    discord --notification--> server
    slack --notification--> workspace
    server --notification--> user
    workspace --notification--> user
```

## ER図

```mermaid
```

## ブランチ戦略

### main

main branch is the release branch.

### dev

dev branch is the development root branch.


### feature

- feat/#[issue-number]-[issue-summary]

  example) feat/#12-add-card-button-component

### chore

- chore/#[issue-number]-[issue-summary]

  example) chore/#12-add-prettier-config

### fix

- fix/#[issue-number]-[issue-summary]

  example) fix/#12-change-title

### update

- update/#[issue-number]-[issue-summary]

  example) update/#12-update-dependencies

### test

- test/#[issue-number]-[issue-summary]

  example) test/#12-add-unit-test

```mermaid
flowchart LR
    feature["feat/*"]
    chore["chore/*"]
    fix["fix/*"]
    update["update/*"]
    dev["dev"]
    test["test/*"]
    main["main"]
    feature --with checks--> dev
    chore --with checks--> dev
    fix --with checks--> dev
    update --with checks--> dev
    dev --with checks--> main
    test --with checks--> dev
    main --with checks (cron)--> main
```

#### with checks (`dev branch`)

- test (`push` and `pull requests`)
- CodeQL Scanning
- docs (`push`)
- preview-frontend (`pull requests`)

#### with checks (`main branch`)

- test (`pull requests`)
- CodeQL Scanning
- deploy-frontend (`push`)
- deploy-backend (`push`)

#### with `checks (cron)` (`main branch`)

- test (`cron`)
