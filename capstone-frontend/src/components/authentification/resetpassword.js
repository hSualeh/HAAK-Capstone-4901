import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import { Link,Navigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
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
      listErrors : ""
    };
  }

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };
  

  resetpassword = () => {
  getAuth();
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
  }
  
  };


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

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Enter New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="loginPassword"
                    onChange={this.handleInput}
                    required
                  />
                  <br></br>
                  <Form.Label> Reenter New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="loginPassword"
                    onChange={this.handleInput}
                    required
                  />

                  
                </Form.Group>
                <Form.Group className="mb-3">
               
             
              
                </Form.Group>
                <Form.Group className="mb-3">
                  <Button variant="primary" type="button" onClick={this.resetpassword}>
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
