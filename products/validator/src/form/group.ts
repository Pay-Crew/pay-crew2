import { registerGroupDebtRequestSchema, type RegisterGroupDebtRequestSchemaType } from '../request/group';

export const RegisterGroupDebtFormSchema = registerGroupDebtRequestSchema.omit({ group_id: true });

export type RegisterGroupDebtFormSchemaType = Omit<RegisterGroupDebtRequestSchemaType, 'group_id'>;
