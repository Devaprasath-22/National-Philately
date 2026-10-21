import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">📮 PhilatelyIndia</div>
          <p className="footer-desc">
            India's premier online community for stamp collectors. Discover, catalog, 
            trade, and connect with fellow philatelists across the nation.
          </p>
        </div>
        <div className="footer-column">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/stamps">Stamp Catalog</Link></li>
            <li><Link to="/forum">Community Forum</Link></li>
            <li><Link to="/trades">Trading Hub</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Account</h4>
          <ul>
            <li><Link to="/profile">My Profile</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Philately Guide</a></li>
            <li><a href="#">Stamp Valuation</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} National Philately Community. All rights reserved. 
        Built with ❤️ for Indian Stamp Collectors.
      </div>
    </footer>
  );
};

export default Footer;
