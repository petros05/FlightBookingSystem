import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar navbar-default navbar-fixed-top" style={{ backgroundColor: '#343a40', color: 'white' }}>
        <div className="container">
          <div className="navbar-header">
            <button className="navbar-toggle collapsed" aria-expanded="false" aria-controls="navbar" type="button"
                    data-toggle="collapse" data-target="#navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link className="navbar-brand" to="/" style={{ color: 'white' }}>Flight Booking</Link>
          </div>
          <div className="navbar-collapse collapse" id="navbar">
            <ul className="nav navbar-nav">
              <li><Link to="/" style={{ color: 'white' }}>Home</Link></li>
              <li><Link to="/flights" style={{ color: 'white' }}>Flights</Link></li>
              {user && user.role === 'Passenger' && (
                <li className="dropdown">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                     aria-expanded="false" style={{ color: 'white' }} onClick={(e) => e.preventDefault()}>Passenger <span className="caret"></span></a>
                  <ul className="dropdown-menu">
                    <li><Link to="/passenger">Passenger Home</Link></li>
                    <li role="separator" className="divider"></li>
                    <li><Link to="/passenger/orders">Orders</Link></li>
                  </ul>
                </li>
              )}
              {user && user.role === 'Administrator' && (
                <li className="dropdown">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                     aria-expanded="false" style={{ color: 'white' }} onClick={(e) => e.preventDefault()}>Manage <span className="caret"></span></a>
                  <ul className="dropdown-menu">
                    <li><Link to="/admin">Admin Home</Link></li>
                    <li role="separator" className="divider"></li>
                    <li><Link to="/admin/flights">Flights</Link></li>
                    <li><Link to="/admin/orders">Orders</Link></li>
                    <li role="separator" className="divider"></li>
                    <li><Link to="/admin/passengers">Passengers</Link></li>
                  </ul>
                </li>
              )}
            </ul>
            <ul className="nav navbar-nav navbar-right">
              {user ? (
                <li>
                  <p className="navbar-text navbar-right" style={{ color: 'white', marginBottom: 0, marginTop: '15px' }}>
                     <strong>{user.displayName || user.userName}</strong> &nbsp;
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}>Logout</a>
                  </p>
                </li>
              ) : (
                <>
                  <li><Link to="/login" style={{ color: 'white' }}>Login</Link></li>
                  <li><Link to="/register" style={{ color: 'white' }}>Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>
      <footer className="container footer">
        <br/>
        <hr/>
        &copy; 2026 | Final Project Flight Booking System
      </footer>
    </>
  );
}

export default Layout;