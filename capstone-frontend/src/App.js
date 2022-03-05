import './App.css';
import Login from './components/authentification/login';
import Signup from './components/authentification/signup';
import Navbar from './components/navbar/navbar';
import Timetable from './components/timetable/timetable';
import Course from './components/courses/course';
import Assignment from './components/assignment/assignment';
import { BrowserRouter , Routes , Route} from 'react-router-dom';
import Dashboard from './views/dashboard';

function App() {
  return (
    <div className="App">
    <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Login></Login>} exact/>
      <Route path="/signup" element={<Signup></Signup>}/>
      <Route path="/dashboard" element={<Dashboard></Dashboard>} exact/>
        <Route path="/timetable" element={<Timetable></Timetable>}/> 
        <Route path="/assignments" element={<Assignment></Assignment>}/> 
        <Route path="/courses" element={<Course></Course>}/> 
        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
