import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateCV from './pages/CreateCV';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/create-cv",
    element: <CreateCV />,
  },

  
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App 