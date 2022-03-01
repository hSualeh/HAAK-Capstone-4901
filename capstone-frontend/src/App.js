import './App.css';
import Login from './components/authentification/login';
import Signup from './components/authentification/signup';
import Navbar from './components/navbar/navbar';
import Timetable from './components/timetable/timetable';
import Course from './components/courses/course';
import Assignment from './components/assignment/assignment';
import {Routes , Route, BrowserRouter as Router} from 'react-router-dom';
import Dashboard from './views/dashboard';
function App() {
  return (
    <div className="App">
    <Router>
    
      <Routes>
      <Route path="/" element={<Login></Login>} exact/>
      <Route path="/signup" element={<Signup></Signup>}/>
      <Route path="/dashboard/:user" element={<Dashboard></Dashboard>}/>
        <Route path="/timetable" element={<Timetable></Timetable>}/> 
        <Route path="/assignments" element={<Assignment></Assignment>}/> 
        <Route path="/courses" element={<Course></Course>}/> 
      </Routes>
    </Router>
    </div>
  );
}

export default App;
