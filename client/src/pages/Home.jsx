import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineCollection, HiOutlineChatAlt2, HiOutlineSwitchHorizontal,
  HiOutlineUserGroup, HiOutlineGlobe, HiOutlineShieldCheck
} from 'react-icons/hi';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <HiOutlineCollection />,
      title: 'Digital Stamp Catalog',
      description: 'Organize and showcase your entire stamp collection online. Add details like country, year, denomination, condition, and rarity.',
      color: 'var(--primary-400)',
      bg: 'rgba(99, 102, 241, 0.15)'
    },
    {
      icon: <HiOutlineChatAlt2 />,
      title: 'Community Forum',
      description: 'Engage with fellow philatelists. Discuss stamp identification, valuation, share your latest finds, and stay updated on events.',
      color: 'var(--success)',
      bg: 'rgba(16, 185, 129, 0.15)'
    },
    {
      icon: <HiOutlineSwitchHorizontal />,
      title: 'Stamp Trading',
      description: 'Exchange stamps with collectors across India. Browse available stamps, send trade offers, and grow your collection.',
      color: 'var(--accent-400)',
      bg: 'rgba(245, 158, 11, 0.15)'
    },
    {
      icon: <HiOutlineUserGroup />,
      title: 'Collector Network',
      description: 'Connect with stamp enthusiasts nationwide. Build your philatelist profile and discover collectors with shared interests.',
      color: 'var(--info)',
      bg: 'rgba(59, 130, 246, 0.15)'
    },
    {
      icon: <HiOutlineGlobe />,
      title: 'Worldwide Stamps',
      description: 'Explore stamps from every corner of the world. Filter by country, era, category, and rarity to find your next treasure.',
      color: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.15)'
    },
    {
      icon: <HiOutlineShieldCheck />,
      title: 'Secure & Reliable',
      description: 'Your collection data is safely stored in the cloud. Access your catalog anytime, anywhere with your secure account.',
      color: 'var(--error)',
      bg: 'rgba(239, 68, 68, 0.12)'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>India's Premier<br />Philately Community</h1>
        <p>
          Discover, catalog, trade, and connect with thousands of stamp collectors
          across the nation. Your journey into the world of philately starts here.
        </p>
        <div className="hero-actions">
          {user ? (
            <>
              <Link to="/stamps" className="btn btn-primary btn-lg">Browse Catalog</Link>
              <Link to="/forum" className="btn btn-ghost btn-lg">Join Discussion</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/stamps" className="btn btn-ghost btn-lg">Explore Stamps</Link>
            </>
          )}
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="number">10K+</div>
            <div className="label">Stamps Cataloged</div>
          </div>
          <div className="hero-stat">
            <div className="number">2.5K+</div>
            <div className="label">Active Collectors</div>
          </div>
          <div className="hero-stat">
            <div className="number">500+</div>
            <div className="label">Trades Completed</div>
          </div>
          <div className="hero-stat">
            <div className="number">150+</div>
            <div className="label">Countries Covered</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="text-center mb-3">
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.2rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            Everything a Philatelist Needs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            A complete platform to manage your passion for stamp collecting
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon" style={{
                background: feature.bg,
                color: feature.color
              }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            marginBottom: '1rem'
          }}>
            Ready to Start Your Collection?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            Join our growing community of stamp enthusiasts. It's free to sign up and
            start cataloging your collection.
          </p>
          <Link to="/register" className="btn btn-accent btn-lg">
            Create Your Free Account
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;
