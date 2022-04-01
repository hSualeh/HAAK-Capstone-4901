import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import {getAuth, confirmPasswordReset, verifyPasswordResetCode} from "firebase/auth";
import { auth } from "../firebase-config";
import loginbg from "../../img/login-bg.PNG";

export default class resetpassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      showError: false,
      success: false,
      listErrors: "",
      password: "",
      passwordVerify: "",
      alertMessage: "",
      passwordChanged: false,
      oobCode: "",
      expired: false,
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setAlertMessage = this.setAlertMessage.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    // Verify that the passwords match
    if (this.state.password !== this.state.passwordVerify) {
      this.setState({ showError: true, alertMessage: "Passwords must match" });
      return;
    }
    if (!this.state.password || this.state.password === "") {
      this.setState({
        showError: true,
        alertMessage: "Passwords cannot be blank!",
      });
      return;
    }

    confirmPasswordReset(auth, this.state.oobCode, this.state.password)
      .then((res) => {
        this.setState({
          showError: false,
          alertMessage: "Password changed successfully!",
          passwordChanged: true,
        });
      })
      .catch((err) => {
        console.log("err", err);
        this.setState({ showError: true, alertMessage: err.message });
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
      [target.name]: target.value,
    });
  };

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email_val) => {
          console.log("email" + email_val);
          this.setState({ email: email_val });
          this.setState({ oobCode: oobCode });
        })
        .catch((err) => {
          this.setState({ expired: true });
        });
    }
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
              alt="reset Background"
            ></img>
          </Col>
          <Col className="auth-inner-col">
            {" "}
            <div
              className="auth-inner"
              style={
                this.state.expired ? { display: "block" } : { display: "none" }
              }
            >
              The link is expired try another time
              <Link to="/forgetpassword">Forget password</Link>
            </div>
            <div
              className="auth-inner"
              style={
                !this.state.expired ? { display: "block" } : { display: "none" }
              }
            >
              <Form>
                <h3>Reset Password</h3>
                <Alert show={this.state.showError} variant="danger">
                  {this.state.alertMessage}
               
                </Alert>
                <Alert show={this.state.passwordChanged} variant="success">
                {this.state.alertMessage}
                Click here to <Link to="/">Sign In</Link>
                </Alert>
             
                <Form.Group className="mb-3">
                  <Form.Label> for {this.state.email}</Form.Label>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
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

                <Form.Group className="mb-3" controlId="formBasicPassword2">
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

                <Form.Group className="mb-3"></Form.Group>
                <Form.Group className="mb-3">
                  <Button
                    variant="primary"
                    type="button"
                    onClick={this.handleSubmit}
                  >
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