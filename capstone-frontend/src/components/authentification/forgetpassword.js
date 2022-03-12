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
  

forgetpassword = () => {
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
      this.setState({showError : true,listErrors:"Email failed!"});
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  }
  else{
    this.setState({showError : true,listErrors:"Email is required!"});
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
                <h3>Forget password</h3>
                <Alert show={this.state.showError} variant="danger">
                  {this.state.listErrors}
                
                </Alert>
                <Alert show={this.state.success} variant="success">
                Email is successfully sent
                 
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
