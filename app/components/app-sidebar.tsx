import { Globe, LogIn, LogOut, Search, Table, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import { useLanguage } from '~/providers/language'

export function AppSidebar() {
  const { language, onLanguageChange } = useLanguage()
  const [studentId, setStudentId] = useState('')
  const { studentId: studentIdParam } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (studentIdParam) {
      setStudentId(studentIdParam)
      localStorage.setItem('studentId', studentIdParam)
    }
    const storedStudentId = localStorage.getItem('studentId')
    if (storedStudentId) {
      setStudentId(storedStudentId)
    }
  }, [studentIdParam])

  const handleLogout = () => {
    localStorage.removeItem('studentId')
    localStorage.removeItem('selectedClasses')
    setStudentId('')
    navigate('/')
  }

  return (
    <Sidebar side='right'>
      <SidebarTrigger className='absolute right-4 top-6 z-50' />
      <SidebarContent className='px-4 pt-8'>
        <SidebarGroup>
          <SidebarGroupLabel className='text-primary gap-2 text-2xl font-semibold'>
            <img src='/logo.svg' alt='logo' />
            <span>{language === 'th' ? 'สอบไหน' : 'SorbNai'}</span>
          </SidebarGroupLabel>
          {studentId ? (
            <SidebarGroupContent className='mt-4'>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to={`/`}>
                      <User />
                      <span>{studentId}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to={`/${studentId}`}>
                      <Search />
                      <span>
                        {language === 'th'
                          ? 'ค้นหาวิชาเรียน'
                          : 'Search Classes'}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to={`/${studentId}/schedule`}>
                      <Table />
                      <span>
                        {language === 'th' ? 'ห้องสอบ' : 'Exam Rooms'}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          ) : null}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLanguageChange}>
                  <Globe />
                  <span>
                    {' '}
                    {language === 'th' ? 'เปลี่ยนภาษา' : 'Switch Language'}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {studentId ? (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}>
                    <LogOut />
                    <span>{language === 'th' ? 'ออกจากระบบ' : 'Logout'}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to={`/`}>
                      <LogIn />
                      <span>{language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
