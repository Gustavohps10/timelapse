import { useQuery } from '@tanstack/react-query'
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
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
  Loader2,
  MessageSquareWarning,
} from 'lucide-react'
import { useMemo, useState } from 'react'
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
import { useWorkspace } from '@/hooks'
import { useSyncStore } from '@/stores/syncStore'
import { SyncTimeEntryRxDBDTO } from '@/sync/time-entries-sync-schema'

// #region Helper Functions and Constants
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

const formatHours = (hours: number): string => {
  if (isNaN(hours) || hours < 0.01) return '00:00'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const parseUTCDate = (dateString: string | undefined): Date => {
  if (!dateString) return new Date(NaN)
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
// #endregion

// #region Data Fetching and Processing Functions (for useQuery)
async function fetchSummaryData(db: any) {
  if (!db?.timeEntries) return { today: 0, week: 0, month: 0 }

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const monthStart = startOfMonth(today)
  const todayStr = format(today, 'yyyy-MM-dd')

  const entries = await db.timeEntries
    .find({ selector: { startDate: { $gte: monthStart.toISOString() } } })
    .exec()

  return entries.reduce(
    (acc: { today: number; week: number; month: number }, entry: any) => {
      if (!entry.startDate) return acc
      const entryDate = parseUTCDate(entry.startDate)
      const hours = entry.timeSpent ?? 0

      if (format(entryDate, 'yyyy-MM-dd') === todayStr) acc.today += hours
      if (entryDate >= weekStart) acc.week += hours
      acc.month += hours // All entries are from the current month
      return acc
    },
    { today: 0, week: 0, month: 0 },
  )
}

async function fetchMetricsData(db: any, dateRange: DateRange) {
  if (!db?.timeEntries || !dateRange.from) return null

  // CHANGE: Usar as datas exatas do date picker, não o mês inteiro.
  // O endOfDay garante que o último dia selecionado seja incluído por completo.
  const from = dateRange.from
  const to = endOfDay(dateRange.to ?? dateRange.from)

  const entries: SyncTimeEntryRxDBDTO[] = await db.timeEntries
    .find({
      selector: {
        startDate: {
          $gte: from.toISOString(),
          $lte: to.toISOString(),
        },
      },
    })
    .exec()

  const dailyHours: Record<string, number> = {}
  const activityHours: Record<string, number> = {}
  const heatmapData: Record<string, Record<string, number>> = {}
  const hoursByDayOfWeek: Record<number, number[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }
  let noCommentCount = 0,
    punctualCount = 0,
    delayedCount = 0

  for (const entry of entries) {
    if (!entry.startDate || !entry.endDate) continue
    const startDate = parseUTCDate(entry.startDate)
    const totalHours = Number(entry.timeSpent ?? 0)

    if (isNaN(startDate.getTime()) || totalHours <= 0) continue

    const dateKey = format(startDate, 'yyyy-MM-dd')
    dailyHours[dateKey] = (dailyHours[dateKey] || 0) + totalHours
    const activityName = entry.activity?.name || 'Não categorizado'
    activityHours[activityName] =
      (activityHours[activityName] || 0) + totalHours

    if (!entry.comments?.trim()) noCommentCount++
    const createdAtDate = parseUTCDate(entry.createdAt)
    if (!isNaN(createdAtDate.getTime())) {
      format(createdAtDate, 'yyyy-MM-dd') === dateKey
        ? punctualCount++
        : delayedCount++
    }

    const dayOfWeekKey = format(startDate, 'EEEE', {
      locale: enUS,
    }).toLowerCase()
    if (!heatmapData[dayOfWeekKey]) heatmapData[dayOfWeekKey] = {}

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
        heatmapData[dayOfWeekKey][hourKey] =
          (heatmapData[dayOfWeekKey][hourKey] || 0) + minutesInSlot / 60
      }
      remainingMinutes -= minutesInSlot
      cursorDate = nextHourDate
    }
  }

  const allDaysInRange = eachDayOfInterval({ start: from, end: to })
  allDaysInRange.forEach((day) => {
    const dayOfWeek = day.getDay()
    const dateKey = format(day, 'yyyy-MM-dd')
    hoursByDayOfWeek[dayOfWeek].push(dailyHours[dateKey] || 0)
  })

  const timelineData = allDaysInRange.map((day) => ({
    date: format(day, 'yyyy-MM-dd'),
    day: format(day, 'EEE', { locale: ptBR }),
    dailyHours: dailyHours[format(day, 'yyyy-MM-dd')] || 0,
  }))

  const overtime = timelineData.reduce(
    (acc, data) => {
      const overtimeHours =
        data.dailyHours > chartSettings.hoursGoal
          ? data.dailyHours - chartSettings.hoursGoal
          : 0
      if (overtimeHours > 0) {
        acc.daysWithOvertime++
      }
      acc.chartData.push({ ...data, overtimeHours })
      return acc
    },
    { daysWithOvertime: 0, chartData: [] as any[] },
  )

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const avgData = weekDays.map((day, index) => {
    const hoursArray = hoursByDayOfWeek[index]
    const totalHours = hoursArray.reduce((sum, h) => sum + h, 0)
    return {
      day,
      averageHours: hoursArray.length > 0 ? totalHours / hoursArray.length : 0,
    }
  })

  const activityColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ]
  const activityData = Object.entries(activityHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, hours], i) => ({
      activity: name,
      hours,
      fill: activityColors[i % activityColors.length],
    }))

  const totalPunctuality = punctualCount + delayedCount
  const punctualityData =
    totalPunctuality > 0
      ? [
          { name: 'Pontuais', value: punctualCount, fill: 'var(--chart-2)' },
          { name: 'Atrasados', value: delayedCount, fill: 'var(--chart-5)' },
        ]
      : []

  const weekdaysInRange = allDaysInRange.filter(
    (d) => d.getDay() > 0 && d.getDay() < 6,
  )
  const workedWeekdaysCount = weekdaysInRange.filter(
    (d) => (dailyHours[format(d, 'yyyy-MM-dd')] || 0) > 0,
  ).length
  const quality = {
    forgottenDays: weekdaysInRange.length - workedWeekdaysCount,
    noCommentPercent:
      entries.length > 0 ? (noCommentCount / entries.length) * 100 : 0,
  }

  return {
    timelineData,
    overtimeData: overtime,
    avgHoursPerDayData: [...avgData.slice(1), avgData[0]],
    heatmapData,
    activityData,
    punctualityData,
    quality,
    estimatedData: [],
  }
}
// #endregion

