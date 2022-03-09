import React, { Component } from 'react'
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row,Container } from "react-bootstrap";
import { auth } from "../firebase-config";
import Listdepartment from "./listdepartment"

export default class profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
          f_name: "",
          l_name: "",
          major_name: "",
          dep_name : "",
          bio_name : "",
          profileError: [],
          showError: false,
          user:null
        };
      }
    
      handleInput = (e) => {
        const name = e.target.name;
    
        const value = e.target.value;
    
        this.setState({ [name]: value });
        // console.log("Name: " + name + "value:" + value);
      };
    
      update = (event) => {
        let newErrors = this.findFormErrors();
        this.setState({profileError:newErrors});
        console.log(newErrors);
        if (newErrors.length == 0) {
        
          
        } else {
          this.setState({ profileError: newErrors, showError: true });
        }
      };
  render() {
    return (
      <div className='profile_container'>
 
            <h3>Profile Settings</h3>
            <hr></hr>

            <Alert show={this.state.showError} variant="danger">
            
              <ul>
      {this.state.profileError.map((error_V) =>
        <li key={error_V}>{error_V}</li>
      )}
    </ul>
            </Alert>
            <Form>
            <Form.Group className="mb-3" controlId="f_name_r">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter First Name"
                name="f_name"
                onChange={this.handleInput}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="l_name_r">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Last Name"
                name="l_name"
                onChange={this.handleInput}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="dep_r">
              <Form.Label>Department</Form.Label>
              <Form.Select defaultValue=""  required  placeholder="Enter Department"
                name="dep_name"
                onChange={this.handleInput}>
                  <Listdepartment></Listdepartment>
            </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="major_r">
              <Form.Label>Major</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Major"
                name="major_name"
                onChange={this.handleInput}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="bio_r">
              <Form.Label>Biography</Form.Label>
              <Form.Control
               as="textarea"
               style={{ height: '100px' }}
                placeholder="Enter Biography"
                name="bio_name"
                onChange={this.handleInput}
              />
            </Form.Group>

             <Form.Group className="mb-3 btn-act">
            <Button variant="danger" type="button" >
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={this.update}>
              Save
            </Button>
            </Form.Group>
          </Form>

      </div>
    )
  }
}
