import {
  HistoryGetResponseSchemaType,
  HistoryPostRequestSchemaType,
  HistoryPostResponseSchemaType,
  HistoryDeleteRequestSchemaType,
  HistoryDeleteResponseSchemaType,
} from 'validator';

export type HistoryServiceType = {
  // /api/historyのGET
  getHistoryService: () => Promise<HistoryGetResponseSchemaType>;
  // /api/historyのPOST
  postHistoryService: (historyPostRequest: HistoryPostRequestSchemaType) => Promise<HistoryPostResponseSchemaType>;
  // /api/historyのDELETE
  deleteHistoryService: (
    historyDeleteRequest: HistoryDeleteRequestSchemaType
  ) => Promise<HistoryDeleteResponseSchemaType>;
};
