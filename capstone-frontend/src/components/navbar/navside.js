import React, { Component } from "react";
import "../../styles/dashboard.css"
import { Link } from "react-router-dom";

export default class navside extends Component {
  render() {
    return (
        <nav
        id="sidebar"
        className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
      >
        <div className="position-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
            <Link className="nav-link" to ="/dashboard">
              <i className="fa fa-home" aria-hidden="true"></i> <span className="ml-2">Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to ="/courses">
              <i className="fa fa-book" aria-hidden="true"></i>
              <span className="ml-2">Courses</span>
              </Link>
            </li>
            <li className="nav-item">
               <Link className="nav-link" to ="/timetable">
              <i className="fa fa-calendar-check-o" aria-hidden="true"></i>
                <span className="ml-2"> 
                  Courses Schedule
             </span>
             </Link>
            </li>
          
            <li className="nav-item">
            <Link className="nav-link" to ="/tasks">
              <i className="fa fa-list-alt" aria-hidden="true"></i> <span className="ml-2">TODO</span>
              </Link>
            </li>
           
            <li className="nav-item">
            <Link className="nav-link" to ="/tasks">
              <i className="fa fa-comments" aria-hidden="true"></i><span className="ml-2">Discussion Room</span>
              </Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to ="/profile/1">
              <i className="fa fa-cog" aria-hidden="true"></i><span className="ml-2">Profile Settings</span>
              </Link>
            </li>
          </ul>
          
        </div>
      </nav>
    )
  }
}