export function Metrics() {
  const db = useSyncStore((state) => state?.db)
  const { workspace } = useWorkspace()
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

  // #region Queries
  const summaryQuery = useQuery({
    queryKey: ['metricsSummary', workspace?.id],
    queryFn: () => fetchSummaryData(db),
    enabled: !!db && !!workspace?.id,
  })

  const metricsQuery = useQuery({
    queryKey: [
      'metrics',
      workspace?.id,
      date?.from?.toISOString(),
      date?.to?.toISOString(),
    ],
    queryFn: () => fetchMetricsData(db, date as DateRange),
    enabled: !!db && !!workspace?.id && !!date?.from && !!date?.to, // Garante que ambas as datas existam
    placeholderData: (prevData) => prevData,
  })

  const { data: summary = { today: 0, week: 0, month: 0 } } = summaryQuery
  const { data: metrics, isLoading: isLoadingMetrics } = metricsQuery
  // #endregion

  // #region Memos and Derived State
  const acceptableHours =
    chartSettings.hoursGoal * chartSettings.acceptablePercentage

  const { yAxisMax, yAxisTicks } = useMemo(() => {
    const maxHours = Math.max(
      ...(metrics?.timelineData.map((d) => d.dailyHours) || [0]),
      0,
    )
    const newYAxisMax = Math.max(chartSettings.hoursGoal, maxHours)
    const ticks = new Set<number>()
    for (let i = 0; i <= Math.ceil(newYAxisMax); i += 2) ticks.add(i)
    ticks.add(chartSettings.hoursGoal)
    ticks.add(acceptableHours)
    return {
      yAxisMax: newYAxisMax,
      yAxisTicks: Array.from(ticks).sort((a, b) => a - b),
    }
  }, [metrics?.timelineData, acceptableHours])

  const activityChartConfig = useMemo(
    () =>
      (metrics?.activityData || []).reduce((acc, { activity, fill }) => {
        acc[activity] = { label: activity, color: fill }
        return acc
      }, {} as ChartConfig),
    [metrics?.activityData],
  )

  const avgHoursAnalysis = useMemo(() => {
    const visibleDaysData = (metrics?.avgHoursPerDayData || []).filter(
      (data) => selectedDays[data.day],
    )
    if (visibleDaysData.length === 0)
      return { chartData: [], overallAverage: 0 }
    const totalAverageHours = visibleDaysData.reduce(
      (sum, day) => sum + day.averageHours,
      0,
    )
    return {
      chartData: visibleDaysData,
      overallAverage: totalAverageHours / visibleDaysData.length,
    }
  }, [metrics?.avgHoursPerDayData, selectedDays])

  const maxHeatmapHours = useMemo(() => {
    if (!metrics?.heatmapData) return 1
    const allHourValues = Object.values(metrics.heatmapData).flatMap((day) =>
      Object.values(day),
    )
    return allHourValues.length > 0 ? Math.max(...allHourValues) : 1
  }, [metrics?.heatmapData])
  // #endregion

  // #region Handlers and Render Functions
  const handleDayToggle = (dayLabel: string) => {
    setSelectedDays((prev) => ({ ...prev, [dayLabel]: !prev[dayLabel] }))
  }

  const getHeatmapStyle = (hours: number | undefined): React.CSSProperties => {
    if (!hours || hours <= 0.01) return { backgroundColor: 'transparent' }
    const ratio = Math.min(hours / maxHeatmapHours, 1)
    return {
      backgroundColor: 'var(--chart-2)',
      opacity: Math.min(0.15 + Math.sqrt(ratio) * 0.85, 1),
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
  // #endregion

  // Chart configs (static or simple)
  const punctualityChartConfig = {
    Pontuais: { label: 'Pontuais', color: 'var(--chart-2)' },
    Atrasados: { label: 'Atrasados', color: 'var(--chart-5)' },
  } satisfies ChartConfig

  const avgHoursChartConfig: ChartConfig = {
    averageHours: { label: 'Média de Horas ', color: 'var(--primary)' },
  }
  const overtimeChartConfig: ChartConfig = {
    overtimeHours: { label: 'Horas Extras', color: 'var(--chart-5)' },
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {' '}
              <BreadcrumbLink href="/">Home</BreadcrumbLink>{' '}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {' '}
              <BreadcrumbPage>Dashboard</BreadcrumbPage>{' '}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas (Hoje)</CardTitle>
            <CalendarCheck2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {' '}
            <div className="text-2xl font-bold">
              {' '}
              {formatHours(summary.today)}{' '}
            </div>{' '}
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
            {' '}
            <div className="text-2xl font-bold">
              {formatHours(summary.week)}
            </div>{' '}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas (Mês)</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {' '}
            <div className="text-2xl font-bold">
              {formatHours(summary.month)}
            </div>{' '}
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Loading State */}
      {isLoadingMetrics && (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      )}

      {!isLoadingMetrics && metrics && (
        <>
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
                config={{
                  dailyHours: { label: 'Horas', color: 'var(--primary)' },
                }}
                className="h-[250px] w-full"
              >
                <LineChart
                  data={metrics.timelineData}
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
                <div className="mb-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    Média geral (dias selecionados)
                  </p>
                  <p className="text-2xl font-bold">
                    {formatHours(avgHoursAnalysis.overallAverage)}
                  </p>
                </div>
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
                    {metrics.overtimeData.daysWithOvertime}
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
                    data={metrics.overtimeData.chartData}
                    margin={{ left: -20, right: 10 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${value.toFixed(1)}h`} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatHours(Number(value))}
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
                      <TableHead
                        key={hour}
                        className="p-1 text-center text-xs"
                      >{`${String(hour).padStart(2, '0')}h`}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heatmapDayMapping.map(({ key, display }) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{display}</TableCell>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hourStr = String(i).padStart(2, '0')
                        const hoursValue = metrics.heatmapData[key]?.[hourStr]
                        return (
                          <TableCell
                            key={`${key}-${i}`}
                            className="p-0 text-center"
                          >
                            <div
                              className="m-0.5 h-8 rounded-md"
                              style={getHeatmapStyle(hoursValue)}
                              title={
                                hoursValue
                                  ? `${formatHours(hoursValue)} em ${display} às ${hourStr}h`
                                  : 'Nenhuma atividade'
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
                  className="mx-auto aspect-square h-[300px] max-h-[300px]"
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
                      data={metrics.activityData}
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
                <CardTitle>Qualidade e Hábitos de Apontamento</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarClock className="h-5 w-5 text-amber-500" />
                    <span className="ml-3 font-medium">
                      Dias Úteis Esquecidos
                    </span>
                  </div>
                  <Badge
                    variant={
                      metrics.quality.forgottenDays > 0
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {metrics.quality.forgottenDays} dia(s)
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
                      {metrics.quality.noCommentPercent.toFixed(0)}%
                    </span>
                    <Progress
                      value={metrics.quality.noCommentPercent}
                      className="mt-1 h-2"
                    />
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
                              const total = metrics.punctualityData.reduce(
                                (acc, curr) => acc + curr.value,
                                0,
                              )
                              const data = payload[0]
                              const percentage =
                                total > 0
                                  ? (data.payload.value / total) * 100
                                  : 0
                              return (
                                <div className="bg-background min-w-[12rem] rounded-lg border p-2 text-sm shadow-sm">
                                  <div className="flex items-center gap-2 font-medium">
                                    <div
                                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                      style={{
                                        backgroundColor: data.payload.fill,
                                      }}
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
                          data={metrics.punctualityData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={30}
                          outerRadius={40}
                          strokeWidth={2}
                        >
                          {metrics.punctualityData.map((entry) => (
                            <Cell
                              key={`cell-${entry.name}`}
                              fill={entry.fill}
                            />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
