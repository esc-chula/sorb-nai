import { z } from 'zod'

export const groupSchema = z.object({
  building: z.string(),
  room: z.string(),
  students: z.number(),
  range: z.string(),
})

export const classInfoSchema = z.object({
  date: z.string(),
  time: z.string(),
  code: z.string(),
  title: z.string(),
  sum_student: z.number(),
  group: z.array(groupSchema),
})

export const myClassInfoSchema = z.object({
  date: z.string(),
  time: z.string(),
  code: z.string(),
  title: z.string(),
  sum_student: z.number(),
  group: groupSchema,
})

export const classScheduleSchema = z.record(classInfoSchema)

export type Group = z.infer<typeof groupSchema>
export type ClassInfo = z.infer<typeof classInfoSchema>
export type ClassSchedule = z.infer<typeof classScheduleSchema>
export type MyClassInfo = z.infer<typeof myClassInfoSchema>

export interface ClassInfoWithInRange extends ClassInfo {
  inRange: boolean
}

export interface MyClassInfoWithInRange extends MyClassInfo {
  inRange: boolean
}
