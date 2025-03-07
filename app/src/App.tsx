import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './layouts/layout_main'
import { Landing } from './pages/landing'
import { PrivateRoutes, PublicRoutes } from './components/route_auth'
import { LoginPage } from './pages/login'
import { Home } from './pages/home'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PublicRoutes />}>
            <Route index path='' element={<Landing />} />
            <Route path='/login' element={<LoginPage />} />
          </Route>
          <Route element={<PrivateRoutes />}>
            <Route path='/home' element={<Home />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
