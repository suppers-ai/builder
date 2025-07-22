import { Navbar } from "@suppers/ui-lib";
import { createComponentRoute } from "@suppers/shared/utils/component-route-generator.tsx";

export default createComponentRoute({
  component: Navbar,
  componentName: "Navbar",
  category: "layout",
  directoryName: "navbar"
});
