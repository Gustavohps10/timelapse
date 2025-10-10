import { Calendar1, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useAuth } from '@/hooks/use-auth'
import { useSync } from '@/hooks/use-sync'

interface ChartData {
  date: string
  day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex'
  dailyHours: number
}

const chartConfig = {
  desktop: {
    label: 'Horas',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

export function Dashboard() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  //const client = useClient()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const { user } = useAuth()
  const { timeEntriesCollection } = useSync()

  function CustomizedTick(props: any) {
    const { x, y, payload } = props
    const index = payload.index
    const formattedDate = chartData[index]?.date
      .split('-')
      .slice(1)
      .reverse()
      .join('/')

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={10} textAnchor="middle" fill="#666">
          <tspan x="0">{payload.value}</tspan> {/* Exibe "Seg", "Ter", etc. */}
          <tspan x="0" dy={18}>
            {formattedDate}
          </tspan>{' '}
          {/* Exibe "25/02", "26/02", etc. */}
        </text>
      </g>
    )
  }

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  console.log(timeEntriesCollection)
  useEffect(() => {
    console.log('USER', user)
    console.log('COOL', timeEntriesCollection)
    if (!user || !timeEntriesCollection) return

    const fetchTimeEntries = async () => {
      const today = new Date()
      const dayOfWeek = today.getDay()

      const monday = new Date(today)
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

      const friday = new Date(monday)
      friday.setDate(monday.getDate() + 4)

      const weekDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] = [
        'Seg',
        'Ter',
        'Qua',
        'Qui',
        'Sex',
      ]

      const formattedWeekDays = weekDays.map((_, index) => {
        const dayDate = new Date(monday)
        dayDate.setDate(monday.getDate() + index)
        return formatDate(dayDate)
      })

      const endDate = friday
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 30)

      // Consultar diretamente na collection
      const entries = await timeEntriesCollection
        .find()
        .where('user.id')
        .eq(user.id.toString())
        .where('createdAt')
        .gte(startDate.toISOString())
        .lte(endDate.toISOString())
        .exec()

      console.log(entries)
      const dailyHours: { [key: string]: number } = {}

      entries.forEach((entry) => {
        const dateKey = entry.createdAt.split('T')[0] // 'YYYY-MM-DD'
        const hours = entry.timeSpent ?? 0
        dailyHours[dateKey] = dailyHours[dateKey]
          ? (dailyHours[dateKey] += hours)
          : (dailyHours[dateKey] = hours)
      })

      const chartData = formattedWeekDays.map((date, index) => ({
        date,
        day: weekDays[index],
        dailyHours: dailyHours[date] || 0,
      }))

      setChartData(chartData)
    }

    fetchTimeEntries()
  }, [user, timeEntriesCollection])

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/components">Menu</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="my-2 mb-4 scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl">
        Dashboard
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={20} // Aumenta a margem inferior para evitar corte
                axisLine={false}
                tick={<CustomizedTick />} // Usa o componente personalizado
              />

              <YAxis domain={[0, 8.5]} tickFormatter={(value) => `${value}h`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="dailyHours"
                name="Horas"
                stroke="var(--primary)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="my-2 flex justify-between gap-2">
        <Card className="flex-1">
          <CardHeader className="pb-0 text-sm">
            <CardTitle className="flex justify-between">
              <span>
                {' '}
                Horas lançadas <br />
                (hoje){' '}
              </span>
              <Calendar1 />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="mt-1 scroll-m-20 font-mono text-2xl font-bold tracking-tighter text-zinc-800 dark:text-zinc-300">
              3:20
            </h1>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-0 text-sm font-normal">
            <CardTitle className="flex justify-between">
              <span className="block">
                Horas lançadas <br />
                (semana)
              </span>
              <CalendarDays />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="mt-1 scroll-m-20 font-mono text-2xl font-bold tracking-tighter text-zinc-800 dark:text-zinc-300">
              45:30
            </h1>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-0 text-sm">
            <CardTitle className="flex justify-between">
              <span className="block">
                Horas lançadas <br />
                (mês)
              </span>
              <CalendarDays />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="mt-1 scroll-m-20 font-mono text-2xl font-bold tracking-tighter text-zinc-800 dark:text-zinc-300">
              113:45
            </h1>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
