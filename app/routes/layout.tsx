import { Outlet } from 'react-router'
import { AppSidebar } from '~/components/app-sidebar'
import { Header } from '~/components/header'
import { SidebarProvider } from '~/components/ui/sidebar'
import { Toaster } from '~/components/ui/sonner'
import { LanguageProvider } from '~/providers/language'

export default function Layout() {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className='flex min-h-dvh w-full flex-col bg-[url(/cloud.png)] bg-top bg-repeat'>
          <Header />
          <Outlet />
        </main>
        <Toaster richColors />
      </SidebarProvider>
    </LanguageProvider>
  )
}
