import './App.css';
import Login from './components/authentification/login';
import Signup from './components/authentification/signup';
import {Routes , Route, BrowserRouter   as Router} from 'react-router-dom';
function App() {
  return (
    <div className="App">
    
    <Router>
 <Routes >
      <Route path="/" element={<Login></Login>} exact/>
      <Route path="/signup" element={<Signup></Signup>}/>
        
    
      </Routes>
</Router>
    </div>
  );
}

export default App;
