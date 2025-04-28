import { format } from 'date-fns'
import { useMemo } from 'react'
import { getDateAndTimeFromString } from '~/lib/date'
import type { MyClassInfo } from '~/types/class'
import { th, enUS } from 'date-fns/locale'
import { useLanguage } from '~/providers/language'
import { google, ics, type CalendarEvent, outlook } from 'calendar-link'
import { Button } from './ui/button'
import { Calendar } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { GoogleCalendarIcon } from './logos/google-calendar'
import { Link } from 'react-router'
import { AppleLogo } from './logos/apple'
import { OutlookLogo } from './logos/outlook'

type ExamCardProps = Pick<
  MyClassInfo,
  'date' | 'time' | 'title' | 'code' | 'group'
>

export function ExamCard({ date, time, title, code, group }: ExamCardProps) {
  const { language } = useLanguage()

  const [start, end] = useMemo(
    () => getDateAndTimeFromString(date, time),
    [date, time]
  )

  const event: CalendarEvent = useMemo(
    () => ({
      title: `${code} ${title}`,
      start,
      end,
      location: `${language === 'th' ? 'อาคาร' : 'Building'} ${group.building} ${language === 'th' ? 'ห้อง' : 'Room'} ${group.room}`,
    }),
    []
  )

  return (
    <div className='border-border group flex size-full flex-col gap-1 rounded-lg border px-6 py-2.5 text-base shadow-sm'>
      <h2 className='text-esc-carmine-500 w-full font-semibold'>
        {code} {title}
      </h2>
      <div className='[&>*:nth-child(odd)]:text-muted-foreground [&>*:nth-child(even)]:text-esc-carmine-400 grid grid-cols-[auto_minmax(0,_1fr)] gap-2 text-sm [&>*:nth-child(even)]:font-semibold'>
        <p>{language === 'th' ? 'วันที่' : 'Date'}:</p>
        <p>
          {format(start, 'eee dd MMM yyyy', {
            locale: language === 'th' ? th : enUS,
          })}
        </p>
        <p>{language === 'th' ? 'เวลา' : 'Time'}:</p>
        <p>
          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
        </p>
        <p>{language === 'th' ? 'อาคาร' : 'Building'}:</p>
        <p>{group.building}</p>
        <p>{language === 'th' ? 'ห้อง' : 'Room'}:</p>
        <p>{group.room}</p>
        <p>{language === 'th' ? 'กลุ่ม' : 'Group'}:</p>
        <p>{group.range}</p>
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant='outline' className='w-full'>
            <Calendar />
            {language === 'th' ? 'เพิ่มลงในปฏิทิน' : 'Add to Calendar'}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {language === 'th'
                ? `เพิ่ม ${title} ลงในปฏิทิน`
                : `Add ${title} to Calendar`}
            </DrawerTitle>
            <DrawerDescription>
              {format(event.start, 'eeee d MMM yyyy เวลา HH:mm', {
                locale: language === 'th' ? th : enUS,
              })}{' '}
              -{' '}
              {format(event.end, 'HH:mm', {
                locale: language === 'th' ? th : enUS,
              })}
              <br />
              {event.location}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant='outline' className='w-full' asChild>
              <Link to={google(event)} target='_blank'>
                <GoogleCalendarIcon className='size-4' /> Google Calendar
              </Link>
            </Button>
            <Button variant='outline' className='w-full' asChild>
              <Link to={ics(event)} target='_blank'>
                <AppleLogo className='size-4' /> Apple Calendar (ICS)
              </Link>
            </Button>
            <Button variant='outline' className='w-full' asChild>
              <Link to={outlook(event)} target='_blank'>
                <OutlookLogo className='size-4' /> Outlook
              </Link>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
