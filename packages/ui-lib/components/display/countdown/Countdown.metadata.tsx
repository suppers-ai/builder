import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Countdown } from "./Countdown.tsx";

const countdownExamples: ComponentExample[] = [
  {
    title: "Basic Countdown",
    description: "Simple countdown timer display",
    props: {
      timeLeft: {
        days: 15,
        hours: 10,
        minutes: 24,
        seconds: 58,
        totalSeconds: 1333498,
      },
    },
  },
  {
    title: "Large Countdown",
    description: "Countdown with larger display size",
    props: {
      timeLeft: {
        days: 25,
        hours: 3,
        minutes: 45,
        seconds: 22,
        totalSeconds: 2173522,
      },
      size: "lg",
    },
  },
  {
    title: "Different Sizes",
    description: "Countdown timers in various sizes",
    props: {
      timeLeft: {
        days: 5,
        hours: 14,
        minutes: 30,
        seconds: 15,
        totalSeconds: 484215,
      },
      size: "sm",
    },
  },
  {
    title: "With Labels",
    description: "Countdown showing time units with labels",
    props: {
      timeLeft: {
        days: 30,
        hours: 8,
        minutes: 15,
        seconds: 42,
        totalSeconds: 2621742,
      },
      showLabels: true,
    },
  },
  {
    title: "Without Labels",
    description: "Clean countdown display without time unit labels",
    props: {
      timeLeft: {
        days: 7,
        hours: 12,
        minutes: 30,
        seconds: 45,
        totalSeconds: 649845,
      },
      showLabels: false,
    },
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
