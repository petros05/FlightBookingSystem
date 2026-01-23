import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Index from './templates/index';
import Login from './templates/login';
import Register from './templates/register';
import AvailableFlights from './templates/availableFlights';
import PassengerHome from './templates/passenger/index';
import BookFlight from './templates/passenger/flights/book';
import OrdersList from './templates/passenger/orders/list';
import AdminHome from './templates/admin/adminsHome';
import AdminFlights from './templates/admin/flights';
import AdminOrders from './templates/admin/orders';
import AdminPassengers from './templates/admin/passengers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="flights" element={<AvailableFlights />} />
            <Route path="flights/book/:id" element={<BookFlight />} />
            <Route path="passenger" element={<PassengerHome />} />
            <Route path="passenger/orders" element={<OrdersList />} />
            <Route path="admin" element={<AdminHome />} />
            <Route path="admin/flights" element={<AdminFlights />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="admin/passengers" element={<AdminPassengers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
