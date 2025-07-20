import { ComponentMetadata } from "../../types.ts";
import { Countdown } from "./Countdown.tsx";

export const countdownMetadata: ComponentMetadata = {
  name: "Countdown",
  description: "Timer and countdown display",
  category: "Data Display",
  path: "/components/display/countdown",
  tags: ["timer", "countdown", "clock", "time", "remaining", "deadline"],
  examples: ["basic", "large", "clock", "with-labels", "colors"],
  relatedComponents: ["stat", "progress", "radial-progress"],
  preview: (
    <div class="flex flex-col gap-4">
      <Countdown
        timeLeft={{
          days: 15,
          hours: 10,
          minutes: 24,
          seconds: 58,
          totalSeconds: 1000
        }}
        showLabels
      />
      <Countdown
        timeLeft={{
          days: 0,
          hours: 2,
          minutes: 30,
          seconds: 15,
          totalSeconds: 500
        }}
        size="sm"
      />
    </div>
  ),
};
