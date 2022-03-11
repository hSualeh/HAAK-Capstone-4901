import './App.css';
import Login from './components/authentification/login';
import Signup from './components/authentification/signup';
import CourseScheduleMain from './components/timetable/courseScheduleMain';
import Course from './components/courses/course';
import Assignment from './components/assignment/assignment';
import Profilemain from './components/profile/profilemain';
import { BrowserRouter , Routes , Route} from 'react-router-dom';
import Dashboard from './components/home/dashboard';
import Forgetpassword from './components/authentification/forgetpassword';

function App() {
  return (
    <div className="App">
    <BrowserRouter>
   
    <Routes>
      <Route path="/" element={<Login></Login>} exact/>
      <Route path="/signup" element={<Signup></Signup>}/>
      <Route path="/forgetpassword" element={<Forgetpassword></Forgetpassword>}/>
      <Route path="/dashboard" element={<Dashboard></Dashboard>} exact/>
        <Route path="/timetable" element={<CourseScheduleMain></CourseScheduleMain>}/> 
        <Route path="/assignments" element={<Assignment></Assignment>}/> 
        <Route path="/courses" element={<Course></Course>}/> 
        <Route path="/profile" element={<Profilemain></Profilemain>}/> 
        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
