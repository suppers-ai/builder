import { Footer } from "@suppers/ui-lib";
import { FooterSection, SocialLink } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Footer Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function FooterPage() {
  // Sample footer sections
  const companySection: FooterSection = {
    title: "Company",
    links: [
      { text: "About Us", href: "/about" },
      { text: "Careers", href: "/careers" },
      { text: "Press", href: "/press" },
      { text: "Contact", href: "/contact" },
    ],
  };

  const socialLinks: SocialLink[] = [
    { platform: "Twitter", href: "https://twitter.com/company", icon: "🐦" },
    { platform: "GitHub", href: "https://github.com/company", icon: "⚡" },
    { platform: "LinkedIn", href: "https://linkedin.com/company/company", icon: "💼" },
    { platform: "Discord", href: "https://discord.gg/company", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 p-8">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold">Footer Component</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Comprehensive footer layouts for websites and applications with navigation, social
            links, and newsletter signup
          </p>
        </div>
      </div>

      {/* Demo Section */}
      <div className="space-y-12 p-8">
        <section className="space-y-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold">Corporate Footer Demo</h2>
            <p className="text-base-content/70">
              Professional footer with company sections and social links
            </p>
          </div>

          <Footer
            logo="🚀 TechCorp"
            sections={[companySection]}
            socialLinks={socialLinks}
            newsletter={{
              title: "Stay Updated",
              description: "Get the latest news and updates.",
              placeholder: "Enter your email",
              buttonText: "Subscribe",
            }}
            copyright="© 2024 TechCorp. All rights reserved."
            onNewsletterSubmit={(email) => {
              console.log("Newsletter signup:", email);
              alert(`Subscribed with: ${email}`);
            }}
          />
        </section>

        {/* Demo message for Fresh 2 completion */}
        <section className="text-center p-8 bg-base-200 rounded-lg max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">🎉 Fresh 2 Migration Complete!</h3>
          <p className="text-base-content/70">
            Footer component is now fully compatible with Fresh 2.0. Additional footer variants can
            be added as needed.
          </p>
        </section>
      </div>
    </div>
  );
}
