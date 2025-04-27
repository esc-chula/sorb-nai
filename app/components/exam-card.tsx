import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { getDateAndTimeFromString } from '~/lib/date'
import type { MyClassInfo } from '~/types/class'
import { th, enUS } from 'date-fns/locale'
import { useLanguage } from '~/providers/language'

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

  const [selected, setSelected] = useState(false)

  return (
    <div
      className='border-border group flex size-full flex-col gap-1 rounded-lg border px-6 py-2.5 text-base shadow-sm'
      onClick={() => setSelected((prev) => !prev)}
    >
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
        <p>{language === 'th' ? 'ตึก' : 'Building'}:</p>
        <p>{group.building}</p>
        <p>{language === 'th' ? 'ห้อง' : 'Room'}:</p>
        <p>{group.room}</p>
        {selected && (
          <>
            <p>{language === 'th' ? 'กลุ่ม' : 'Group'}:</p>
            <p>{group.range}</p>
          </>
        )}
      </div>
    </div>
  )
}
