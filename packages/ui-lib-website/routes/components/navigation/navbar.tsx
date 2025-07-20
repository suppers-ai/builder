import { Navbar, Button, Badge, Input } from "@suppers/ui-lib";

export default function NavbarPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Navbar Component</h1>
        <p>Navigation bar component with flexible layout options</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Navbar</h2>
          <Navbar>
            <Button variant="ghost" class="text-xl">daisyUI</Button>
          </Navbar>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Navbar with Start, Center, End</h2>
          <Navbar
            start={
              <div class="dropdown">
                <Button variant="ghost" class="lg:hidden" tabIndex={0} role="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </Button>
                <ul
                  tabIndex={0}
                  class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                >
                  <li>
                    <a>Item 1</a>
                  </li>
                  <li>
                    <a>Item 2</a>
                  </li>
                  <li>
                    <a>Item 3</a>
                  </li>
                </ul>
              </div>
            }
            center={<Button variant="ghost" class="text-xl">daisyUI</Button>}
            end={
              <div class="navbar-end">
                <Button>Login</Button>
              </div>
            }
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Navbar with Menu</h2>
          <Navbar
            start={
              <>
                <div class="dropdown">
                  <Button variant="ghost" class="lg:hidden" tabIndex={0} role="button">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h8m-8 6h16"
                      />
                    </svg>
                  </Button>
                  <ul
                    tabIndex={0}
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                  >
                    <li>
                      <a>Item 1</a>
                    </li>
                    <li>
                      <a>Parent</a>
                      <ul class="p-2">
                        <li>
                          <a>Submenu 1</a>
                        </li>
                        <li>
                          <a>Submenu 2</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a>Item 3</a>
                    </li>
                  </ul>
                </div>
                <Button variant="ghost" class="text-xl">daisyUI</Button>
              </>
            }
            center={
              <div class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal px-1">
                  <li>
                    <a>Item 1</a>
                  </li>
                  <li>
                    <details>
                      <summary>Parent</summary>
                      <ul class="p-2">
                        <li>
                          <a>Submenu 1</a>
                        </li>
                        <li>
                          <a>Submenu 2</a>
                        </li>
                      </ul>
                    </details>
                  </li>
                  <li>
                    <a>Item 3</a>
                  </li>
                </ul>
              </div>
            }
            end={<Button>Login</Button>}
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Navbar with Search</h2>
          <Navbar
            start={<Button variant="ghost" class="text-xl">daisyUI</Button>}
            center={
              <div class="form-control">
                <Input
                  type="text"
                  placeholder="Search"
                  bordered
                  class="w-24 md:w-auto"
                />
              </div>
            }
            end={
              <div class="flex gap-2">
                <div class="dropdown dropdown-end">
                  <Button variant="ghost" circle={true} tabIndex={0} role="button">
                    <div class="indicator">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                        />
                      </svg>
                      <Badge size="sm" class="indicator-item">8</Badge>
                    </div>
                  </Button>
                  <div
                    tabIndex={0}
                    class="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
                  >
                    <div class="card-body">
                      <span class="text-lg font-bold">8 Items</span>
                      <span class="text-info">Subtotal: $999</span>
                      <div class="card-actions">
                        <Button color="primary" class="btn-block">View cart</Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="dropdown dropdown-end">
                  <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
                    <div class="w-10 rounded-full">
                      <img
                        alt="Profile"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                  >
                    <li>
                      <a class="justify-between">
                        Profile
                        <Badge size="sm">New</Badge>
                      </a>
                    </li>
                    <li>
                      <a>Settings</a>
                    </li>
                    <li>
                      <a>Logout</a>
                    </li>
                  </ul>
                </div>
              </div>
            }
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Colors</h2>
          <div class="space-y-4">
            <Navbar class="bg-primary text-primary-content">
              <Button variant="ghost" class="text-xl">Primary Navbar</Button>
            </Navbar>

            <Navbar class="bg-secondary text-secondary-content">
              <Button variant="ghost" class="text-xl">Secondary Navbar</Button>
            </Navbar>

            <Navbar class="bg-accent text-accent-content">
              <Button variant="ghost" class="text-xl">Accent Navbar</Button>
            </Navbar>

            <Navbar class="bg-neutral text-neutral-content">
              <Button variant="ghost" class="text-xl">Neutral Navbar</Button>
            </Navbar>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Responsive Example</h2>
          <Navbar class="shadow-lg">
            <div class="navbar-start">
              <div class="dropdown">
                <Button variant="ghost" class="lg:hidden" tabIndex={0} role="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </Button>
                <ul
                  tabIndex={0}
                  class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                >
                  <li>
                    <a>Home</a>
                  </li>
                  <li>
                    <a>About</a>
                  </li>
                  <li>
                    <a>Services</a>
                  </li>
                  <li>
                    <a>Contact</a>
                  </li>
                </ul>
              </div>
              <Button variant="ghost" class="text-xl">My App</Button>
            </div>
            <div class="navbar-center hidden lg:flex">
              <ul class="menu menu-horizontal px-1">
                <li>
                  <a>Home</a>
                </li>
                <li>
                  <a>About</a>
                </li>
                <li>
                  <a>Services</a>
                </li>
                <li>
                  <a>Contact</a>
                </li>
              </ul>
            </div>
            <div class="navbar-end">
              <Button color="primary">Get Started</Button>
            </div>
          </Navbar>
        </section>
      </div>
    </div>
  );
}
