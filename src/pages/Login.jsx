import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

// ---- Design tokens (boutique-hotel key-tag identity) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  brass: '#C6A15B',
  brassLight: '#E4CD98',
  ivory: '#FBF8F1',
  sand: '#EFE6D0',
  rose: '#B3413B',
  roseBg: 'rgba(179,65,59,0.10)',
  muted: 'rgba(13,43,38,0.55)',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

  .hb-login * { box-sizing: border-box; }

  .hb-input::placeholder { color: rgba(13,43,38,0.38); }

  .hb-input:focus {
    outline: none;
    border-color: ${COLORS.emerald} !important;
    box-shadow: 0 0 0 3px rgba(31,93,79,0.16);
  }

  .hb-input-error:focus {
    border-color: ${COLORS.rose} !important;
    box-shadow: 0 0 0 3px rgba(179,65,59,0.14);
  }

  .hb-link:hover { text-decoration: underline; }

  .hb-submit:not(:disabled):hover {
    background-color: ${COLORS.emeraldDark} !important;
    transform: translateY(-1px);
  }

  .hb-toggle:hover { color: ${COLORS.ink} !important; }
  .hb-toggle:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; border-radius: 4px; }

  .hb-tag {
    animation: hb-sway 6s ease-in-out infinite;
    transform-origin: top center;
  }
  @keyframes hb-sway {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .hb-tag { animation: none; }
  }

  @media (max-width: 900px) {
    .hb-shell { grid-template-columns: 1fr !important; }
    .hb-brand { display: none !important; }
    .hb-form-card { box-shadow: none !important; border: none !important; padding: 0 !important; background: transparent !important; }
  }
