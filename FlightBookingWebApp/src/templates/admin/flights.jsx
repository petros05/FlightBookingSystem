import { useState, useEffect } from 'react';
import api from '../../utils/axios';

function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    flightNumber: '',
    price: '',
    departureTime: '',
    arrivalTime: '',
    origin: '',
    destination: '',
    capacity: ''
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await api.get('/admin/flights');
      setFlights(res.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
      alert(error.response?.data?.message || 'Error loading flights');
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
        await api.put(`/admin/flights/${editing.id}`, flightData);
      } else {
        await api.post('/admin/flights', flightData);
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
      await api.delete(`/admin/flights/${id}`);
      fetchFlights();
    } catch (error) {
      alert('Error deleting flight');
    }
  };

  const togglePublish = async (id, isPublished) => {
    try {
      await api.patch(`/admin/flights/${id}`, { isPublished: !isPublished });
      fetchFlights();
    } catch (error) {
      alert('Error updating flight');
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
                  <button className="btn btn-sm btn-info" onClick={() => handleEdit(flight)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(flight.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminFlights;