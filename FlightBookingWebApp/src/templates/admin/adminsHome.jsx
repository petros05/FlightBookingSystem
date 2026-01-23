import { Link } from 'react-router-dom';

function AdminHome() {
  return (
    <div>
      <div className="jumbotron">
        <h1>Welcome to Admin Home</h1>
        <p>Manage the flight booking system.</p>
      </div>
      <div className="row">
        <div className="col-md-4">
          <h1>Flights</h1>
          <p>Manage flights.</p>
          <Link to="/admin/flights" className="btn btn-primary">Manage Flights</Link>
        </div>
        <div className="col-md-4">
          <h1>Orders</h1>
          <p>View all orders.</p>
          <Link to="/admin/orders" className="btn btn-primary">View Orders</Link>
        </div>
        <div className="col-md-4">
          <h1>Passengers</h1>
          <p>Manage passengers.</p>
          <Link to="/admin/passengers" className="btn btn-primary">Manage Passengers</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;