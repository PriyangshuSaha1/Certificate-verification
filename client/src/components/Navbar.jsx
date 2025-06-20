import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { admin, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">CertVerify</Link>
        
        <div className="flex items-center space-x-4">
          {admin ? (
            <>
              <Link to="/admin" className="hover:text-gray-300">Admin Dashboard</Link>
              <button 
                onClick={logout}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
