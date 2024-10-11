"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import Sidebar from "@/components/SidebarDash"

import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import Link from "next/link"

import Header from "@/components/HeaderDash"

import dataJson from "@/app/dashboard.json"

import * as React from "react"

export default function Charts() {
  const [position, setPosition] = React.useState("none")

  let data = []
  for (let i = 0; i < dataJson['flashcard-sets'].length; i++){
    var correct = 0;
    const flashcardContent = dataJson['flashcard-sets'][i];
    for (let index = 0; index < flashcardContent.cards.length; index++){
      if (flashcardContent.cards[index].correct == flashcardContent.cards[index].chosen) correct++;
    }
    let flashcardJson = {
      title: [flashcardContent.title],
      id: flashcardContent.ID,
      type: flashcardContent.subject,
      date: new Date(flashcardContent.date.year, flashcardContent.date.month-1, flashcardContent.date.day),
      accuracy: correct,
      "set-size": flashcardContent.cards.length
    }
    data.push(flashcardJson)
  }

  data.sort(
    function (a, b) {
      if ( a.date > b.date) return 1;
      if (b.date > a.date) return -1;
      return 0; 
    }  
  )

  const todayDate = new Date(Date.now())
  const sundayDate = new Date(todayDate.getFullYear(), todayDate.getMonth(),todayDate.getDate() - todayDate.getDay())
  const weekData = []
  const monthData = []
  const yearData = []
  const dayData = []

  for (let i = 0; i < data.length; i++){
    if (data[i].date.getFullYear() == todayDate.getFullYear()){
      yearData.push(data[i])
      if (data[i].date.getMonth() == todayDate.getMonth()) {
        monthData.push(data[i])
        const sundayDate = todayDate.getDate() - todayDate.getDay();
        if (data[i].date.getDate() - sundayDate >= 0) weekData.push(data[i])
        if (data[i].date.getDate() == todayDate.getDate()) dayData.push(data[i])
      }
    }
  }

  function getChartData(time){
    var myData = [];
    if (time === "Day") myData = dayData;
    if (time === "Week") myData = weekData;
    if (time === "Month") myData = monthData;
    if (time === "Year") myData = yearData;
    if (time === "none") myData = data;
    const myChart = []
    for (let i = 0; i < myData.length; i++){
      let barJson = {
        date: getDateString(myData[i].date, 0),
        steps: myData[i].accuracy
      }
      myChart.push(barJson)
    }
    return myChart
  }

  function getAccuracy(myData){
    var correct = 0;
    var total = 0;
    for (let i = 0; i < myData.length; i++){
      correct += myData[i].accuracy;
      total += myData[i]['set-size'];
    }
    return Math.round(correct/total * 100)
  }

  function getTotal(myData){
    var total = 0;
    for (let i = 0; i < myData.length; i++){
      total += myData[i]['set-size'];
    }
    return total
  }

  function getTotalCorrect(myData){
    var total = 0;
    for (let i = 0; i < myData.length; i++){
      total += myData[i].accuracy;
    }
    return total
  }

  const dayInMillis = 24 * 60 * 60 * 1000;

  function getDateString(date: Date, offset: number){
    const newDate = new Date(date.getTime())
    newDate.setTime(date.getTime() + offset * dayInMillis);
    return (newDate.getFullYear().toString().concat("-",(newDate.getMonth() + 1).toString().concat("-",(newDate.getDate()).toString())))
  }

  return (
    <>
    <Sidebar/>
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
    <Header/>
    <Card>
      <CardHeader>
        <CardTitle>Your Stats {position == "Day" ? "Today": null} {position == "Week" ? "this Week": null} {position == "Month" ? "this Month": null} {position == "Year" ? "this Year": null}</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="justify-start">
          <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Filter: Time <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem
          value="Day"
          className="max-w-sm">
            Day
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
          value="Week"
          className="max-w-sm">
            Week
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
          value="Month"
          className="max-w-sm">
            Month
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
          value="Year"
          className="max-w-sm">
            Year
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
          value="none"
          className="max-w-sm">
            None
          </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
    <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]">
        <Card
          className="lg:max-w-md" x-chunk="charts-01-chunk-0"
        >
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>{position == "Day" ? "Today": null} {position == "Week" ? "This Week": null} {position == "Month" ? "This Month": null} {position == "Year" ? "This Year": null} {position == "none" ? "All-Time": null}</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
            {position == "Day" ? getTotalCorrect(dayData): null} {position == "Week" ? getTotalCorrect(weekData): null} {position == "Month" ? getTotalCorrect(monthData): null} {position == "Year" ? getTotalCorrect(yearData): null}{position == "none" ? getTotalCorrect(data): null}{" "}
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                correct answers
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                steps: {
                  label: "Steps",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <BarChart
                accessibilityLayer
                margin={{
                  left: -4,
                  right: -4,
                }}
                data={[
                  {
                    date: "2024-4-4",
                    steps: 5
                  }
                ]}
              >
                <Bar
                  dataKey="steps"
                  fill="var(--color-steps)"
                  radius={5}
                  fillOpacity={0.6}
                  activeBar={<Rectangle fillOpacity={0.8} />}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }}
                />
                <ChartTooltip
                  defaultIndex={2}
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                  cursor={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1">
            <CardDescription>
              Over the past 7 days, you have walked{" "}
              <span className="font-medium text-foreground">53,305</span> steps.
            </CardDescription>
            <CardDescription>
              You need{" "}
              <span className="font-medium text-foreground">12,584</span> more
              steps to reach you{getChartData("none").length}
            </CardDescription>
          </CardFooter>
        </Card>
        <Card
          className="flex flex-col lg:max-w-md" x-chunk="charts-01-chunk-1"
        >
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
            <div>
              <CardDescription>Resting HR</CardDescription>
              <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                62
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  bpm
                </span>
              </CardTitle>
            </div>
            <div>
              <CardDescription>Variability</CardDescription>
              <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                35
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  ms
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 items-center">
            <ChartContainer
              config={{
                resting: {
                  label: "Resting",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="w-full"
            >
              <LineChart
                accessibilityLayer
                margin={{
                  left: 14,
                  right: 14,
                  top: 10,
                }}
                data={[
                  {
                    date: "2024-01-01",
                    resting: 62,
                  },
                  {
                    date: "2024-01-02",
                    resting: 72,
                  },
                  {
                    date: "2024-01-03",
                    resting: 35,
                  },
                  {
                    date: "2024-01-04",
                    resting: 62,
                  },
                  {
                    date: "2024-01-05",
                    resting: 52,
                  },
                  {
                    date: "2024-01-06",
                    resting: 62,
                  },
                  {
                    date: "2024-01-07",
                    resting: 70,
                  },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.5}
                />
                <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }}
                />
                <Line
                  dataKey="resting"
                  type="natural"
                  fill="var(--color-resting)"
                  stroke="var(--color-resting)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    fill: "var(--color-resting)",
                    stroke: "var(--color-resting)",
                    r: 4,
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                  cursor={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6 lg:max-w-[20rem]">
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-2"
        >
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>
              You&apos;re averaging more steps a day this year than last year.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid auto-rows-min gap-2">
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                12,453
                <span className="text-sm font-normal text-muted-foreground">
                  steps/day
                </span>
              </div>
              <ChartContainer
                config={{
                  steps: {
                    label: "Steps",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="aspect-auto h-[32px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  layout="vertical"
                  margin={{
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  data={[
                    {
                      date: "2024",
                      steps: 12435,
                    },
                  ]}
                >
                  <Bar
                    dataKey="steps"
                    fill="var(--color-steps)"
                    radius={4}
                    barSize={32}
                  >
                    <LabelList
                      position="insideLeft"
                      dataKey="date"
                      offset={8}
                      fontSize={12}
                      fill="white"
                    />
                  </Bar>
                  <YAxis dataKey="date" type="category" tickCount={1} hide />
                  <XAxis dataKey="steps" type="number" hide />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="grid auto-rows-min gap-2">
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                10,103
                <span className="text-sm font-normal text-muted-foreground">
                  steps/day
                </span>
              </div>
              <ChartContainer
                config={{
                  steps: {
                    label: "Steps",
                    color: "hsl(var(--muted))",
                  },
                }}
                className="aspect-auto h-[32px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  layout="vertical"
                  margin={{
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  data={[
                    {
                      date: "2023",
                      steps: 10103,
                    },
                  ]}
                >
                  <Bar
                    dataKey="steps"
                    fill="var(--color-steps)"
                    radius={4}
                    barSize={32}
                  >
                    <LabelList
                      position="insideLeft"
                      dataKey="date"
                      offset={8}
                      fontSize={12}
                      fill="hsl(var(--muted-foreground))"
                    />
                  </Bar>
                  <YAxis dataKey="date" type="category" tickCount={1} hide />
                  <XAxis dataKey="steps" type="number" hide />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-3"
        >
          <CardHeader className="p-4 pb-0">
            <CardTitle>Total Cards Studied</CardTitle>
            <CardDescription>
              {position == "none"? null : "Over the last "}{position == "Day" ? "day": null}{position == "Week" ? "week": null}{position == "Month" ? "month": null}{position == "Year" ? "year": null}
              {position == "none"? "T" : ", t"}he total amount of cards you studied was
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
            {position == "Day" ? getTotal(dayData): null} {position == "Week" ? getTotal(weekData): null} {position == "Month" ? getTotal(monthData): null} {position == "Year" ? getTotal(yearData): null}{position == "none" ? getTotal(data): null}
              <span className="text-sm font-normal text-muted-foreground">
                cards
              </span>
            </div>
            
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-4"
        >
          <CardContent className="flex gap-4 p-4 pb-2">
            <ChartContainer
              config={{
                move: {
                  label: "Move",
                  color: "hsl(var(--chart-1))",
                },
                stand: {
                  label: "Stand",
                  color: "hsl(var(--chart-2))",
                },
                exercise: {
                  label: "Exercise",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[140px] w-full"
            >
              <BarChart
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 10,
                }}
                data={[
                  {
                    activity: "stand",
                    value: (8 / 12) * 100,
                    label: "8/12 hr",
                    fill: "var(--color-stand)",
                  },
                  {
                    activity: "exercise",
                    value: (46 / 60) * 100,
                    label: "46/60 min",
                    fill: "var(--color-exercise)",
                  },
                  {
                    activity: "move",
                    value: (245 / 360) * 100,
                    label: "245/360 kcal",
                    fill: "var(--color-move)",
                  },
                ]}
                layout="vertical"
                barSize={32}
                barGap={2}
              >
                <XAxis type="number" dataKey="value" hide />
                <YAxis
                  dataKey="activity"
                  type="category"
                  tickLine={false}
                  tickMargin={4}
                  axisLine={false}
                  className="capitalize"
                />
                <Bar dataKey="value" radius={5}>
                  <LabelList
                    position="insideLeft"
                    dataKey="label"
                    fill="white"
                    offset={8}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex flex-row border-t p-4">
            <div className="flex w-full items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Move</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  562
                  <span className="text-sm font-normal text-muted-foreground">
                    kcal
                  </span>
                </div>
              </div>
              <Separator orientation="vertical" className="mx-2 h-10 w-px" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Exercise</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  73
                  <span className="text-sm font-normal text-muted-foreground">
                    min
                  </span>
                </div>
              </div>
              <Separator orientation="vertical" className="mx-2 h-10 w-px" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Stand</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  14
                  <span className="text-sm font-normal text-muted-foreground">
                    hr
                  </span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6">
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-5"
        >
          <CardContent className="flex gap-4 p-4">
            <div className="grid items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-sm text-muted-foreground">Move</div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                  562/600
                  <span className="text-sm font-normal text-muted-foreground">
                    kcal
                  </span>
                </div>
              </div>
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-sm text-muted-foreground">Exercise</div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                  73/120
                  <span className="text-sm font-normal text-muted-foreground">
                    min
                  </span>
                </div>
              </div>
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-sm text-muted-foreground">Stand</div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                  8/12
                  <span className="text-sm font-normal text-muted-foreground">
                    hr
                  </span>
                </div>
              </div>
            </div>
            <ChartContainer
              config={{
                move: {
                  label: "Move",
                  color: "hsl(var(--chart-1))",
                },
                exercise: {
                  label: "Exercise",
                  color: "hsl(var(--chart-2))",
                },
                stand: {
                  label: "Stand",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="mx-auto aspect-square w-full max-w-[80%]"
            >
              <RadialBarChart
                margin={{
                  left: -10,
                  right: -10,
                  top: -10,
                  bottom: -10,
                }}
                data={[
                  {
                    activity: "stand",
                    value: (8 / 12) * 100,
                    fill: "var(--color-stand)",
                  },
                  {
                    activity: "exercise",
                    value: (46 / 60) * 100,
                    fill: "var(--color-exercise)",
                  },
                  {
                    activity: "move",
                    value: (245 / 360) * 100,
                    fill: "var(--color-move)",
                  },
                ]}
                innerRadius="20%"
                barSize={24}
                startAngle={90}
                endAngle={450}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  dataKey="value"
                  tick={false}
                />
                <RadialBar dataKey="value" background cornerRadius={5} />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-6"
        >
          <CardHeader className="p-4 pb-0">
            <CardTitle>Active Energy</CardTitle>
            <CardDescription>
              You&apos;re burning an average of 754 calories per day. Good job!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
            <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
              1,254
              <span className="text-sm font-normal text-muted-foreground">
                kcal/day
              </span>
            </div>
            <ChartContainer
              config={{
                calories: {
                  label: "Calories",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="ml-auto w-[64px]"
            >
              <BarChart
                accessibilityLayer
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
                data={[
                  {
                    date: "2024-01-01",
                    calories: 354,
                  },
                  {
                    date: "2024-01-02",
                    calories: 514,
                  },
                  {
                    date: "2024-01-03",
                    calories: 345,
                  },
                  {
                    date: "2024-01-04",
                    calories: 734,
                  },
                  {
                    date: "2024-01-05",
                    calories: 645,
                  },
                  {
                    date: "2024-01-06",
                    calories: 456,
                  },
                  {
                    date: "2024-01-07",
                    calories: 345,
                  },
                ]}
              >
                <Bar
                  dataKey="calories"
                  fill="var(--color-calories)"
                  radius={2}
                  fillOpacity={0.2}
                  activeIndex={6}
                  activeBar={<Rectangle fillOpacity={0.8} />}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  hide
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-7"
        >
          <CardHeader className="space-y-0 pb-0">
            <CardDescription>Time in Bed</CardDescription>
            <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
              8
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                hr
              </span>
              35
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                min
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer
              config={{
                time: {
                  label: "Time",
                  color: "hsl(var(--chart-2))",
                },
              }}
            >
              <AreaChart
                accessibilityLayer
                data={[
                  {
                    date: "2024-01-01",
                    time: 8.5,
                  },
                  {
                    date: "2024-01-02",
                    time: 7.2,
                  },
                  {
                    date: "2024-01-03",
                    time: 8.1,
                  },
                  {
                    date: "2024-01-04",
                    time: 6.2,
                  },
                  {
                    date: "2024-01-05",
                    time: 5.2,
                  },
                  {
                    date: "2024-01-06",
                    time: 8.1,
                  },
                  {
                    date: "2024-01-07",
                    time: 7.0,
                  },
                ]}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <XAxis dataKey="date" hide />
                <YAxis domain={["dataMin - 5", "dataMax + 2"]} hide />
                <defs>
                  <linearGradient id="fillTime" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-time)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-time)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="time"
                  type="natural"
                  fill="url(#fillTime)"
                  fillOpacity={0.4}
                  stroke="var(--color-time)"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => (
                    <div className="flex min-w-[120px] items-center text-xs text-muted-foreground">
                      Time in bed
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">
                          hr
                        </span>
                      </div>
                    </div>
                  )}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    </CardContent>
    </Card>
    </div>
    </>
  )
}
