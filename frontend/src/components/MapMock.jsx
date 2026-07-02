import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Truck, RefreshCw } from 'lucide-react';

const MapMock = ({ pickupAddress, dropAddress, status }) => {
  const [progress, setProgress] = useState(0); // 0 to 100% route progress
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isAnimating) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0; // Loop the animation to show path progress dynamically
          }
          return prev + 1;
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Adjust route animation based on delivery status
  useEffect(() => {
    if (status === 'Completed' || status === 'Delivered') {
      setProgress(100);
      setIsAnimating(false);
    } else if (status === 'Accepted' || status === 'Assigned') {
      setProgress(0);
      setIsAnimating(false);
    } else if (status === 'Picked Up') {
      setProgress(40);
      setIsAnimating(true);
    } else if (status === 'On the Way') {
      setProgress(75);
      setIsAnimating(true);
    }
  }, [status]);

  // Coordinates on SVG layout (representing route curve)
  const donorX = 60;
  const donorY = 240;
  const ngoX = 440;
  const ngoY = 60;

  // Midpoints to create a curved route path
  const curveX1 = 150;
  const curveY1 = 200;
  const curveX2 = 300;
  const curveY2 = 100;

  const pathD = `M ${donorX} ${donorY} C ${curveX1} ${curveY1}, ${curveX2} ${curveY2}, ${ngoX} ${ngoY}`;

  // Simple cubic bezier interpolation to get position along the path for the animated truck
  const getBezierPoint = (t) => {
    const x = Math.pow(1 - t, 3) * donorX + 3 * Math.pow(1 - t, 2) * t * curveX1 + 3 * (1 - t) * Math.pow(t, 2) * curveX2 + Math.pow(t, 3) * ngoX;
    const y = Math.pow(1 - t, 3) * donorY + 3 * Math.pow(1 - t, 2) * t * curveY1 + 3 * (1 - t) * Math.pow(t, 2) * curveY2 + Math.pow(t, 3) * ngoY;
    return { x, y };
  };

  const truckPos = getBezierPoint(progress / 100);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
      
      {/* Map Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} style={{ color: 'var(--primary)' }} />
            Active Route Map Tracker
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Delhi Central Transit Routing Map</p>
        </div>
        <button 
          onClick={() => setIsAnimating(!isAnimating)}
          className="btn btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
          disabled={status === 'Completed' || status === 'Assigned'}
        >
          <RefreshCw size={12} className={isAnimating ? 'animate-spin' : ''} />
          {isAnimating ? 'Pause Simulation' : 'Resume Simulation'}
        </button>
      </div>

      {/* SVG Map Display */}
      <div style={{ 
        position: 'relative', 
        height: '300px', 
        background: 'rgba(0, 0, 0, 0.4)', 
        borderRadius: 'var(--radius-sm)', 
        border: '1px solid var(--glass-border)',
        overflow: 'hidden'
      }}>
        {/* Map Grid Gridlines Mockup */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'radial-gradient(var(--bg-tertiary) 1px, transparent 1px)', 
          backgroundSize: '20px 20px',
          opacity: 0.4
        }}></div>

        <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 500 300">
          {/* Main Transit Route Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--bg-tertiary)" 
            strokeWidth="6" 
            strokeLinecap="round" 
          />
          {/* Animated Glowing Progress Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="500" 
            strokeDashoffset={500 - (500 * (progress / 100))}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />

          {/* Donor Pin */}
          <g transform={`translate(${donorX - 12}, ${donorY - 24})`}>
            <circle cx="12" cy="12" r="16" fill="rgba(16, 185, 129, 0.2)" />
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--primary)" />
            <circle cx="12" cy="9" r="3" fill="#fff" />
          </g>

          {/* NGO Pin */}
          <g transform={`translate(${ngoX - 12}, ${ngoY - 24})`}>
            <circle cx="12" cy="12" r="16" fill="rgba(59, 130, 246, 0.2)" />
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)" />
            <circle cx="12" cy="9" r="3" fill="#fff" />
          </g>

          {/* Moving Volunteer Vehicle Pin */}
          <g transform={`translate(${truckPos.x - 14}, ${truckPos.y - 14})`}>
            <circle cx="14" cy="14" r="12" fill="var(--bg-primary)" stroke="var(--primary)" strokeWidth="2" />
            <foreignObject x="6" y="6" width="16" height="16">
              <Truck size={16} style={{ color: 'var(--primary)' }} />
            </foreignObject>
          </g>
        </svg>

        {/* Floating Location Overlay */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', border: '1px solid var(--glass-border)' }}>
          <MapPin size={10} style={{ color: 'var(--primary)', marginRight: '4px', display: 'inline' }} />
          Donor Location: 28.6139° N, 77.2090° E
        </div>

        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', border: '1px solid var(--glass-border)' }}>
          <MapPin size={10} style={{ color: 'var(--accent)', marginRight: '4px', display: 'inline' }} />
          NGO Location: 28.6250° N, 77.2200° E
        </div>
      </div>

      {/* Transit Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Distance</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>4.2 km</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Estimated Time</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>18 minutes</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Status</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>
            {status}
          </div>
        </div>
      </div>

      {/* Route Address Description */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
        <div><strong>Pickup:</strong> {pickupAddress || 'Delhi Central Donor Point'}</div>
        <div style={{ marginTop: '6px' }}><strong>Drop-off:</strong> {dropAddress || 'ShareMeal NGO Center'}</div>
      </div>
    </div>
  );
};

export default MapMock;
