import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import {Button,Alert} from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import  "../../styles/auth.css"
import { Link } from "react-router-dom";
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();
export default class signup extends Component {
  constructor(props) {
    super(props);
    this.state = { registerEmail: "", registerPassword: "" , signError:"",showError:false};
  }

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };

 
  register = (event) => {  
      createUserWithEmailAndPassword(
        auth,
        this.state.registerEmail,
        this.state.registerPassword
      ).then((userCredential) => {
         
        const user = userCredential.user;
     
      })
      .catch((error) => {
      
      console.log(error.code +" "+ error.message);
      let errorMessage ="";
      if(error.code === "auth/email-already-in-use"  || error.code === "auth/email-already-exists" ){
     
        errorMessage = "Sorry. Email already exists. Please try again";
     }
     else if(error.code === "auth/invalid-email"  || error.code === "auth/email-already-exists" ){
     
      errorMessage = "Sorry. invalid email. Please try again";
   }

     this.setState({signError:errorMessage,showError:true});
 
      });
  }

  render() {
    return (
      <div className="auth-wrapper">
      <div className="auth-inner">
          
        <Form>
        <h3>Sign up</h3>
        <Alert show={this.state.showError} variant="danger" >
          {this.state.signError}
  </Alert>
          <Form.Group className="mb-3" controlId="formBasicEmail_r">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="registerEmail"
        
              onChange={this.handleInput}
            />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword_r">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="registerPassword"
          
              onChange={this.handleInput}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formConfirmPassword_r">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" placeholder="Confirm Password" />
          </Form.Group>
         
          <Button variant="primary" type="button" onClick={this.register}>
            Submit
          </Button>
        </Form>
        <div className="w-100  mt-2">
           Already have an account?
            <Link to="/"> Sign in </Link>
          </div>
      </div>
      </div>
    );
  }
}
