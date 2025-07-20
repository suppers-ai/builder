import { PhoneMockup } from "@suppers/ui-lib";

export default function PhoneMockupDemo() {
  return (
    <div class="min-h-screen bg-base-100 p-8">
      <div class="max-w-6xl mx-auto space-y-12">
        <header class="text-center">
          <h1 class="text-4xl font-bold mb-4">Phone Mockup Component</h1>
          <p class="text-lg opacity-70">
            DaisyUI Phone Mockup component for displaying mobile content
          </p>
        </header>

        {/* Basic Phone Mockup */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Basic Phone Mockup</h2>
          <div class="flex justify-center">
            <PhoneMockup>
              <div class="bg-gradient-to-b from-primary to-secondary p-6 text-white h-full">
                <div class="text-center">
                  <h3 class="text-xl font-bold mb-4">Mobile App</h3>
                  <p class="mb-6">Beautiful mobile experience</p>
                  <button class="btn btn-primary">Get Started</button>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </section>

        {/* Phone Mockup with App Interface */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Phone Mockup with App Interface</h2>
          <div class="flex justify-center">
            <PhoneMockup>
              <div class="bg-base-100 h-full flex flex-col">
                <div class="bg-primary text-white p-4 text-center">
                  <h3 class="font-bold">Chat App</h3>
                </div>
                <div class="flex-1 p-4 space-y-4">
                  <div class="chat chat-start">
                    <div class="chat-bubble">Hello there!</div>
                  </div>
                  <div class="chat chat-end">
                    <div class="chat-bubble chat-bubble-primary">Hi! How are you?</div>
                  </div>
                  <div class="chat chat-start">
                    <div class="chat-bubble">I'm doing great, thanks!</div>
                  </div>
                </div>
                <div class="p-4 bg-base-200">
                  <div class="flex gap-2">
                    <input class="input input-bordered flex-1" placeholder="Type a message..." />
                    <button class="btn btn-primary">Send</button>
                  </div>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </section>

        {/* Multiple Phone Mockups */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Multiple Phone Mockups</h2>
          <div class="flex flex-wrap justify-center gap-8">
            <PhoneMockup>
              <div class="bg-base-100 p-4 h-full">
                <h3 class="text-lg font-bold mb-4">Settings</h3>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span>Notifications</span>
                    <input type="checkbox" class="toggle" checked />
                  </div>
                  <div class="flex justify-between items-center">
                    <span>Dark Mode</span>
                    <input type="checkbox" class="toggle" />
                  </div>
                  <div class="flex justify-between items-center">
                    <span>Auto-save</span>
                    <input type="checkbox" class="toggle" checked />
                  </div>
                </div>
              </div>
            </PhoneMockup>

            <PhoneMockup>
              <div class="bg-base-100 p-4 h-full">
                <h3 class="text-lg font-bold mb-4">Profile</h3>
                <div class="text-center">
                  <div class="avatar">
                    <div class="w-16 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                    </div>
                  </div>
                  <h4 class="font-semibold mt-2">John Doe</h4>
                  <p class="text-sm opacity-70">john@example.com</p>
                  <button class="btn btn-primary btn-sm mt-4">Edit Profile</button>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </section>

        {/* Usage Examples */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Phone Mockup</code></pre>
                <pre data-prefix=">"><code>{'<PhoneMockup><div>Mobile content</div></PhoneMockup>'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
