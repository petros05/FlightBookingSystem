import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({ userName: '', password: '', confirmPassword: '', displayName: '', identityNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!form.userName.trim() || !form.password || !form.displayName.trim() || !form.identityNumber.trim()) {
      setError('All fields are required');
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const result = await register(form.userName.trim(), form.password, form.displayName.trim(), form.identityNumber.trim());
      if (result.success) {
        alert('Registration successful! You are now logged in.');
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form className="col-md-6" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="userName">User Name</label>
            <input
              className="form-control"
              type="text"
              id="userName"
              name="userName"
              value={form.userName}
              onChange={onChange}
              required
              disabled={loading}
            />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
            <input
              className="form-control"
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="displayName">Real Name</label>
            <input
              className="form-control"
              type="text"
              id="displayName"
              name="displayName"
              value={form.displayName}
              onChange={onChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="identityNumber">ID Card Number</label>
            <input
              className="form-control"
              type="text"
              id="identityNumber"
              name="identityNumber"
              value={form.identityNumber}
              onChange={onChange}
              required
              disabled={loading}
            />
        </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
      </form>
    </div>
  );
}

export default Register;