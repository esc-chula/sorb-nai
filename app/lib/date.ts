import { parse } from 'date-fns'

export function getDateAndTimeFromString(
  date: string,
  time: string,
  ise: boolean = false
): [Date, Date] {
  return ise ? dateTimeISE(date, time) : dateTimeThai(date, time)
}

function dateTimeThai(date: string, time: string): [Date, Date] {
  const year = String(Number(date.split('-')[2]) - 43)
  date = date.split('-').slice(0, 2).join('-') + '-' + year
  const parsedDate = parse(date, 'dd-MM-yy', new Date())
  const [startTime, endTime] = time.split('-')
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const startDate = new Date(parsedDate)
  startDate.setHours(startHour, startMinute)
  const endDate = new Date(parsedDate)
  endDate.setHours(endHour, endMinute)
  console.log({ date, time, startDate, endDate })
  return [startDate, endDate]
}

function dateTimeISE(date: string, time: string): [Date, Date] {
  if (date === 'TDF' || time === 'TDF') {
    return [new Date(253402189200000), new Date(253402189200000)]
  } else if (date === 'CANCELLED' || time === 'CANCELLED') {
    return [new Date(0), new Date(0)]
  }
  const parsedDate = parse(date, 'EEE dd MMM yy', new Date())
  const [startTime, endTime] = time.split('-')
  const [startHour, startMinute] = startTime.split('.').map(Number)
  const [endHour, endMinute] = endTime.split('.').map(Number)
  const startDate = new Date(parsedDate)
  startDate.setHours(startHour, startMinute)
  const endDate = new Date(parsedDate)
  endDate.setHours(endHour, endMinute)
  return [startDate, endDate]
}
