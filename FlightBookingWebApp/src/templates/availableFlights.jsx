import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

function AvailableFlights() {
  const [flights, setFlights] = useState([]);
  const [query, setQuery] = useState({ city: '', flightNumber: '', date: '' });
  const navigate = useNavigate();

  const fetchFlights = async () => {
    try {
      const params = {};
      if (query.city) params.city = query.city;
      if (query.flightNumber) params.flightNumber = query.flightNumber;
      if (query.date) params.date = query.date;
      
      const res = await api.get('/flights/search', { params });
      setFlights(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const onChange = (e) => setQuery({ ...query, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFlights();
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Available Flights</h1>
      </div>
      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                className="form-control"
                placeholder="Enter city"
                value={query.city}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="flightNumber">Flight Number</label>
              <input
                id="flightNumber"
                name="flightNumber"
                type="text"
                className="form-control"
                placeholder="Enter flight number"
                value={query.flightNumber}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                className="form-control"
                value={query.date}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="col-md-1">
            <button className="btn btn-primary" type="submit">
              <span className="glyphicon glyphicon-search" aria-hidden="true"></span> Search
            </button>
          </div>
        </div>
      </form>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Flight Number</th>
            <th>From</th>
            <th>To</th>
            <th>Price</th>
            <th>Departure Time</th>
            <th>Arrival Time</th>
            <th>Remaining Seats</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flights.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">No available flights found</td>
            </tr>
          ) : (
            flights.map(flight => (
              <tr key={flight._id || flight.id}>
                <td>{flight.flightNumber}</td>
                <td>{flight.origin}</td>
                <td>{flight.destination}</td>
                <td>${flight.price?.toFixed(2) || '0.00'}</td>
                <td>{formatDateTime(flight.departureTime)}</td>
                <td>{formatDateTime(flight.arrivalTime)}</td>
                <td>{flight.remainingSeats !== undefined ? flight.remainingSeats : 'N/A'}</td>
                <td>
                  <Link to={`/flights/book/${flight._id || flight.id}`} className="btn btn-success">Book</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AvailableFlights;