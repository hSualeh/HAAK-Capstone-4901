import React, { Component } from "react";
import "../../styles/dashboard.css";
import { Button } from "react-bootstrap";
import { Link,Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";


export default class userProfileDropDown extends Component {
    constructor(props) {
        super(props);
        this.state = { user:null,error :null,signout:false};
    
        
      }

    logout = (event) => {
        try {
          signOut(auth);
          this.setState({signout:true});
        } catch (error) {
         this.setState({error:error.message}); 
          this.setState({signout:false});
        }
    
      }
  render() {
    return (
        <div className="dropdown userProfile">
        <Button
          className="btn btn-secondary dropdown-toggle"
          type="Button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-expanded="false"
        >
          Hello, {this.props.user?.email}
        </Button>
        <ul
          className="dropdown-menu"
          aria-labelledby="dropdownMenuButton"
        >
          <li>
          <Link className="nav-link" to ="/dashboard">
              Settings
            </Link>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Notifications
            </a>
          </li>
          <li>
          {(this.state.signout) &&(
          <Navigate to="/" replace={true} />
        )}
          <a className="dropdown-item" onClick={this.logout}> Sign out</a>

          </li>
        </ul>
      </div>
    )
  }
}
