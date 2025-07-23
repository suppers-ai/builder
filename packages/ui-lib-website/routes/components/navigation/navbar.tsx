import { Navbar } from "@suppers/ui-lib";
import { createComponentRoute } from "../../../shared/lib/component-route-generator.tsx";

export default createComponentRoute({
  component: Navbar,
  componentName: "Navbar",
  category: "layout",
  directoryName: "navbar"
});
