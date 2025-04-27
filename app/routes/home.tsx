import { useNavigate } from 'react-router'
import {
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useLanguage } from '~/providers/language'

const formSchema = z.object({
  studentId: z
    .string()
    .length(10, { message: 'Student ID must be 10 characters long' })
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Student ID must be only digits',
    })
    .refine((val) => val.endsWith('21'), {
      message: 'Student ID must end with 21',
    }),
})

type FormData = z.infer<typeof formSchema>

export default function Home() {
  const { language } = useLanguage()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
    },
  })
  const navigate = useNavigate()

  useEffect(() => {
    const studentId = localStorage.getItem('studentId')
    if (studentId) {
      form.setValue('studentId', studentId)
    }
  }, [form])

  const onValidSubmit: SubmitHandler<FormData> = (data) => {
    localStorage.setItem('studentId', data.studentId)
    navigate(`/${data.studentId}`)
  }
  const onInvalidSubmit: SubmitErrorHandler<FormData> = (errors) => {
    if (errors.studentId) {
      toast.error(errors.studentId.message)
    }
  }

  return (
    <div className='mx-auto flex size-full max-w-3xl items-center justify-center p-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-3xl font-semibold tracking-tighter text-neutral-800'>
            {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
          </CardTitle>
          <CardDescription className='text-base'>
            {language === 'th'
              ? 'โปรดเข้าสู่ระบบด้วยเลขนิสิตของคุณ'
              : 'Please log in with your student ID'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)}
              className='flex flex-col gap-4'
            >
              <FormField
                control={form.control}
                name='studentId'
                render={({ field }) => (
                  <FormItem className=''>
                    <FormLabel className='text-lg font-semibold'>
                      {language === 'th' ? 'เลขนิสิต' : 'Student ID'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='6xxxxxxx21' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' size='lg'>
                {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
