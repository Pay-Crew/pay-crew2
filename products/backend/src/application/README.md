# 構成
- index.ts: export
- model: serviceで定義するAPIの型定義
- service: APIの処理

## index.ts

modelやserviceを更新したら、このファイルからexportし直す。ほかディレクトリからapplicationの中身をimportするときはこのファイルからexportしたものをimportする。

## model

例

```typescript
export type HistoryServiceType = {
  getHistoryService: () => Promise<HistoryGetResponseSchemaType>;
  postHistoryService: (HistoryPostRequest: HistoryPostRequestSchemaType) => Promise<HistoryPostResponseSchemaType>;
  deleteHistoryService: (historyDeleteRequest: HistoryDeleteRequestSchemaType) => Promise<HistoryDeleteResponseSchemaType>
};
```
APIのGET,POST,DELETEなどそれぞれに対応する関数の型定義。引数の型と返り値の型は"validator"で定義されたものをimportする。

## service

例

```typescript
export class HistoryService implements HistoryServiceType {
  private hyperdrive: Readonly<Hyperdrive>;

  constructor(hyperdrive: Hyperdrive) {
    this.hyperdrive = hyperdrive;
  }

  async getHistoryService() {
    // 略
  }

  async postHistoryService(historyPostRequest: HistoryPostRequestSchemaType) {
    // 略
  }

  async deleteHistoryService(historyDeleteRequest: HistoryDeleteRequestSchemaType) {
    // 略
  }
}
```

APIの内部の処理を記述する。modelのほうで定めた関数を実装する。`hyperdrive`はデータベースにアクセスするための値。

```typescript
const db = drizzle({ connection: this.hyperdrive });
```

drizzleのデータベースの接続。

```typescript
const result = await db.select().from(history).where(
    and(
        eq(history.from, from),
        eq(history.to, to)
    )
);
```

```typescript
const result = await db.insert(history).values(history).returning();
```

```typescript
const result = await db.delete(history).where(eq(history.id, id)).returning();
```
データベースの選択、挿入、削除。`history`は表の指定で、"../../db/schema"からimportする。`where`メソッドは条件の指定で、`and`や`eq`関数を用いる("drizzle-orm"からimport)。`returning`メソッドは挿入や削除、更新時に使えて、対象となった表の行の内容をすべて返す。

その他詳しいことはhttps://orm.drizzle.team/docs/data-querying参照。
