import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getStudentReportAPI,
  markAttendanceAPI,
  getWeeklyTimetableAPI,
  getSectionSyllabusAPI,
} from '../services/api';

const DAYS = ['Monday','Tuesday','Wednesday',
              'Thursday','Friday','Saturday'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [report, setReport]     = useState(null);
  const [qrToken, setQrToken]   = useState('');
  const [timetable, setTimetable] = useState({});
  const [syllabus, setSyllabus]   = useState([]);
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    loadReport();
    loadTimetable();
    loadSyllabus();
  }, []);

  const loadReport = async () => {
    try {
      const res = await getStudentReportAPI();
      setReport(res.data);
    } catch { setErr('Failed to load report!'); }
    setLoading(false);
  };

  const loadTimetable = async () => {
    try {
      // Use student's department & section from user context
      const dept    = user?.department || 'Computer Science';
      const section = user?.section    || 'CSE-A';
      const res = await getWeeklyTimetableAPI(dept, section);
      setTimetable(res.data);
    } catch {}
  };

  const loadSyllabus = async () => {
    try {
      const dept    = user?.department || 'Computer Science';
      const section = user?.section    || 'CSE-A';
      const res = await getSectionSyllabusAPI(dept, section);
      setSyllabus(res.data);
    } catch {}
  };

  const handleMark = async () => {
    setMsg(''); setErr('');
    if (!qrToken) { setErr('Enter QR token!'); return; }
    const mark = async (lat, lng) => {
      try {
        const res = await markAttendanceAPI({
          qrToken,
          studentLatitude:lat,
          studentLongitude:lng,
        });
        if (res.data.message) {
          setMsg(res.data.message);
          setQrToken('');
          loadReport();
        } else setErr(res.data.error);
      } catch { setErr('Failed to mark!'); }
    };
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(
          p => mark(p.coords.latitude, p.coords.longitude),
          () => mark(null, null))
      : mark(null, null);
  };

  const getPctColor = (pct) => {
    const n = parseInt(pct);
    if (n >= 75) return 'var(--green)';
    if (n >= 60) return 'var(--yellow)';
    return 'var(--red)';
  };

  const tabs = [
    { id:'attendance', label:'✅ Attendance'  },
    { id:'timetable',  label:'📅 Timetable'   },
    { id:'syllabus',   label:'📖 Syllabus'    },
  ];

  // Group syllabus by subject
  const syllabusGrouped = syllabus.reduce((acc, s) => {
    if (!acc[s.subject]) acc[s.subject] = [];
    acc[s.subject].push(s);
    return acc;
  }, {});

  return (
    <div className="page">
      <Navbar />
      <div className="container">

        {/* Header */}
        <div className="page-header fade-in">
          <div className="page-title">Student Dashboard</div>
          <div className="page-subtitle">
            Welcome, {user?.name} · {user?.department} · {user?.section}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          {[
            { icon:'📚', label:'Subjects',
              value:report?.totalSubjects||0,
              color:'var(--accent)' },
            { icon:'✅', label:'Good Standing',
              value:report?.subjectReports?.filter(
                s => parseInt(s.percentage)>=75).length||0,
              color:'var(--green)' },
            { icon:'⚠️', label:'Low Alerts',
              value:report?.lowAttendanceAlerts?.length||0,
              color:'var(--red)' },
            { icon:'📖', label:'Topics Covered',
              value:syllabus.filter(
                s => s.status==='COMPLETED').length||0,
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
          ✅ {msg}</div>}
        {err && <div className="alert alert-error fade-in">
          ⚠️ {err}</div>}

        {/* ── Attendance Tab ── */}
        {activeTab === 'attendance' && (
          <div className="fade-in">
            {/* Mark Attendance */}
            <div className="card" style={{marginBottom:16}}>
              <div className="card-header">
                <div className="card-title">📷 Mark Attendance</div>
              </div>
              <div className="card-body">
                <div style={{display:'flex', gap:10}}>
                  <input className="form-input" style={{flex:1}}
                    placeholder="Paste QR token from faculty…"
                    value={qrToken}
                    onChange={e => setQrToken(e.target.value)} />
                  <button className="btn btn-success"
                    onClick={handleMark}>
                    ✓ Mark Present
                  </button>
                </div>
                <div style={{
                  marginTop:12, padding:'10px 14px',
                  background:'var(--bg-3)',
                  border:'1px solid var(--border)',
                  borderRadius:8, fontSize:12,
                  color:'var(--text-3)',
                }}>
                  ⏰ &nbsp;
                  <span style={{color:'var(--green)',
                    fontWeight:600}}>0–10 min</span>
                  {' '}= Present &nbsp;·&nbsp;
                  <span style={{color:'var(--yellow)',
                    fontWeight:600}}>10–20 min</span>
                  {' '}= Late &nbsp;·&nbsp;
                  <span style={{color:'var(--red)',
                    fontWeight:600}}>20+ min</span>
                  {' '}= Absent
                </div>
              </div>
            </div>

            {/* Attendance Report */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">📊 Attendance Report</div>
                {report?.lowAttendanceAlerts?.length > 0 && (
                  <span className="badge badge-red">
                    ⚠️ {report.lowAttendanceAlerts.length} low
                  </span>
                )}
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="empty">
                    <div className="empty-icon">⏳</div>
                    <div className="empty-text">Loading…</div>
                  </div>
                ) : report?.subjectReports?.length > 0 ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Attended</th>
                          <th>Total</th>
                          <th>Percentage</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.subjectReports.map((s,i) => (
                          <tr key={i}>
                            <td style={{
                              fontWeight:600,
                              color:'var(--text)'
                            }}>
                              {s.subject}
                            </td>
                            <td>{s.attended}</td>
                            <td>{s.totalClasses}</td>
                            <td>
                              <div style={{minWidth:110}}>
                                <span style={{
                                  fontWeight:700, fontSize:14,
                                  color:getPctColor(s.percentage)
                                }}>
                                  {s.percentage}
                                </span>
                                <div className="progress"
                                  style={{marginTop:5}}>
                                  <div className="progress-fill"
                                    style={{
                                      width:s.percentage,
                                      background:getPctColor(
                                        s.percentage)
                                    }}/>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${
                                parseInt(s.percentage)>=75
                                  ? 'badge-green' : 'badge-red'
                              }`}>
                                {parseInt(s.percentage)>=75
                                  ? '✅ Good' : '⚠️ Low'}
                              </span>
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
                      No attendance records yet
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Timetable Tab ── */}
        {activeTab === 'timetable' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">📅 Weekly Timetable</div>
              <span style={{fontSize:12, color:'var(--text-3)'}}>
                9:00 AM – 5:00 PM
              </span>
            </div>
            <div className="card-body">
              {DAYS.map(day => (
                <div key={day} style={{marginBottom:20}}>
                  {/* Day header */}
                  <div style={{
                    display:'flex', alignItems:'center',
                    gap:10, marginBottom:10,
                  }}>
                    <div style={{
                      fontSize:12, fontWeight:700,
                      color:'var(--accent)',
                      textTransform:'uppercase',
                      letterSpacing:'0.8px',
                      minWidth:80,
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
                          borderLeft:`3px solid var(--accent)`,
                          borderRadius:10,
                          padding:'12px 16px',
                          minWidth:200,
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

        {/* ── Syllabus Tab ── */}
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
                            <th>Faculty</th>
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
                                color:'var(--text)'
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
                              <td style={{fontSize:12}}>
                                {e.facultyEmail}
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
                      No syllabus coverage submitted yet
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;