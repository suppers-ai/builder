import { Button, Button as ButtonComponent } from "@suppers/ui-lib";
import { createButtonRoute } from "../../../shared/lib/component-route-generator.tsx";

// Use the generic button route generator
export default createButtonRoute(ButtonComponent, Button);