`;

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.27 21.27 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.61 3.94M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FEATURES = [
  { icon: TagIcon, label: 'Best rate guarantee' },
  { icon: ClockIcon, label: '24/7 concierge' },
  { icon: ShieldIcon, label: 'Secure checkout' },
];

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const validate = (data) => {
    const errs = {};
    if (!data.username.trim()) errs.username = 'Enter your username.';
    if (!data.password) errs.password = 'Enter your password.';
    return errs;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const next = { ...credentials, [name]: value };
    setCredentials(next);
    if (touched[name]) setFieldErrors(validate(next));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldErrors(validate(credentials));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const errs = validate(credentials);
    setFieldErrors(errs);
    setTouched({ username: true, password: true });
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setError(null);

    axios.post(`${apiUrl}/api/Auth/login`, credentials)
      .then(response => {
        const token = response.data.token || response.data;
        sessionStorage.setItem('jwtToken', token);

        let finalRole = 'Customer';
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
          finalRole = payload[roleKey] || payload.role || 'Customer';
        } catch (e) {
          console.error("Could not decode token", e);
        }

        // 2. Save it to session storage exactly ONCE
        sessionStorage.setItem('userRole', finalRole);

        // 3. Traffic cop redirect using the role we just decoded!
        if (finalRole === 'Customer') {
          navigate('/customer');
        } else {
          // FIX: Send Admin and FrontDesk to /admin instead of /
          navigate('/admin'); 
        }        
      })
      .catch(err => {
        console.error("Login error:", err);
        if (!err.response) {
          setError("Can't reach the server right now. Check your connection and try again.");
        } else if (err.response.status === 401 || err.response.status === 400) {
          setError("Incorrect username or password. Please try again.");
        } else {
          setError("Something went wrong on our end. Please try again in a moment.");
        }
        setIsLoading(false);
      });
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: `1.5px solid ${hasError ? COLORS.rose : 'rgba(13,43,38,0.18)'}`,
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: COLORS.ivory,
    color: COLORS.ink,
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  return (
    <div
      className="hb-login"
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.sand,
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(13,43,38,0.07) 1px, transparent 0)`,
        backgroundSize: '26px 26px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{globalStyles}</style>

      <div className="hb-shell" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

        {/* BRAND PANEL */}
        <aside
          className="hb-brand"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(251,248,241,0.09) 1px, transparent 0), linear-gradient(160deg, ${COLORS.emerald} 0%, ${COLORS.emeraldDark} 100%)`,
            backgroundSize: '24px 24px, cover',
            color: COLORS.ivory,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 72px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            {/* KEY TAG CLUSTER */}
            <div style={{ position: 'relative', width: '160px', height: '150px', marginBottom: '44px' }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute', left: '-6px', top: '26px', width: '68px', height: '96px',
                  backgroundColor: COLORS.brassLight, opacity: 0.28, borderRadius: '9px',
                  transform: 'rotate(-14deg)',
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute', right: '4px', top: '14px', width: '62px', height: '88px',
                  backgroundColor: COLORS.ivory, opacity: 0.14, borderRadius: '9px',
                  transform: 'rotate(11deg)',
                }}
              />
              <div
                className="hb-tag"
                aria-hidden="true"
                style={{
                  position: 'relative',
                  width: '92px',
                  height: '128px',
                  backgroundColor: COLORS.brass,
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.28)',
                }}
              >
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: COLORS.emeraldDark, marginBottom: '10px' }} />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 600, color: COLORS.emeraldDark }}>HB</span>
              </div>
            </div>

            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '44px', fontWeight: 600, margin: '0 0 16px 0', lineHeight: 1.1 }}>
              Welcome back to<br />HotelBook
            </h1>
            <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.82, maxWidth: '360px', margin: 0 }}>
              Sign in to pick up your itinerary, manage bookings, and check rates on your saved stays.
            </p>

            {/* FEATURE STRIP */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', marginTop: '44px', paddingTop: '28px', borderTop: '1px solid rgba(251,248,241,0.15)' }}>
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: COLORS.ivory, opacity: 0.85 }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(198,161,91,0.18)',
                    color: COLORS.brassLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER CAPTION */}
          <p style={{ margin: 0, fontSize: '12.5px', letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.5 }}>
            HotelBook &middot; Boutique stays, worldwide
          </p>
        </aside>

        {/* FORM PANEL */}
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
          <div
            className="hb-form-card"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: COLORS.ivory,
              borderRadius: '20px',
              border: '1px solid rgba(13,43,38,0.07)',
              boxShadow: '0 24px 60px rgba(13,43,38,0.10)',
              padding: '42px 40px 38px 40px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: COLORS.brass }} />

            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 600, color: COLORS.ink, margin: '0 0 8px 0' }}>
                Sign in
              </h2>
              <p style={{ margin: 0, color: COLORS.muted, fontSize: '15px' }}>
                New to HotelBook?{' '}
                <Link to="/register" className="hb-link" style={{ color: COLORS.emerald, fontWeight: 600, textDecoration: 'none' }}>
                  Create an account
                </Link>
              </p>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  backgroundColor: COLORS.roseBg,
                  color: COLORS.rose,
                  padding: '13px 16px',
                  borderRadius: '8px',
                  marginBottom: '22px',
                  fontSize: '14px',
                  lineHeight: 1.4,
                  borderLeft: `3px solid ${COLORS.rose}`,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: 600, color: COLORS.ink, letterSpacing: '0.01em' }}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your username"
                  className={`hb-input${fieldErrors.username && touched.username ? ' hb-input-error' : ''}`}
                  style={inputStyle(fieldErrors.username && touched.username)}
                  aria-invalid={Boolean(fieldErrors.username && touched.username)}
                  aria-describedby="username-error"
                />
                {fieldErrors.username && touched.username && (
                  <p id="username-error" style={{ margin: '6px 0 0 0', fontSize: '13px', color: COLORS.rose }}>{fieldErrors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: 600, color: COLORS.ink, letterSpacing: '0.01em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`hb-input${fieldErrors.password && touched.password ? ' hb-input-error' : ''}`}
                    style={{ ...inputStyle(fieldErrors.password && touched.password), paddingRight: '46px' }}
                    aria-invalid={Boolean(fieldErrors.password && touched.password)}
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    className="hb-toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted,
                      display: 'flex', alignItems: 'center', padding: '4px',
                    }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {fieldErrors.password && touched.password && (
                  <p id="password-error" style={{ margin: '6px 0 0 0', fontSize: '13px', color: COLORS.rose }}>{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="hb-submit"
                style={{
                  marginTop: '6px',
                  padding: '15px',
                  backgroundColor: isLoading ? 'rgba(13,43,38,0.35)' : COLORS.emerald,
                  color: COLORS.ivory,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '15px',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background-color 0.15s, transform 0.15s',
                }}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}