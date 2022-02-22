import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
export default class login extends Component {
  constructor(props) {
    super(props);
    this.state = { loginEmail: "", loginPassword: "" };
  }

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };
  signin() {}

  render() {
    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <Form>
          <h3>Sign In</h3>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="loginEmail"
                onChange={this.handleInput}
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
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Check me out" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
          <div className="w-100  mt-2">
            Don't have an account?
            <Link to="/signup"> Register </Link>
          </div>
        </div>
      </div>
    );
  }
}
