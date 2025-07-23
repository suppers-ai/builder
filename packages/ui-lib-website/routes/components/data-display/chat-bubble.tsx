import { ChatBubble } from "@suppers/ui-lib";

export default function ChatBubblePage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Chat Bubble Component</h1>
        <p>
          Message display component for chat interfaces with avatar, timestamp, and styling options
        </p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Chat Bubbles</h2>
          <div class="max-w-lg mx-auto space-y-4">
            <ChatBubble
              message="Hello! How are you doing today?"
              position="start"
            />

            <ChatBubble
              message="I'm doing great, thanks for asking! How about you?"
              position="end"
            />

            <ChatBubble
              message="Pretty good! Just working on some new features."
              position="start"
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Chat with Avatars and Names</h2>
          <div class="max-w-lg mx-auto space-y-4">
            <ChatBubble
              message="Hey team! Ready for the standup meeting?"
              position="start"
              avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              name="Sarah"
              time="12:45"
            />

            <ChatBubble
              message="Yes! I've got my updates ready. Should we start with the new feature progress?"
              position="end"
              avatar="https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp"
              name="Alex"
              time="12:46"
            />

            <ChatBubble
              message="Perfect! Let's dive into it. I'll share my screen."
              position="start"
              avatar="https://img.daisyui.com/images/stock/photo-1517841905240-472988babdf9.webp"
              name="Emma"
              time="12:47"
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colored Chat Bubbles</h2>
          <div class="max-w-lg mx-auto space-y-4">
            <ChatBubble
              message="Welcome to our chat! 👋"
              position="start"
              color="primary"
              avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />

            <ChatBubble
              message="Thanks for the warm welcome!"
              position="end"
              color="secondary"
            />

            <ChatBubble
              message="Great to have you here! 🎉"
              position="start"
              color="accent"
              avatar="https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp"
            />

            <ChatBubble
              message="Success! Feature deployed successfully ✅"
              position="end"
              color="success"
            />

            <ChatBubble
              message="Warning: Server maintenance in 1 hour ⚠️"
              position="start"
              color="warning"
              avatar="https://img.daisyui.com/images/stock/photo-1517841905240-472988babdf9.webp"
            />

            <ChatBubble
              message="Error: Connection failed. Please try again."
              position="end"
              color="error"
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Typing Indicator</h2>
          <div class="max-w-lg mx-auto space-y-4">
            <ChatBubble
              message="What do you think about the new design?"
              position="start"
              avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              name="Design Team"
              time="2:30 PM"
            />

            <ChatBubble
              message=""
              position="end"
              isTyping={true}
              avatar="https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp"
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Chat Demo</h2>
          <div class="max-w-lg mx-auto space-y-4">
            <ChatBubble
              message="Click the buttons below to see different chat interactions"
              position="start"
              avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              name="Demo Bot"
              time="now"
              color="info"
            />
            <ChatBubble
              message="This is an interactive demo showing various chat bubble styles"
              position="end"
              time="now"
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Customer Support Chat</h2>
          <div class="max-w-2xl mx-auto bg-base-100 rounded-lg shadow-lg">
            <div class="bg-primary text-primary-content p-4 rounded-t-lg">
              <h3 class="font-bold">Customer Support</h3>
              <p class="text-sm opacity-90">We're here to help!</p>
            </div>

            <div class="p-4 space-y-4 max-h-96 overflow-y-auto">
              <ChatBubble
                message="Hi! Welcome to our support chat. How can I help you today?"
                position="start"
                avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                name="Support Agent"
                time="9:00 AM"
                color="primary"
              />

              <ChatBubble
                message="Hello! I'm having trouble with my recent order. The tracking shows it was delivered but I haven't received it."
                position="end"
                time="9:01 AM"
              />

              <ChatBubble
                message="I'm sorry to hear about that! Let me look into your order right away. Can you please provide your order number?"
                position="start"
                avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                name="Support Agent"
                time="9:02 AM"
                color="primary"
              />

              <ChatBubble
                message="Sure, it's #ORD-123456"
                position="end"
                time="9:02 AM"
              />

              <ChatBubble
                message="Thank you! I found your order. I can see it was marked as delivered yesterday at 3:15 PM. Let me contact the shipping carrier to investigate this further."
                position="start"
                avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                name="Support Agent"
                time="9:04 AM"
                color="primary"
              />

              <ChatBubble
                message=""
                position="start"
                isTyping={true}
                avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>

            <div class="p-4 border-t border-base-300">
              <div class="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  class="input input-bordered flex-1"
                />
                <button class="btn btn-primary">Send</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Group Chat Example</h2>
          <div class="max-w-2xl mx-auto bg-base-100 rounded-lg shadow-lg">
            <div class="bg-secondary text-secondary-content p-4 rounded-t-lg">
              <h3 class="font-bold">Team Project Discussion</h3>
              <p class="text-sm opacity-90">5 members online</p>
            </div>

            <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
              <ChatBubble
                message="Morning everyone! Just pushed the latest changes to the dev branch 🚀"
                position="start"
                avatar="https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp"
                name="Mike Chen"
                time="8:30 AM"
              />

              <ChatBubble
                message="Awesome! I'll review the PR this morning"
                position="start"
                avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                name="Sarah Johnson"
                time="8:32 AM"
                color="secondary"
              />

              <ChatBubble
                message="Great work! The new UI components look fantastic 👏"
                position="end"
                time="8:35 AM"
              />

              <ChatBubble
                message="Thanks! Sarah, can you also check the responsive design on mobile? Want to make sure everything scales properly."
                position="start"
                avatar="https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp"
                name="Mike Chen"
                time="8:36 AM"
              />

              <ChatBubble
                message="Absolutely! I'll test it on various devices today."
                position="start"
                avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                name="Sarah Johnson"
                time="8:37 AM"
                color="secondary"
              />

              <ChatBubble
                message="Perfect! Meeting at 2 PM to discuss the final deployment strategy?"
                position="end"
                time="8:40 AM"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Chat Bubble</code></pre>
                <pre data-prefix=">"><code>{'<ChatBubble message="Hello!" position="start" />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Chat with avatar and timestamp</code></pre>
                <pre data-prefix=">"><code>{'<ChatBubble message="Hi there!" avatar="/avatar.jpg" name="User" time="12:30" />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Colored chat bubble</code></pre>
                <pre data-prefix=">"><code>{'<ChatBubble message="Success!" color="success" position="end" />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Typing indicator</code></pre>
                <pre data-prefix=">"><code>{'<ChatBubble message="" isTyping={true} avatar="/avatar.jpg" />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
