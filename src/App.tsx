import { RouterProvider } from "react-router";
import { router } from "./routes/index.route";
import { ToastProvider } from "./contexts/toast-context";

function App() {
  return (
    <ToastProvider>
      {" "}
      {/* Wrap the entire app with ToastProvider */}
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
