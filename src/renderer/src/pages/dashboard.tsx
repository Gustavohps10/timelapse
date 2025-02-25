import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/renderer/components/ui/chart";
import { useAuth } from "@/renderer/hooks/use-auth";
import { Calendar1, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
} from "recharts";

const chartConfig = {
  desktop: {
    label: "Horas",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function Dashboard() {
  const [chartData, setChartData] = useState<any[]>([]);
  const { user } = useAuth();

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); 

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const formattedWeekDays = weekDays.map((day, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      return formatDate(dayDate);
    });

    console.log(formattedWeekDays); 
    window.api.redmine.timeEntries({
      key: user?.api_key,
      userId: user?.id,
      initialDate: formatDate(monday),
      finalDate: formatDate(friday),
    }).then((data) => {
      const timeEntries = data.time_entries;
      const dailyHours: { [key: string]: number } = {};

      // Preenchendo com os dados de horas
      timeEntries.forEach(entry => {
        const date = entry.spent_on;
        const hours = entry.hours;

        if (dailyHours[date]) {
          dailyHours[date] += hours;
        } else {
          dailyHours[date] = hours;
        }
      });

      const chartData = formattedWeekDays.map((date) => ({
        date: date,
        dailyHours: dailyHours[date] || 0, 
      }));

      console.log(chartData);

      setChartData(chartData);
    });
  }, [user]);

  return (
    <>
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
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)} 
              />
              <YAxis
                domain={[0, 8.5]} 
                tickFormatter={(value) => `${value}h`} 
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="dailyHours"
                stroke="var(--primary)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="flex gap-2 my-2 justify-between">
        <Card className="flex-1">
          <CardHeader className="pb-0 text-sm">
            <CardTitle className="flex justify-between">
              <span>  Horas lançadas <br />(hoje)  </span>
              <Calendar1 />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="scroll-m-20 text-2xl mt-1 font-bold tracking-tighter text-zinc-800 dark:text-zinc-300 font-mono">
              3:20
            </h1>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-0 text-sm font-normal">
            <CardTitle className="flex justify-between">
              <span className="block">Horas lançadas <br />(semana)</span>
              <CalendarDays />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="scroll-m-20 text-2xl mt-1 font-bold tracking-tighter text-zinc-800 dark:text-zinc-300 font-mono">
              45:30
            </h1>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-0 text-sm">
            <CardTitle className="flex justify-between">
              <span className="block">Horas lançadas <br />(mês)</span>
              <CalendarDays />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="scroll-m-20 text-2xl mt-1 font-bold tracking-tighter text-zinc-800 dark:text-zinc-300 font-mono">
              113:45
            </h1>
          </CardContent>
        </Card>
      </div>
      <Button className="cursor-pointer">Novo Apontamento</Button>
    </>
  );
}
