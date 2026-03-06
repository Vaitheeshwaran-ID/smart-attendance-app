import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  startClassAPI, getFacultyReportAPI,
  getSessionAttendanceAPI,
  getFacultyTimetableAPI, createTimetableAPI,
  deleteTimetableSlotAPI,
  submitSyllabusCoverageAPI, getFacultySyllabusAPI,
} from '../services/api';

const DAYS = ['Monday','Tuesday','Wednesday',
              'Thursday','Friday','Saturday'];
const TIMES = ['09:00','10:00','11:00','12:00',
               '13:00','14:00','15:00','16:00','17:00'];

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [report, setReport]         = useState(null);
  const [sessions, setSessions]     = useState([]);
  const [sessionAttendance, setSessionAttendance] = useState([]);
  const [selectedSession, setSelectedSession]     = useState(null);
  const [qrToken, setQrToken]       = useState('');
  const [timetable, setTimetable]   = useState({});
  const [syllabus, setSyllabus]     = useState([]);
  const [msg, setMsg]               = useState('');
  const [err, setErr]               = useState('');
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('start');

  const [classForm, setClassForm] = useState({
    subject:'', department:'', section:''
  });
  const [ttForm, setTtForm] = useState({
    subject:'', department:'', section:'',
    day:'Monday', startTime:'09:00',
    endTime:'10:00', room:''
  });
  const [syllabusForm, setSyllabusForm] = useState({
    subject:'', department:'', section:'',
    unitNumber:'', topicCovered:'',
    timePeriod:'', description:'', status:'COMPLETED'
  });

  useEffect(() => {
    loadReport();
    loadTimetable();
    loadSyllabus();
  }, []);

  const loadReport = async () => {
    try {
      const res = await getFacultyReportAPI();
      setReport(res.data);
      setSessions(res.data.sessionReports || []);
    } catch { setErr('Failed to load report!'); }
    setLoading(false);
  };

  const loadTimetable = async () => {
    try {
      const res = await getFacultyTimetableAPI();
      setTimetable(res.data);
    } catch {}
  };

  const loadSyllabus = async () => {
    try {
      const res = await getFacultySyllabusAPI();
      setSyllabus(res.data);
    } catch {}
  };

  const handleStartClass = async () => {
    setMsg(''); setErr('');
    if (!classForm.subject || !classForm.department) {
      setErr('Fill all fields!'); return;
    }
    const start = async (lat, lng) => {
      try {
        const res = await startClassAPI({
          ...classForm, facultyLatitude:lat, facultyLongitude:lng
        });
        setQrToken(res.data.qrToken);
        setMsg('Class started!');
        loadReport();
      } catch { setErr('Failed to start!'); }
    };
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(
          p => start(p.coords.latitude, p.coords.longitude),
          () => start(null, null))
      : start(null, null);
  };

  const handleAddTimetable = async () => {
    setMsg(''); setErr('');
    try {
      const res = await createTimetableAPI(ttForm);
      setMsg(res.data.message);
      loadTimetable();
    } catch { setErr('Failed to add slot!'); }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await deleteTimetableSlotAPI(id);
      loadTimetable();
    } catch { setErr('Failed to delete!'); }
  };

  const handleSubmitSyllabus = async () => {
    setMsg(''); setErr('');
    try {
      const res = await submitSyllabusCoverageAPI(syllabusForm);
      setMsg(res.data.message);
      setSyllabusForm({
        subject:'', department:'', section:'',
        unitNumber:'', topicCovered:'',
        timePeriod:'', description:'', status:'COMPLETED'
      });
      loadSyllabus();
    } catch { setErr('Failed to submit!'); }
  };

  const viewSessionAttendance = async (sessionId) => {
    try {
      const res = await getSessionAttendanceAPI(sessionId);
      setSessionAttendance(res.data);
      setSelectedSession(sessionId);
    } catch { setErr('Failed to load!'); }
  };

  const tabs = [
    { id:'start',     label:'🚀 Start Class'    },
    { id:'timetable', label:'📅 Timetable'       },
    { id:'syllabus',  label:'📖 Syllabus'        },
    { id:'sessions',  label:'📋 Sessions'        },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header fade-in">
          <div className="page-title">Faculty Dashboard</div>
          <div className="page-subtitle">Welcome, {user?.name}</div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          {[
            { icon:'📅', label:'Classes Taken',
              value:report?.totalClassesTaken||0,
              color:'var(--accent)' },
            { icon:'📖', label:'Topics Submitted',
              value:syllabus.length||0,
              color:'var(--green)' },
            { icon:'📊', label:'Syllabus Done',
              value:report?.curriculumStatus
                ?.completionPercentage||'0%',
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

        {/* ── Start Class ── */}
        {activeTab === 'start' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">🚀 Start Class</div>
            </div>
            <div className="card-body">
              <div style={{display:'grid',
                gridTemplateColumns:'1fr 1fr 1fr', gap:14,
                marginBottom:16}}>
                {[
                  { key:'subject', label:'Subject',
                    ph:'e.g. Mathematics' },
                  { key:'department', label:'Department',
                    ph:'e.g. Computer Science' },
                  { key:'section', label:'Section',
                    ph:'e.g. CSE-A' },
                ].map((f,i) => (
                  <div className="form-group" key={i}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input"
                      placeholder={f.ph}
                      value={classForm[f.key]}
                      onChange={e => setClassForm({
                        ...classForm, [f.key]:e.target.value})} />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary"
                onClick={handleStartClass}>
                🚀 Generate QR Token
              </button>

              {qrToken && (
                <div className="qr-box fade-in">
                  <div className="qr-label">
                    ✅ Share this token with students
                  </div>
                  <div className="qr-token">{qrToken}</div>
                  <div className="qr-expiry">
                    ⏰ 0-10 mins = Present &nbsp;|&nbsp;
                    10-20 mins = Late &nbsp;|&nbsp;
                    20+ mins = Absent
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Timetable ── */}
        {activeTab === 'timetable' && (
          <div className="fade-in">
            {/* Add Slot */}
            <div className="card" style={{marginBottom:16}}>
              <div className="card-header">
                <div className="card-title">➕ Add Timetable Slot</div>
              </div>
              <div className="card-body">
                <div style={{display:'grid',
                  gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
                  {[
                    { key:'subject',    label:'Subject',
                      ph:'Mathematics' },
                    { key:'department', label:'Department',
                      ph:'Computer Science' },
                    { key:'section',    label:'Section',
                      ph:'CSE-A' },
                    { key:'room',       label:'Room',
                      ph:'Room 101' },
                  ].map((f,i) => (
                    <div className="form-group" key={i}>
                      <label className="form-label">{f.label}</label>
                      <input className="form-input"
                        placeholder={f.ph}
                        value={ttForm[f.key]}
                        onChange={e => setTtForm({
                          ...ttForm, [f.key]:e.target.value})} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Day</label>
                    <select className="form-input"
                      value={ttForm.day}
                      onChange={e => setTtForm({
                        ...ttForm, day:e.target.value})}>
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <select className="form-input"
                      value={ttForm.startTime}
                      onChange={e => setTtForm({
                        ...ttForm, startTime:e.target.value})}>
                      {TIMES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <select className="form-input"
                      value={ttForm.endTime}
                      onChange={e => setTtForm({
                        ...ttForm, endTime:e.target.value})}>
                      {TIMES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary"
                  onClick={handleAddTimetable}>
                  ➕ Add Slot
                </button>
              </div>
            </div>

            {/* Weekly View */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  📅 My Weekly Timetable
                </div>
              </div>
              <div className="card-body">
                {DAYS.map(day => (
                  <div key={day} style={{marginBottom:16}}>
                    <div style={{
                      fontSize:12, fontWeight:700,
                      color:'var(--accent)',
                      textTransform:'uppercase',
                      letterSpacing:'0.8px',
                      marginBottom:8
                    }}>
                      {day}
                    </div>
                    {timetable[day]?.length > 0 ? (
                      <div style={{
                        display:'flex', flexWrap:'wrap', gap:8
                      }}>
                        {timetable[day].map((slot,i) => (
                          <div key={i} style={{
                            background:'var(--surface-2)',
                            border:'1px solid var(--border)',
                            borderRadius:10, padding:'10px 14px',
                            fontSize:13, minWidth:160,
                            position:'relative',
                          }}>
                            <div style={{
                              fontWeight:700,
                              color:'var(--text)',
                              marginBottom:4
                            }}>
                              {slot.subject}
                            </div>
                            <div style={{
                              color:'var(--accent)',
                              fontSize:12, fontWeight:600
                            }}>
                              {slot.startTime} – {slot.endTime}
                            </div>
                            <div style={{
                              color:'var(--text-3)',
                              fontSize:11, marginTop:2
                            }}>
                              📍 {slot.room}
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteSlot(slot.id)}
                              style={{
                                position:'absolute',
                                top:6, right:6,
                                background:'none', border:'none',
                                color:'var(--text-3)',
                                cursor:'pointer', fontSize:12,
                              }}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        color:'var(--text-3)', fontSize:12,
                        fontStyle:'italic'
                      }}>
                        No classes
                      </div>
                    )}
                    {day !== 'Saturday' && (
                      <div className="divider"
                        style={{marginTop:12}} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Syllabus Coverage ── */}
        {activeTab === 'syllabus' && (
          <div className="fade-in">
            {/* Submit Coverage */}
            <div className="card" style={{marginBottom:16}}>
              <div className="card-header">
                <div className="card-title">
                  📖 Submit Syllabus Coverage
                </div>
              </div>
              <div className="card-body">
                <div style={{display:'grid',
                  gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
                  {[
                    { key:'subject',      label:'Subject',
                      ph:'Mathematics' },
                    { key:'department',   label:'Department',
                      ph:'Computer Science' },
                    { key:'section',      label:'Section',
                      ph:'CSE-A' },
                    { key:'unitNumber',   label:'Unit Number',
                      ph:'Unit 1' },
                    { key:'topicCovered', label:'Topic Covered',
                      ph:'Introduction to Calculus' },
                    { key:'timePeriod',   label:'Time Period',
                      ph:'9:00 AM - 10:00 AM' },
                  ].map((f,i) => (
                    <div className="form-group" key={i}>
                      <label className="form-label">{f.label}</label>
                      <input className="form-input"
                        placeholder={f.ph}
                        value={syllabusForm[f.key]}
                        onChange={e => setSyllabusForm({
                          ...syllabusForm,
                          [f.key]:e.target.value})} />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Description (Optional)
                  </label>
                  <input className="form-input"
                    placeholder="Brief description of what was covered..."
                    value={syllabusForm.description}
                    onChange={e => setSyllabusForm({
                      ...syllabusForm,
                      description:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input"
                    style={{width:'auto'}}
                    value={syllabusForm.status}
                    onChange={e => setSyllabusForm({
                      ...syllabusForm, status:e.target.value})}>
                    <option value="COMPLETED">✅ Completed</option>
                    <option value="IN_PROGRESS">
                      ⏳ In Progress
                    </option>
                    <option value="PLANNED">📅 Planned</option>
                  </select>
                </div>
                <button className="btn btn-primary"
                  onClick={handleSubmitSyllabus}>
                  📖 Submit Coverage
                </button>
              </div>
            </div>

            {/* My Submissions */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  📋 My Submissions
                </div>
                <span className="badge badge-blue">
                  {syllabus.length} entries
                </span>
              </div>
              <div className="card-body">
                {syllabus.length > 0 ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Subject</th>
                          <th>Unit</th>
                          <th>Topic</th>
                          <th>Time Period</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syllabus.map((s,i) => (
                          <tr key={i}>
                            <td style={{fontSize:12}}>
                              {new Date(s.date)
                                .toLocaleDateString()}
                            </td>
                            <td style={{
                              fontWeight:600,
                              color:'var(--text)'
                            }}>
                              {s.subject}
                            </td>
                            <td>{s.unitNumber}</td>
                            <td>{s.topicCovered}</td>
                            <td style={{
                              color:'var(--accent)',
                              fontSize:12
                            }}>
                              {s.timePeriod}
                            </td>
                            <td>
                              <span className={`badge ${
                                s.status==='COMPLETED'
                                  ? 'badge-green'
                                  : s.status==='IN_PROGRESS'
                                  ? 'badge-yellow'
                                  : 'badge-blue'
                              }`}>
                                {s.status==='COMPLETED'
                                  ? '✅ Done'
                                  : s.status==='IN_PROGRESS'
                                  ? '⏳ In Progress'
                                  : '📅 Planned'}
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
                      No submissions yet
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Sessions ── */}
        {activeTab === 'sessions' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">📋 My Sessions</div>
              <span className="badge badge-blue">
                {sessions.length} total
              </span>
            </div>
            <div className="card-body">
              {sessions.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Date & Time</th>
                        <th>Present</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s,i) => (
                        <tr key={i}>
                          <td style={{
                            fontWeight:600,
                            color:'var(--text)'
                          }}>
                            {s.subject}
                          </td>
                          <td style={{fontSize:12}}>
                            {new Date(s.date).toLocaleString()}
                          </td>
                          <td>
                            <span className="badge badge-blue">
                              {s.totalStudents}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              s.status==='ACTIVE'
                                ? 'badge-green'
                                : 'badge-yellow'
                            }`}>
                              ● {s.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                viewSessionAttendance(
                                  s.sessionId)}>
                              👁️ View
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
                  <div className="empty-text">No sessions yet</div>
                </div>
              )}

              {selectedSession &&
                sessionAttendance.length > 0 && (
                <div style={{marginTop:20}}>
                  <div style={{
                    fontSize:12, fontWeight:700,
                    color:'var(--text-3)',
                    textTransform:'uppercase',
                    letterSpacing:'0.8px',
                    marginBottom:10
                  }}>
                    Session {selectedSession} Attendance
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Marked At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionAttendance.map((a,i) => (
                          <tr key={i}>
                            <td style={{color:'var(--text)'}}>
                              {a.studentEmail}
                            </td>
                            <td style={{fontSize:12}}>
                              {new Date(a.markedAt)
                                .toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge ${
                                a.status==='PRESENT'
                                  ? 'badge-green'
                                  : a.status==='LATE'
                                  ? 'badge-yellow'
                                  : 'badge-red'
                              }`}>
                                {a.status==='PRESENT'
                                  ? '✅ Present'
                                  : a.status==='LATE'
                                  ? '⏰ Late'
                                  : '❌ Absent'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FacultyDashboard;