import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginAPI = (data) => api.post('/auth/login', data);
export const registerAPI = (data) => api.post('/auth/register', data);

// Timetable
export const createTimetableAPI = (data) =>
  api.post('/timetable/create', data);
export const getWeeklyTimetableAPI = (department, section) =>
  api.get(`/timetable/weekly/${department}/${section}`);
export const getFacultyTimetableAPI = () =>
  api.get('/timetable/faculty');
export const deleteTimetableSlotAPI = (id) =>
  api.delete(`/timetable/delete/${id}`);

// Attendance
export const startClassAPI = (data) =>
  api.post('/attendance/start-class', data);
export const markAttendanceAPI = (data) =>
  api.post('/attendance/mark', data);
export const getSessionAttendanceAPI = (sessionId) =>
  api.get(`/attendance/session/${sessionId}`);

// Reports
export const getStudentReportAPI = () =>
  api.get('/reports/student');
export const getFacultyReportAPI = () =>
  api.get('/reports/faculty');
export const getAdminReportAPI = (department) =>
  api.get(`/reports/admin/${department}`);

// Dashboard
export const getDashboardStatsAPI = () =>
  api.get('/dashboard/stats');

// Curriculum
export const createCurriculumAPI = (data) =>
  api.post('/curriculum/create', data);
export const getCurriculumAPI = (subject) =>
  api.get(`/curriculum/subject/${subject}`);
export const markTopicCompleteAPI = (id) =>
  api.put(`/curriculum/complete/${id}`);

// Syllabus Coverage
export const submitSyllabusCoverageAPI = (data) =>
  api.post('/syllabus/submit', data);
export const getSyllabusBySubjectAPI = (subject, department) =>
  api.get(`/syllabus/subject/${subject}/${department}`);
export const getTodaySyllabusAPI = (department) =>
  api.get(`/syllabus/today/${department}`);
export const getFacultySyllabusAPI = () =>
  api.get('/syllabus/faculty');
export const getSectionSyllabusAPI = (department, section) =>
  api.get(`/syllabus/section/${department}/${section}`);

// Advisor
export const getAdvisorDashboardAPI = () =>
  api.get('/advisor/dashboard');
export const createStudentAPI = (data) =>
  api.post('/advisor/create-student', data);
export const getAdvisorStudentsAPI = () =>
  api.get('/advisor/students');
export const getLowAttendanceAPI = () =>
  api.get('/advisor/students/low-attendance');
export const getAdvisorFacultyReportAPI = () =>
  api.get('/advisor/faculty-report');
export const removeStudentAPI = (email) =>
  api.delete(`/advisor/remove-student/${email}`);

export default api;