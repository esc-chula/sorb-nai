import { z } from 'zod'

export const iseGroupSchema = z.object({
  sec: z.string(),
  building: z.array(z.string()),
  room: z.array(z.string()),
})

export const iseEntrySchema = z.object({
  code: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  group: z.array(iseGroupSchema),
})

export const iseDataSchema = z.record(iseEntrySchema)

export type IseGroup = z.infer<typeof iseGroupSchema>
export type IseEntry = z.infer<typeof iseEntrySchema>
export type IseData = z.infer<typeof iseDataSchema>
