import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// ---- Design tokens (boutique-hotel key-tag identity — matches Login.jsx) ----
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
  sage: '#4F7A5B',
  sageBg: 'rgba(79,122,91,0.10)',
  muted: 'rgba(13,43,38,0.55)',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

  .hb-register * { box-sizing: border-box; }

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

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3Z" />
      <path d="M9 4v13M15 7v13" />
    </svg>
  );
}

const FEATURES = [
  { icon: BookmarkIcon, label: 'Save favorite stays' },
  { icon: ZapIcon, label: 'Faster checkout' },
  { icon: MapIcon, label: 'One trip history' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const validate = (data) => {
    const errs = {};
    if (!data.fullName.trim()) errs.fullName = 'Enter your full name.';
    if (!data.username.trim()) {
      errs.username = 'Choose a username.';
    } else if (data.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    }
    if (!data.email.trim()) {
      errs.email = 'Enter your email address.';
    } else if (!EMAIL_RE.test(data.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (!data.password) {
      errs.password = 'Create a password.';
    } else if (data.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    return errs;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) setFieldErrors(validate(next));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldErrors(validate(formData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(formData);
    setFieldErrors(errs);
    setTouched({ fullName: true, username: true, email: true, password: true });
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    axios.post(`${apiUrl}/api/Auth/register`, formData)
      .then(() => {
        setSuccessMessage("Account created. Taking you to sign in…");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch(err => {
        console.error("Registration error:", err);
        if (!err.response) {
          setError("Can't reach the server right now. Check your connection and try again.");
        } else {
          setError(err.response?.data?.message || "That username or email is already taken.");
        }
        setIsLoading(false);
      });
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: '8px',
    border: `1.5px solid ${hasError ? COLORS.rose : 'rgba(13,43,38,0.18)'}`,
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: COLORS.ivory,
    color: COLORS.ink,
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  const labelStyle = {
    display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: 600, color: COLORS.ink, letterSpacing: '0.01em',
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', met: formData.password.length >= 6 },
  ];

  return (
    <div
      className="hb-register"
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
              Get your<br />own key
            </h1>
            <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.82, maxWidth: '360px', margin: 0 }}>
              Create a HotelBook account to save favorite stays, book faster, and track every trip in one place.
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
              padding: '38px 40px 36px 40px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: COLORS.brass }} />

            <div style={{ marginBottom: '26px' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 600, color: COLORS.ink, margin: '0 0 8px 0' }}>
                Create your account
              </h2>
              <p style={{ margin: 0, color: COLORS.muted, fontSize: '15px' }}>
                Already have one?{' '}
                <Link to="/login" className="hb-link" style={{ color: COLORS.emerald, fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>

            {error && (
              <div role="alert" style={{ backgroundColor: COLORS.roseBg, color: COLORS.rose, padding: '13px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '14px', lineHeight: 1.4, borderLeft: `3px solid ${COLORS.rose}` }}>
                {error}
              </div>
            )}

            {successMessage && (
              <div role="status" style={{ backgroundColor: COLORS.sageBg, color: COLORS.sage, padding: '13px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '14px', lineHeight: 1.4, borderLeft: `3px solid ${COLORS.sage}` }}>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label htmlFor="fullName" style={labelStyle}>Full name</label>
                <input
                  id="fullName" type="text" name="fullName" value={formData.fullName}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="John Doe"
                  className={`hb-input${fieldErrors.fullName && touched.fullName ? ' hb-input-error' : ''}`}
                  style={inputStyle(fieldErrors.fullName && touched.fullName)}
                  aria-invalid={Boolean(fieldErrors.fullName && touched.fullName)}
                  aria-describedby="fullName-error"
                />
                {fieldErrors.fullName && touched.fullName && (
                  <p id="fullName-error" style={{ margin: '6px 0 0 0', fontSize: '13px', color: COLORS.rose }}>{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" style={labelStyle}>Username</label>
                <input
                  id="username" type="text" name="username" value={formData.username}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="johndoe123"
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
                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email" type="email" name="email" value={formData.email}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="john@example.com"
                  className={`hb-input${fieldErrors.email && touched.email ? ' hb-input-error' : ''}`}
                  style={inputStyle(fieldErrors.email && touched.email)}
                  aria-invalid={Boolean(fieldErrors.email && touched.email)}
                  aria-describedby="email-error"
                />
                {fieldErrors.email && touched.email && (
                  <p id="email-error" style={{ margin: '6px 0 0 0', fontSize: '13px', color: COLORS.rose }}>{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleInputChange} onBlur={handleBlur} placeholder="Min. 6 characters"
                    className={`hb-input${fieldErrors.password && touched.password ? ' hb-input-error' : ''}`}
                    style={{ ...inputStyle(fieldErrors.password && touched.password), paddingRight: '46px' }}
                    aria-invalid={Boolean(fieldErrors.password && touched.password)}
                    aria-describedby="password-error"
                  />
                  <button
                    type="button" className="hb-toggle" onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, display: 'flex', alignItems: 'center', padding: '4px' }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {fieldErrors.password && touched.password ? (
                  <p id="password-error" style={{ margin: '6px 0 0 0', fontSize: '13px', color: COLORS.rose }}>{fieldErrors.password}</p>
                ) : (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {passwordRequirements.map((req) => (
                      <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: req.met ? COLORS.sage : COLORS.muted }}>
                        <span style={{
                          width: '15px', height: '15px', borderRadius: '50%',
                          border: `1.5px solid ${req.met ? COLORS.sage : 'rgba(13,43,38,0.3)'}`,
                          backgroundColor: req.met ? COLORS.sage : 'transparent',
                          color: COLORS.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {req.met && <CheckIcon />}
                        </span>
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit" disabled={isLoading} className="hb-submit"
                style={{
                  marginTop: '6px', padding: '15px',
                  backgroundColor: isLoading ? 'rgba(13,43,38,0.35)' : COLORS.emerald,
                  color: COLORS.ivory, border: 'none', borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px',
                  fontFamily: "'Inter', sans-serif", transition: 'background-color 0.15s, transform 0.15s',
                }}
              >
                {isLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}