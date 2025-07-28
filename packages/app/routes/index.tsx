import { type PageProps } from "$fresh/runtime";
import { Hero } from "@suppers/ui-lib";
import { Button } from "@suppers/ui-lib";
import { Card } from "@suppers/ui-lib";
import { Divider } from "@suppers/ui-lib";

export default function Home(props: PageProps) {
  return (
    <div class="min-h-screen bg-base-100">
      <div class="container mx-auto px-4 py-8">
        <Hero
          title="Suppers App"
          subtitle="SSO Authentication Service - Secure login and profile management for your applications."
          actions={
            <div class="flex gap-4 justify-center">
              <Button as="a" href="/login" variant="primary">
                Login
              </Button>
              <Button as="a" href="/profile" variant="outline">
                Profile
              </Button>
            </div>
          }
        />
        
        <Divider />
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card
            title="Authentication"
            content="Secure login with email/password and OAuth providers."
            actions={
              <Button as="a" href="/login" variant="primary" size="sm">
                Login
              </Button>
            }
          />
          
          <Card
            title="Profile Management"
            content="Manage your account settings and personal information."
            actions={
              <Button as="a" href="/profile" variant="primary" size="sm">
                Profile
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}