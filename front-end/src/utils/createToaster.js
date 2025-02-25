import { configureToasts, Toast } from "toaster-js"
import "/node_modules/toaster-js/default.css"

export function createToaster(message, type="normal") {
  new Toast(message, type === "normal" ? Toast.TYPE_NORMAL : Toast.TYPE_ERROR, 1500)
}