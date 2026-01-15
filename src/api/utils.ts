import { z } from "zod";

export const withDataEnvelope = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: schema,
  });
