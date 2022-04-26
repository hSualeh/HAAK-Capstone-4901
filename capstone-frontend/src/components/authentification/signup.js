/**
 * This component handle the sign up process
 * 
 */
import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row,Container } from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import "../../styles/auth.css";
import loginbg from "../../img/login-bg.PNG";
import { Link,Navigate } from "react-router-dom";

export default class signup extends Component {
  constructor(props) {
    super(props);
    /**
     * List of states used in this component
     */
    this.state = {
      registerEmail: "",
      registerPassword: "",
      confirm_password: "",
      signError: [],
      showError: false,
      signuppass:false,
      user:null
    };
  }
/**
 * handle the form input fields into states
 * @param {*} e 
 */
  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };
/**
 * This function create new account using firebase authentication services
 *
 * @param {
 * } event 
 * 
 */
  register = (event) => {
    let newErrors = this.findFormErrors();//check if there is any error before sending registration request
    this.setState({signError:newErrors});
    console.log(newErrors);
    if (newErrors.length === 0) { //if there is no error, create new user
      createUserWithEmailAndPassword(
        auth,
        this.state.registerEmail,
        this.state.registerPassword
      )
        .then((userCredential) => {
          const user = userCredential.user;
          this.setState({user:user});

        })
        .catch((error) => { //display an error if the user exist or if the email is invalid
          console.log(error.code + " " + error.message);
          let errorMessage = "";
          if (
            error.code === "auth/email-already-in-use" ||
            error.code === "auth/email-already-exists"
          ) {
            errorMessage = "Sorry. Email already exists. Please try again";
          } else if (
            error.code === "auth/invalid-email" ||
            error.code === "auth/email-already-exists"
          ) {
            errorMessage = "Sorry. invalid email. Please try again";
          }

          this.setState({ signError: [errorMessage], showError: true });
        });
    } else {
      this.setState({ signError: newErrors, showError: true });
    }
  };
  /**
   * This function detect if there is any validation errors in the form
   * @returns errors[] //list of errors
   * 
   */
  findFormErrors = () => {
    const newErrors =[];
    // Email errors
    if (!this.state.registerEmail || this.state.registerEmail === "")
      newErrors.push("Email cannot be blank!");
    else if (!this.emailValidation())
    newErrors.push("Email is not valid!");

    // password errors
    if (!this.state.registerPassword || this.state.registerPassword === "")
    newErrors.push("Password cannot be blank!");
    else if (this.state.registerPassword.length < 7)
    newErrors.push( "Password cannot be less than 7!");
    else if(this.state.registerPassword.search(/[A-Z]/) < 0)
    newErrors.push( "Password doesn't contain upper case letter");
    //confirm password and password doesn't match
    if (
      typeof this.state.registerPassword !== "undefined" &&
      typeof this.state.confirm_password !== "undefined"
    ) {
      if (this.state.registerPassword !== this.state.confirm_password) {
        newErrors.push("Passwords don't match.");
      }
    }
    return newErrors;
  }
  /**
   * This function will check if the email entered by the user is valid
   * @returns True if the email is valid 
   * 
   */
  emailValidation(){
    const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(!this.state.registerEmail || regex.test(this.state.registerEmail) === false){
        return false;
    }
    return true;
}

  render() {
    return (
      <Container className="auth_container">
          {(this.state.user) &&(
          <Navigate to="/dashboard" replace={true} />
        )}
  <Row>
    <Col className="bg">  <img
              src={loginbg}
              className="signupbg"
              alt="sign up Background"
            ></img></Col>
    <Col className="auth-inner-col"> <div className="auth-inner">
          <Form>
            <h3>Sign up</h3>
            <Alert show={this.state.showError} variant="danger">
            
              <ul>
      {this.state.signError.map((error_V) =>
        <li key={error_V}>{error_V}</li>
      )}
    </ul>
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
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                name="confirm_password"
                onChange={this.handleInput}
              />
            </Form.Group>
            <Form.Group className="mb-3">
            <Button variant="primary" type="button" onClick={this.register}>
              Submit
            </Button>
            </Form.Group>
          </Form>
          <div className="w-100  mt-2">
            Already have an account?
            <Link to="/"> Sign in </Link>
          </div>
        </div></Col>
  </Row>
 
</Container>
    
    );
  }
}
