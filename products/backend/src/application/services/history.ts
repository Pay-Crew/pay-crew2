import { drizzle } from 'drizzle-orm/node-postgres';
import { history } from '../../db/schema';
import {
  HistoryDeleteRequestSchemaType,
  HistoryDeleteResponseSchemaType,
  HistoryGetResponseSchemaType,
  HistoryPostRequestSchemaType,
  HistoryPostResponseSchemaType,
} from 'validator';
import { HistoryServiceType } from '../model/history';
import { and, eq } from 'drizzle-orm';

export class HistoryService implements HistoryServiceType {
  private hyperdrive: Readonly<Hyperdrive>;

  constructor(hyperdrive: Hyperdrive) {
    this.hyperdrive = hyperdrive;
  }

  // データベースのhistoryの行の全取得
  async selectHistoryDBAll(): Promise<(typeof history.$inferSelect)[]> {
    const db = drizzle({ connection: this.hyperdrive });
    const result = await db.select().from(history);
    return result;
  }

  // データベースのhistoryの行の取得(fromとtoを指定)
  async selectHistoryDBByFromTo({ from, to }: { from: string; to: string }): Promise<(typeof history.$inferSelect)[]> {
    const db = drizzle({ connection: this.hyperdrive });
    const result = await db
      .select()
      .from(history)
      .where(and(eq(history.from, from), eq(history.to, to)));
    return result;
  }

  // データベースのhistoryの行の挿入(fromとtoとamountを指定)
  async insertHistoryDB(historyData: typeof history.$inferInsert): Promise<(typeof history.$inferSelect)[]> {
    const db = drizzle({ connection: this.hyperdrive });
    const result = await db.insert(history).values(historyData).returning();
    return result;
  }

  // データベースのhistoryの行の削除(idを指定)
  async deleteHistoryDBById({ id }: { id: number }): Promise<(typeof history.$inferSelect)[]> {
    const db = drizzle({ connection: this.hyperdrive });
    const result = await db.delete(history).where(eq(history.id, id)).returning();
    return result;
  }

  // /api/historyのGET
  async getHistoryService(): Promise<HistoryGetResponseSchemaType> {
    const result = await this.selectHistoryDBAll();
    return result;
  }

  // /api/historyのPOST
  async postHistoryService(historyPostRequest: HistoryPostRequestSchemaType): Promise<HistoryPostResponseSchemaType> {
    const match_data = await this.selectHistoryDBByFromTo({
      from: historyPostRequest.from,
      to: historyPostRequest.to,
    });
    if (match_data.length > 0) {
      await this.deleteHistoryDBById({ id: match_data[0].id });
      historyPostRequest.amount += match_data[0].amount;
    }

    const reverse_match_data = await this.selectHistoryDBByFromTo({
      from: historyPostRequest.to,
      to: historyPostRequest.from,
    });
    if (reverse_match_data.length > 0) {
      await this.deleteHistoryDBById({ id: reverse_match_data[0].id });
      historyPostRequest.amount -= reverse_match_data[0].amount;
      if (historyPostRequest.amount < 0) {
        const temp = historyPostRequest.from;
        historyPostRequest.from = historyPostRequest.to;
        historyPostRequest.to = temp;
        historyPostRequest.amount = -historyPostRequest.amount;
      }
    }
    if (historyPostRequest.amount === 0) {
      return null;
    }

    const result = await this.insertHistoryDB(historyPostRequest);
    return result;
  }

  // /api/historyのDELETE
  async deleteHistoryService(
    historyDeleteRequest: HistoryDeleteRequestSchemaType
  ): Promise<HistoryDeleteResponseSchemaType> {
    const result = await this.deleteHistoryDBById({ id: historyDeleteRequest.id });
    return result.length > 0 ? result[0] : null;
  }
}
