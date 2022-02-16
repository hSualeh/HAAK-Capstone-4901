import './App.css';
import Login from './components/authentification/login';
import Signup from './components/authentification/signup';
import Navbar from './components/navbar/navbar';
import Timetable from './components/timetable/timetable';
import {Routes , Route, BrowserRouter as Router} from 'react-router-dom';

function App() {
  return (
    <div className="App">
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login></Login>} exact/>
        <Route path="/signup" element={<Signup></Signup>}/>
        <Route path="/timetable" element={<Timetable></Timetable>}/> 
      </Routes>
    </Router>
    </div>
  );
}

export default App;
