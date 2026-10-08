'use client'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

interface AppShellProps {
  children: React.ReactNode
  title?: string
}

export function AppShell({ children, title }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <Sidebar isMobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* FIXED: Perfectly docks to the 215px Sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-[215px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        
        <main className="flex-1 overflow-y-auto">
          {/* This applies exactly 24px padding globally */}
          <div className="page-enter min-h-full p-4 lg:p-6 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}