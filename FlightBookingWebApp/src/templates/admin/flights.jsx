import { useState, useEffect } from 'react';
import api from '../../utils/axios';

function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFlight, setBookingFlight] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({
    flightNumber: '',
    price: '',
    departureTime: '',
    arrivalTime: '',
    origin: '',
    destination: '',
    capacity: ''
  });
  const [bookingForm, setBookingForm] = useState({
    identityCardNumber: '',
    displayName: '',
    seat: ''
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await api.get('/api/admin/flights');
      if (res.data && Array.isArray(res.data)) {
        setFlights(res.data);
      } else {
        setFlights([]);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error loading flights');
      setFlights([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert form data to proper format
      const flightData = {
        ...form,
        price: parseFloat(form.price),
        capacity: parseInt(form.capacity),
        departureTime: new Date(form.departureTime).toISOString(),
        arrivalTime: new Date(form.arrivalTime).toISOString()
      };

      if (editing) {
        await api.put(`/api/flights/${editing.id}`, flightData);
      } else {
        await api.post('/api/flights', flightData);
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        flightNumber: '',
        price: '',
        departureTime: '',
        arrivalTime: '',
        origin: '',
        destination: '',
        capacity: ''
      });
      fetchFlights();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving flight');
    }
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEdit = (flight) => {
    setEditing(flight);
    setForm({
      flightNumber: flight.flightNumber,
      price: flight.price,
      departureTime: formatDateTimeLocal(flight.departureTime),
      arrivalTime: formatDateTimeLocal(flight.arrivalTime),
      origin: flight.origin,
      destination: flight.destination,
      capacity: flight.capacity
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/flights/${id}`);
      fetchFlights();
    } catch (error) {
      alert('Error deleting flight');
    }
  };

  const togglePublish = async (id, isPublished) => {
    try {
      await api.patch(`/api/flights/${id}`, { isPublished: !isPublished });
      fetchFlights();
    } catch (error) {
      alert('Error updating flight');
    }
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

      const res = await api.post('/api/admin/book-flight', bookingData);
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
  };

  return (
    <div>
      <h1>Manage Flights</h1>
      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Flight'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Flight Number</label>
                <input type="text" className="form-control" value={form.flightNumber} onChange={(e) => setForm({...form, flightNumber: e.target.value})} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Price</label>
                <input type="number" step="0.01" className="form-control" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Origin</label>
                <input type="text" className="form-control" value={form.origin} onChange={(e) => setForm({...form, origin: e.target.value})} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Destination</label>
                <input type="text" className="form-control" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} required />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Departure Time</label>
                <input type="datetime-local" className="form-control" value={form.departureTime} onChange={(e) => setForm({...form, departureTime: e.target.value})} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Arrival Time</label>
                <input type="datetime-local" className="form-control" value={form.arrivalTime} onChange={(e) => setForm({...form, arrivalTime: e.target.value})} required />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Capacity</label>
                <input type="number" className="form-control" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} required />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-success">{editing ? 'Update' : 'Add'}</button>
        </form>
      )}
      <table className="table table-striped" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Flight Number</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Price</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">No flights found</td>
            </tr>
          ) : (
            flights.map(flight => (
              <tr key={flight.id}>
                <td>{flight.flightNumber}</td>
                <td>{flight.origin} - {flight.destination}</td>
                <td>{new Date(flight.departureTime).toLocaleString()}</td>
                <td>${flight.price}</td>
                <td>
                  <button className={`btn btn-sm ${flight.isPublished ? 'btn-success' : 'btn-warning'}`} onClick={() => togglePublish(flight.id, flight.isPublished)}>
                    {flight.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={() => handleBookForPassenger(flight)} 
                    style={{ marginRight: '5px' }}
                    title="Book this flight for a passenger"
                  >
                    Book for Passenger
                  </button>
                  <button className="btn btn-sm btn-info" onClick={() => handleEdit(flight)} style={{ marginRight: '5px' }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(flight.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Booking Modal */}
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

export default AdminFlights;