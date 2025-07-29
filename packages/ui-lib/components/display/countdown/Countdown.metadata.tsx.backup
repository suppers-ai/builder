import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Countdown } from "./Countdown.tsx";

const countdownExamples: ComponentExample[] = [
  {
    title: "Basic Countdown",
    description: "Simple countdown timer display",
    code: `<Countdown 
  timeLeft={{
    days: 15,
    hours: 10,
    minutes: 24,
    seconds: 58,
    totalSeconds: 1333498
  }}
/>`,
    props: {
      timeLeft: {
        days: 15,
        hours: 10,
        minutes: 24,
        seconds: 58,
        totalSeconds: 1333498
      }
    },
    showCode: true,
  },
  {
    title: "Large Countdown",
    description: "Countdown with larger display size",
    code: `<Countdown 
  timeLeft={{
    days: 25,
    hours: 3,
    minutes: 45,
    seconds: 22,
    totalSeconds: 2173522
  }}
  size="lg"
/>`,
    props: {
      timeLeft: {
        days: 25,
        hours: 3,
        minutes: 45,
        seconds: 22,
        totalSeconds: 2173522
      },
      size: "lg"
    },
    showCode: true,
  },
  {
    title: "Different Sizes",
    description: "Countdown timers in various sizes",
    code: `<Countdown 
  timeLeft={{
    days: 5,
    hours: 14,
    minutes: 30,
    seconds: 15,
    totalSeconds: 484215
  }}
  size="sm"
/>`,
    props: {
      timeLeft: {
        days: 5,
        hours: 14,
        minutes: 30,
        seconds: 15,
        totalSeconds: 484215
      },
      size: "sm"
    },
    showCode: true,
  },
  {
    title: "With Labels",
    description: "Countdown showing time units with labels",
    code: `<Countdown 
  timeLeft={{
    days: 30,
    hours: 8,
    minutes: 15,
    seconds: 42,
    totalSeconds: 2621742
  }}
  showLabels
/>`,
    props: {
      timeLeft: {
        days: 30,
        hours: 8,
        minutes: 15,
        seconds: 42,
        totalSeconds: 2621742
      },
      showLabels: true
    },
    showCode: true,
  },
  {
    title: "Without Labels",
    description: "Clean countdown display without time unit labels",
    code: `<Countdown 
  timeLeft={{
    days: 7,
    hours: 12,
    minutes: 30,
    seconds: 45,
    totalSeconds: 649845
  }}
  showLabels={false}
/>`,
    props: {
      timeLeft: {
        days: 7,
        hours: 12,
        minutes: 30,
        seconds: 45,
        totalSeconds: 649845
      },
      showLabels: false
    },
    showCode: true,
  },
];

export const countdownMetadata: ComponentMetadata = {
  name: "Countdown",
  description: "Timer and countdown display",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/countdown",
  tags: ["timer", "countdown", "clock", "time", "remaining", "deadline"],
  examples: countdownExamples,
  relatedComponents: ["stat", "progress", "radial-progress"],
  preview: (
    <div class="flex flex-col gap-4">
      <Countdown
        timeLeft={{
          days: 15,
          hours: 10,
          minutes: 24,
          seconds: 58,
          totalSeconds: 1000,
        }}
        showLabels
      />
      <Countdown
        timeLeft={{
          days: 0,
          hours: 2,
          minutes: 30,
          seconds: 15,
          totalSeconds: 500,
        }}
        size="sm"
      />
    </div>
  ),
};
