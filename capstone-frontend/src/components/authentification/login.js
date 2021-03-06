/**
 * This component handle the login process
 */
import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import { Link,Navigate } from "react-router-dom";
import { onAuthStateChanged,setPersistence,signInWithEmailAndPassword,browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebase-config";
import loginbg from "../../img/login-bg.PNG";


export default class login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loginEmail: "",
      loginPassword: "",
      user: null,
      signError: "",
      showError: false,

    };
  }

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };
/**
 * This function help sign in a user using the email and password entered
 * if the information entered not correct , error will be display and sign in process will not be completed
 * Input : this.state.loginEmail, this.state.loginPassword
 * output : this.setState({ user:user });
 */
  signin = () => {
    setPersistence(auth, browserSessionPersistence)
    .then(() => {
       signInWithEmailAndPassword(auth, this.state.loginEmail, this.state.loginPassword)
       .then((user) => {
        console.log("login" + this.state.user?.email);
        this.setState({ user:user });
     
      })
      .catch((error) => {
        let message = error.message + "..." + error.code;
        console.log("error" + error.message);
        if (
          error.code === "auth/invalid-email" ||
          error.code === "auth/user-not-found" || error.code === "auth/wrong-password"
        ) {
          message =
            "Sorry, we couldn't find user with that credentials.Please try again";
        }
  
        this.setState({ signError: message, showError: true });
      });
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
    });
    
  };

  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });
    });

  }

  render() {
   
    return (
      
      <Container className="auth_container">
        <Row>
          <Col className="bg">
            {" "}  
            <img
              src={loginbg}
              className="signupbg"
              alt="sign up Background"
            ></img>
          </Col>
          <Col className="auth-inner-col">
            {" "}
            <div className="auth-inner">
              <Form>
                <h3>Sign In</h3>
                <Alert show={this.state.showError} variant="danger">
                  {this.state.signError}
                 
                </Alert>
                {(this.state.user) &&(
          <Navigate to="/dashboard" replace={true} />
        )}

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="loginEmail"
                    onChange={this.handleInput}
                    required
                  />
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="loginPassword"
                    onChange={this.handleInput}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
               
                <Link to="forgetpassword">  Forget Password </Link>
              
                </Form.Group>
                <Form.Group className="mb-3">
                  <Button variant="primary" type="button" onClick={this.signin}>
                    Submit
                  </Button>
                </Form.Group>
              </Form>
              <div className="w-100  mt-2">
                Don't have an account?
                <Link to="signup"> Register </Link>
              </div>
              
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}
