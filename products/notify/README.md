# pay-crew Notify

## 概要

Cloudflare Workersを使用して、定期的にDiscordのWebhookに
メッセージを送信するWorkersを実装している。

### cronについて

以下のように、`wrangler.jsonc`の`triggers`セクションで
cronジョブを設定することで、Cloudflare Workers上で
定期的に処理を実行できる。
以下は、1分ごとにジョブを実行する設定例である。

```jsonc
/**
 * For more details on how to configure Wrangler, refer to:
 * https://developers.cloudflare.com/workers/wrangler/configuration/
 */
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "pay-crew-notify",
  "main": "src/index.ts",
  "compatibility_date": "2025-11-19",
  "observability": {
    "enabled": true,
  },
  "triggers": {
    // ここを編集してcronジョブを設定する
    // 複数設定可能
    "crons": ["*/1 * * * *"],
  },
}
```

また、ローカル環境の設定ファイルは、`wrangler.local.jsonc`に記述する。
このファイルは、`pnpm run setup:generate`コマンドで
自動生成されるため、手動で作成する必要はない。
ローカル環境の設定ファイルに追加で設定を行いたい場合は、`wrangler.local.jsonc`に追記すれば良い。

### `index.ts`

scheduleハンドラを実装することで、cronジョブの処理を定義できる。
また、fetchハンドラも実装しており、WorkersへのHTTPアクセス時の
処理も定義している。

```ts
default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    // cron jobの処理内容
  },
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // アクセス時の処理内容
    return new Response('Response Message');
  },
} satisfies ExportedHandler<Env>;
```
