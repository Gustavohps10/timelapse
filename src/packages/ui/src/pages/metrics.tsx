import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import {
  AlarmClockOff,
  BarChartHorizontal,
  Calendar,
  CalendarCheck2,
  CalendarClock,
  Clock4,
  Grid,
  MessageSquareWarning,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'

import { DatePickerWithRange } from '@/components'
import { Badge } from '@/components/ui/badge'
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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { useSyncStore } from '@/stores/syncStore'

interface TimelineChartData {
  date: string
  day: string
  dailyHours: number
}
interface ActivityChartData {
  activity: string
  hours: number
  fill: string
}
interface EstimatedVsSpentData {
  task: string
  estimado: number
  gasto: number
}
interface PunctualityData {
  name: string
  value: number
  fill: string
}
interface AvgHoursPerDayData {
  day: string
  averageHours: number
}
interface OvertimeData {
  daysWithOvertime: number
  chartData: Array<{
    date: string
    day: string
    overtimeHours: number
  }>
}
type HeatmapData = Record<string, Record<string, number>>

const getMonday = (d: Date): Date => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

const formatHours = (hours: number): string => {
  if (isNaN(hours) || hours < 0.01) return '00:00'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const parseUTCDate = (dateString: string | undefined): Date => {
  if (!dateString) {
    return new Date(NaN)
  }
  const date = new Date(dateString)
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )
}

const chartSettings = {
  hoursGoal: 8.5,
  acceptablePercentage: 0.85,
}

const WEEK_DAYS_CONFIG = [
  { id: 'Seg', label: 'Seg' },
  { id: 'Ter', label: 'Ter' },
  { id: 'Qua', label: 'Qua' },
  { id: 'Qui', label: 'Qui' },
  { id: 'Sex', label: 'Sex' },
  { id: 'Sáb', label: 'Sáb' },
  { id: 'Dom', label: 'Dom' },
]

export function Metrics() {
  const { user } = useAuth()
  const db = useSyncStore((state) => state?.db)

  const [date, setDate] = useState<DateRange | undefined>(() => {
    const today = new Date()
    return { from: startOfMonth(today), to: endOfMonth(today) }
  })

  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    Seg: true,
    Ter: true,
    Qua: true,
    Qui: true,
    Sex: true,
    Sáb: false,
    Dom: false,
  })

  const [timelineData, setTimelineData] = useState<TimelineChartData[]>([])
  const [yAxisMax, setYAxisMax] = useState(chartSettings.hoursGoal)
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([])
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0 })
  const [activityData, setActivityData] = useState<ActivityChartData[]>([])
  const [estimatedData, setEstimatedData] = useState<EstimatedVsSpentData[]>([])
  const [quality, setQuality] = useState({
    forgottenDays: 0,
    noCommentPercent: 0,
  })
  const [punctualityData, setPunctualityData] = useState<PunctualityData[]>([])
  const [avgHoursPerDayData, setAvgHoursPerDayData] = useState<
    AvgHoursPerDayData[]
  >([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({})
  const [overtimeData, setOvertimeData] = useState<OvertimeData>({
    daysWithOvertime: 0,
    chartData: [],
  })

  const acceptableHours =
    chartSettings.hoursGoal * chartSettings.acceptablePercentage

  const activityChartConfig = useMemo(
    () =>
      activityData.reduce((acc, { activity, fill }) => {
        acc[activity] = { label: activity, color: fill }
        return acc
      }, {} as ChartConfig),
    [activityData],
  )

  const punctualityChartConfig = useMemo(
    () =>
      ({
        Pontuais: { label: 'Pontuais', color: 'var(--chart-2)' },
        Atrasados: { label: 'Atrasados', color: 'var(--chart-5)' },
      }) satisfies ChartConfig,
    [],
  )

  const avgHoursChartConfig: ChartConfig = {
    averageHours: { label: 'Média de Horas ', color: 'var(--primary)' },
  }
  const overtimeChartConfig: ChartConfig = {
    overtimeHours: { label: 'Horas Extras', color: 'var(--chart-5)' },
  }

  const handleDayToggle = (dayLabel: string) => {
    setSelectedDays((prev) => ({
      ...prev,
      [dayLabel]: !prev[dayLabel],
    }))
  }

  const avgHoursAnalysis = useMemo(() => {
    const visibleDaysData = avgHoursPerDayData.filter(
      (data) => selectedDays[data.day],
    )

    if (visibleDaysData.length === 0) {
      return { chartData: [], overallAverage: 0 }
    }

    const totalAverageHours = visibleDaysData.reduce(
      (sum, day) => sum + day.averageHours,
      0,
    )
    const overallAverage = totalAverageHours / visibleDaysData.length

    return {
      chartData: visibleDaysData,
      overallAverage,
    }
  }, [avgHoursPerDayData, selectedDays])

  useEffect(() => {
    if (!db?.timeEntries || !date?.from) return

    const processData = async () => {
      const today = new Date()
      const fetchSince = startOfMonth(today)
      const allEntriesForSummary = await db.timeEntries
        .find({ selector: { startDate: { $gte: fetchSince.toISOString() } } })
        .exec()

      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
      const monthStart = startOfMonth(today)
      const monthEnd = endOfMonth(today)
      const todayStr = format(today, 'yyyy-MM-dd')
      let todayHours = 0,
        weekHours = 0,
        monthHours = 0

      allEntriesForSummary.forEach((entry) => {
        if (!entry.startDate) return
        const entryDate = parseUTCDate(entry.startDate)
        const hours = entry.timeSpent ?? 0
        if (format(entryDate, 'yyyy-MM-dd') === todayStr) {
          todayHours += hours
        }
        if (entryDate >= weekStart && entryDate <= weekEnd) {
          weekHours += hours
        }
        if (entryDate >= monthStart && entryDate <= monthEnd) {
          monthHours += hours
        }
      })
      setSummary({ today: todayHours, week: weekHours, month: monthHours })

      const queryStartDate = new Date(date.from!)
      queryStartDate.setHours(0, 0, 0, 0)
      const queryEndDate = date.to ? new Date(date.to) : new Date(date.from!)
      queryEndDate.setHours(23, 59, 59, 999)

      const entriesInRange = await db.timeEntries
        .find({
          selector: {
            startDate: {
              $gte: queryStartDate.toISOString(),
              $lte: queryEndDate.toISOString(),
            },
          },
        })
        .exec()

      const dailyHours: { [key: string]: number } = {}
      const activityHours: { [key: string]: number } = {}
      const taskHours: { [key: string]: { spent: number; estimated: number } } =
        {}
      let noCommentCount = 0,
        punctualCount = 0,
        delayedCount = 0
      const newHeatmapData: HeatmapData = {}
      const hoursByDayOfWeek: Record<number, number[]> = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
      }

      entriesInRange.forEach((entry) => {
        if (!entry.startDate || !entry.endDate) return

        const startDate = parseUTCDate(entry.startDate)
        const endDate = parseUTCDate(entry.endDate)
        const totalHours = Number(entry.timeSpent ?? 0)

        if (
          isNaN(startDate.getTime()) ||
          isNaN(endDate.getTime()) ||
          totalHours <= 0
        )
          return

        const dayOfWeekKey = format(startDate, 'EEEE', {
          locale: enUS,
        }).toLowerCase()
        if (!newHeatmapData[dayOfWeekKey]) {
          newHeatmapData[dayOfWeekKey] = {}
        }

        let remainingMinutes = totalHours * 60
        let cursorDate = new Date(startDate)

        while (remainingMinutes > 0.1) {
          const cursorHour = cursorDate.getHours()
          const hourKey = String(cursorHour).padStart(2, '0')

          const nextHourDate = new Date(cursorDate)
          nextHourDate.setHours(cursorHour + 1, 0, 0, 0)

          const minutesToEndOfHour =
            (nextHourDate.getTime() - cursorDate.getTime()) / (1000 * 60)
          const minutesInSlot = Math.min(remainingMinutes, minutesToEndOfHour)

          if (minutesInSlot > 0) {
            newHeatmapData[dayOfWeekKey][hourKey] =
              (newHeatmapData[dayOfWeekKey][hourKey] || 0) + minutesInSlot / 60
          }

          remainingMinutes -= minutesInSlot
          cursorDate = nextHourDate
        }

        const dateKey = format(startDate, 'yyyy-MM-dd')
        dailyHours[dateKey] = (dailyHours[dateKey] || 0) + totalHours
        const activityName = entry.activity?.name || 'Não categorizado'
        activityHours[activityName] =
          (activityHours[activityName] || 0) + totalHours
        const taskId = entry.task?.id || 'Tarefa Avulsa'
        if (!taskHours[taskId]) taskHours[taskId] = { spent: 0, estimated: 0 }
        taskHours[taskId].spent += totalHours
        if (!entry.comments?.trim()) noCommentCount++
        if (entry.createdAt) {
          const createdAtDate = parseUTCDate(entry.createdAt)
          if (!isNaN(createdAtDate.getTime())) {
            const createdAtStr = format(createdAtDate, 'yyyy-MM-dd')
            if (dateKey === createdAtStr) punctualCount++
            else delayedCount++
          }
        }
      })

      setHeatmapData(newHeatmapData)

      const allDaysInRange = eachDayOfInterval({
        start: queryStartDate,
        end: queryEndDate,
      })

      allDaysInRange.forEach((day) => {
        const dayOfWeek = day.getDay()
        const dateKey = format(day, 'yyyy-MM-dd')
        hoursByDayOfWeek[dayOfWeek].push(dailyHours[dateKey] || 0)
      })

      const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const avgData = weekDays.map((day, index) => {
        const hoursArray = hoursByDayOfWeek[index]
        const totalHours = hoursArray.reduce((sum, h) => sum + h, 0)
        const average =
          hoursArray.length > 0 ? totalHours / hoursArray.length : 0
        return { day, averageHours: average }
      })
      const orderedAvgData = [...avgData.slice(1), avgData[0]]
      setAvgHoursPerDayData(orderedAvgData)

      const timelineChartData = allDaysInRange.map((dayDate) => ({
        date: format(dayDate, 'yyyy-MM-dd'),
        day: format(dayDate, 'EEE', { locale: ptBR }),
        dailyHours: dailyHours[format(dayDate, 'yyyy-MM-dd')] || 0,
      }))
      setTimelineData(timelineChartData)

      let daysWithOvertime = 0
      const overtimeChartData = timelineChartData.map((data) => {
        let overtimeHours = 0
        if (data.dailyHours > chartSettings.hoursGoal) {
          daysWithOvertime++
          overtimeHours = data.dailyHours - chartSettings.hoursGoal
        }
        return {
          date: data.date,
          day: data.day,
          overtimeHours,
        }
      })
      setOvertimeData({ daysWithOvertime, chartData: overtimeChartData })

      const maxHoursInData = Math.max(
        ...timelineChartData.map((d) => d.dailyHours),
        0,
      )
      const newYAxisMax = Math.max(chartSettings.hoursGoal, maxHoursInData)
      setYAxisMax(newYAxisMax)
      const ticks = []
      for (let i = 0; i <= Math.ceil(newYAxisMax); i += 2) ticks.push(i)
      ticks.push(chartSettings.hoursGoal, acceptableHours)
      setYAxisTicks([...new Set(ticks)].sort((a, b) => a - b))

      const totalPunctualityEntries = punctualCount + delayedCount
      if (totalPunctualityEntries > 0) {
        setPunctualityData([
          { name: 'Pontuais', value: punctualCount, fill: 'var(--chart-1)' },
          { name: 'Atrasados', value: delayedCount, fill: 'var(--chart-2)' },
        ])
      } else {
        setPunctualityData([])
      }
      const activityColors = [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ]
      setActivityData(
        Object.entries(activityHours)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, hours], i) => ({
            activity: name,
            hours,
            fill: activityColors[i % activityColors.length],
          })),
      )
      setEstimatedData(
        Object.entries(taskHours).map(([task, data]) => ({
          task: `Task #${task.slice(0, 5)}`,
          gasto: data.spent,
          estimado: data.estimated,
        })),
      )
      const weekdaysInRange = allDaysInRange.filter(
        (d) => d.getDay() > 0 && d.getDay() < 6,
      )
      const workedWeekdays = weekdaysInRange.filter(
        (d) => (dailyHours[format(d, 'yyyy-MM-dd')] || 0) > 0,
      )
      setQuality({
        forgottenDays: weekdaysInRange.length - workedWeekdays.length,
        noCommentPercent:
          entriesInRange.length > 0
            ? (noCommentCount / entriesInRange.length) * 100
            : 0,
      })
    }
    processData()
  }, [date, user, db, acceptableHours])

  const maxHeatmapHours = useMemo(() => {
    const allHourValues = Object.values(heatmapData).flatMap((day) =>
      Object.values(day),
    )
    if (allHourValues.length === 0) {
      return 1
    }
    return Math.max(...allHourValues)
  }, [heatmapData])

  const getHeatmapStyle = (
    hours: number | undefined,
    maxHours: number,
  ): React.CSSProperties => {
    if (!hours || hours <= 0.01) {
      return { backgroundColor: 'transparent' }
    }

    let color: string
    let opacity: number

    if (hours < 1) {
      const ratio = Math.min(hours / 1, 1)
      color = 'var(--destructive)'
      opacity = 0.3 + (1 - ratio) * 0.7
    } else {
      const ratio = Math.min(hours / maxHours, 1)
      color = 'var(--chart-2)'
      opacity = 0.15 + Math.sqrt(ratio) * 0.85
    }

    return {
      backgroundColor: color,
      opacity: Math.min(opacity, 1),
    }
  }

  const heatmapDayMapping = [
    { key: 'monday', display: 'Seg' },
    { key: 'tuesday', display: 'Ter' },
    { key: 'wednesday', display: 'Qua' },
    { key: 'thursday', display: 'Qui' },
    { key: 'friday', display: 'Sex' },
    { key: 'saturday', display: 'Sáb' },
    { key: 'sunday', display: 'Dom' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas (Hoje)</CardTitle>
            <CalendarCheck2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(summary.today)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Horas (Semana)
            </CardTitle>
            <CalendarClock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(summary.week)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas (Mês)</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(summary.month)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline de Horas</CardTitle>
          <CardDescription>
            Horas apontadas no período de{' '}
            {date?.from ? format(date.from, 'dd/MM/yy') : ''} a{' '}
            {date?.to ? format(date.to, 'dd/MM/yy') : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{ dailyHours: { label: 'Horas', color: 'var(--primary)' } }}
            className="h-[250px] w-full"
          >
            <LineChart
              data={timelineData}
              margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                height={50}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(1)}h`}
                width={40}
                domain={[0, yAxisMax]}
                ticks={yAxisTicks}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ReferenceLine
                y={chartSettings.hoursGoal}
                label={{
                  value: `Meta ${chartSettings.hoursGoal}h`,
                  position: 'insideTopRight',
                  fill: 'orange',
                  fontSize: 12,
                }}
                stroke="orange"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={acceptableHours}
                label={{
                  value: `Aceitável ${acceptableHours.toFixed(1)}h`,
                  position: 'insideTopRight',
                  fill: 'var(--muted-foreground)',
                  fontSize: 12,
                  dy: 20,
                }}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="dailyHours"
                stroke="var(--color-dailyHours)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChartHorizontal className="h-5 w-5" />
              <CardTitle>Média de Horas por Dia da Semana</CardTitle>
            </div>
            <CardDescription>
              Qual dia da semana você é mais produtivo?
            </CardDescription>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
              {WEEK_DAYS_CONFIG.map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${id}`}
                    checked={selectedDays[label]}
                    onCheckedChange={() => handleDayToggle(label)}
                  />
                  <Label
                    htmlFor={`day-${id}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* --- INÍCIO DA MODIFICAÇÃO: Exibição da nova média geral --- */}
            <div className="mb-4 text-center">
              <p className="text-muted-foreground text-sm">
                Média geral (dias selecionados)
              </p>
              <p className="text-2xl font-bold">
                {formatHours(avgHoursAnalysis.overallAverage)}
              </p>
            </div>
            {/* --- FIM DA MODIFICAÇÃO --- */}
            <ChartContainer
              config={avgHoursChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                data={avgHoursAnalysis.chartData}
                margin={{ left: -20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}h`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="averageHours"
                  fill="var(--color-averageHours)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlarmClockOff className="h-5 w-5" />
              <CardTitle>Análise de Horas Extras</CardTitle>
            </div>
            <CardDescription>
              Você teve{' '}
              <span className="text-primary font-bold">
                {overtimeData.daysWithOvertime}
              </span>{' '}
              dia(s) com horas extras no período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={overtimeChartConfig}
              className="h-[300px] w-full"
            >
              <LineChart
                data={overtimeData.chartData}
                margin={{ left: -20, right: 10 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value.toFixed(1)}h`} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `${formatHours(Number(value))}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="overtimeHours"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            <CardTitle>Mapa de Calor de Produtividade</CardTitle>
          </div>
          <CardDescription>
            Seus horários de pico de trabalho no período selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Dia</TableHead>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <TableHead key={hour} className="p-1 text-center text-xs">
                    {`${String(hour).padStart(2, '0')}h`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {heatmapDayMapping.map(({ key, display }) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{display}</TableCell>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                    const hourStr = String(hour).padStart(2, '0')
                    const hoursValue = heatmapData[key]?.[hourStr]
                    return (
                      <TableCell
                        key={`${key}-${hour}`}
                        className="p-0 text-center"
                      >
                        <div
                          className="m-0.5 h-8 rounded-md"
                          style={getHeatmapStyle(hoursValue, maxHeatmapHours)}
                          title={
                            hoursValue
                              ? `${formatHours(
                                  hoursValue,
                                )} em ${display} às ${hourStr}h`
                              : `Nenhuma atividade`
                          }
                        />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Atividade</CardTitle>
            <CardDescription>Top 5 atividades no período.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer
              config={activityChartConfig}
              className="h-[300px] w-full max-w-[300px]"
            >
              <RechartsPieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="hours"
                      formatter={(value) => formatHours(Number(value))}
                    />
                  }
                />
                <Pie
                  data={activityData}
                  dataKey="hours"
                  nameKey="activity"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estimado vs. Gasto</CardTitle>
            <CardDescription>Comparativo de horas por tarefa.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                gasto: { label: 'Gasto', color: 'var(--primary)' },
                estimado: { label: 'Estimado', color: 'var(--secondary)' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart
                data={estimatedData}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="task" hide />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatHours(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey="gasto"
                  name="Gasto"
                  radius={5}
                  fill="var(--color-gasto)"
                />
                <Bar
                  dataKey="estimado"
                  name="Estimado"
                  radius={5}
                  fill="var(--color-estimado)"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Qualidade e Hábitos de Apontamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarClock className="h-5 w-5 text-amber-500" />
              <span className="ml-3 font-medium">
                Dias Úteis Esquecidos no Período
              </span>
            </div>
            <Badge
              variant={quality.forgottenDays > 0 ? 'destructive' : 'secondary'}
            >
              {quality.forgottenDays} dia(s)
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquareWarning className="h-5 w-5 text-amber-500" />
              <span className="ml-3 font-medium">
                Apontamentos sem Comentários
              </span>
            </div>
            <div className="w-32 text-right">
              <span className="font-bold">
                {quality.noCommentPercent.toFixed(0)}%
              </span>
              <Progress value={quality.noCommentPercent} className="mt-1 h-2" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock4 className="h-5 w-5 text-amber-500" />
              <span className="ml-3 font-medium">
                Pontualidade dos Apontamentos
              </span>
            </div>
            <div className="w-40">
              <ChartContainer
                config={punctualityChartConfig}
                className="h-[100px] w-full"
              >
                <RechartsPieChart accessibilityLayer>
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = punctualityData.reduce(
                          (acc, curr) => acc + curr.value,
                          0,
                        )
                        const data = payload[0]
                        const percentage =
                          total > 0 ? (data.payload.value / total) * 100 : 0
                        return (
                          <div className="bg-background min-w-[12rem] rounded-lg border p-2 text-sm shadow-sm">
                            <div className="flex items-center gap-2 font-medium">
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                style={{ backgroundColor: data.payload.fill }}
                              />
                              {data.name}
                            </div>
                            <div className="text-muted-foreground flex justify-between">
                              <span>Contagem: {data.payload.value}</span>
                              <span>{percentage.toFixed(0)}%</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Pie
                    data={punctualityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={30}
                    outerRadius={40}
                    strokeWidth={2}
                  >
                    {punctualityData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
