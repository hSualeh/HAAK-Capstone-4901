import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import  "../../styles/auth.css"
import { Link, useHistory } from "react-router-dom";
export default class signup extends Component {
  constructor(props) {
    super(props);
    this.state = { registerEmail: "", registerPassword: "" };
  }

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };

  handleSubmit = (event) => {
    alert("A name was submitted: " + this.state.registerEmail);
    try {
      createUserWithEmailAndPassword(
        auth,
        this.state.registerEmail,
        this.state.registerPassword
      );
    } catch (error) {
      console.log(error.message);
    }
    //event.preventDefault();
  }

  register() {
    try {
      createUserWithEmailAndPassword(
        auth,
        this.state.registerEmail,
        this.state.registerPassword
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  render() {
    return (
      <div className="auth-wrapper">
      <div className="auth-inner">
          
        <Form onSubmit={this.handleSubmit}>
        <h3>Sign up</h3>
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
         
          <Button variant="primary" type="submit">
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
