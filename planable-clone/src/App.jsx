import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import Compose from './pages/Compose';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="Dashboard">
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/calendar"
          element={
            <Layout title="Calendar">
              <CalendarView />
            </Layout>
          }
        />
        <Route
          path="/compose"
          element={
            <Layout title="Compose">
              <Compose />
            </Layout>
          }
        />
        <Route
          path="/media"
          element={
            <Layout title="Media Library">
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Media Library - Coming Soon</p>
              </div>
            </Layout>
          }
        />
        <Route
          path="/analytics"
          element={
            <Layout title="Analytics">
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Analytics - Coming Soon</p>
              </div>
            </Layout>
          }
        />
        <Route
          path="/team"
          element={
            <Layout title="Team">
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Team Management - Coming Soon</p>
              </div>
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout title="Settings">
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Settings - Coming Soon</p>
              </div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
