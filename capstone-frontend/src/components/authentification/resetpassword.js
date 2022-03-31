import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import { Link,Navigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { auth } from "../firebase-config";
import loginbg from "../../img/login-bg.PNG";


export default class resetpassword extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      user: null,
      showError: false,
      success : false,
      listErrors : "",
      password: "",
      passwordVerify: "",
      alertMessage: ""
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setAlertMessage = this.setAlertMessage.bind(this);
  }

  // Whenever an input changes value, change the corresponding state variable
 /* handleInputChange(event) {
    event.preventDefault();
    const target = event.target;
    this.setState({
      [target.name]: target.value
    });
  } */

  handleSubmit(event) {
    event.preventDefault();

    //Userfront.init("demo1234");

    // Reset the alert to empty
    this.setAlertMessage();
    
    // Verify that the passwords match
    if (this.state.password !== this.state.passwordVerify) {
      return this.setAlertMessage("Passwords must match");
    }

      // Call Userfront.resetPassword()
      updatePassword(this.state.user, this.state.password).then(() => {
        console.log("Password has been reset!");
      }).catch((error) => {
        console.log("Reset Failed!");
      });
    }

    setAlertMessage(message) {
      this.setState({ alertMessage: message });
    }

  handleInput = (e) => {
    e.preventDefault();
    const name = e.target.name;

    const value = e.target.value;

    const target = e.target;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);

    this.setState({
      [target.name]: target.value
    });
  };



  resetpassword = () => {
  getAuth();
  /*
  if(this.state.email != "")
  {
    console.log(this.state.email)
    sendPasswordResetEmail(auth,this.state.email)
    .then(() => {
      this.setState({success : true,showError : false});
      console.log("Email is successfully sent!");
    })
    .catch((error) => {
      console.log("Email failed!");
      this.setState({showError : true,success : false,listErrors:"Email failed!"});
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  }
  else{
    this.setState({showError : true,success : false,listErrors:"Email is required!"});
  }*/
  
  };




  render() {
   
    return (
      
      <Container className="auth_container">
        <Row>
          <Col className="bg">
            {" "}
            <img
              src={loginbg}
              className="signupbg"
              alt="reset Background"
            ></img>
          </Col>
          <Col className="auth-inner-col">
            {" "}
            <div className="auth-inner">
            <Alert message={this.state.alertMessage} />
              <Form>
                <h3>Reset Password</h3>
                <Alert show={this.state.showError} variant="danger">
                  {this.state.listErrors}
                
                </Alert>
                <Alert show={this.state.success} variant="success">
                Password is successfully changed
                 
                </Alert>
                {(this.state.user) &&(
          <Navigate to="/dashboard" replace={true} />
        )}
  
                <Form.Group className="mb-3" controlId="formBasicPassword" onSubmit={this.handleSubmit}>
                  <Form.Label>Enter New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={this.state.password}
                    onChange={this.handleInput}
                    required
                  />
                  <br></br>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword2" onSubmit={this.handleSubmit}>
                  <Form.Label> Reenter New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="passwordVerify"
                    value={this.state.passwordVerify}
                    onChange={this.handleInput}
                    required
                  />
                  </Form.Group>
                  
                
                <Form.Group className="mb-3">
               
             
              
                </Form.Group>
                <Form.Group className="mb-3">
                  <Button variant="primary" type="button" onClick={this.handleSubmit}>
                    Reset Password Now
                  </Button>
                </Form.Group>
              </Form>
              
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}
