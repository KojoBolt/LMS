// import React from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// // Public Components
// import Home from './components/Home'
// import Programs from './components/Programs'
// import Career from './components/Career'
// // import NavBar from './components/NavBar'
// import OurMission from './components/OurMission'

// // Auth Components
// import Login from './components/auth/Login'
// import Signup from './components/auth/Signup'
// import ForgotPassword from './components/auth/ForgotPassword'

// // Student Components
// import StudentDashboard from './components/student/Dashboard'
// import CourseList from './components/student/CourseList'
// import CourseDetails from './components/student/CourseDetails'
// import EnrolledCourses from './components/student/EnrolledCourses'
// import VideoPlayer from './components/student/VideoPlayer'
// // import StudentSideBar from './components/student/SideBar'
// import Loading from './components/student/Loading'

// // Admin Components
// import AdminDashboard from './components/admin/AdminDashboard'
// import MyCourses from './components/admin/MyCourses'
// import StudentEnrollments from './components/admin/StudentEnrollments'
// import UploadCourseForm from './components/admin/UploadCourseForm'

// // Layout Components
// import ProtectedRoute from './components/ProtectedRoute'
// import AdminLayout from './components/layouts/AdminLayout'
// import StudentLayout from './components/layouts/StudentLayout'
// import PublicLayout from './components/layouts/PublicLayout'

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<PublicLayout />}>
//           <Route index element={<Home />} />
//           <Route path="programs" element={<Programs />} />
//           <Route path="career" element={<Career />} />
//           <Route path="mission" element={<OurMission />} />
//         </Route>

//         {/* Auth Routes */}
//         <Route path="/auth">
//           <Route path="login" element={<Login />} />
//           <Route path="signup" element={<Signup />} />
//           <Route path="forgot-password" element={<ForgotPassword />} />
//         </Route>

//         {/* Student Protected Routes */}
//         <Route path="/student" element={
//           <ProtectedRoute role="student">
//             <StudentLayout />
//           </ProtectedRoute>
//         }>
//           <Route index element={<StudentDashboard />} />
//           <Route path="dashboard" element={<StudentDashboard />} />
//           <Route path="courses" element={<CourseList />} />
//           <Route path="courses/:id" element={<CourseDetails />} />
//           <Route path="enrolled-courses" element={<EnrolledCourses />} />
//           <Route path="video/:courseId/:videoId" element={<VideoPlayer />} />
//         </Route>

//         {/* Admin Protected Routes */}
//         <Route path="/admin" element={
//           <ProtectedRoute role="admin">
//             <AdminLayout />
//           </ProtectedRoute>
//         }>
//           <Route index element={<AdminDashboard />} />
//           <Route path="dashboard" element={<AdminDashboard />} />
//           <Route path="courses" element={<MyCourses />} />
//           <Route path="upload-course" element={<UploadCourseForm />} />
//           <Route path="enrollments" element={<StudentEnrollments />} />
//         </Route>

//         {/* Loading Route (if needed globally) */}
//         <Route path="/loading" element={<Loading />} />

//         {/* 404 Route */}
//         {/* <Route path="*" element={<NotFound />} /> */}
//       </Routes>
//     </Router>
//   )
// }

// export default App

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Public Components
import Home from './components/Home'
import Programs from './components/Programs'
import Career from './components/Career'
import OurMission from './components/OurMission'

// Auth Components
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ForgotPassword from './components/auth/ForgotPassword'

// Student Components
import StudentDashboard from './components/student/Dashboard';
import CourseList from './components/student/CourseList';
import CourseDetails from './components/student/CourseDetails';
import EnrolledCourses from './components/student/EnrolledCourses';
import VideoPlayer from './components/student/VideoPlayer';
import Loading from './components/student/Loading';
import Guides from './components/student/pages/Guides';
import Courses from './components/student/pages/Courses';
import Workshops from './components/student/pages/Workshops';
import Events from './components/student/pages/Events';
import CourseDescriptionPage from './components/student/CourseDescriptionPage';
import Checkout from './components/student/Checkout';
import PaymentSuccess from './components/student/PaymentSuccess'
import PaystackTest from './components/student/PaystackTest';
import Profile from './components/student/Profile';
import Progress from './components/student/Progress';
import GuideDetails from './components/student/GuideDetails';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard'
import MyCourses from './components/admin/MyCourses'
import StudentEnrollments from './components/admin/StudentEnrollments'
import UploadCourseForm from './components/admin/UploadCourseForm'
import SuccessPage from './components/admin/SuccessPage';
import EditCourse from './components/admin/EditCourse';
import CreateGuide from './components/admin/CreateGuide';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout'
import StudentLayout from './components/layouts/StudentLayout'
import PublicLayout from './components/layouts/PublicLayout'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="programs" element={<Programs />} />
          <Route path="career" element={<Career />} />
          <Route path="mission" element={<OurMission />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/">
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup role="student"/>} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Student Routes (unprotected) */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courseslist" element={<CourseList />} />
          <Route path='guides' element={<Guides />} />
          <Route path='guides/:guideId' element={<GuideDetails />} />
          <Route path='courses' element={<Courses />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="enrolled-courses" element={<EnrolledCourses />} />
          <Route path="video/:courseId/:videoId" element={<VideoPlayer />} />
          <Route path="workshops" element={<Workshops />} />
          <Route path="events" element={<Events />} />
          <Route path="course/:courseId" element={<CourseDescriptionPage />} />
          <Route path="checkout/:courseId" element={<Checkout />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="test/payment" element={<PaystackTest />} />
          <Route path="profile" element={<Profile />} />
          <Route path="progress" element={<Progress />} />

      
        </Route>

        <Route path="/admin">
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup role="admin"  />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Admin Routes (unprotected) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="upload-course" element={<UploadCourseForm />} />
          <Route path="enrollments" element={<StudentEnrollments />} />
          <Route path="/admin/edit-course/:courseId" element={<EditCourse />} /> 
          <Route path="create-guide" element={<CreateGuide />} />


        </Route>

        {/* Optional loading route */}
        <Route path="/loading" element={<Loading />} />
      </Routes>
    </Router>
  )
}

export default App

