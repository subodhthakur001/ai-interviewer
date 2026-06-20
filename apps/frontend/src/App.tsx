import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Form } from "./components/Form";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";
import "../styles/globals.css";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
