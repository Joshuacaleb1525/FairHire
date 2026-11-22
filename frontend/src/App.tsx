import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewJob } from './pages/NewJob';
import { JobWorkspace } from './pages/JobWorkspace';
import { CandidateDetail } from './pages/CandidateDetail';

export default function App(){
  return <Routes>
    <Route element={<Layout/>}>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/jobs/new" element={<NewJob/>}/>
      <Route path="/jobs/:id" element={<JobWorkspace/>}/>
      <Route path="/candidates/:id" element={<CandidateDetail/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/"/>}/>
  </Routes>
}
