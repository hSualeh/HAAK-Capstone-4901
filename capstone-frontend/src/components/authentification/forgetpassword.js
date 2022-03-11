import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import { Link,Navigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase-config";
import loginbg from "../../img/login-bg.PNG";





export default class forgetpassword extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
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
  

forgetpassword = () => {
  getAuth();
  console.log(this.state.email)
  sendPasswordResetEmail(auth,this.state.email)
  .then(() => {
    console.log("Email is successfully sent!");
  })
  .catch((error) => {
    console.log("Email failed!");
    const errorCode = error.code;
    const errorMessage = error.message;
  });
  };

//popup for email sent confirmation
/*
emailconfirmationPopup = (Popup.register)({
  title: 'Email Confirmation',
  content: 'We have sent an email to reset your password on the email to registered with',
  buttons:{
    right: ['ok']
  }
});
Popup.queue(emailconfirmationPopup);
*/
  render() {
   
    return (
      
      <Container className="auth_container">
        <Row>
          <Col>
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
                <h3>Forget password</h3>
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
                    name="email"
                    onChange={this.handleInput}
                    required
                  />
                  <Form.Text className="text-muted">
                  Enter the email address  associated with your course managment account.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
               
             
              
                </Form.Group>
                <Form.Group className="mb-3">
                  <Button variant="primary" type="button" onClick={this.forgetpassword}>
                    Submit
                  </Button>
                </Form.Group>
              </Form>
              <div className="w-100  mt-2">
            Already have an account?
            <Link to="/"> Sign in </Link>
          </div>
              
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}
