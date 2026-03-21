import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardStatsAPI,
  getAdminReportAPI,
  registerAPI
} from '../services/api';

const AdminDashboard = () => {
  const { user }  = useAuth();
  const [stats, setStats]       = useState(null);
  const [report, setReport]     = useState(null);
  const [dept, setDept]         = useState('Computer Science');
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [regForm, setRegForm]   = useState({
    name:'', email:'', password:'',
    role:'STUDENT', department:''
  });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboardStatsAPI();
      setStats(res.data);
    } catch { setErr('Failed to load stats'); }
  };

  const loadReport = async () => {
    setMsg(''); setErr('');
    try {
      const res = await getAdminReportAPI(dept);
      setReport(res.data);
    } catch { setErr('Failed to load report'); }
  };

  const handleRegister = async () => {
    setMsg(''); setErr('');
    try {
      const res = await registerAPI(regForm);
      if (res.data.message) {
        setMsg(`✅ ${regForm.role} "${regForm.name}" registered!`);
        setRegForm({ name:'', email:'', password:'', role:'STUDENT', department:'' });
        loadStats();
      } else setErr(res.data.error);
    } catch { setErr('Registration failed!'); }
  };

  const roleOptions = [
    { value:'STUDENT', icon:'🎓' },
    { value:'FACULTY', icon:'👨‍🏫' },
    { value:'ADMIN',   icon:'👨‍💼' },
  ];

  const statCards = [
    { icon:'👥', label:'Total Users',     value: stats?.totalUsers     || 0, color:'var(--accent)' },
    { icon:'📅', label:'Total Sessions',  value: stats?.totalSessions  || 0, color:'var(--green)'  },
    { icon:'✅', label:'Attendance Records', value: stats?.totalAttendanceRecords || 0, color:'var(--yellow)' },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="container">

        {/* Header */}
        <div className="page-header fade-in">
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">
            College-wide overview — {user?.name}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          {statCards.map((s,i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{color:s.color}}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs fade-in">
          {[
            { id:'overview', label:'📊 Department Report' },
            { id:'register', label:'➕ Register User' },
          ].map(t => (
            <button key={t.id}
              className={`tab ${activeTab===t.id?'active':''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div className="alert alert-success fade-in">✅ {msg}</div>}
        {err && <div className="alert alert-error fade-in">⚠️ {err}</div>}

        {/* ── Department Report ── */}
        {activeTab === 'overview' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">📊 Department Report</div>
            </div>
            <div className="card-body">
              <div style={{display:'flex', gap:10, marginBottom:20}}>
                <input className="form-input" style={{flex:1}}
                  placeholder="Enter department e.g. Computer Science"
                  value={dept}
                  onChange={e => setDept(e.target.value)} />
                <button className="btn btn-primary" onClick={loadReport}>
                  Generate →
                </button>
              </div>

              {report && (
                <div className="fade-in">
                  {/* Mini stats */}
                  <div className="stats-grid" style={{marginBottom:20}}>
                    {[
                      { icon:'🎓', label:'Students', value:report.totalStudents, color:'var(--accent)' },
                      { icon:'👨‍🏫', label:'Faculty',  value:report.totalFaculty,  color:'var(--green)'  },
                      { icon:'⚠️', label:'Low Attendance', value:report.lowAttendanceStudents?.length||0, color:'var(--red)' },
                    ].map((s,i) => (
                      <div className="stat-card" key={i}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value" style={{color:s.color, fontSize:24}}>
                          {s.value}
                        </div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Faculty Table */}
                  {report.facultyReport?.length > 0 && (
                    <>
                      <div style={{
                        fontSize:12, fontWeight:700, color:'var(--text-3)',
                        textTransform:'uppercase', letterSpacing:'0.8px',
                        marginBottom:10
                      }}>
                        Faculty Activity
                      </div>
                      <div className="table-wrap" style={{marginBottom:20}}>
                        <table>
                          <thead>
                            <tr>
                              <th>Faculty</th>
                              <th>Classes Taken</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.facultyReport.map((f,i) => (
                              <tr key={i}>
                                <td style={{color:'var(--text)', fontWeight:500}}>
                                  {f.faculty}
                                </td>
                                <td>{f.totalClassesTaken}</td>
                                <td>
                                  <span className="badge badge-green">
                                    ● Active
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Low Attendance */}
                  {report.lowAttendanceStudents?.length > 0 ? (
                    <>
                      <div style={{
                        fontSize:12, fontWeight:700, color:'var(--red)',
                        textTransform:'uppercase', letterSpacing:'0.8px',
                        marginBottom:10
                      }}>
                        ⚠️ Students Below 75%
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Subject</th>
                              <th>Attendance</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.lowAttendanceStudents.map((s,i) => (
                              <tr key={i}>
                                <td style={{color:'var(--text)',fontWeight:500}}>
                                  {s.student}
                                </td>
                                <td>{s.subject}</td>
                                <td>
                                  <span style={{
                                    fontWeight:700, color:'var(--red)'
                                  }}>
                                    {s.percentage}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge badge-red">
                                    Send Warning
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-success">
                      ✅ All students have good attendance in {dept}!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Register User ── */}
        {activeTab === 'register' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">➕ Register New User</div>
            </div>
            <div className="card-body">

              {/* Role Selector */}
              <div className="form-group">
                <label className="form-label">Role</label>
                <div style={{display:'flex', gap:10, marginBottom:4}}>
                  {roleOptions.map(r => (
                    <div key={r.value}
                      onClick={() => setRegForm({...regForm,role:r.value})}
                      style={{
                        flex:1, padding:'12px', borderRadius:10,
                        cursor:'pointer', textAlign:'center',
                        border: regForm.role===r.value
                          ? '1.5px solid var(--accent)'
                          : '1.5px solid var(--border)',
                        background: regForm.role===r.value
                          ? 'rgba(59,130,246,0.08)' : 'var(--bg-3)',
                        transition:'all 0.2s',
                      }}>
                      <div style={{fontSize:22}}>{r.icon}</div>
                      <div style={{
                        fontSize:12, fontWeight:700, marginTop:4,
                        color: regForm.role===r.value
                          ? 'var(--accent)' : 'var(--text-2)',
                      }}>
                        {r.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                display:'grid', gridTemplateColumns:'1fr 1fr', gap:14
              }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Full name"
                    value={regForm.name}
                    onChange={e => setRegForm({...regForm,name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" placeholder="Email address"
                    value={regForm.email}
                    onChange={e => setRegForm({...regForm,email:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={regForm.password}
                    onChange={e => setRegForm({...regForm,password:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" placeholder="e.g. Computer Science"
                    value={regForm.department}
                    onChange={e => setRegForm({...regForm,department:e.target.value})} />
                </div>
              </div>

              <button className="btn btn-primary"
                style={{marginTop:8}}
                onClick={handleRegister}>
                ➕ Register User
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;