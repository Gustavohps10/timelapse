import { Moon, Sun } from 'lucide-react'

import { Button } from '@/presentation/renderer/components/ui/button'
import { useTheme } from '@/presentation/renderer/components/theme-provider'

export function ModeToggle({
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { setTheme, theme } = useTheme()

  function handleToggleTheme() {
    if (theme == 'dark') {
      setTheme('light')
      return
    }

    setTheme('dark')
  }
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        {...props}
        onClick={handleToggleTheme}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
    </>
  )
}
