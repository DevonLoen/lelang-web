import { z } from 'zod';

export const withDataEnvelope = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: schema,
  });

export const PaginationMetaSchema = z.object({
  page: z.number(),
  size: z.number(),
  totalPage: z.number(),
  totalData: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  data: T[];
}

export const withPaginationEnvelope = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    meta: z.object({
      page: z.number(),
      size: z.number(),
      totalPage: z.number(),
      totalData: z.number(),
    }),
    data: schema,
  });
