import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateCV from './pages/CreateCV';
import ResumeViewer from './components/ResumeViewer';
import FindJobs from './pages/FindJobs';

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
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App 