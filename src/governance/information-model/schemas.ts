import { z } from "zod";

  export const consultingSevicesSchema = z.object({
    title: z.string(),
    metatitle: z.string(),
    type: z.string(),
    keywords: z.string().optional().nullable(),
    description: z.string(),
    url: z.string().optional().nullable(),
    path: z.string().optional().nullable(),
    categories: z.string().optional().nullable(),
    date: z.date().optional().nullable(),
    author: z.string().optional().nullable(),
    excerpt: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    catslug: z.array(z.string()).optional().nullable(),
    category: z.array(z.string()).optional().nullable(),
    weight: z.number().optional(),
    slugid: z.string().optional().nullable(),
    layout: z.string().optional().nullable(),
  })
  .strict();
