# pay-crew2 Backend

## `better-auth`の生成するスキーマファイルの更新方法

1. 設定ファイルの更新を行う。

better-authの設定は、`src/auth.config.ts`の`betterAuthConfig`関数に記述されている。
設定を更新するには、このファイルを記述する必要がある。

以下に、better-authの設定ファイルの依存関係を示す。

```mermaid
flowchart LR
  env[".env (環境変数)"]
  wrangler["wrangler.local.jsonc (環境変数)"]
  config["src/auth.config.ts (betterAuthConfig関数)"]
  cli["auth.cli.ts"]
  hono["src/presentation/share/auth.ts"]
  cli --> env
  cli --> config
  hono --> wrangler
  hono --> config
```

- `auth.cli.ts`

better-auth CLIが`src/db/auth-schema.ts`を生成する際に参照する設定ファイル。

- `src/presentation/share/auth.ts`

better-authが実行時に参照する設定ファイル。

2. `pnpm run backend:better-auth:generate`を実行する。

```sh
pnpm run backend:better-auth:generate
```

`auto-auth-schema.ts`が更新される。

このファイルを読み、適宜`src/db/auth-schema.ts`を手動で更新する。

3. `pnpm run backend:drizzle:generate`を実行する。

```sh
pnpm run backend:drizzle:generate
```

4. `pnpm run backend:migrate`を実行する。

```sh
pnpm run backend:migrate
```

## Xata LiteへのMigration方法

0. `products/backend/.env`の`DATABASE_CREDENTIALS_SSL_REJECT_UNAUTHORIZED`の値を`true`に設定しておくこと。

> [!NOTE]
> Drizzleが未認証のユーザ情報の操作を拒否する必要があるため。
>
> 開発時は`DATABASE_CREDENTIALS_SSL_REJECT_UNAUTHORIZED`の値を`false`に設定しないと、ローカルのPostgreSQLに書き込みができなくなるため注意。

1. `products/backend/.env`の`DATABASE_URL`の値に対象のXata Liteのデータベースの`DATABASE_URL_POSTGRES`を設定する。

2. `pnpm run backend:migrate`を実行する。

※ 事前に`pnpm i && pnpm run backend:better-auth:generate`と`pnpm run backend:drizzle:generate`を実行しておくこと。

```sh
pnpm run backend:migrate
```

3. マイグレーションが完了したら、`products/backend/.env`の`DATABASE_CREDENTIALS_SSL_REJECT_UNAUTHORIZED`と`DATABASE_URL`の値を元の状態に戻す。

## Workersと接続するHyperdriveを変更する方法

1. `products/backend/wrangler.jsonc`の`HYPERDRIVE`の`ID`を変更する。

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "pay-crew2-backend",
  "main": "src/index.ts",
  "compatibility_date": "2025-12-03",
  "compatibility_flags": ["nodejs_compat"],
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "", // <- ここを変更する
    },
  ],
}

```

2. `pnpm run backend:deploy`を実行する。

```sh
pnpm run backend:deploy
```

3. デプロイが完了したら、`products/backend/wrangler.jsonc`の`HYPERDRIVE`の`ID`を`""` (元の状態) に戻す。

※ HyperdriveのIDが漏洩すると、他者にデータベースを操作される可能性があるため、デプロイ完了後は必ず元に戻してからステージング (`git add`) をすること。

## drizzleのスキーマファイルの構造

```mermaid
flowchart LR
  auth-schema["src/db/auth-schema.ts (better-auth関係のテーブル定義用)"]
  pay-crew2["src/db/pay-crew2-schema.ts (pay-crew2関係のテーブル定義用)"]
  relation["src/db/relation.ts (リレーション定義用)"]
  schema["src/db/schema.ts (エクスポート用)"]
  auth-schema --> relation
  pay-crew2 --> relation
  relation --> schema
```

## 構造

この構造は、レイヤードアーキテクチャから着想を得て定義している。

このプロジェクトでは、hyperdriveによってDB接続が抽象化されている。
また、drizzleというORMを使用してDB操作も抽象化している。
そのため、infrastructure層は不要と判断し、用意していない。

### presentation (presentation/shareを除く)

ルーティングの定義を行う。

- 外部依存
  - hono
  - @hono/zod-openapi
  - zod-openapi-share
  - better-auth


#### presentation/share

presentation層で共通して使用するエンティティを定義する。

### application

ビジネスロジック及びデータベースCRUD操作の定義を行う

- 外部依存
  - drizzle
  - better-auth

### db

データベーススキーマの定義を行う

- 外部依存
  - Drizzle

### openapi

openapi.jsonの生成を行う処理を定義している。

`pnpm run backend:openapi`で生成できる。

- 外部依存 (間接的な依存も含む)
  - hono
  - @hono/zod-openapi
  - zod-openapi-share
  - better-auth

## 依存関係

```mermaid
flowchart TD
  presentation["presentation (include entrypoint)"]
  application["application"]
  db["db"]
  presentation --> application
  application --> db
```

## 処理の流れ

```mermaid
flowchart TD
    io[Network IO]
    routes["routes (include entrypoint)"]
    application["application"]
    hyperdrive["cloudflare hyperdrive"]
    db["Xata Lite (DBaaS)"]

    io --> routes
    routes --> io
    routes --> application
    application --> routes
    application --> hyperdrive
    hyperdrive --> application
    hyperdrive --> db
    db --> hyperdrive
```