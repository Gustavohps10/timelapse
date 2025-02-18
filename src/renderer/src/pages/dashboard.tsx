import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
  } from "@/renderer/components/ui/chart";
  import {
    LineChart,
    CartesianGrid,
    XAxis,
    Line,
  } from "recharts";
  
  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ];
  
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "var(--primary)",
    },
    mobile: {
      label: "Mobile",
      color: "var(--foreground)",
    },
  } satisfies ChartConfig;
  
  export function Dashboard() {
    return (
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
    );
  }
  