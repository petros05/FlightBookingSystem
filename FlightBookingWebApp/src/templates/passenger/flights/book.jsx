import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/axios';

function BookFlight() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [takenSeats, setTakenSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(true);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await api.get(`/api/flights/${id}`);
        setFlight(res.data);
      } catch (error) {
        setError('Failed to load flight details');
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [id]);

  useEffect(() => {
    const fetchAvailableSeats = async () => {
      if (!id) return;
      try {
        setLoadingSeats(true);
        setError(''); // Clear previous errors
        const res = await api.get(`/api/orders/flight/${id}/seats`);
        setAvailableSeats(res.data.availableSeats || []);
        setTakenSeats(res.data.takenSeats || []);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load available seats. Please try again.';
        setError(errorMessage);
        // Set empty arrays on error to prevent showing "No available seats" incorrectly
        setAvailableSeats([]);
        setTakenSeats([]);
      } finally {
        setLoadingSeats(false);
      }
    };
    if (flight) {
      fetchAvailableSeats();
    }
  }, [id, flight]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedSeat) {
      setError('Please select a seat');
      return;
    }

    if (!confirm(`Are you sure you want to book this flight in seat ${selectedSeat}?`)) {
      return;
    }

    setBooking(true);
    setError('');
    try {
      const response = await api.post('/api/orders', { flightId: id, seat: selectedSeat });
      alert('Flight booked successfully!');
      navigate('/passenger/orders');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to book flight';
      setError(errorMessage);
      // If it's an auth error, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setBooking(false);
    }
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

  if (loading) {
    return <div className="text-center"><h2>Loading...</h2></div>;
  }

  if (error && !flight) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
        <Link to="/flights" className="btn btn-primary">Back to Flights</Link>
      </div>
    );
  }

  if (!flight) {
    return null;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Book Flight</h1>
      </div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row">
        <div className="col-md-8">
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Flight Number</th>
                <td>{flight.flightNumber}</td>
              </tr>
              <tr>
                <th>From</th>
                <td>{flight.origin}</td>
              </tr>
              <tr>
                <th>To</th>
                <td>{flight.destination}</td>
              </tr>
              <tr>
                <th>Departure Time</th>
                <td>{formatDateTime(flight.departureTime)}</td>
              </tr>
              <tr>
                <th>Arrival Time</th>
                <td>{formatDateTime(flight.arrivalTime)}</td>
              </tr>
              <tr>
                <th>Price</th>
                <td><strong>${flight.price?.toFixed(2) || '0.00'}</strong></td>
              </tr>
              <tr>
                <th>Remaining Seats</th>
                <td>{flight.remainingSeats || (flight.capacity - (flight.ordersCount || 0))}</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Select Your Seat</h3>
            {loadingSeats ? (
              <p>Loading available seats...</p>
            ) : availableSeats.length === 0 ? (
              <div className="alert alert-warning">
                No available seats for this flight.
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '15px' }}>
                  <strong>Total Seats:</strong> {flight.capacity || 0} | 
                  <strong> Available:</strong> {availableSeats.length} | 
                  <strong> Taken:</strong> {takenSeats.length}
                </p>
                <div className="form-group" style={{ marginTop: '20px', maxWidth: '300px' }}>
                  <label htmlFor="seatSelect"><strong>Choose Your Seat:</strong></label>
                  <select
                    id="seatSelect"
                    className="form-control"
                    value={selectedSeat || ''}
                    onChange={(e) => {
                      const seat = e.target.value ? parseInt(e.target.value) : null;
                      setSelectedSeat(seat);
                      setError('');
                    }}
                    style={{
                      padding: '10px',
                      fontSize: '16px',
                      marginTop: '10px'
                    }}
                  >
                    <option value="">-- Select a seat --</option>
                    {Array.from({ length: flight.capacity || 0 }, (_, i) => {
                      const seatNumber = i + 1;
                      const isTaken = takenSeats.includes(seatNumber);
                      
                      return (
                        <option
                          key={seatNumber}
                          value={seatNumber}
                          disabled={isTaken}
                          style={{
                            backgroundColor: isTaken ? '#f8d7da' : '#fff',
                            color: isTaken ? '#721c24' : '#000'
                          }}
                        >
                          Seat {seatNumber} {isTaken ? '(Taken)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {selectedSeat && (
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px', border: '1px solid #28a745' }}>
                    <strong>Selected Seat: {selectedSeat}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px' }}>
            <button 
              className="btn btn-success btn-lg" 
              onClick={handleBook}
              disabled={booking || !selectedSeat || availableSeats.length === 0}
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
            <Link to="/flights" className="btn btn-default btn-lg" style={{ marginLeft: '10px' }}>
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFlight;
