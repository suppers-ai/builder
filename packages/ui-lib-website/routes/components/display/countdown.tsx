import { Countdown } from "@suppers/ui-lib";
import { Progress } from "@suppers/ui-lib";

export default function CountdownPage() {
  // Create various target dates for different examples
  const now = new Date();
  const oneHour = new Date(now.getTime() + (60 * 60 * 1000));
  const oneDay = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  const oneWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  const newYear = new Date(now.getFullYear() + 1, 0, 1);
  const christmas = new Date(now.getFullYear(), 11, 25);
  const nextBirthday = new Date(now.getFullYear(), 5, 15); // June 15th
  if (nextBirthday < now) {
    nextBirthday.setFullYear(now.getFullYear() + 1);
  }

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Countdown Component</h1>
        <p>Display time remaining until a target date with customizable units and styling</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Countdowns</h2>
          <div class="space-y-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Next Hour</h3>
                <Countdown
                  targetDate={oneHour}
                  size="lg"
                />
                <p class="text-sm opacity-70">Real-time countdown updates every second</p>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Tomorrow</h3>
                <Countdown
                  targetDate={oneDay}
                  size="md"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="grid gap-4">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center text-sm">Extra Small</h3>
                <Countdown
                  targetDate={oneWeek}
                  size="xs"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center text-sm">Small</h3>
                <Countdown
                  targetDate={oneWeek}
                  size="sm"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Medium (Default)</h3>
                <Countdown
                  targetDate={oneWeek}
                  size="md"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Large</h3>
                <Countdown
                  targetDate={oneWeek}
                  size="lg"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Extra Large</h3>
                <Countdown
                  targetDate={oneWeek}
                  size="xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Custom Unit Display</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Hours and Minutes Only</h3>
                <Countdown
                  targetDate={oneDay}
                  showDays={false}
                  showSeconds={false}
                  size="lg"
                />
                <p class="text-sm opacity-70 mt-2">Perfect for meeting timers</p>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Minutes and Seconds</h3>
                <Countdown
                  targetDate={oneHour}
                  showDays={false}
                  showHours={false}
                  size="lg"
                />
                <p class="text-sm opacity-70 mt-2">Great for short timers</p>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Without Labels</h3>
                <Countdown
                  targetDate={oneWeek}
                  showLabels={false}
                  size="lg"
                />
                <p class="text-sm opacity-70 mt-2">Clean numeric display</p>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Days Only</h3>
                <Countdown
                  targetDate={oneWeek}
                  showHours={false}
                  showMinutes={false}
                  showSeconds={false}
                  size="xl"
                />
                <p class="text-sm opacity-70 mt-2">Simple day counter</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Event Countdowns</h2>
          <div class="grid gap-6">
            <div class="card bg-gradient-to-r from-red-500 to-green-500 text-white">
              <div class="card-body text-center">
                <h3 class="card-title justify-center text-white">🎄 Christmas Countdown</h3>
                <Countdown
                  targetDate={christmas}
                  size="lg"
                  class="text-white"
                />
                <p class="opacity-90 mt-2">Time until Christmas Day!</p>
              </div>
            </div>

            <div class="card bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <div class="card-body text-center">
                <h3 class="card-title justify-center text-white">🎉 New Year Countdown</h3>
                <Countdown
                  targetDate={newYear}
                  size="lg"
                  class="text-white"
                />
                <p class="opacity-90 mt-2">Welcome the new year!</p>
              </div>
            </div>

            <div class="card bg-gradient-to-r from-pink-500 to-yellow-500 text-white">
              <div class="card-body text-center">
                <h3 class="card-title justify-center text-white">🎂 Birthday Countdown</h3>
                <Countdown
                  targetDate={nextBirthday}
                  size="lg"
                  class="text-white"
                />
                <p class="opacity-90 mt-2">Time until the next birthday!</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Static Display Examples</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Static Countdown (Display Only)</h3>
                <Countdown
                  targetDate={oneWeek}
                  size="lg"
                />
                <p class="text-sm opacity-70 mt-2">Server-safe display component</p>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Static Without Labels</h3>
                <Countdown
                  targetDate={oneDay}
                  showLabels={false}
                  size="lg"
                />
                <p class="text-sm opacity-70 mt-2">Clean numeric display</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Product Launch Example</h2>
          <div class="hero bg-base-200 rounded-lg">
            <div class="hero-content text-center">
              <div class="max-w-md">
                <h1 class="text-5xl font-bold">🚀 Product Launch</h1>
                <p class="py-6">
                  Our amazing new product is launching soon! Don't miss out on the excitement.
                </p>
                <Countdown
                  targetDate={oneWeek}
                  size="xl"
                  class="mb-6"
                />
                <div class="space-x-2">
                  <button class="btn btn-primary">Notify Me</button>
                  <button class="btn btn-outline">Learn More</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sale Countdown</h2>
          <div class="card bg-error text-error-content">
            <div class="card-body text-center">
              <h3 class="card-title justify-center text-error-content">🔥 FLASH SALE</h3>
              <p class="text-2xl font-bold">50% OFF Everything!</p>
              <div class="my-4">
                <p class="text-sm opacity-90 mb-2">Sale ends in:</p>
                <Countdown
                  targetDate={oneDay}
                  size="lg"
                  class="text-error-content"
                />
              </div>
              <button class="btn btn-outline btn-error-content">Shop Now</button>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Meeting Timer</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <div class="flex items-center justify-between mb-4">
                <h3 class="card-title">📅 Team Standup Meeting</h3>
                <div class="badge badge-primary">Live</div>
              </div>

              <div class="text-center mb-4">
                <p class="text-sm opacity-70 mb-2">Next meeting starts in:</p>
                <Countdown
                  targetDate={oneHour}
                  showDays={false}
                  size="lg"
                />
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Participants:</strong>
                  <ul class="list-disc list-inside mt-1 opacity-70">
                    <li>Sarah (Product Manager)</li>
                    <li>Alex (Developer)</li>
                    <li>Emma (Designer)</li>
                  </ul>
                </div>
                <div>
                  <strong>Agenda:</strong>
                  <ul class="list-disc list-inside mt-1 opacity-70">
                    <li>Sprint progress review</li>
                    <li>Blockers discussion</li>
                    <li>Next tasks planning</li>
                  </ul>
                </div>
              </div>

              <div class="card-actions justify-end">
                <button class="btn btn-sm btn-outline">Add to Calendar</button>
                <button class="btn btn-sm btn-primary">Join Meeting</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Exam Timer</h2>
          <div class="card bg-warning text-warning-content">
            <div class="card-body text-center">
              <h3 class="card-title justify-center text-warning-content">📝 Final Exam</h3>
              <p class="text-lg">JavaScript Fundamentals</p>
              <div class="my-4">
                <p class="text-sm opacity-90 mb-2">Time remaining:</p>
                <Countdown
                  targetDate={new Date(now.getTime() + (45 * 60 * 1000))} // 45 minutes
                  showDays={false}
                  showHours={false}
                  size="xl"
                  class="text-warning-content"
                />
              </div>
              <div class="text-sm opacity-90">
                <p>Question 12 of 20 completed</p>
                <Progress value={60} max={100} color="warning" class="w-32 mt-2" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
