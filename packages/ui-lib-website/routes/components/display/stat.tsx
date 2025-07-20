import { Stat } from "@suppers/ui-lib";

export default function StatPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Stat Component</h1>
        <p>Display key metrics and statistics with optional descriptions, figures, and actions</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Stats</h2>
          <div class="stats shadow">
            <Stat
              title="Total Page Views"
              value="89,400"
              description="21% more than last month"
            />

            <Stat
              title="Downloads"
              value="31K"
              description="↗︎ 400 (22%)"
            />

            <Stat
              title="New Users"
              value="4,200"
              description="↘︎ 90 (14%)"
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Stats with Figures</h2>
          <div class="stats shadow">
            <Stat
              title="Total Sales"
              value="$125,430"
              description="8% increase from last week"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  >
                  </path>
                </svg>
              }
            />

            <Stat
              title="Active Users"
              value="25,600"
              description="12% increase"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  >
                  </path>
                </svg>
              }
            />

            <Stat
              title="Conversion Rate"
              value="4.2%"
              description="↗︎ 0.3% improvement"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  >
                  </path>
                </svg>
              }
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Stats with Actions</h2>
          <div class="stats shadow">
            <Stat
              title="Server Status"
              value="99.9%"
              description="Uptime this month"
              figure={
                <div class="text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    >
                    </path>
                  </svg>
                </div>
              }
              actions={<button class="btn btn-sm btn-success">View Details</button>}
            />

            <Stat
              title="Pending Reviews"
              value="12"
              description="Requires attention"
              figure={
                <div class="text-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    >
                    </path>
                  </svg>
                </div>
              }
              actions={<button class="btn btn-sm btn-warning">Review Now</button>}
            />

            <Stat
              title="Storage Used"
              value="78%"
              description="2.1 GB of 2.7 GB"
              figure={
                <div class="text-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    >
                    </path>
                  </svg>
                </div>
              }
              actions={<button class="btn btn-sm btn-error">Upgrade Plan</button>}
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Vertical Stats</h2>
          <div class="stats stats-vertical shadow">
            <Stat
              title="Total Revenue"
              value="$1,345,678"
              description="↗︎ 12% from last quarter"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  >
                  </path>
                </svg>
              }
            />

            <Stat
              title="Customer Satisfaction"
              value="4.8/5.0"
              description="Based on 1,247 reviews"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  >
                  </path>
                </svg>
              }
            />

            <Stat
              title="Orders Fulfilled"
              value="98.7%"
              description="Same-day delivery"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  >
                  </path>
                </svg>
              }
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Dashboard Example</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div class="stats shadow">
              <Stat
                title="Active Projects"
                value="24"
                description="3 due this week"
                figure={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    >
                    </path>
                  </svg>
                }
              />
            </div>

            <div class="stats shadow">
              <Stat
                title="Team Members"
                value="156"
                description="8 new this month"
                figure={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    >
                    </path>
                  </svg>
                }
              />
            </div>

            <div class="stats shadow">
              <Stat
                title="Bug Reports"
                value="7"
                description="2 critical"
                figure={
                  <div class="text-error">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      class="inline-block w-8 h-8 stroke-current"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      >
                      </path>
                    </svg>
                  </div>
                }
              />
            </div>

            <div class="stats shadow">
              <Stat
                title="Performance"
                value="94%"
                description="Above target"
                figure={
                  <div class="text-success">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      class="inline-block w-8 h-8 stroke-current"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      >
                      </path>
                    </svg>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">E-commerce Stats</h2>
          <div class="stats shadow w-full">
            <Stat
              title="Orders Today"
              value="127"
              description="↗︎ 12% vs yesterday"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13a2 2 0 11-4 0 2 2 0 014 0zM9 19a2 2 0 11-4 0 2 2 0 014 0z"
                  >
                  </path>
                </svg>
              }
            />

            <Stat
              title="Revenue"
              value="$12,450"
              description="Daily target: $10,000"
              figure={
                <div class="text-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    >
                    </path>
                  </svg>
                </div>
              }
            />

            <Stat
              title="Avg. Order Value"
              value="$98"
              description="↗︎ $8 vs last week"
              figure={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  >
                  </path>
                </svg>
              }
            />

            <Stat
              title="Cart Abandonment"
              value="23%"
              description="↘︎ 5% improvement"
              figure={
                <div class="text-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    >
                    </path>
                  </svg>
                </div>
              }
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Stat</code></pre>
                <pre data-prefix=">"><code>{'<Stat title="Users" value="1,200" description="↗︎ 12%" />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Stat with figure</code></pre>
                <pre data-prefix=">"><code>{'<Stat title="Revenue" value="$25K" figure={<Icon />} />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive stat</code></pre>
                <pre data-prefix=">"><code>{'<Stat title="Click me" value="42" onClick={handleClick} />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Stat with actions</code></pre>
                <pre data-prefix=">"><code>{'<Stat value="78%" actions={<Button>Upgrade</Button>} />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
