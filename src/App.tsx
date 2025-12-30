import "./App.css";
import Navbar from "./components/common/Navbar";
import { SidebarProvider } from "./components/ui/sidebar";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex">
          <Navbar />
          <main className="flex-1 p-6">
            <AppRoutes />
          </main>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
