import React, { Component } from "react";
import "../styles/dashboard.css";
import logo from "../img/logo.PNG";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import ListCoursesSummary from "../components/courses/listCoursesSummary";
import ListTodoSummary from "../components/todo/listTodoSummary";
import { onAuthStateChanged,signOut } from "firebase/auth";
import { auth } from "../components/firebase-config";
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();
export default class dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = { user:null};

    
  }
  logout = (event) => {
    try {
      signOut(auth);
      console.log("logout"+this.state.user?.email)
      history.push("/");
    } catch (error) {
     this.setState({signError:error.message})
    }

  }
  componentDidMount() {
    onAuthStateChanged(auth,(currentUser)=>{
      this.setState({user:currentUser});
    });
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-light bg-light p-3">
          <div className="d-flex col-12 col-md-3 col-lg-2 mb-2 mb-lg-0 flex-wrap flex-md-nowrap justify-content-between">
            <img src={logo} className="logo" alt="Portal logo"></img>
            <Button
              className="navbar-toggler d-md-none collapsed mb-3"
              type="Button"
              data-toggle="collapse"
              data-target="#sidebar"
              aria-controls="sidebar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </Button>
          </div>
          <div className="col-12 col-md-4 col-lg-2"></div>
          <div className="col-12 col-md-5 col-lg-8 d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
            <div className="dropdown userProfile">
              <Button
                className="btn btn-secondary dropdown-toggle"
                type="Button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                Hello, {this.state.user?.email}
              </Button>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Notifications
                  </a>
                </li>
                <li>
                <Link to="/" className="dropdown-item" onClick={this.logout}> Sign out</Link>

                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <nav
              id="sidebar"
              className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
            >
              <div className="position-sticky pt-md-5">
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">
                    <i className="fa fa-home" aria-hidden="true"></i> <span className="ml-2">Dashboard</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                    <i className="fa fa-calendar" aria-hidden="true"></i>
                    <span className="ml-2">Courses Schedule</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                    <i className="fa fa-list-alt" aria-hidden="true"></i> <span className="ml-2">TODO</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                    <i className="fa fa-calendar-check-o" aria-hidden="true"></i>
                      <span className="ml-2">Calendar</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                    <i className="fa fa-comments" aria-hidden="true"></i><span className="ml-2">Discussion Room</span>
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
            <main className="content">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#">Home</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Overview
                  </li>
                </ol>
              </nav>
            
              <div className="row my-4">
               
              <div className="row my-4">
 <ListTodoSummary></ListTodoSummary>
 <ListCoursesSummary></ListCoursesSummary>
  <div className="col-12 col-md-6 mb-4 mb-lg-0 col-lg-3">
      <div className="card">
          <h5 className="card-header">Quick Links</h5>
          <div className="card-body">
         Quick link component
          </div>
        </div>
  </div>
  </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
