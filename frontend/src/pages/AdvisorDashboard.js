import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getAdvisorDashboardAPI,
  createStudentAPI,
  getAdvisorFacultyReportAPI,
  removeStudentAPI,
  getWeeklyTimetableAPI,
  getSectionSyllabusAPI,
} from '../services/api';

const DAYS = ['Monday','Tuesday','Wednesday',
              'Thursday','Friday','Saturday'];

const AdvisorDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard]     = useState(null);
  const [facultyReport, setFacultyReport] = useState([]);
  const [timetable, setTimetable]     = useState({});
  const [syllabus, setSyllabus]       = useState([]);
  const [activeTab, setActiveTab]     = useState('overview');
  const [msg, setMsg]                 = useState('');
  const [err, setErr]                 = useState('');
  const [loading, setLoading]         = useState(true);
  const [form, setForm] = useState({
    name:'', email:'', password:''
  });

  useEffect(() => {
    loadDashboard();
    loadFacultyReport();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getAdvisorDashboardAPI();
      setDashboard(res.data);
      // Load timetable & syllabus using advisor's dept/section
      const dept    = res.data.department;
      const section = res.data.section;
      loadTimetable(dept, section);
      loadSyllabus(dept, section);
    } catch { setErr('Failed to load!'); }
    setLoading(false);
  };

  const loadTimetable = async (dept, section) => {
    try {
      const res = await getWeeklyTimetableAPI(dept, section);
      setTimetable(res.data);
    } catch {}
  };

  const loadSyllabus = async (dept, section) => {
    try {
      const res = await getSectionSyllabusAPI(dept, section);
      setSyllabus(res.data);
    } catch {}
  };

  const loadFacultyReport = async () => {
    try {
      const res = await getAdvisorFacultyReportAPI();
      setFacultyReport(res.data);
    } catch {}
  };

  const handleCreateStudent = async () => {
    setMsg(''); setErr('');
    if (!form.name || !form.email || !form.password) {
      setErr('Please fill all fields!'); return;
    }
    try {
      const res = await createStudentAPI(form);
      if (res.data.message) {
        setMsg(`✅ Student "${form.name}" created!`);
        setForm({ name:'', email:'', password:'' });
        loadDashboard();
      } else setErr(res.data.error);
    } catch { setErr('Failed to create student!'); }
  };

  const handleRemoveStudent = async (email) => {
    if (!window.confirm(
      `Remove student ${email}? This cannot be undone!`))
      return;
    setMsg(''); setErr('');
    try {
      const res = await removeStudentAPI(email);
      if (res.data.message) {
        setMsg(res.data.message);
        loadDashboard();
      } else setErr(res.data.error);
    } catch { setErr('Failed to remove!'); }
  };

  const getPctColor = (pct) => {
    const n = parseInt(pct);
    if (n >= 75) return 'var(--green)';
    if (n >= 60) return 'var(--yellow)';
    return 'var(--red)';
  };

  // Group syllabus by subject
  const syllabusGrouped = syllabus.reduce((acc, s) => {
    if (!acc[s.subject]) acc[s.subject] = [];
    acc[s.subject].push(s);
    return acc;
  }, {});

  const tabs = [
    { id:'overview',  label:'📊 Overview'       },
    { id:'students',  label:'🎓 Students'        },
    { id:'low',       label:'⚠️ Low Attendance'  },
    { id:'timetable', label:'📅 Timetable'       },
    { id:'syllabus',  label:'📖 Syllabus'        },
    { id:'faculty',   label:'👨‍🏫 Faculty'        },
    { id:'add',       label:'➕ Add Student'     },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="container">

        {/* Header */}
        <div className="page-header fade-in">
          <div className="page-title">Class Advisor Dashboard</div>
          <div className="page-subtitle">
            {dashboard?.department} — Section {dashboard?.section}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          {[
            { icon:'🎓', label:'Total Students',
              value:dashboard?.totalStudents||0,
              color:'var(--accent)' },
            { icon:'✅', label:'Good Attendance',
              value:(dashboard?.totalStudents||0) -
                    (dashboard?.lowAttendanceCount||0),
              color:'var(--green)' },
            { icon:'⚠️', label:'Low Attendance',
              value:dashboard?.lowAttendanceCount||0,
              color:'var(--red)' },
            { icon:'👨‍🏫', label:'Faculty',
              value:dashboard?.totalFaculty||0,
              color:'var(--yellow)' },
          ].map((s,i) => (
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
          {tabs.map(t => (
            <button key={t.id}
              className={`tab ${activeTab===t.id?'active':''}`}
              onClick={() => {
                setActiveTab(t.id);
                setMsg(''); setErr('');
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div className="alert alert-success fade-in">
          {msg}</div>}
        {err && <div className="alert alert-error fade-in">
          ⚠️ {err}</div>}

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">📋 Section Summary</div>
              <span style={{fontSize:12, color:'var(--text-3)'}}>
                {dashboard?.department} · {dashboard?.section}
              </span>
            </div>
            <div className="card-body">
              <div style={{
                display:'grid',
                gridTemplateColumns:'1fr 1fr',
                gap:16
              }}>
                {[
                  { label:'Advisor',       value:dashboard?.advisorName },
                  { label:'Department',    value:dashboard?.department },
                  { label:'Section',       value:dashboard?.section },
                  { label:'Total Students',value:dashboard?.totalStudents },
                ].map((item,i) => (
                  <div key={i} style={{
                    background:'var(--bg-3)',
                    border:'1px solid var(--border)',
                    borderRadius:10, padding:'14px 16px',
                  }}>
                    <div style={{
                      fontSize:11, color:'var(--text-3)',
                      textTransform:'uppercase',
                      letterSpacing:'0.8px', fontWeight:600,
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize:16, fontWeight:700,
                      color:'var(--text)', marginTop:6,
                    }}>
                      {item.value || '—'}
                    </div>
                  </div>
                ))}
              </div>
              {dashboard?.lowAttendanceCount > 0 && (
                <div className="alert alert-warning"
                  style={{marginTop:16}}>
                  ⚠️ {dashboard.lowAttendanceCount} student(s)
                  below 75% — check Low Attendance tab!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── All Students ── */}
        {activeTab === 'students' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">🎓 All Students</div>
              <span className="badge badge-blue">
                {dashboard?.students?.length||0} students
              </span>
            </div>
            <div className="card-body">
              {dashboard?.students?.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Attended</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.students.map((s,i) => (
                        <tr key={i}>
                          <td style={{
                            fontWeight:600, color:'var(--text)'
                          }}>
                            {s.name}
                          </td>
                          <td style={{fontSize:12}}>
                            {s.email}
                          </td>
                          <td>
                            {s.totalAttended}/{s.totalClasses}
                          </td>
                          <td>
                            <div style={{minWidth:100}}>
                              <span style={{
                                fontWeight:700,
                                color:getPctColor(
                                  s.overallPercentage)
                              }}>
                                {s.overallPercentage}
                              </span>
                              <div className="progress"
                                style={{marginTop:5}}>
                                <div className="progress-fill"
                                  style={{
                                    width:s.overallPercentage,
                                    background:getPctColor(
                                      s.overallPercentage)
                                  }}/>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              s.status==='GOOD'
                                ? 'badge-green' : 'badge-red'
                            }`}>
                              {s.status==='GOOD'
                                ? '✅ Good' : '⚠️ Low'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                handleRemoveStudent(s.email)}>
                              🗑️ Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">
                    No students in your section yet
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Low Attendance ── */}
        {activeTab === 'low' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">
                ⚠️ Low Attendance Students
              </div>
              <span className="badge badge-red">
                {dashboard?.lowAttendanceStudents?.length||0}
              </span>
            </div>
            <div className="card-body">
              {dashboard?.lowAttendanceStudents?.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Attendance %</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.lowAttendanceStudents.map(
                        (s,i) => (
                        <tr key={i}>
                          <td style={{
                            fontWeight:600, color:'var(--text)'
                          }}>
                            {s.name}
                          </td>
                          <td style={{fontSize:12}}>{s.email}</td>
                          <td>
                            <span style={{
                              fontWeight:700, color:'var(--red)'
                            }}>
                              {s.overallPercentage}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-red">
                              ⚠️ Send Warning
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-success">
                  ✅ All students have good attendance!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Timetable ── */}
        {activeTab === 'timetable' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">
                📅 Section Weekly Timetable
              </div>
              <span style={{fontSize:12, color:'var(--text-3)'}}>
                {dashboard?.section} · 9:00 AM – 5:00 PM
              </span>
            </div>
            <div className="card-body">
              {DAYS.map(day => (
                <div key={day} style={{marginBottom:20}}>
                  <div style={{
                    display:'flex', alignItems:'center',
                    gap:10, marginBottom:10,
                  }}>
                    <div style={{
                      fontSize:12, fontWeight:700,
                      color:'var(--accent)',
                      textTransform:'uppercase',
                      letterSpacing:'0.8px', minWidth:80,
                    }}>
                      {day}
                    </div>
                    <div style={{
                      flex:1, height:1,
                      background:'var(--border)',
                    }}/>
                  </div>
                  {timetable[day]?.length > 0 ? (
                    <div style={{
                      display:'flex', gap:10, flexWrap:'wrap'
                    }}>
                      {timetable[day].map((slot,i) => (
                        <div key={i} style={{
                          background:'var(--surface-2)',
                          border:'1px solid var(--border)',
                          borderLeft:'3px solid var(--accent)',
                          borderRadius:10,
                          padding:'12px 16px', minWidth:200,
                        }}>
                          <div style={{
                            fontWeight:700, color:'var(--text)',
                            fontSize:14, marginBottom:4,
                          }}>
                            {slot.subject}
                          </div>
                          <div style={{
                            color:'var(--accent)', fontSize:12,
                            fontWeight:600, marginBottom:4,
                          }}>
                            ⏰ {slot.startTime} – {slot.endTime}
                          </div>
                          <div style={{
                            color:'var(--text-3)', fontSize:11,
                          }}>
                            👨‍🏫 {slot.facultyName}
                          </div>
                          <div style={{
                            color:'var(--text-3)', fontSize:11,
                          }}>
                            📍 {slot.room}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      color:'var(--text-3)', fontSize:12,
                      fontStyle:'italic', paddingLeft:4,
                    }}>
                      No classes scheduled
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Syllabus ── */}
        {activeTab === 'syllabus' && (
          <div className="fade-in">
            {Object.keys(syllabusGrouped).length > 0 ? (
              Object.entries(syllabusGrouped).map(
                ([subject, entries]) => (
                <div className="card" key={subject}
                  style={{marginBottom:16}}>
                  <div className="card-header">
                    <div className="card-title">
                      📚 {subject}
                    </div>
                    <span className="badge badge-blue">
                      {entries.filter(
                        e => e.status==='COMPLETED').length
                      }/{entries.length} done
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Unit</th>
                            <th>Topic</th>
                            <th>Time Period</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((e,i) => (
                            <tr key={i}>
                              <td style={{fontSize:12}}>
                                {new Date(e.date)
                                  .toLocaleDateString()}
                              </td>
                              <td>
                                <span className="badge badge-blue">
                                  {e.unitNumber}
                                </span>
                              </td>
                              <td style={{
                                fontWeight:500,
                                color:'var(--text)',
                              }}>
                                {e.topicCovered}
                                {e.description && (
                                  <div style={{
                                    fontSize:11,
                                    color:'var(--text-3)',
                                    marginTop:2,
                                  }}>
                                    {e.description}
                                  </div>
                                )}
                              </td>
                              <td style={{
                                color:'var(--accent)',
                                fontSize:12,
                              }}>
                                {e.timePeriod}
                              </td>
                              <td>
                                <span className={`badge ${
                                  e.status==='COMPLETED'
                                    ? 'badge-green'
                                    : e.status==='IN_PROGRESS'
                                    ? 'badge-yellow'
                                    : 'badge-blue'
                                }`}>
                                  {e.status==='COMPLETED'
                                    ? '✅ Done'
                                    : e.status==='IN_PROGRESS'
                                    ? '⏳ In Progress'
                                    : '📅 Planned'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="empty">
                    <div className="empty-icon">📭</div>
                    <div className="empty-text">
                      No syllabus coverage yet
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Faculty Report ── */}
        {activeTab === 'faculty' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">👨‍🏫 Faculty Report</div>
            </div>
            <div className="card-body">
              {facultyReport.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Classes Taken</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyReport.map((f,i) => (
                        <tr key={i}>
                          <td style={{
                            fontWeight:600, color:'var(--text)'
                          }}>
                            {f.name}
                          </td>
                          <td style={{fontSize:12}}>{f.email}</td>
                          <td>{f.totalClasses}</td>
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
              ) : (
                <div className="empty">
                  <div className="empty-icon">👨‍🏫</div>
                  <div className="empty-text">
                    No faculty data yet
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Add Student ── */}
        {activeTab === 'add' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">➕ Add New Student</div>
              <span style={{fontSize:12, color:'var(--text-3)'}}>
                Auto-assigned to {dashboard?.department}
                · {dashboard?.section}
              </span>
            </div>
            <div className="card-body">
              <div style={{
                background:'rgba(59,130,246,0.05)',
                border:'1px solid rgba(59,130,246,0.15)',
                borderRadius:10, padding:'12px 16px',
                marginBottom:20, fontSize:13,
                color:'var(--text-2)',
              }}>
                ℹ️ Student will be automatically added to your
                department and section. Share the login credentials
                with the student after creation.
              </div>
              <div style={{
                display:'grid',
                gridTemplateColumns:'1fr 1fr',
                gap:14,
              }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input"
                    placeholder="Student full name"
                    value={form.name}
                    onChange={e => setForm({
                      ...form, name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input"
                    placeholder="student@college.edu"
                    value={form.email}
                    onChange={e => setForm({
                      ...form, email:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password"
                    placeholder="Set a password"
                    value={form.password}
                    onChange={e => setForm({
                      ...form, password:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input className="form-input"
                    value={dashboard?.section||''}
                    disabled style={{opacity:0.5}} />
                </div>
              </div>
              <button className="btn btn-primary"
                onClick={handleCreateStudent}>
                ➕ Create Student Account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvisorDashboard;