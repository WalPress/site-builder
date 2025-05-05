import { Routes, Route } from 'react-router-dom';

import AuthPage from './pages/auth/auth';
import AuthLocalPage from './pages/auth/auth-local';
import DashboardPage from './pages/dashboard';
import DashboardLayout from './components/layouts/DashboardLayout';
import MySitesPage from './pages/sites/index';
import SuiNsManagerPage from './pages/ns/ns-manager';
import NotFoundPage from './pages/not-found-page';
import SettingsPage from './pages/settings/settings';
import EditorPage from './pages/sites/editor';
import { AccountProvider } from './context/account';

const RouteWithLayout = ({ element }: { element: React.ReactNode }) => (
  <DashboardLayout>
    {element}
  </DashboardLayout>
);

const AppRoutes = () => (
    <Routes>
      <Route path="/" element={<AuthPage />} /> 
      <Route path="/auth/local" element={<AuthLocalPage />} />
      <Route 
        path="/dashboard" 
        element={
          <RouteWithLayout element={<DashboardPage />} />
        }
      />
      <Route path="sites">
        <Route index element={<RouteWithLayout element={<MySitesPage />} />} />
        <Route path=":id/edit" element={<RouteWithLayout element={<EditorPage />} />} />
      </Route>
      <Route 
        path="/ns-manager" 
        element={
          <RouteWithLayout element={<SuiNsManagerPage />} />
        }
      />
      <Route
        path="/settings"
        element={
          <RouteWithLayout element={<SettingsPage />} />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
)

function App() {
  return (
    <AccountProvider>
      <AppRoutes />
    </AccountProvider>
  );
}

export default App;
