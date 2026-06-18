import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Rules from '@/pages/Rules';
import CallList from '@/pages/CallList';
import Register from '@/pages/Register';
import Pharmacist from '@/pages/Pharmacist';
import Tasks from '@/pages/Tasks';
import { useStoreLinker } from '@/store/useStoreLinker';

export default function App() {
  useStoreLinker();
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/call-list" element={<CallList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:id" element={<Register />} />
          <Route path="/pharmacist" element={<Pharmacist />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
