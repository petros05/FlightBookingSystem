import { useState, useEffect } from 'react';
import api from '../../utils/axios';

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders');
      setOrders(res.data);
    } catch (error) {
      // Error fetching orders
    }
  };

  return (
    <div>
      <h1>All Orders</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Flight</th>
            <th>Passenger</th>
            <th>Seat</th>
            <th>Status</th>
            <th>Price</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.flight?.flightNumber} ({order.flight?.origin} - {order.flight?.destination})</td>
              <td>{order.passenger?.userName}</td>
              <td>{order.seat}</td>
              <td>{order.status}</td>
              <td>${order.price}</td>
              <td>{new Date(order.createdTime).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrders;