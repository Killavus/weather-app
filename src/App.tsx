import MainRouter from "pages/main";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

type AppProps = {
  queryClient: QueryClient;
};

const App: React.FC<AppProps> = ({ queryClient }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <MainRouter />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
