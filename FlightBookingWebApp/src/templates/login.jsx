import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [form, setForm] = useState({ userName: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.userName, form.password);
    if (result.success) {
      navigate('/');
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <div className="row">
        <form className="col-md-4" onSubmit={onSubmit}>
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
            />
          </div>
          <button className="btn btn-primary" type="submit">Login</button>
          <Link className="btn btn-link" to="/register">Don't have an account?</Link>
        </form>
      </div>
    </div>
  );
}

export default Login;