import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const roles = [
  {
    key: 'STUDENT',
    icon: '🎓',
    label: 'Student',
    desc: 'View attendance & mark presence',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    key: 'FACULTY',
    icon: '👨‍🏫',
    label: 'Faculty',
    desc: 'Start classes & manage curriculum',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    key: 'CLASS_ADVISOR',
    icon: '👩‍💼',
    label: 'Class Advisor',
    desc: 'Monitor section & manage students',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.2)',
  },
  {
    key: 'ADMIN',
    icon: '👨‍💼',
    label: 'HOD / Admin',
    desc: 'Full system access & reports',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
  },
];

const Login = () => {
  const [step, setStep]                 = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setStep('creds');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await loginAPI({ email, password });
      if (data.token) {
        if (data.role !== selectedRole.key) {
          setError(`This account is not a ${selectedRole.label}. Please go back and select the correct role.`);
          setLoading(false);
          return;
        }
        login({
          name:       data.name,
          role:       data.role,
          email:      email,
          department: data.department,
          section:    data.section,
        }, data.token);
        if (data.role === 'STUDENT')           navigate('/student');
        else if (data.role === 'FACULTY')      navigate('/faculty');
        else if (data.role === 'CLASS_ADVISOR') navigate('/advisor');
        else                                   navigate('/admin');
      } else setError(data.error || 'Invalid credentials!');
    } catch {
      setError('Cannot reach server. Is Spring Boot running on 8080?');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background blobs */}
      <div style={{
        position:'fixed', top:'-15%', left:'-10%',
        width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        position:'fixed', bottom:'-15%', right:'-10%',
        width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
        pointerEvents:'none',
      }}/>

      {/* Logo */}
      <div style={{
        display:'flex', flexDirection:'column',
        alignItems:'center', marginBottom:40,
      }} className="fade-in">
        <div style={{
          width:60, height:60, borderRadius:16,
          background:'linear-gradient(135deg,#3b82f6,#6366f1)',
          display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:28,
          boxShadow:'0 0 40px rgba(59,130,246,0.35)',
          marginBottom:16,
        }}>🎓</div>
        <div style={{
          fontSize:22, fontWeight:900,
          color:'var(--text)', letterSpacing:'-0.5px',
        }}>
          SmartAttend
        </div>
        <div style={{
          fontSize:13, color:'var(--text-3)', marginTop:4
        }}>
          Smart Curriculum & Attendance System
        </div>
      </div>

      {/* ── STEP 1: Role Selection ── */}
      {step === 'role' && (
        <div style={{width:'100%', maxWidth:480}}
          className="fade-in">
          <div style={{textAlign:'center', marginBottom:28}}>
            <h2 style={{
              fontSize:20, fontWeight:800,
              color:'var(--text)', letterSpacing:'-0.3px',
            }}>
              Who are you?
            </h2>
            <p style={{
              fontSize:13, color:'var(--text-3)', marginTop:6
            }}>
              Select your role to continue
            </p>
          </div>

          <div style={{
            display:'flex', flexDirection:'column', gap:12
          }}>
            {roles.map((r, i) => (
              <div key={r.key}
                onClick={() => handleRoleSelect(r)}
                style={{
                  display:'flex', alignItems:'center', gap:16,
                  background:'var(--surface)',
                  border:'1px solid var(--border)',
                  borderRadius:14, padding:'18px 20px',
                  cursor:'pointer', transition:'all 0.2s',
                  animation:`fadeUp 0.3s ease ${i*0.07}s both`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border =
                    `1px solid ${r.color}`;
                  e.currentTarget.style.transform =
                    'translateX(4px)';
                  e.currentTarget.style.boxShadow =
                    `0 4px 20px ${r.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border =
                    '1px solid var(--border)';
                  e.currentTarget.style.transform =
                    'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width:52, height:52, borderRadius:13,
                  background: r.glow,
                  border:`1px solid ${r.color}30`,
                  display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:24,
                  flexShrink:0,
                }}>
                  {r.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{
                    fontSize:15, fontWeight:700,
                    color:'var(--text)',
                  }}>
                    {r.label}
                  </div>
                  <div style={{
                    fontSize:12, color:'var(--text-3)',
                    marginTop:3,
                  }}>
                    {r.desc}
                  </div>
                </div>
                <div style={{
                  fontSize:16, color:'var(--text-3)'
                }}>→</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop:24, padding:'12px 16px',
            background:'rgba(59,130,246,0.04)',
            border:'1px solid rgba(59,130,246,0.1)',
            borderRadius:10, textAlign:'center',
          }}>
            <p style={{
              fontSize:12, color:'var(--text-3)',
              lineHeight:1.6
            }}>
              🔐 Credentials are provided by your
              Class Advisor / HOD.<br/>
              Contact admin if you need access.
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 2: Login Form ── */}
      {step === 'creds' && selectedRole && (
        <div style={{width:'100%', maxWidth:400}}
          className="fade-in">

          {/* Back button */}
          <button
            onClick={() => {
              setStep('role'); setError('');
              setEmail(''); setPassword('');
            }}
            style={{
              display:'flex', alignItems:'center', gap:6,
              background:'none', border:'none',
              cursor:'pointer', color:'var(--text-3)',
              fontSize:13, fontWeight:600,
              marginBottom:24, padding:0,
            }}>
            ← Back
          </button>

          {/* Role badge */}
          <div style={{
            display:'flex', alignItems:'center', gap:12,
            background:'var(--surface)',
            border:`1px solid ${selectedRole.color}30`,
            borderRadius:12, padding:'14px 18px',
            marginBottom:24,
          }}>
            <div style={{
              width:44, height:44, borderRadius:11,
              background: selectedRole.glow,
              display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:22,
            }}>
              {selectedRole.icon}
            </div>
            <div>
              <div style={{
                fontSize:15, fontWeight:700,
                color:'var(--text)',
              }}>
                {selectedRole.label}
              </div>
              <div style={{
                fontSize:12, color:'var(--text-3)'
              }}>
                {selectedRole.desc}
              </div>
            </div>
            <div style={{
              marginLeft:'auto',
              width:8, height:8, borderRadius:'50%',
              background: selectedRole.color,
              boxShadow:`0 0 8px ${selectedRole.color}`,
            }}/>
          </div>

          {/* Form */}
          <div className="card">
            <div className="card-body">
              <h3 style={{
                fontSize:17, fontWeight:800,
                color:'var(--text)', marginBottom:6,
                letterSpacing:'-0.3px',
              }}>
                Sign in
              </h3>
              <p style={{
                fontSize:13, color:'var(--text-3)',
                marginBottom:20
              }}>
                Enter your credentials to continue
              </p>

              {error && (
                <div className="alert alert-error">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">
                    Email Address
                  </label>
                  <input className="form-input" type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required />
                </div>
                <button type="submit"
                  className="btn btn-primary"
                  style={{
                    width:'100%', padding:'12px',
                    fontSize:14, marginTop:4,
                    background:`linear-gradient(135deg,
                      ${selectedRole.color},
                      ${selectedRole.color}cc)`,
                    boxShadow:
                      `0 4px 16px ${selectedRole.glow}`,
                  }}
                  disabled={loading}>
                  {loading
                    ? '⏳ Signing in…'
                    : `→ Sign in as ${selectedRole.label}`}
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Login;