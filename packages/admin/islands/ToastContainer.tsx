import { ToastContainer as UIToastContainer } from "@suppers/ui-lib";
import { toastManager } from "../lib/toast-manager.ts";

export default function ToastContainer() {
  return <UIToastContainer toastManager={toastManager} />;
}