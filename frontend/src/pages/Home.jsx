import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, Users, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Landing Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <Heart size={22} fill="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-title)', color: '#fff' }}>ShareMeal</span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Join System</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 0 60px 0', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} className="animate-fade-in">
        <h1 style={{ fontSize: '54px', fontWeight: '800', lineHeight: '1.1', maxWidth: '800px', color: '#fff', marginBottom: '24px' }}>
          Connecting Surplus Food to <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hunger Relief Centers</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
          ShareMeal bridges the gap between donors, NGOs, and volunteers, reducing landfill food waste and delivering nourishment to families in need.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
            Portal Login
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', padding: '60px 0', borderTop: '1px solid var(--glass-border)' }}>
        
        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '20px' }}>
            <Heart size={24} />
          </div>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '10px' }}>Generous Donors</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            Restaurants, hotels, caterers, and individuals can publish details of surplus food within minutes and request pickups.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '20px' }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '10px' }}>Registered NGOs</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            Browse local verified food donations, claim allocations, and specify distribution locations within your community.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '20px' }}>
            <Truck size={24} />
          </div>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '10px' }}>Dedicated Volunteers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            Accept delivery assignments, access pickup/NGO routing information, and track updates using local transit routes.
          </p>
        </div>

      </section>

      {/* Stats Counter */}
      <section style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        flexWrap: 'wrap', 
        gap: '30px', 
        padding: '50px', 
        background: 'rgba(22, 31, 48, 0.4)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--glass-border)',
        marginBottom: '80px',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '36px', color: 'var(--primary)', fontWeight: '800' }}>24,830+</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Meals Shared</p>
        </div>
        <div>
          <h2 style={{ fontSize: '36px', color: 'var(--accent)', fontWeight: '800' }}>1,200+</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Registered Donors</p>
        </div>
        <div>
          <h2 style={{ fontSize: '36px', color: '#8b5cf6', fontWeight: '800' }}>420+</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>NGO Partners</p>
        </div>
        <div>
          <h2 style={{ fontSize: '36px', color: 'var(--warning)', fontWeight: '800' }}>940+</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Active Volunteers</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '30px 0', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <div>&copy; {new Date().getFullYear()} ShareMeal Food Donation Management System. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
