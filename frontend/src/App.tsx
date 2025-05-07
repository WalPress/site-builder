
/* -------------------------------------------------------------------------- */
/*                             External Dependency                            */
/* -------------------------------------------------------------------------- */
import { Routes, Route } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                             Internal Dependency                            */
/* -------------------------------------------------------------------------- */
import AuthPage from './pages/auth/auth';
import AuthLocalPage from './pages/auth/auth-local';
import DashboardPage from './pages/dashboard';
import MySitesPage from './pages/dashboard/sites';
import SuiNsManagerPage from './pages/dashboard/ns-manager';
import NotFoundPage from './pages/not-found-page';
import SettingsPage from './pages/dashboard/settings';
import EditorPage from './pages/dashboard/sites/editor';
import InstallPage from './pages/install';
import WelcomePage from './pages/welcome';
import AuthLayout from './pages/auth/layout';
import DashboardLayout from './pages/dashboard/layout';


const AppRoutes = () => (
  <Routes>
    <Route index element={<WelcomePage />} />
    <Route path="install" element={<InstallPage />} />

    <Route path="auth" element={<AuthLayout />}>
      <Route index element={<AuthPage />} />
      <Route path="wallet" element={<AuthLocalPage />} />
    </Route>

    <Route path="app" element={<DashboardLayout />}>
      <Route index element={<DashboardPage />} />

      <Route path="sites">
        <Route index element={<MySitesPage />} />
        <Route path=":id/edit" element={<EditorPage />} />
      </Route>
      <Route path="ns-manager" element={<SuiNsManagerPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

function App() {
  return <AppRoutes />;
}

export default App;
