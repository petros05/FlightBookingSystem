import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/axios';

function OrdersList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/passenger');
      setOrders(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      alert('Order cancelled successfully!');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handlePay = async (orderId) => {
    if (!confirm('Confirm payment for this order?')) {
      return;
    }
    try {
      await api.patch(`/orders/${orderId}/pay`);
      alert('Payment successful!');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process payment');
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

  return (
    <div>
      <div className="page-header">
        <h1>My Orders</h1>
      </div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {orders.length === 0 ? (
        <div className="alert alert-info">
          <p>You have no orders yet.</p>
          <Link to="/flights" className="btn btn-primary">Book a Flight</Link>
        </div>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Flight Number</th>
              <th>From</th>
              <th>To</th>
              <th>Departure Time</th>
              <th>Seat</th>
              <th>Price</th>
              <th>Status</th>
              <th>Created Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id || order.id}>
                <td>{(order._id || order.id).substring(0, 8)}</td>
                <td>{order.flight?.flightNumber || 'N/A'}</td>
                <td>{order.flight?.origin || 'N/A'}</td>
                <td>{order.flight?.destination || 'N/A'}</td>
                <td>{formatDateTime(order.flight?.departureTime)}</td>
                <td>{order.seat || 'N/A'}</td>
                <td>${order.price?.toFixed(2) || '0.00'}</td>
                <td>
                  {order.isCancelled ? (
                    <span className="label label-danger">Cancelled</span>
                  ) : order.isPaid ? (
                    <span className="label label-success">Paid</span>
                  ) : (
                    <span className="label label-warning">Unpaid</span>
                  )}
                </td>
                <td>{formatDateTime(order.createdTime)}</td>
                <td>
                  {!order.isCancelled && !order.isPaid && (
                    <>
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handlePay(order._id || order.id)}
                        style={{ marginRight: '5px' }}
                      >
                        Pay
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleCancel(order._id || order.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.isCancelled && (
                    <span className="text-muted">Cancelled</span>
                  )}
                  {order.isPaid && !order.isCancelled && (
                    <span className="text-success">Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrdersList;
