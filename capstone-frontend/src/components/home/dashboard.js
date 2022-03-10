import React, { Component } from "react";
import "../../styles/dashboard.css";
import logo from "../../img/logo.PNG";
import { Button } from "react-bootstrap";
import ListCoursesSummary from "../courses/listCoursesSummary";
import ListTodoSummary from "../todo/listTodoSummary";
import { onAuthStateChanged,signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import Navside from "../navbar/navside";
import UserProfileDropDown from "./userProfileDropDown";
import Breadcrumb from "./breadcrumb";
import Quicklinks from "./quicklinks";
export default class dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = { user:null};

    
  }
  logout = (event) => {
    try {
      signOut(auth);
     
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
        <UserProfileDropDown user={this.state.user}></UserProfileDropDown>
          </div>
        </nav>
        <div className="container-fluid">
          <div className="row">
           <Navside></Navside>
            <main className="content col">
         <Breadcrumb/>
            
              <div className="row my-4">
               
              <div className="row my-4">
 <ListTodoSummary user={this.state.user}></ListTodoSummary>
 <ListCoursesSummary user={this.state.user}></ListCoursesSummary>
 <Quicklinks></Quicklinks>
  </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
