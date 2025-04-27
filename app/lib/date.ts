import { parse } from 'date-fns'

export function getDateAndTimeFromString(
  date: string,
  time: string
): [Date, Date] {
  const parsedDate = parse(date, 'EEE d MMM yy', new Date())
  const [startTime, endTime] = time.split('-')
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const startDate = new Date(parsedDate)
  startDate.setHours(startHour, startMinute, 0, 0)
  const endDate = new Date(parsedDate)
  endDate.setHours(endHour, endMinute, 0, 0)
  return [startDate, endDate]
}
