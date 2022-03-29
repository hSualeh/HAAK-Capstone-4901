import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import { getDatabase, ref, onValue, update } from "firebase/database";
import Listdepartment from "./listdepartment";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";
import { Tabs, Tab} from "react-bootstrap";

export default class profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveData: null,
      f_name: "",
      l_name: "",
      major_name: "",
      dep_name: "",
      bio_name: "",
      token: "",
      profileError: [],
      showError: false,
      showSaveOk: false,
      showCancel: false,
      user: null,
    };
  }

  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });
      this.getUserProfile();
    });
  }

  getUserProfile = () => {
    if (this.state.user == null) {
      return;
    }
    const starCountRef = ref(getDatabase(), "users/" + this.state.user.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({ f_name: data.firstName });
        this.setState({ l_name: data.lastName });
        this.setState({ major_name: data.major });
        this.setState({ dep_name: data.department });
        this.setState({ bio_name: data.bio });
        this.setState({ token: data.token });
        this.setState({ saveData: data });
      } else {
        this.isNodata = true;
      }
    });
  };

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };

  findFormErrors = () => {
    const newErrors = [];
    // Email errors
    if (!this.state.f_name || this.state.f_name === "")
      newErrors.push("First Name cannot be blank!");

    if (!this.state.l_name || this.state.l_name === "")
      newErrors.push("Last Name cannot be blank!");

    if (!this.state.dep_name || this.state.dep_name === "")
      newErrors.push("Department cannot be blank!");

    return newErrors;
  };

  cancel = (event) => {
    this.setState({ f_name: this.state.saveData.firstName });
    this.setState({ l_name: this.state.saveData.lastName });
    this.setState({ major_name: this.state.saveData.major });
    this.setState({ dep_name: this.state.saveData.department });
    this.setState({ bio_name: this.state.saveData.bio });
    this.setState({ token: this.state.saveData.token });
    
    this.setState({
      showError: false,
      showSaveOk: false,
      showCancel: true
    });
  };

  update = (event) => {
    let newErrors = this.findFormErrors();
    this.setState({ profileError: newErrors });

    if (newErrors.length == 0) {
      this.setState({
        profileError: newErrors,
        showError: false,
        showSaveOk: true,
        showCancel: false
      });
    } else {
      this.setState({
        profileError: newErrors,
        showError: true,
        showSaveOk: false,
        showCancel: false
      });
      return;
    }

    const updates = {};
    const userData = {
      bio: this.state.bio_name,
      department: this.state.dep_name,
      firstName: this.state.f_name,
      lastName: this.state.l_name,
      major: this.state.major_name,
      token: this.state.token,
    };

    updates["/users/" + this.state.user.uid] = userData;

    update(ref(getDatabase()), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    
    return (
      <div className="profile_container">

      <Tabs defaultActiveKey="General Information" id="uncontrolled-tab">
        <Tab eventKey="general information" title="General Information">
        
        <h3>Profile Settings</h3>
        <hr></hr>
        <Alert show={this.state.showCancel} variant="success">
          <ul>
            <li>Data has been reset!</li>
          </ul>
        </Alert>
        <Alert show={this.state.showSaveOk} variant="success">
          <ul>
            <li>Save successfully!</li>
          </ul>
        </Alert>
        <Alert show={this.state.showError} variant="danger">
          <ul>
            {this.state.profileError.map((error_V) => (
              <li key={error_V}>{error_V}</li>
            ))}
          </ul>
        </Alert>
      
        
        <Form>
        
        <Form.Group className="mb-3" controlId="f_name_r">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            required
            placeholder="Enter First Name"
            name="f_name"
            value={this.state.f_name}
            onChange={this.handleInput}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="l_name_r">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            required
            placeholder="Enter Last Name"
            name="l_name"
            value={this.state.l_name}
            onChange={this.handleInput}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="dep_r">
          <Form.Label>Department</Form.Label>
          <Form.Select
            defaultValue=""
            required
            placeholder="Enter Department"
            name="dep_name"
            value={this.state.dep_name}
            onChange={this.handleInput}
          >
            <Listdepartment></Listdepartment>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="major_r">
          <Form.Label>Major</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Major"
            name="major_name"
            value={this.state.major_name}
            onChange={this.handleInput}
          />
        </Form.Group>

       

        <Form.Group className="mb-3" controlId="bio_r">
          <Form.Label>Biography</Form.Label>
          <Form.Control
            as="textarea"
            style={{ height: "100px" }}
            placeholder="Enter Biography"
            name="bio_name"
            value={this.state.bio_name}
            onChange={this.handleInput}
          />
        </Form.Group>

        <Form.Group className="mb-3 btn-act">
          <Button variant="danger" type="button" onClick={this.cancel}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={this.update}>
            Save
          </Button>
        </Form.Group>
      </Form>
        </Tab>

      <Tab eventKey="integration" title="Integration">
      <Form.Group className="mb-3" controlId="canvas_key">
          <Form.Label>Canvas Key</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Canvas Key"
            name="canvas_key"
            value={this.state.canvas_key}
            onChange={this.handleInput}
          />
        </Form.Group>

        <Form.Group className="mb-3 btn-act">
          <Button variant="danger" type="button" onClick={this.cancel}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={this.update}>
            Save
          </Button>
        </Form.Group>
      
      </Tab>

    </Tabs>

        
  </div>




    );
  }
}
