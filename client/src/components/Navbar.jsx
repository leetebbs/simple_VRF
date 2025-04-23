import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">Random Number Generator</div>
            <div className="navbar-menu">
                <Link to="/" className="navbar-item">Home</Link>
                <Link to="/about" className="navbar-item">About</Link>
                <a href="#contact" className="navbar-item">Contact</a>
            </div>
        </nav>
    );
}

export default Navbar;