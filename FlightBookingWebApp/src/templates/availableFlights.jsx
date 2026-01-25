import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

function AvailableFlights() {
  const { user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [query, setQuery] = useState({ city: '', flightNumber: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFlight, setBookingFlight] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    identityCardNumber: '',
    displayName: '',
    seat: ''
  });

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const params = {};
      if (query.city) params.city = query.city;
      if (query.flightNumber) params.flightNumber = query.flightNumber;
      if (query.date) params.date = query.date;
      
      const res = await api.get('/api/flights/search', { params });
      if (res.data && Array.isArray(res.data)) {
        setFlights(res.data);
      } else {
        setFlights([]);
      }
    } catch (error) {
      setFlights([]);
    } finally {
      setLoading(false);
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

  const handleBookForPassenger = async (flight) => {
    setBookingFlight(flight);
    setShowBookingModal(true);
    setBookingForm({
      identityCardNumber: '',
      displayName: '',
      seat: ''
    });
    
    // Fetch available seats
    setLoadingSeats(true);
    try {
      const res = await api.get(`/api/orders/flight/${flight.id}/seats`);
      setAvailableSeats(res.data.availableSeats || []);
    } catch (error) {
      alert('Failed to load available seats');
      setAvailableSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.identityCardNumber || !bookingForm.displayName) {
      alert('Please enter passenger identity card number and name');
      return;
    }

    setBooking(true);
    try {
      const bookingData = {
        flightId: bookingFlight.id,
        identityCardNumber: bookingForm.identityCardNumber,
        displayName: bookingForm.displayName,
        seat: bookingForm.seat ? parseInt(bookingForm.seat) : undefined
      };

      await api.post('/api/orders', bookingData);
      alert('Flight booked successfully!');
      setShowBookingModal(false);
      setBookingFlight(null);
      setBookingForm({
        identityCardNumber: '',
        displayName: '',
        seat: ''
      });
      fetchFlights(); // Refresh flights to update remaining seats
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to book flight');
  } finally {
    setBooking(false);
  }
}
  return (
    <div>
      <div className="page-header">
        <h1>Available Flights</h1>
      </div>
      {!loading && flights.length === 0 && (
        <div className="alert alert-info">
          {query.city || query.flightNumber || query.date 
            ? 'No flights found matching your search criteria. Try different search terms.' 
            : 'No published flights available. Please check back later or contact support.'}
        </div>
      )}
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
      {loading ? (
        <div className="text-center" style={{ padding: '20px' }}>
          <p>Loading flights...</p>
        </div>
      ) : (
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
                    {user && user.role === 'Administrator' ? (
                      <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => handleBookForPassenger(flight)} 
                      style={{ marginRight: '5px' }}
                      title="Book this flight for a passenger"
                    >
                      Book for Passenger
                    </button>
                    ) : (
                      <Link to={`/flights/book/${flight._id || flight.id}`} className="btn btn-success">
                        Book
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Booking Modal for Admin */}
      {showBookingModal && bookingFlight && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Book Flight for Passenger</h5>
                <button type="button" className="close" onClick={() => setShowBookingModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleBookingSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Flight</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={`${bookingFlight.flightNumber} - ${bookingFlight.origin} to ${bookingFlight.destination}`}
                      disabled 
                    />
                  </div>
                  <div className="form-group">
                    <label>Passenger Identity Card Number *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={bookingForm.identityCardNumber}
                      onChange={(e) => setBookingForm({...bookingForm, identityCardNumber: e.target.value})}
                      required 
                      placeholder="Enter passenger ID card number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Passenger Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={bookingForm.displayName}
                      onChange={(e) => setBookingForm({...bookingForm, displayName: e.target.value})}
                      required 
                      placeholder="Enter passenger full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Seat Number (Optional)</label>
                    {loadingSeats ? (
                      <div>Loading available seats...</div>
                    ) : (
                      <select 
                        className="form-control" 
                        value={bookingForm.seat}
                        onChange={(e) => setBookingForm({...bookingForm, seat: e.target.value})}
                      >
                        <option value="">Auto-assign</option>
                        {availableSeats.map(seat => (
                          <option key={seat} value={seat}>Seat {seat}</option>
                        ))}
                      </select>
                    )}
                    {availableSeats.length > 0 && (
                      <small className="form-text text-muted">
                        {availableSeats.length} seats available. Leave empty for auto-assignment.
                      </small>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={booking}>
                    {booking ? 'Booking...' : 'Book Flight'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailableFlights;