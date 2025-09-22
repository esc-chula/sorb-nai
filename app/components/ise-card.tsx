import { format } from 'date-fns'
import { enUS, th } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { getDateAndTimeFromString } from '~/lib/date'
import { useLanguage } from '~/providers/language'
import type { IseEntry } from '~/types/ise'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { Button } from './ui/button'
import { Calendar } from 'lucide-react'
import { Link } from 'react-router'
import { google, ics, outlook, type CalendarEvent } from 'calendar-link'
import { GoogleCalendarIcon } from './logos/google-calendar'
import { OutlookLogo } from './logos/outlook'
import { AppleLogo } from './logos/apple'

type ExamCardProps = Pick<
  IseEntry,
  'date' | 'time' | 'title' | 'code' | 'group'
>

export function IseCard({ date, time, title, code, group }: ExamCardProps) {
  const { language } = useLanguage()
  const [selectedSec, setSelectedSec] = useState<string>()

  const [start, end] = useMemo(
    () => getDateAndTimeFromString(date, time, true),
    [date, time]
  )

  useEffect(() => {
    const selectedSecs = localStorage.getItem('selectedSecs')
    if (selectedSecs) {
      const parsedSelectedSecs = JSON.parse(selectedSecs)
      const selectedSec = parsedSelectedSecs[code]
      if (selectedSec) {
        setSelectedSec(selectedSec)
      } else {
        setSelectedSec(group[0].sec)
        localStorage.setItem(
          'selectedSecs',
          JSON.stringify({ ...parsedSelectedSecs, [code]: group[0].sec })
        )
      }
    } else {
      setSelectedSec(group[0].sec)
      localStorage.setItem(
        'selectedSecs',
        JSON.stringify({ [code]: group[0].sec })
      )
    }
  }, [])

  const event: CalendarEvent = useMemo(() => {
    const selectedGroup = group.find((g) => g.sec === selectedSec)
    if (!selectedGroup) {
      return {
        title: `${code} ${title}`,
        start,
        end,
        location: '',
      }
    }

    const { building, room } = selectedGroup

    const location = building
      .map((b, i) => {
        const roomNumber = room[i]
        return `${language === 'th' ? 'อาคาร' : 'Building'} ${b} ${
          language === 'th' ? 'ห้อง' : 'Room'
        } ${roomNumber}`
      })
      .join(', ')

    return {
      title: `${code} ${title}`,
      start,
      end,
      location,
    }
  }, [selectedSec])

  const handleSelectSec = (sec: string) => {
    setSelectedSec(sec)
    const selectedSecs = localStorage.getItem('selectedSecs')
    if (selectedSecs) {
      const parsedSelectedSecs = JSON.parse(selectedSecs)
      localStorage.setItem(
        'selectedSecs',
        JSON.stringify({ ...parsedSelectedSecs, [code]: sec })
      )
    } else {
      localStorage.setItem('selectedSecs', JSON.stringify({ [code]: sec }))
    }
  }

  if (
    start.getTime() === 253402189200000 &&
    end.getTime() === 253402189200000
  ) {
    return (
      <div className='border-border group flex size-full flex-col gap-1 rounded-lg border bg-stone-200 px-6 py-2.5 text-base shadow-sm'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-esc-carmine-500 w-full font-semibold'>
            {code} {title}
          </h2>
        </div>
        <div className='text-muted-foreground text-sm'>
          {language === 'th'
            ? 'วันที่และเวลาจะประกาศอีกครั้ง'
            : 'Date and time to be announced'}
        </div>
      </div>
    )
  } else if (start.getTime() === 0 && end.getTime() === 0) {
    return (
      <div className='border-border group flex size-full flex-col gap-1 rounded-lg border bg-stone-200 px-6 py-2.5 text-base shadow-sm'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-esc-carmine-500 w-full font-semibold'>
            {code} {title}
          </h2>
        </div>
        <div className='text-muted-foreground text-sm'>
          {language === 'th'
            ? 'วิชานี้ถูกยกเลิกการสอบ'
            : 'This exam has been cancelled'}
        </div>
      </div>
    )
  }

  return (
    <div className='border-border group flex size-full flex-col gap-1 rounded-lg border px-6 py-2.5 text-base shadow-sm'>
      <div className='flex items-center justify-between gap-2'>
        <h2 className='text-esc-carmine-500 w-full font-semibold'>
          {code} {title}
        </h2>
        <Select value={selectedSec} onValueChange={handleSelectSec}>
          <SelectTrigger disabled={group.length === 1}>
            {selectedSec ? (
              <span className='text-esc-carmine-500'>{selectedSec}</span>
            ) : (
              <span className='text-muted-foreground'>
                {language === 'th' ? 'เลือกเซค' : 'Select Sec.'}
              </span>
            )}
          </SelectTrigger>
          <SelectContent>
            {group.map((g) => (
              <SelectItem key={g.sec} value={g.sec}>
                {g.sec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='[&>*:nth-child(odd)]:text-muted-foreground [&>*:nth-child(even)]:text-esc-carmine-400 grid grid-cols-[auto_minmax(0,_1fr)] gap-2 text-sm [&>*:nth-child(even)]:font-semibold'>
        <p>{language === 'th' ? 'วันที่' : 'Date'}:</p>
        <p>
          {format(start, 'eee d MMM yyyy', {
            locale: language === 'th' ? th : enUS,
          })}
        </p>
        <p>{language === 'th' ? 'เวลา' : 'Time'}:</p>
        <p>
          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
        </p>
        <div className='col-span-2'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'th' ? 'เซค' : 'Sec.'}</TableHead>
                <TableHead>
                  {language === 'th' ? 'อาคาร' : 'Building'}
                </TableHead>
                <TableHead>{language === 'th' ? 'ห้อง' : 'Room'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group
                .filter((g) => g.sec === selectedSec)
                .map((g) =>
                  g.building.map((b, i) => (
                    <TableRow key={i}>
                      <TableCell className='font-semibold'>
                        {i === 0 && g.sec}
                      </TableCell>
                      <TableCell>{b}</TableCell>
                      <TableCell>{g.room[i]}</TableCell>
                    </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
        </div>
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
