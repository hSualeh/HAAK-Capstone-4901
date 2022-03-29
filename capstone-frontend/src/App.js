import './App.css';
import Login from './components/authentification/login';
import Signup from './components/authentification/signup';
import CourseScheduleMain from './components/timetable/courseScheduleMain';
import TodoMain from './components/todo/todoMain';
import CourseMain from './components/courses/courseMain';
import AssignmentMain from './components/assignment/assignmentMain';
import Profilemain from './components/profile/profilemain';
import { BrowserRouter , Routes , Route} from 'react-router-dom';
import Dashboard from './components/home/dashboard';
import Forgetpassword from './components/authentification/forgetpassword';
import Resetpassword from './components/authentification/resetpassword';

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
        <Route path="/courses" element={<CourseMain></CourseMain>}/> 
        <Route path="/profile/:id" element={<Profilemain></Profilemain>}/> 
        <Route path="/tasks" element={<TodoMain></TodoMain>}/> 
        <Route path="/assignments/:id" element={<AssignmentMain></AssignmentMain>}/>
        <Route path="/resetpassword" element={<Resetpassword></Resetpassword>}/>
        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
