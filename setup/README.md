# pay-crew Setup

## 概要

setupは、pay-crewのシークレットファイルを
生成するためのプログラムが書かれている。

## 仕組み

0. `pnpm run setup:generate`が実行のトリガーになる。

1. プロジェクトのルートにある`.env`を読み込む

2. `products/backend/.env`と`products/backend/wrangler.local.jsonc`を生成する。

※ 各ファイルの内容は、1. で読み込んだ`.env`の内容に依存する。
