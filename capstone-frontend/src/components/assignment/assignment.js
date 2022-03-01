import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, update } from "firebase/database";

//Css
import "../../styles/assignment.css";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlFW1iZlyuKtZNAURkJiRSBaVK2fyaEMc",
  authDomain: "coursemanagmentportal.firebaseapp.com",
  databaseURL: "https://coursemanagmentportal-default-rtdb.firebaseio.com",
  projectId: "coursemanagmentportal",
  storageBucket: "coursemanagmentportal.appspot.com",
  messagingSenderId: "300067894635",
  appId: "1:300067894635:web:424f4aff1e0661d253482e",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let userID = "1";

export default class assignment extends Component {
  constructor(props) {
    super(props);
    this.maxAssignment = 0;
    this.state = {
      mode: true,
      show: false,
      listAssignment: [],
      listCurCourses: [],
      assignmentid: "",
      classid: "",
      atitle: "",
      description: "",
      duedate: "2022-01-01",
    };
  }

  componentDidMount() {
    const auth = getAuth(app);

    if (auth.currentUser == null) {
      //window.location.href = "/";
      userID = "1";
    } else {
      userID = auth.currentUser.uid;
    }
    this.getAllAssignmentData();
    this.getAllCourseData();
  }

  componentWillUnmount() {}

  getAllAssignmentData = () => {
    const starCountRef = ref(db, "assignments");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const filter = data.filter(this.filterData);

      if (data != null) {
        this.setState({ listAssignment: filter });
        this.maxAssignment = data.length;
      } else {
        this.maxAssignment = 0;
      }
    });
  };

  getAllCourseData = () => {
    const starCountRef = ref(db, "courses");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const filter = data.filter(
          (x) => x.student.findIndex((y) => y === userID) !== -1
        );
        this.setState({ listCurCourses: filter });
      } else {
        alert(
          "You donot enroll any cource, please sync data with your school!"
        );
        window.location.href = "/courses";
      }
    });
  };

  addAssignmentData = () => {
    if (this.state.classid === "") {
      this.setState({ classid: "1" });
    }

    if (this.maxAssignment !== 0) {
      set(ref(db, "assignments/" + this.maxAssignment), {
        aid: this.maxAssignment,
        classid: this.state.classid,
        description: this.state.description,
        duedate: this.state.duedate,
        title: this.state.atitle,
        uid: userID,
      });
    } else {
      const updates = {};

      const data = {
        aid: 0,
        classid: this.state.classid,
        description: this.state.description,
        duedate: this.state.duedate,
        title: this.state.atitle,
        uid: userID,
      };

      updates["/assignments/0"] = data;

      update(ref(db), updates)
        .then(() => {
          // Data saved successfully!
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  updateAssignmentData = () => {
    set(ref(db, "assignments/" + this.state.assignmentid), {
      aid: this.state.assignmentid,
      classid: this.state.classid,
      description: this.state.description,
      duedate: this.state.duedate,
      title: this.state.atitle,
      uid: userID,
    });
  };

  handleClose = (e) => {
    this.setState({ show: false });
  };

  handleSubmitForm = (e) => {
    if (e.target.innerText === "Save") {
      this.updateAssignmentData();
    } else {
      this.addAssignmentData();
    }
    this.setState({ show: false });
  };

  handleShowAdd = (e) => {
    this.setState({ assignmentid: "" });
    this.setState({ classid: "" });
    this.setState({ atitle: "" });
    this.setState({ description: "" });
    this.setState({ duedate: "2022-01-01" });

    this.setState({ show: true, mode: true });
  };

  handleShowEdit = (e) => {
    //Load data from table
    this.setState({
      assignmentid:
        e.target.parentElement.parentElement.childNodes[0].innerText,
    });
    this.setState({
      classid: e.target.parentElement.parentElement.childNodes[1].innerText,
    });
    this.setState({
      atitle: e.target.parentElement.parentElement.childNodes[2].innerText,
    });
    this.setState({
      description: e.target.parentElement.parentElement.childNodes[3].innerText,
    });
    this.setState({
      duedate: e.target.parentElement.parentElement.childNodes[4].innerText,
    });

    this.setState({ show: true, mode: false });
  };

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
  };

  render() {
    const listAssignment = this.state.listAssignment;
    const listCourses = this.state.listCurCourses;
    return (
      <div className="assignment-wrapper">
        <div className="assignment-inner">
          <div className="header-function">
            <Button variant="primary" onClick={this.handleShowAdd}>
              Add
            </Button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Class</th>
                <th scope="col">Title</th>
                <th scope="col">Descriptions</th>
                <th scope="col">Due Dates</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {listAssignment.map((asgn) => (
                <tr key={asgn.aid}>
                  <th scope="row">{asgn.aid}</th>
                  <td>{asgn.classid}</td>
                  <td>{asgn.title}</td>
                  <td>{asgn.description}</td>
                  <td>{asgn.duedate}</td>
                  <td>
                    <Button variant="primary" onClick={this.handleShowEdit}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <>
          <Modal show={this.state.show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                {this.state.mode ? "Assignment Add" : "Assignment Save"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Title: </Form.Label>
                <Form.Control
                  type="text"
                  name="atitle"
                  onChange={this.handleInput}
                  value={this.state.atitle}
                  placeholder="Title input"
                  required
                />
                <Form.Label>Class: </Form.Label>
                <Form.Control
                  as="select"
                  name="classid"
                  value={this.state.classid}
                  onChange={this.handleInput}
                >
                  {listCourses.map((course) => (
                    <option value={course.mid}>{course.course_code}</option>
                  ))}
                </Form.Control>
                <Form.Label>Description: </Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  onChange={this.handleInput}
                  value={this.state.description}
                  placeholder="Description input"
                  required="true"
                />
                <Form.Label>Due date: </Form.Label>
                <Form.Control
                  type="date"
                  name="duedate"
                  onChange={this.handleInput}
                  value={this.state.duedate}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={this.handleSubmitForm}>
                {this.state.mode ? "Add" : "Save"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      </div>
    );
  }

  filterData(value) {
    return value.uid === userID;
  }
}
