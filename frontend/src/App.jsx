import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateCV from './pages/CreateCV';
import ResumeViewer from './components/ResumeViewer';
import FindJobs from './pages/FindJobs';
import Dictaphone from './components/Temp';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/create-cv",
    element: <CreateCV />,
  },
  {
    path: "/view-cvs",
    element: <ResumeViewer />,
  },
  {
    path: "/find-jobs",
    element: <FindJobs />,
  },
  {
    path: "/temp",
    element: <Dictaphone />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App 