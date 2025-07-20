import { Download, Star, TrendingUp, Users } from "lucide-preact";

interface Stat {
  icon: any;
  value: string;
  label: string;
  description: string;
  trend?: string;
}

const stats: Stat[] = [
  {
    icon: <Download size={24} />,
    value: "10K+",
    label: "Downloads",
    description: "Monthly package downloads",
    trend: "+23%",
  },
  {
    icon: <Users size={24} />,
    value: "500+",
    label: "Developers",
    description: "Active users building with our library",
    trend: "+15%",
  },
  {
    icon: <Star size={24} />,
    value: "4.9",
    label: "Rating",
    description: "Average developer satisfaction",
    trend: "★★★★★",
  },
  {
    icon: <TrendingUp size={24} />,
    value: "99.9%",
    label: "Uptime",
    description: "Component reliability in production",
    trend: "Stable",
  },
];

export function StatsSection() {
  return (
    <section class="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div class="px-4 lg:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-bold text-base-content mb-4">
            Trusted by the Community
          </h2>
          <p class="text-base-content/70">
            Join thousands of developers who choose our component library
          </p>
        </div>

        {/* Stats Grid */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              class="stats shadow-lg bg-base-100 border border-base-300"
            >
              <div class="stat">
                <div class="stat-figure text-primary">
                  {stat.icon}
                </div>
                <div class="stat-title text-base-content/60">
                  {stat.label}
                </div>
                <div class="stat-value text-primary text-2xl lg:text-3xl">
                  {stat.value}
                </div>
                <div class="stat-desc text-base-content/60">
                  {stat.description}
                </div>
                {stat.trend && (
                  <div class="stat-desc text-success font-medium mt-1">
                    {stat.trend}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional metrics */}
        <div class="mt-12 text-center">
          <div class="inline-flex flex-wrap items-center justify-center gap-8 text-sm text-base-content/60">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-success rounded-full"></div>
              <span>Zero runtime dependencies</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span>Supports all modern browsers</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-secondary rounded-full"></div>
              <span>Active community support</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-accent rounded-full"></div>
              <span>Regular updates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
