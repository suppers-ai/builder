import { type PageProps } from "fresh";

export default function Home(props: PageProps) {
  return (
    <div class="min-h-screen bg-base-100">
      <div class="container mx-auto px-4 py-8">
        <div class="hero min-h-[60vh]">
          <div class="hero-content text-center">
            <div class="max-w-md">
              <h1 class="text-5xl font-bold">Suppers App</h1>
              <p class="py-6">
                SSO Authentication Service - Secure login and profile management for your applications.
              </p>
              <div class="flex gap-4 justify-center">
                <a href="/login" class="btn btn-primary">
                  Login
                </a>
                <a href="/profile" class="btn btn-outline">
                  Profile
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Authentication</h2>
              <p>Secure login with email/password and OAuth providers.</p>
              <div class="card-actions justify-end">
                <a href="/login" class="btn btn-primary btn-sm">Login</a>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Profile Management</h2>
              <p>Manage your account settings and personal information.</p>
              <div class="card-actions justify-end">
                <a href="/profile" class="btn btn-primary btn-sm">Profile</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}