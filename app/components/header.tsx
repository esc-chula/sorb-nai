import { SidebarTrigger } from './ui/sidebar'

export function Header() {
  return (
    <header className='bg-card sticky top-0 z-50 flex w-full px-4 py-5 shadow-md'>
      <div className='flex w-full justify-between'>
        <img src='/logo.svg' alt='logo' />
        <SidebarTrigger />
      </div>
    </header>
  )
}
