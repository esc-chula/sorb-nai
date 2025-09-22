import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ExamCard } from '~/components/exam-card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { env } from '~/env'
import { getMyClassInfoWithInRange } from '~/lib/classes'
import { getDateAndTimeFromString } from '~/lib/date'
import { useLanguage } from '~/providers/language'
import {
  classScheduleSchema,
  type MyClassInfo,
  type MyClassInfoWithInRange,
} from '~/types/class'
import type { Route } from '../../+types/root'

export async function loader({ params, context }: Route.LoaderArgs) {
  const { studentId } = params
  if (!studentId) {
    throw new Error('Student ID is required')
  }

  const filePath = (context as any)?.FILE_PATH ?? env.FILE_PATH
  if (!filePath) {
    throw new Error('Missing FILE_PATH')
  }
  const res = await fetch(filePath)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  const { data, success } = classScheduleSchema.safeParse(await res.json())

  if (!success) {
    return {
      classes: [],
    }
  }

  const myClassesWithInRange = getMyClassInfoWithInRange(studentId, data)

  return {
    classes: myClassesWithInRange,
  }
}

export default function SchedulePage({ loaderData }: Route.ComponentProps) {
  const { language } = useLanguage()
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { classes } = loaderData as unknown as {
    classes: MyClassInfoWithInRange[]
  }
  const [upcomingClasses, setUpcomingClasses] = useState<MyClassInfo[]>([])
  const [pastClasses, setPastClasses] = useState<MyClassInfo[]>([])
  const [noDataClasses, setNoDataClasses] = useState<string[]>([])

  useEffect(() => {
    if (localStorage.getItem('tab') === 'ise') {
      navigate(`/${studentId}/ise`)
    }
  }, [])

  useEffect(() => {
    const selectedClasses = localStorage.getItem('selectedClasses')
    if (!selectedClasses) {
      setUpcomingClasses([])
      setPastClasses([])
      setNoDataClasses([])
      return
    }

    const parsedClasses = JSON.parse(selectedClasses) as string[]

    const filteredClasses = classes.filter((classInfo) =>
      parsedClasses.some((c) => c === classInfo.code)
    )

    const noDataClasses = parsedClasses.filter(
      (classCode) =>
        !filteredClasses.some((classInfo) => classInfo.code === classCode)
    )
    setNoDataClasses(noDataClasses)

    const today = new Date()
    const upcomingClasses = filteredClasses
      .filter((classInfo) => {
        const [startDate] = getDateAndTimeFromString(
          classInfo.date,
          classInfo.time
        )
        return startDate >= today
      })
      .sort((a, b) => {
        const [startDateA] = getDateAndTimeFromString(a.date, a.time)
        const [startDateB] = getDateAndTimeFromString(b.date, b.time)
        return startDateA.getTime() - startDateB.getTime()
      })
    const pastClasses = filteredClasses
      .filter((classInfo) => {
        const [startDate] = getDateAndTimeFromString(
          classInfo.date,
          classInfo.time
        )
        return startDate < today
      })
      .sort((a, b) => {
        const [startDateA] = getDateAndTimeFromString(a.date, a.time)
        const [startDateB] = getDateAndTimeFromString(b.date, b.time)
        return startDateA.getTime() - startDateB.getTime()
      })
    setUpcomingClasses(upcomingClasses)
    setPastClasses(pastClasses)
  }, [classes])

  if (!studentId) {
    throw new Error('Student ID is required')
  }

  return (
    <div className='mx-auto flex size-full max-w-4xl flex-col items-center gap-4 p-4'>
      <Accordion
        type='multiple'
        className='flex w-full flex-col gap-4'
        defaultValue={['upcoming']}
      >
        <Card className='w-full'>
          <AccordionItem value='upcoming' className='w-full'>
            <CardHeader>
              <AccordionTrigger>
                <CardTitle className='text-base'>
                  {language === 'th' ? 'วิชาที่กำลังจะสอบ' : 'Upcoming Exams'}
                </CardTitle>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className='flex w-full flex-col gap-2 overflow-auto'>
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((classInfo) => (
                    <ExamCard key={classInfo.code} {...classInfo} />
                  ))
                ) : (
                  <span>
                    {language === 'th'
                      ? 'ไม่มีวิชาที่กำลังจะสอบ'
                      : 'No upcoming exams'}
                  </span>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        <Card className='w-full'>
          <AccordionItem value='past' className='w-full'>
            <CardHeader>
              <AccordionTrigger>
                <CardTitle className='text-base'>
                  {language === 'th' ? 'วิชาที่สอบไปแล้ว' : 'Past Exams'}
                </CardTitle>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className='flex w-full flex-col gap-2 overflow-auto'>
                {pastClasses.length > 0 ? (
                  pastClasses.map((classInfo) => (
                    <ExamCard key={classInfo.code} {...classInfo} />
                  ))
                ) : (
                  <span>
                    {language === 'th'
                      ? 'ไม่มีวิชาที่สอบไปแล้ว'
                      : 'No past exams'}
                  </span>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {noDataClasses.length > 0 && (
          <Card className='w-full'>
            <AccordionItem value='no-data' className='w-full'>
              <CardHeader>
                <AccordionTrigger>
                  <CardTitle className='text-base'>
                    {language === 'th' ? 'ไม่มีข้อมูล' : 'No Exam Data'}
                  </CardTitle>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className='flex w-full flex-col gap-2 overflow-auto'>
                  {noDataClasses.map((classInfo) => (
                    <div key={classInfo} className='flex items-center gap-2'>
                      <span>{classInfo}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <span className='text-muted-foreground text-sm'>
                    {language === 'th'
                      ? 'ทางเราไม่มีข้อมูลการสอบสำหรับวิชาเหล่านี้ของคุณ'
                      : 'We have no exam data for these classes'}
                  </span>
                </CardFooter>
              </AccordionContent>
            </AccordionItem>
          </Card>
        )}
      </Accordion>
      <Button asChild size='lg' className='w-full'>
        <Link to={`/${studentId}`}>
          {language === 'th' ? 'เลือกวิชาเพิ่ม' : 'Select More Classes'}
        </Link>
      </Button>
    </div>
  )
}
