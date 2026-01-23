import { Link } from 'react-router-dom';

const AdminManage = () => {
    return (
        <div className="col-md-4">
        <h1>Administrator</h1>
        <p>Manage the system.</p>
        <Link to="/admin" className="btn btn-primary">Manage</Link>
      </div>
    )
}

export default AdminManage;