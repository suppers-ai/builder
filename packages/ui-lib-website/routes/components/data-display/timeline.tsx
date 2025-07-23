import { Timeline } from "@suppers/ui-lib";

export default function TimelinePage() {
  const projectTimeline = [
    {
      id: "planning",
      title: "Project Planning",
      subtitle: "January 2024",
      content: "Initial project scope and requirements gathering",
      badge: "Completed",
      badgeColor: "badge-success",
      icon: "📋",
      startContent: "Week 1-2",
    },
    {
      id: "design",
      title: "UI/UX Design",
      subtitle: "February 2024",
      content: "Wireframes, mockups, and user experience design",
      badge: "Completed",
      badgeColor: "badge-success",
      icon: "🎨",
      startContent: "Week 3-6",
    },
    {
      id: "development",
      title: "Development Phase",
      subtitle: "March - May 2024",
      content: "Frontend and backend implementation",
      badge: "In Progress",
      badgeColor: "badge-warning",
      icon: "💻",
      startContent: "Week 7-18",
    },
    {
      id: "testing",
      title: "Testing & QA",
      subtitle: "June 2024",
      content: "Unit testing, integration testing, and quality assurance",
      badge: "Pending",
      badgeColor: "badge-info",
      icon: "🧪",
      startContent: "Week 19-22",
    },
    {
      id: "deployment",
      title: "Deployment",
      subtitle: "July 2024",
      content: "Production deployment and monitoring setup",
      badge: "Pending",
      badgeColor: "badge-ghost",
      icon: "🚀",
      startContent: "Week 23-24",
    },
  ];

  const orderTimeline = [
    {
      id: "ordered",
      title: "Order Placed",
      subtitle: "Today, 2:30 PM",
      content: "Your order #12345 has been confirmed",
      icon: "🛒",
      iconColor: "text-success",
    },
    {
      id: "processed",
      title: "Order Processed",
      subtitle: "Today, 3:15 PM",
      content: "Payment confirmed and order sent to warehouse",
      icon: "✅",
      iconColor: "text-success",
    },
    {
      id: "shipped",
      title: "Shipped",
      subtitle: "Tomorrow, 9:00 AM",
      content: "Package dispatched via express delivery",
      badge: "Express",
      badgeColor: "badge-primary",
      icon: "📦",
      iconColor: "text-warning",
    },
    {
      id: "delivery",
      title: "Out for Delivery",
      subtitle: "Expected: Dec 15",
      content: "Your package is on its way!",
      icon: "🚚",
      iconColor: "text-info",
    },
  ];

  const socialTimeline = [
    {
      id: "post1",
      title: "Sarah Johnson",
      subtitle: "2 hours ago",
      content: "Just finished reading an amazing book about design patterns! 📚✨",
      startContent: "🟢",
      icon: "👤",
    },
    {
      id: "post2",
      title: "Tech Conference 2024",
      subtitle: "4 hours ago",
      content: "Amazing keynote about the future of web development. Thanks to all attendees! 🎉",
      badge: "Event",
      badgeColor: "badge-accent",
      startContent: "📅",
      icon: "🎪",
    },
    {
      id: "post3",
      title: "Alex Chen",
      subtitle: "6 hours ago",
      content: "New blog post: 'Building Scalable React Applications' is now live!",
      startContent: "✍️",
      icon: "👤",
    },
  ];

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Timeline Component</h1>
        <p>Display chronological events and processes with beautiful visual timelines</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Project Development Timeline</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">🚀 Project Roadmap</h3>
              <Timeline
                items={projectTimeline}
                onItemClick={(item, index) => {
                  console.log(`Clicked ${item.title} at index ${index}`);
                  alert(`Viewing details for: ${item.title}`);
                }}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Order Tracking</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <div class="flex justify-between items-center mb-4">
                <h3 class="card-title">📦 Order #12345</h3>
                <span class="badge badge-success">On Track</span>
              </div>
              <Timeline items={orderTimeline} />
              <div class="mt-4 text-center">
                <button class="btn btn-outline btn-sm">Track Package</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Small Timeline</h3>
                <Timeline
                  items={[
                    { title: "Login", subtitle: "9:00 AM", icon: "🔐" },
                    { title: "Dashboard", subtitle: "9:05 AM", icon: "📊" },
                    { title: "Reports", subtitle: "9:15 AM", icon: "📈" },
                  ]}
                  size="sm"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Large Timeline</h3>
                <Timeline
                  items={[
                    { title: "System Start", subtitle: "Boot sequence", icon: "⚡" },
                    { title: "Loading", subtitle: "Dependencies", icon: "⏳" },
                    { title: "Ready", subtitle: "All systems go", icon: "✅" },
                  ]}
                  size="lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Social Media Timeline</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">📱 Activity Feed</h3>
              <Timeline
                items={socialTimeline}
                onItemClick={(item) => console.log("Social item clicked:", item.title)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Company History</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">🏢 Our Journey</h3>
              <Timeline
                items={[
                  {
                    title: "Company Founded",
                    subtitle: "2010",
                    content: "Started as a small team with a big vision",
                    icon: "🌱",
                    badge: "Foundation",
                    badgeColor: "badge-info",
                  },
                  {
                    title: "First Product Launch",
                    subtitle: "2012",
                    content: "Launched our flagship product to great success",
                    icon: "🚀",
                    badge: "Launch",
                    badgeColor: "badge-success",
                  },
                  {
                    title: "Series A Funding",
                    subtitle: "2015",
                    content: "Raised $10M to expand our team and product offerings",
                    icon: "💰",
                    badge: "Funding",
                    badgeColor: "badge-warning",
                  },
                  {
                    title: "Global Expansion",
                    subtitle: "2018",
                    content: "Opened offices in 5 countries and reached 1M users",
                    icon: "🌍",
                    badge: "Growth",
                    badgeColor: "badge-accent",
                  },
                  {
                    title: "IPO",
                    subtitle: "2024",
                    content: "Successfully went public on NASDAQ",
                    icon: "📈",
                    badge: "Public",
                    badgeColor: "badge-primary",
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Learning Path</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">📚 Web Development Course</h3>
              <Timeline
                items={[
                  {
                    title: "HTML Basics",
                    subtitle: "Week 1-2",
                    content: "Learn the fundamentals of HTML structure and semantics",
                    badge: "Completed",
                    badgeColor: "badge-success",
                    icon: "✅",
                    iconColor: "text-success",
                  },
                  {
                    title: "CSS Styling",
                    subtitle: "Week 3-4",
                    content: "Master CSS selectors, layouts, and responsive design",
                    badge: "Completed",
                    badgeColor: "badge-success",
                    icon: "✅",
                    iconColor: "text-success",
                  },
                  {
                    title: "JavaScript Fundamentals",
                    subtitle: "Week 5-7",
                    content: "Variables, functions, DOM manipulation, and events",
                    badge: "Current",
                    badgeColor: "badge-warning",
                    icon: "📖",
                    iconColor: "text-warning",
                  },
                  {
                    title: "React Framework",
                    subtitle: "Week 8-10",
                    content: "Components, hooks, state management, and routing",
                    badge: "Locked",
                    badgeColor: "badge-ghost",
                    icon: "🔒",
                    iconColor: "text-base-content",
                  },
                  {
                    title: "Final Project",
                    subtitle: "Week 11-12",
                    content: "Build a complete web application from scratch",
                    badge: "Locked",
                    badgeColor: "badge-ghost",
                    icon: "🔒",
                    iconColor: "text-base-content",
                  },
                ]}
                onItemClick={(item) => {
                  if (item.badge === "Locked") {
                    alert("Complete previous modules to unlock this section");
                  } else {
                    alert(`Opening: ${item.title}`);
                  }
                }}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Deployment Pipeline</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">🔄 CI/CD Pipeline</h3>
              <Timeline
                items={[
                  {
                    title: "Code Push",
                    subtitle: "Developer commits code",
                    icon: "📝",
                    iconColor: "text-info",
                    badge: "Git",
                    badgeColor: "badge-info",
                  },
                  {
                    title: "Automated Tests",
                    subtitle: "Unit & integration tests",
                    icon: "🧪",
                    iconColor: "text-warning",
                    badge: "Testing",
                    badgeColor: "badge-warning",
                  },
                  {
                    title: "Build Process",
                    subtitle: "Compile and optimize",
                    icon: "⚙️",
                    iconColor: "text-accent",
                    badge: "Build",
                    badgeColor: "badge-accent",
                  },
                  {
                    title: "Staging Deploy",
                    subtitle: "Deploy to staging environment",
                    icon: "🎭",
                    iconColor: "text-secondary",
                    badge: "Staging",
                    badgeColor: "badge-secondary",
                  },
                  {
                    title: "Production Deploy",
                    subtitle: "Release to production",
                    icon: "🚀",
                    iconColor: "text-success",
                    badge: "Live",
                    badgeColor: "badge-success",
                  },
                ]}
                size="sm"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">User Activity Log</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">👤 Recent Activity</h3>
              <Timeline
                items={[
                  {
                    title: "Profile Updated",
                    subtitle: "10 minutes ago",
                    content: "Changed profile picture and bio",
                    startContent: "👤",
                    icon: "✏️",
                  },
                  {
                    title: "New Post",
                    subtitle: "1 hour ago",
                    content: "Shared a photo from vacation",
                    startContent: "📸",
                    icon: "📱",
                  },
                  {
                    title: "Friend Request",
                    subtitle: "2 hours ago",
                    content: "Sent friend request to John Doe",
                    startContent: "👥",
                    icon: "➕",
                  },
                  {
                    title: "Login",
                    subtitle: "3 hours ago",
                    content: "Logged in from mobile device",
                    startContent: "🔐",
                    icon: "📱",
                  },
                ]}
                size="sm"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
