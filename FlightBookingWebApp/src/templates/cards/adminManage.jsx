import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import React from 'react';
import {Navigate} from 'react-router-dom';

const AdminManage = () => {
    const { user } = useAuth();
    return (
        <div className="col-md-4">
        <h1>Administrator</h1>
        <p>Manage the system.</p>
        <Link to="/admin" className="btn btn-primary">Manage</Link>
      </div>
    )
}

export default AdminManage;