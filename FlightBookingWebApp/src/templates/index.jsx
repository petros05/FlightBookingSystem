import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlightBtn from './cards/flightBtn';
import AdminManage from './cards/adminManage';
import Register from './cards/register';

function Index() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <div className="jumbotron">
        <h1>Welcome to Flight Booking System</h1>
        <p>Your trusted platform for easy and reliable flight booking.</p>
        {!isAuthenticated && (
          <Link to="/login" className="btn btn-large btn-success">Login Now</Link>
        )}
      </div>

      <div className="row">
        {user && user.role === "Passenger" && (
          <FlightBtn />
        )}
        {user && user.role === "Administrator" && (
          <AdminManage />
        )}
        {!isAuthenticated && (
          <>
          <FlightBtn />
          <Register />
          <AdminManage />
          </>
        )}
      </div>
    </div>
  );
}

export default Index;