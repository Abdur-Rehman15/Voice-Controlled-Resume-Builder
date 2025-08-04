import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateCV from './components/CreateCV';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/abc",
    element: <CreateCV />,
  },

  
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App 