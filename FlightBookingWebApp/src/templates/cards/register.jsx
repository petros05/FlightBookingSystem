import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="col-md-4">
          <h1>Become a member</h1>
          <p>Register as a passenger.</p>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
    )
}

export default Register;