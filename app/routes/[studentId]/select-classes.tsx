import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import type { Route } from '../../+types/root'
import { env } from '~/env'
import { classScheduleSchema, type ClassInfoWithInRange } from '~/types/class'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'
import { useNavigate, useParams } from 'react-router'
import { getClassInfoWithInRange } from '~/lib/classes'
import { useLanguage } from '~/providers/language'

export async function loader({ params }: Route.LoaderArgs) {
  const { studentId } = params
  if (!studentId) {
    throw new Error('Student ID is required')
  }

  const res = await fetch(env.FILE_PATH)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  const { data, success } = classScheduleSchema.safeParse(await res.json())

  if (!success) {
    return {
      classes: [],
    }
  }

  const classesWithInRange = getClassInfoWithInRange(studentId, data)

  return {
    classes: classesWithInRange,
  }
}

export default function SelectClassesPage({
  loaderData,
}: Route.ComponentProps) {
  const { language } = useLanguage()
  const { classes } = loaderData as unknown as {
    classes: ClassInfoWithInRange[]
  }
  const { studentId } = useParams()
  const [search, setSearch] = useState<string>('')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [showMode, setShowMode] = useState<'all' | 'in-range'>('in-range')
  const navigate = useNavigate()

  useEffect(() => {
    const storedSelectedClasses = localStorage.getItem('selectedClasses')
    if (storedSelectedClasses) {
      setSelectedClasses(JSON.parse(storedSelectedClasses))
    }
  }, [])

  if (!studentId) {
    throw new Error('Student ID is required')
  }

  const handleContinue = () => {
    localStorage.setItem('selectedClasses', JSON.stringify(selectedClasses))
    navigate(`/${studentId}/schedule`)
  }

  return (
    <div className='mx-auto flex h-full w-full max-w-4xl flex-col items-center gap-4 p-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>
            {language === 'th'
              ? 'โปรดเลือกวิชาที่คุณลงทะเบียน'
              : 'Please select the classes you are registered for'}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex w-full flex-col items-center gap-4'>
          <div className='relative flex w-full items-center'>
            <Search className='text-muted-foreground absolute left-2 top-1/2 size-5 -translate-y-1/2' />
            <Input
              placeholder={language === 'th' ? 'ค้นหาวิชา' : 'Search classes'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-8'
            />
          </div>
          <div className='flex max-h-[40dvh] w-full flex-col gap-2.5 overflow-y-auto sm:max-h-[500px] md:max-h-[600px] lg:max-h-[700px] xl:max-h-[800px]'>
            {classes
              .filter((classInfo) => {
                const { code, title } = classInfo
                const isSelected = selectedClasses.includes(code)

                return (
                  isSelected ||
                  ((title.toLowerCase().includes(search.toLowerCase()) ||
                    code.toLowerCase().includes(search.toLowerCase())) &&
                    (showMode === 'in-range' ? classInfo.inRange : true))
                )
              })
              .map((classInfo) => {
                const { code, title } = classInfo
                const isSelected = selectedClasses.includes(code)

                return (
                  <Button
                    key={code}
                    asChild
                    variant='outline'
                    onClick={() => {
                      if (isSelected) {
                        setSelectedClasses((prev) =>
                          prev.filter((c) => c !== code)
                        )
                      } else {
                        setSelectedClasses((prev) => [...prev, code])
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'flex h-max w-full items-start justify-start gap-1 px-6 py-2.5 shadow-sm transition-colors duration-150 hover:underline',
                        isSelected
                          ? 'bg-esc-carmine-400 text-esc-carmine-50 border-esc-carmine-600 hover:bg-esc-carmine-400 hover:text-esc-carmine-50'
                          : 'bg-card text-esc-carmine-400 border-esc-carmine-200 hover:bg-card hover:text-esc-carmine-400'
                      )}
                    >
                      <span>{code}</span>
                      <span className='w-full truncate'>{title}</span>
                    </div>
                  </Button>
                )
              })}
          </div>
        </CardContent>
        <CardFooter className='flex w-full flex-col items-start gap-4'>
          <div className='flex items-center space-x-2'>
            <Switch
              id='show-mode'
              checked={showMode === 'in-range'}
              onCheckedChange={(checked) => {
                setShowMode(checked ? 'in-range' : 'all')
              }}
            />
            <Label htmlFor='show-mode'>
              {language === 'th'
                ? showMode === 'in-range'
                  ? 'แสดงเฉพาะวิชาที่เลขนิสิตของคุณอยู่ในช่วง'
                  : 'แสดงวิชาทั้งหมด'
                : showMode === 'in-range'
                  ? 'Show only classes your student ID is in range'
                  : 'Show all classes'}
            </Label>
          </div>
          <Button className='w-full' size='lg' onClick={handleContinue}>
            {language === 'th' ? 'ดำเนินการต่อ' : 'Continue'}
          </Button>
        </CardFooter>
      </Card>
      <p className='text-muted-foreground self-start text-sm'>
        {language === 'th'
          ? 'หมายเหตุ: วิชาไหนที่ไม่มีในนี้ให้ไปหาห้องสอบเอง อันนี้คือเอาจากที่มีในวิศวะ'
          : 'Note: If a class is not listed here, please find the exam room yourself. This is based on the information available in the Faculty of Engineering.'}
      </p>
    </div>
  )
}
