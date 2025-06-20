import React from 'react'
import ReactDOM from 'react-dom/client'
import { default as App } from './pages/App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Crm from './container/Pages_DemandesAdministratives/dashboards/crm/crm.jsx'
import './index.scss'
import Error500 from './container/error/500error/500error.jsx'
import Auth from './firebase/auth.jsx'
import Login from './firebase/login.jsx'
import ScrollToTop from './components/ui/scrolltotop.jsx'
import PrivateRoute from './guards/PrivateRoute.jsx'
import GuestRoute from './guards/GuestRoute.jsx'
import { AuthProvider } from './components/utile/AuthProvider.jsx'
import PageTransition from './components/utile/PageTransition.jsx'
import ListeDemandes from './container/Pages_DemandesAdministratives/Demandes/listeDemandes.jsx'
import ListeDemandesDirecteur from './container/Pages_DemandesAdministratives/Demandes/listeDemandesDirecteur.jsx'
import Home from './container/Home/Home.jsx'
import Users from './container/Pages_DashboardAdmin/users/users.jsx'
import Profile from './container/Pages_DemandesAdministratives/profile/Profile.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense>
          <ScrollToTop />
          <PageTransition>
            <Routes>
              {/* Guest Routes (Login) */}
              <Route element={<GuestRoute />}>
                <Route element={<Auth />}>
                  <Route index element={<Login />} />
                  <Route path="login" element={<Login />} />
                </Route>
              </Route>

              {/* Protected Routes (Dashboard and other pages) */}
              <Route element={<PrivateRoute />}>
                <Route path="Home" element={<Home />} />
                <Route element={<App />}>
                  <Route path="DemandesAdministratives/dashboards" element={<Crm />} />
                  <Route path="DemandesAdministratives/listeDemandes" element={<ListeDemandes />} />
                  <Route path="DemandesAdministratives/listeDemandesValidation" element={<ListeDemandesDirecteur />} />
                  <Route path="admin/Users" element={<Users />} />
                  <Route path="admin/Profile" element={<Profile />} />
               
                  {/* <Route path="DemandesAdministratives/pages/empty" element={<Empty />} /> */}
                  {/* ... other routes ... */}
                </Route>
              </Route>

              {/* Catch-all route for 404 errors - Must be the last route */}
              <Route path="*" element={<Error500 />} />
            </Routes>
          </PageTransition>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  </React.Fragment>
)
