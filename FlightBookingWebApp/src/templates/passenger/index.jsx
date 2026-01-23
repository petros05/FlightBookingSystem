import { Link } from 'react-router-dom';

function PassengerHome() {
  return (
    <div>
      <div className="jumbotron">
        <h1>Welcome to Passenger Home</h1>
        <p>Choose an action below.</p>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h1>Flights</h1>
          <p>View and book flights.</p>
          <Link to="/flights" className="btn btn-primary">View Flights</Link>
        </div>
        <div className="col-md-6">
          <h1>Orders</h1>
          <p>View, pay and cancel orders.</p>
          <Link to="/passenger/orders" className="btn btn-primary">Manage Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default PassengerHome;
