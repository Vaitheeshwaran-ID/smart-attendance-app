import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  // Faculty APIs
  startClassAPI, getFacultyReportAPI, getSessionAttendanceAPI,
  getFacultyTimetableAPI, createTimetableAPI, deleteTimetableSlotAPI,
  submitSyllabusCoverageAPI, getFacultySyllabusAPI,

  // Advisor APIs
  getAdvisorDashboardAPI, createStudentAPI, getAdvisorFacultyReportAPI,
  removeStudentAPI, getWeeklyTimetableAPI, getSectionSyllabusAPI,
} from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('start');

  // ─── Faculty States ───
  const [facultyReport, setFacultyReport] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionAttendance, setSessionAttendance] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [facultyTimetable, setFacultyTimetable] = useState({});
  const [facultySyllabus, setFacultySyllabus] = useState([]);
  const [classForm, setClassForm] = useState({ subject: '', department: '', section: '' });
  const [syllabusForm, setSyllabusForm] = useState({
    subject: '', department: '', section: '', unitNumber: '', topicCovered: '',
    timePeriod: '', description: '', status: 'COMPLETED'
  });

  // ─── Advisor States ───
  const [advisorDashboard, setAdvisorDashboard] = useState(null);
  const [advisorFacultyReport, setAdvisorFacultyReport] = useState([]);
  const [sectionTimetable, setSectionTimetable] = useState({});
  const [sectionSyllabus, setSectionSyllabus] = useState([]);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '' });
  const [ttForm, setTtForm] = useState({
    subject: '', day: 'Monday', startTime: '09:00', endTime: '10:00',
    room: '', facultyEmail: ''
  });

  // ─── Data Loading ───
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Load common faculty data
      await loadFacultyReport();
      await loadFacultyTimetable();
      await loadFacultySyllabus();

      // If user is a class advisor, load advisor data
      if (user?.isClassAdvisor) {
        await loadAdvisorDashboard();
        await loadAdvisorFacultyReport();
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  // ─── Faculty API Calls ───
  const loadFacultyReport = async () => {
    try {
      const res = await getFacultyReportAPI();
      setFacultyReport(res.data);
      setSessions(res.data.sessionReports || []);
    } catch { setErr('Failed to load faculty report!'); }
  };

  const loadFacultyTimetable = async () => {
    try {
      const res = await getFacultyTimetableAPI();
      setFacultyTimetable(res.data);
    } catch { }
  };

  const loadFacultySyllabus = async () => {
    try {
      const res = await getFacultySyllabusAPI();
      setFacultySyllabus(res.data);
    } catch { }
  };

  const handleStartClass = async () => {
    setMsg(''); setErr('');
    if (!classForm.subject || !classForm.department) {
      setErr('Fill all fields!'); return;
    }
    const start = async (lat, lng) => {
      try {
        const res = await startClassAPI({ ...classForm, facultyLatitude: lat, facultyLongitude: lng });
        setQrToken(res.data.qrToken);
        setMsg('Class started!');
        loadFacultyReport();
      } catch { setErr('Failed to start class!'); }
    };
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(p => start(p.coords.latitude, p.coords.longitude), () => start(null, null))
      : start(null, null);
  };

  const handleSubmitSyllabus = async () => {
    setMsg(''); setErr('');
    try {
      const res = await submitSyllabusCoverageAPI(syllabusForm);
      setMsg(res.data.message);
      setSyllabusForm({
        subject: '', department: '', section: '', unitNumber: '', topicCovered: '',
        timePeriod: '', description: '', status: 'COMPLETED'
      });
      loadFacultySyllabus();
    } catch { setErr('Failed to submit syllabus!'); }
  };

  const viewSessionAttendance = async (sessionId) => {
    try {
      const res = await getSessionAttendanceAPI(sessionId);
      setSessionAttendance(res.data);
      setSelectedSession(sessionId);
    } catch { setErr('Failed to load session attendance!'); }
  };

  // ─── Advisor API Calls ───
  const loadAdvisorDashboard = async () => {
    try {
      const res = await getAdvisorDashboardAPI();
      setAdvisorDashboard(res.data);
      // Load timetable & syllabus using advisor's dept/section
      const { department, section } = res.data;
      if (department && section) {
        loadSectionTimetable(department, section);
        loadSectionSyllabus(department, section);
      }
    } catch { setErr('Failed to load advisor dashboard!'); }
  };

  const loadSectionTimetable = async (dept, section) => {
    try {
      const res = await getWeeklyTimetableAPI(dept, section);
      setSectionTimetable(res.data);
    } catch { }
  };

  const loadSectionSyllabus = async (dept, section) => {
    try {
      const res = await getSectionSyllabusAPI(dept, section);
      setSectionSyllabus(res.data);
    } catch { }
  };

  const loadAdvisorFacultyReport = async () => {
    try {
      const res = await getAdvisorFacultyReportAPI();
      setAdvisorFacultyReport(res.data);
    } catch { }
  };

  const handleCreateStudent = async () => {
    setMsg(''); setErr('');
    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      setErr('Please fill all fields!'); return;
    }
    try {
      const res = await createStudentAPI(studentForm);
      setMsg(`✅ Student "${studentForm.name}" created!`);
      setStudentForm({ name: '', email: '', password: '' });
      loadAdvisorDashboard();
    } catch { setErr('Failed to create student!'); }
  };
  
  const handleRemoveStudent = async (email) => {
    if (!window.confirm(`Remove student ${email}? This cannot be undone!`)) return;
    setMsg(''); setErr('');
    try {
      await removeStudentAPI(email);
      setMsg(`Student ${email} removed.`);
      loadAdvisorDashboard();
    } catch { setErr('Failed to remove student!'); }
  };

  const handleAddTimetable = async () => {
    setMsg(''); setErr('');
    try {
      const res = await createTimetableAPI({
        ...ttForm,
        department: advisorDashboard.department,
        section: advisorDashboard.section,
      });
      setMsg(res.data.message);
      loadSectionTimetable(advisorDashboard.department, advisorDashboard.section);
    } catch { setErr('Failed to add timetable slot!'); }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await deleteTimetableSlotAPI(id);
      loadFacultyTimetable(); // Reload personal timetable
      if (user.isClassAdvisor) {
        loadSectionTimetable(advisorDashboard.department, advisorDashboard.section); // Also reload section timetable
      }
    } catch { setErr('Failed to delete slot!'); }
  };

  // ─── UI Rendering ───
  const facultyTabs = [
    { id: 'start', label: '🚀 Start Class' },
    { id: 'timetable', label: '📅 My Timetable' },
    { id: 'syllabus', label: '📖 My Syllabus' },
    { id: 'sessions', label: '📋 My Sessions' },
  ];

  const advisorTabs = [
    { id: 'overview', label: '📊 Section Overview' },
    { id: 'students', label: '🎓 Section Students' },
    { id: 'low', label: '⚠️ Low Attendance' },
    { id: 'section_timetable', label: '📅 Section Timetable' },
    { id: 'section_syllabus', label: '📖 Section Syllabus' },
    { id: 'faculty', label: '👨‍🏫 Section Faculty' },
    { id: 'add_student', label: '➕ Add Student' },
    { id: 'add_slot', label: '➕ Add Timetable Slot' },
  ];

  const allTabs = user?.isClassAdvisor ? [...facultyTabs, ...advisorTabs] : facultyTabs;

  const getPctColor = (pct) => {
    const n = parseInt(pct);
    if (n >= 75) return 'var(--green)';
    if (n >= 60) return 'var(--yellow)';
    return 'var(--red)';
  };

  if (loading) {
    return <div className="page"><Navbar /><div className="container">Loading...</div></div>;
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header fade-in">
          <div className="page-title">Faculty Dashboard</div>
          <div className="page-subtitle">
            Welcome, {user?.name}
            {user?.isClassAdvisor && ` (Class Advisor for ${advisorDashboard?.department} - ${advisorDashboard?.section})`}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs fade-in">
          {allTabs.map(t => (
            <button key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(t.id); setMsg(''); setErr(''); }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div className="alert alert-success fade-in">✅ {msg}</div>}
        {err && <div className="alert alert-error fade-in">⚠️ {err}</div>}

        {/* === FACULTY TABS === */}

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

                {activeTab === 'timetable' && (
          <div className="card fade-in">
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
                  {facultyTimetable[day]?.length > 0 ? (
                    <div style={{
                      display:'flex', flexWrap:'wrap', gap:8
                    }}>
                      {facultyTimetable[day].map((slot,i) => (
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
                            onClick={() => handleDeleteSlot(slot.id)}
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
        )}

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
                  {facultySyllabus.length} entries
                </span>
              </div>
              <div className="card-body">
                {facultySyllabus.length > 0 ? (
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
                        {facultySyllabus.map((s,i) => (
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
        )}        {activeTab === 'sessions' && (
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
                  <div className="card-header" style={{paddingLeft:0}}>
                    <div className="card-title">
                      👁️ Attendance for Session
                    </div>
                    <span className="badge badge-blue">
                      {sessionAttendance.length} students
                    </span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionAttendance.map((att,i) => (
                          <tr key={i}>
                            <td style={{
                              fontWeight:600,
                              color:'var(--text)'
                            }}>
                              {att.studentName}
                            </td>
                            <td style={{fontSize:12}}>
                              {att.studentEmail}
                            </td>
                            <td>
                              <span className={`badge ${
                                att.status==='PRESENT'
                                  ? 'badge-green'
                                  : att.status==='LATE'
                                  ? 'badge-yellow'
                                  : 'badge-red'
                              }`}>
                                {att.status}
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


        {/* === ADVISOR TABS (Conditional) === */}

                {user?.isClassAdvisor && activeTab === 'overview' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">📋 Section Summary</div>
              <span style={{fontSize:12, color:'var(--text-3)'}}>
                {advisorDashboard?.department} · {advisorDashboard?.section}
              </span>
            </div>
            <div className="card-body">
              <div style={{
                display:'grid',
                gridTemplateColumns:'1fr 1fr',
                gap:16
              }}>
                {[
                  { label:'Advisor',       value:advisorDashboard?.advisorName },
                  { label:'Department',    value:advisorDashboard?.department },
                  { label:'Section',       value:advisorDashboard?.section },
                  { label:'Total Students',value:advisorDashboard?.totalStudents },
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
              {advisorDashboard?.lowAttendanceCount > 0 && (
                <div className="alert alert-warning"
                  style={{marginTop:16}}>
                  ⚠️ {advisorDashboard.lowAttendanceCount} student(s)
                  below 75% — check Low Attendance tab!
                </div>
              )}
            </div>
          </div>
        )}


                {user?.isClassAdvisor && activeTab === 'students' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">🎓 All Students</div>
              <span className="badge badge-blue">
                {advisorDashboard?.students?.length||0} students
              </span>
            </div>
            <div className="card-body">
              {advisorDashboard?.students?.length > 0 ? (
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
                      {advisorDashboard.students.map((s,i) => (
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

        
                {user?.isClassAdvisor && activeTab === 'low' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">⚠️ Low Attendance</div>
              <span className="badge badge-red">
                {
                  advisorDashboard?.students
                    ?.filter(s => s.status !== 'GOOD').length || 0
                } students
              </span>
            </div>
            <div className="card-body">
              {advisorDashboard?.students?.filter(s => s.status !== 'GOOD').length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Attended</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advisorDashboard.students
                        .filter(s => s.status !== 'GOOD')
                        .map((s,i) => (
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
                            <span className="badge badge-red">
                              ⚠️ Low
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty">
                  <div className="empty-icon">✅</div>
                  <div className="empty-text">
                    Great news! No students have low attendance.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


                {user?.isClassAdvisor && activeTab === 'section_timetable' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">
                📅 Section Weekly Timetable
              </div>
              <span style={{fontSize:12, color:'var(--text-3)'}}>
                {advisorDashboard?.department} · {advisorDashboard?.section}
              </span>
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
                  {sectionTimetable[day]?.length > 0 ? (
                    <div style={{
                      display:'flex', flexWrap:'wrap', gap:8
                    }}>
                      {sectionTimetable[day].map((slot,i) => (
                        <div key={i} style={{
                          background:'var(--surface-2)',
                          border:'1px solid var(--border)',
                          borderRadius:10, padding:'10px 14px',
                          fontSize:13, minWidth:180,
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
                            👨‍🏫 {slot.facultyName}
                          </div>
                          <div style={{
                            color:'var(--text-3)',
                            fontSize:11, marginTop:2
                          }}>
                            📍 {slot.room}
                          </div>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
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
                      No classes scheduled
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
        )}

                {user?.isClassAdvisor && activeTab === 'section_syllabus' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">
                📖 Section Syllabus Coverage
              </div>
              <span className="badge badge-blue">
                {sectionSyllabus.length} entries
              </span>
            </div>
            <div className="card-body">
              {sectionSyllabus.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Faculty</th>
                        <th>Subject</th>
                        <th>Unit</th>
                        <th>Topic</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionSyllabus.map((s,i) => (
                        <tr key={i}>
                          <td style={{fontSize:12}}>
                            {new Date(s.date)
                              .toLocaleDateString()}
                          </td>
                          <td style={{
                            fontWeight:600,
                            color:'var(--text)'
                          }}>
                            {s.facultyName}
                          </td>
                          <td>{s.subject}</td>
                          <td>{s.unitNumber}</td>
                          <td>{s.topicCovered}</td>
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
                    No syllabus has been covered for this section yet.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

                {user?.isClassAdvisor && activeTab === 'faculty' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">👨‍🏫 Section Faculty</div>
              <span className="badge badge-blue">
                {advisorFacultyReport.length} faculty
              </span>
            </div>
            <div className="card-body">
              {advisorFacultyReport.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Classes Taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advisorFacultyReport.map((f,i) => (
                        <tr key={i}>
                          <td style={{
                            fontWeight:600,
                            color:'var(--text)'
                          }}>
                            {f.name}
                          </td>
                          <td style={{fontSize:12}}>
                            {f.email}
                          </td>
                          <td>{f.subject}</td>
                          <td>
                            <span className="badge badge-blue">
                              {f.totalClasses}
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
                    No faculty data available for this section.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

                {user?.isClassAdvisor && activeTab === 'add_student' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">➕ Add New Student</div>
            </div>
            <div className="card-body">
              <div style={{
                display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
                gap:14, marginBottom:16
              }}>
                {[
                  { key:'name',     label:'Full Name',
                    ph:'e.g. John Doe' },
                  { key:'email',    label:'Email Address',
                    ph:'e.g. john.doe@example.com' },
                  { key:'password', label:'Password',
                    ph:'Create a secure password' },
                ].map((f,i) => (
                  <div className="form-group" key={i}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input"
                      type={f.key === 'password' ? 'password' : 'text'}
                      placeholder={f.ph}
                      value={studentForm[f.key]}
                      onChange={e => setStudentForm({
                        ...studentForm, [f.key]:e.target.value})} />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary"
                onClick={handleCreateStudent}>
                ➕ Create Student
              </button>
            </div>
          </div>
        )}


                {user?.isClassAdvisor && activeTab === 'add_slot' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">➕ Add Timetable Slot</div>
            </div>
            <div className="card-body">
              <div style={{
                display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
                gap:14, marginBottom:16
              }}>
                {/* Subject */}
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input"
                    placeholder="e.g. Data Structures"
                    value={ttForm.subject}
                    onChange={e => setTtForm({
                      ...ttForm, subject:e.target.value})} />
                </div>
                {/* Day */}
                <div className="form-group">
                  <label className="form-label">Day of Week</label>
                  <select className="form-input"
                    value={ttForm.day}
                    onChange={e => setTtForm({
                      ...ttForm, day:e.target.value})}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Start Time */}
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time"
                    value={ttForm.startTime}
                    onChange={e => setTtForm({
                      ...ttForm, startTime:e.target.value})} />
                </div>
                {/* End Time */}
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="time"
                    value={ttForm.endTime}
                    onChange={e => setTtForm({
                      ...ttForm, endTime:e.target.value})} />
                </div>
                {/* Room */}
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input className="form-input"
                    placeholder="e.g. A-101"
                    value={ttForm.room}
                    onChange={e => setTtForm({
                      ...ttForm, room:e.target.value})} />
                </div>
                {/* Faculty Email */}
                <div className="form-group">
                  <label className="form-label">Faculty Email</label>
                  <input className="form-input"
                    placeholder="e.g. prof@example.com"
                    value={ttForm.facultyEmail}
                    onChange={e => setTtForm({
                      ...ttForm, facultyEmail:e.target.value})} />
                </div>
              </div>
              <button className="btn btn-primary"
                onClick={handleAddTimetable}>
                ➕ Add Slot
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default FacultyDashboard;