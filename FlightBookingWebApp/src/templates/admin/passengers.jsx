import { useState, useEffect } from 'react';
import api from '../../utils/axios';

function AdminPassengers() {
  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      const res = await api.get('/api/admin/passengers');
      setPassengers(res.data);
    } catch (error) {
      // Error fetching passengers
    }
  };

  return (
    <div>
      <h1>All Passengers</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Display Name</th>
            <th>Identity Number</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map(passenger => (
            <tr key={passenger.id}>
              <td>{passenger.userName}</td>
              <td>{passenger.displayName}</td>
              <td>{passenger.identityCardNumber}</td>
              <td>{new Date(passenger.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPassengers;