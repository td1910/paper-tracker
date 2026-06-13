import { z } from 'zod';

export const ArxivEntrySchema = z.object({
  id: z.string(),
  published: z.string().or(z.date()),
  title: z.string(),
  summary: z.string(),
  author: z.union([
    z.object({ name: z.string() }),
    z.array(z.object({ name: z.string() }))
  ])
});

export function validateArxivEntry(entry: any) {
  return ArxivEntrySchema.parse(entry);
}
