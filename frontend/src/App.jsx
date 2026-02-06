import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import Login from './components/Login'
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import EachCategory from './components/EachCategory';
import Cart from './components/Cart';
import UserAccount from './components/UserAccount';
import NotFound from './components/NotFound';
import OrdersList from './components/OrdersList';


import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path='/category/:item' element={<ProtectedRoute><EachCategory /></ProtectedRoute>} />
        <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path='/user-account' element={<ProtectedRoute><UserAccount /></ProtectedRoute>} />
        <Route path='/previous-orders' element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
