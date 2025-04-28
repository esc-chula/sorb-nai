import { parse } from 'date-fns'

export function getDateAndTimeFromString(
  date: string,
  time: string,
  ise: boolean = false
): [Date, Date] {
  const parsedDate = parse(date, 'EEE d MMM yy', new Date())
  const [startTime, endTime] = time.split('-')
  const [startHour, startMinute] = startTime.split(ise ? '.' : ':').map(Number)
  const [endHour, endMinute] = endTime.split(ise ? '.' : ':').map(Number)
  const startDate = new Date(parsedDate)
  startDate.setHours(startHour ?? 0, startMinute ?? 0, 0, 0)
  const endDate = new Date(parsedDate)
  endDate.setHours(endHour ?? 0, endMinute ?? 0, 0, 0)
  return [startDate, endDate]
}
