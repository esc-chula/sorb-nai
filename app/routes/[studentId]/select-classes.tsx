import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { env } from '~/env'
import { getClassInfoWithInRange } from '~/lib/classes'
import { cn } from '~/lib/utils'
import { useLanguage } from '~/providers/language'
import { classScheduleSchema, type ClassInfoWithInRange } from '~/types/class'
import { iseDataSchema, type IseEntry } from '~/types/ise'
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

  const iseFilePath = (context as any)?.ISE_FILE_PATH ?? env.ISE_FILE_PATH
  if (!iseFilePath) {
    throw new Error('Missing ISE_FILE_PATH')
  }
  const iseRes = await fetch(iseFilePath)
  if (!iseRes.ok) {
    throw new Error('Failed to fetch data')
  }

  const { data, success } = classScheduleSchema.safeParse(await res.json())
  const { data: iseData, success: iseSuccess } = iseDataSchema.safeParse(
    await iseRes.json()
  )

  if (!success || !iseSuccess) {
    return {
      classes: [],
      ise: [],
    }
  }

  const classesWithInRange = getClassInfoWithInRange(studentId, data)
  const ise: IseEntry[] = Object.values(iseData)

  return {
    classes: classesWithInRange,
    ise,
  }
}

export default function SelectClassesPage({
  loaderData,
}: Route.ComponentProps) {
  const { language } = useLanguage()
  const { classes, ise } = loaderData as unknown as {
    classes: ClassInfoWithInRange[]
    ise: IseEntry[]
  }
  const { studentId } = useParams()
  const [search, setSearch] = useState<string>('')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [showMode, setShowMode] = useState<'all' | 'in-range'>('in-range')
  const [tab, setTab] = useState<'thai' | 'ise'>('thai')
  const navigate = useNavigate()

  useEffect(() => {
    const storedSelectedClasses = localStorage.getItem('selectedClasses')
    if (storedSelectedClasses) {
      setSelectedClasses(JSON.parse(storedSelectedClasses))
    }
    const storedTab = localStorage.getItem('tab')
    if (storedTab) {
      setTab(storedTab as 'thai' | 'ise')
    }
  }, [])

  if (!studentId) {
    throw new Error('Student ID is required')
  }

  const handleContinue = () => {
    localStorage.setItem(
      'selectedClasses',
      JSON.stringify(
        selectedClasses.filter((code) => {
          const iseInfo = ise.find((c) => c.code === code)
          if (iseInfo) {
            return tab === 'ise'
          }
          return tab === 'thai'
        })
      )
    )
    if (tab === 'ise') {
      navigate(`/${studentId}/ise`)
    } else {
      localStorage.setItem('selectedSecs', JSON.stringify([]))
      navigate(`/${studentId}/schedule`)
    }
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
          <Tabs
            className='w-full'
            defaultValue='thai'
            value={tab}
            onValueChange={(value) => {
              setTab(value as 'thai' | 'ise')
              localStorage.setItem('tab', value)
            }}
          >
            <TabsList className='w-full'>
              <TabsTrigger value='thai'>
                {language === 'th' ? 'ภาคไทย' : 'Thai'}
              </TabsTrigger>
              <TabsTrigger value='ise'>
                {language === 'th' ? 'ISE' : 'ISE'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value='thai'>
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
            </TabsContent>
            <TabsContent value='ise'>
              <div className='flex max-h-[40dvh] w-full flex-col gap-2.5 overflow-y-auto sm:max-h-[500px] md:max-h-[600px] lg:max-h-[700px] xl:max-h-[800px]'>
                {ise
                  .filter((classInfo) => {
                    const { code, title } = classInfo
                    const isSelected = selectedClasses.includes(code)

                    return (
                      isSelected ||
                      title.toLowerCase().includes(search.toLowerCase()) ||
                      code.toLowerCase().includes(search.toLowerCase())
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className='flex w-full flex-col items-start gap-4'>
          <div
            className={cn(
              'flex items-center space-x-2',
              tab === 'ise' && 'hidden'
            )}
          >
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
