import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentSchema,
} from "../../types.ts";
import { Navbar } from "./Navbar.tsx";
import {
  NavbarPropsSchema,
  safeValidateNavbarProps,
  validateNavbarProps,
} from "./Navbar.schema.ts";

const navbarExamples: ComponentExample[] = [
  {
    title: "Basic Navbar",
    description: "Simple navigation bar with brand and menu items",
    props: {
      start: <a class="btn btn-ghost text-xl">Brand</a>,
      end: (
        <div class="flex gap-2">
          <a class="btn btn-ghost">Home</a>
          <a class="btn btn-ghost">About</a>
          <a class="btn btn-ghost">Contact</a>
        </div>
      ),
    },
  },
  {
    title: "Navbar with Dropdown",
    description: "Navigation bar with dropdown menu",
    props: {
      start: <a class="btn btn-ghost text-xl">My App</a>,
      end: (
        <div class="flex gap-2">
          <a class="btn btn-ghost">Home</a>
          <div class="dropdown dropdown-end">
            <div tabIndex={0} role="button" class="btn btn-ghost">
              Services
            </div>
            <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li>
                <a>Web Design</a>
              </li>
              <li>
                <a>Development</a>
              </li>
              <li>
                <a>Consulting</a>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  },
  {
    title: "Navbar with Search",
    description: "Navigation bar with integrated search functionality",
    props: {
      start: <a class="btn btn-ghost text-xl">Platform</a>,
      center: (
        <div class="form-control">
          <input
            type="text"
            placeholder="Search..."
            class="input input-bordered w-24 md:w-auto"
          />
        </div>
      ),
      end: (
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-circle">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0z"
              />
            </svg>
          </button>
          <button class="btn btn-primary">Sign In</button>
        </div>
      ),
    },
  },
  {
    title: "Responsive Navbar",
    description: "Navigation bar that adapts to mobile screens with hamburger menu",
    props: {
      start: (
        <>
          <div class="dropdown">
            <div tabIndex={0} role="button" class="btn btn-ghost lg:hidden">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li>
                <a>Home</a>
              </li>
              <li>
                <a>Products</a>
              </li>
              <li>
                <a>About</a>
              </li>
              <li>
                <a>Contact</a>
              </li>
            </ul>
          </div>
          <a class="btn btn-ghost text-xl">Company</a>
        </>
      ),
      center: (
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li>
              <a>Home</a>
            </li>
            <li>
              <a>Products</a>
            </li>
            <li>
              <a>About</a>
            </li>
            <li>
              <a>Contact</a>
            </li>
          </ul>
        </div>
      ),
      end: <a class="btn">Get Started</a>,
    },
  },
];

const navbarSchema: ComponentSchema = {
  schema: NavbarPropsSchema,
  validateFn: validateNavbarProps,
  safeValidateFn: safeValidateNavbarProps,
};

export const navbarMetadata: ComponentMetadata = {
  name: "Navbar",
  description: "Top navigation",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/navbar",
  tags: ["navigation", "header", "menu", "top"],
  examples: navbarExamples,
  schema: navbarSchema,
  relatedComponents: ["menu", "breadcrumbs", "link"],
  preview: (
    <div class="w-full max-w-md">
      <Navbar
        start={<a class="btn btn-ghost text-xl">My App</a>}
        end={
          <div class="flex gap-2">
            <a class="btn btn-ghost btn-sm">Home</a>
            <a class="btn btn-ghost btn-sm">About</a>
          </div>
        }
      />
    </div>
  ),
};
