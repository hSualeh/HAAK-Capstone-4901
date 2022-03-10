import React, { Component } from "react";
import "../../styles/dashboard.css";
import logo from "../../img/logo.PNG";
import { Button } from "react-bootstrap";

import { onAuthStateChanged,signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import Navside from "../navbar/navside";
import UserProfileDropDown from "../home/userProfileDropDown";
import Breadcrumb from "../home/breadcrumb";
import Profile from "./profile";
export default class profilemain extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }
  logout = (event) => {
    try {
      signOut(auth);
    } catch (error) {
      this.setState({ signError: error.message });
    }
  };
  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });
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
            <main className="profile content">
              <Breadcrumb />

              <div className="">
                <Profile user={this.state.user}></Profile>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
