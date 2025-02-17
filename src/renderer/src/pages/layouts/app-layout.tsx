import { Header } from '@/renderer/components/header'
import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}