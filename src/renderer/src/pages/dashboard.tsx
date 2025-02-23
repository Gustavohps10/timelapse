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
import { Calendar1, CalendarDays } from "lucide-react";
import {
    LineChart,
    CartesianGrid,
    XAxis,
    Line,
  } from "recharts";
  
  const chartData = [
    { month: "Seg", desktop: 8},
    { month: "Ter", desktop: 4},
    { month: "Qua", desktop: 6},
    { month: "Qui", desktop: 7},
    { month: "Sex", desktop: 8},
  ];
  
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;
  
  export function Dashboard() {
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
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="desktop"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Line
                  type="monotone"
                  dataKey="mobile"
                  stroke="var(--foreground)"
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
              <Calendar1/>
            </CardTitle>
          </CardHeader>
          <CardContent>
          <h1 className="scroll-m-20 text-2xl mt-1 font-bold tracking-tighter text-zinc-800 dark:text-zinc-300 font-mono">
            3:20
          </h1>
          </CardContent>
        </Card>
        
        <Card  className="flex-1">
          <CardHeader  className="pb-0 text-sm font-normal">
            <CardTitle className="flex justify-between">
              <span className="block">Horas lançadas  <br />(semana)</span> 
              <CalendarDays/>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="scroll-m-20 text-2xl mt-1 font-bold tracking-tighter text-zinc-800 dark:text-zinc-300 font-mono ">
            45:30
          </h1>
          </CardContent>
        </Card>
      
        <Card  className="flex-1">
          <CardHeader className="pb-0 text-sm">
            <CardTitle className="flex justify-between">
              <span className="block">Horas lançadas  <br />(mês)</span> 
            <CalendarDays/>
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
  