import { Moon, Sun } from "lucide-react"
 
import { Button } from "@/renderer/components/ui/button"
import { useTheme } from "@/renderer/components/theme-provider"
 
export function ModeToggle({...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const { setTheme, theme } = useTheme()
 
  function handleToggleTheme() {
    if(theme == 'dark') {
      setTheme('light')
      return
    }

    setTheme('dark')
  }
  return (
    <>
      <Button variant="ghost" size="icon" {...props} onClick={handleToggleTheme}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </>
  )
}