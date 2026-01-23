import { Link } from 'react-router-dom';

const FlightBtn = () => {
    return (
        <div className="col-md-4">
          <h1>Go where you want</h1>
          <p>View and book flights.</p>
          <Link to="/flights" className="btn btn-primary">Book Flights</Link>
        </div>
    )
}

export default FlightBtn;