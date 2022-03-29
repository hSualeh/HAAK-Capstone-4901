import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import { auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { Link } from "react-router-dom";

export default class course extends Component {
  constructor(props) {
    super(props);

    this.maxCourse = 0;
    this.isNodata = false;

    this.state = {
      mode: true,
      formShow: false,
      listCurCourses: [],
      syncData: [],
      fID: "",
      fName: "",

      fRNumber: "",
      fMDates: "",
      fMTime: "",
      fMFDates: "",
      fMFTime: "",      
      fCourseCode: "",
      user: null,
      profileError: [],
      showError: false,
      courseData: null,
      token: "",
      showSync: true,
      showError: false,
      showConfirm: false,
      showMessage: false,
      message: "",
    };
  }

  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });

      this.getAllCourseData();
      this.getUNTToken();
    });
  }

  componentWillUnmount() {}

  getAllCourseData = () => {
    const starCountRef = ref(getDatabase(), "courses");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        let allData = [];
        let filter = [];

        for (var key of Object.keys(data)) {
          allData.push(data[key]);

          const check = data[key].student.filter(
            (x) => x === this.state.user.uid
          );

          if (check.length !== 0) {
            filter.push(data[key]);
          }
        }
        this.setState({ listCurCourses: filter });

        this.maxCourse =
          Math.max.apply(
            Math,
            allData.map(function (o) {
              return o.id;
            })
          ) + 1;
      } else {
        this.isNodata = true;
        let filter = [];
        this.setState({ listCurCourses: filter });
      }
    });
  };

  getUNTToken = () => {
    if (this.state.user == null) {
      return;
    }
    const starCountRef = ref(getDatabase(), "users/" + this.state.user.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({ token: data.token });
      }
    });
  };

  handleClose = (e) => {
    this.setState({
      formShow: false,
      showError: false,
      showConfirm: false,
      showMessage: false,
    });
  };

  handleShowConfirm = (e) => {
    let id = "";

    if (e.target.innerHTML !== "") {
      id = e.target.parentElement.parentElement.childNodes[0].innerText;
    } else {
      id =
        e.target.parentElement.parentElement.parentElement.childNodes[0]
          .innerText;
    }

    this.setState({ fID: id });

    this.setState({
      showConfirm: true,
      message: "Want to delete!",
    });
  };

  handleSubmitForm = (e) => {
    let newErrors = this.findFormErrors();
    this.setState({ profileError: newErrors });

    if (newErrors.length == 0) {
      this.setState({
        profileError: newErrors,
        showError: false,
      });
    } else {
      this.setState({
        profileError: newErrors,
        showError: true,
      });

      return;
    }

    if (e.target.innerText === "Save") {
      this.updateCourse();
    } else {
      this.createNewCourse();
    }

    e.target.blur();
    this.setState({ formShow: false });
    this.handleShowMsg("Save successfully!");
  };

  findFormErrors = () => {
    const newErrors = [];
    // Email errors
    if (!this.state.fName || this.state.fName === "")
      newErrors.push("Name cannot be blank!");

    if (!this.state.fRNumber || this.state.fRNumber === "")
      newErrors.push("Room Number cannot be blank!");

    if (
      !this.state.fMDates ||
      this.state.fMDates === "" ||
      !this.state.fMTime ||
      this.state.fMTime === "" ||
      !this.state.fMFDates ||
      this.state.fMFDates === "" ||
      !this.state.fMFTime ||
      this.state.fMFTime === ""
    )
      newErrors.push("Meeting Date cannot be blank!");
    else {
      var startTime = new Date(this.state.fMDates + " " + this.state.fMTime);
      var endTime = new Date(this.state.fMFDates + " " + this.state.fMFTime);

      if (startTime > endTime) {
        newErrors.push("Start Date is greater then End Date!");
      }
    }
    if (!this.state.fCourseCode || this.state.fCourseCode === "")
      newErrors.push("Session cannot be blank!");

    return newErrors;
  };

  handleSync = (e) => {
    let listCourses = this.state.listCurCourses;
    let uid = this.state.user.uid;
    let isNodata = this.isNodata;
    let maxCourse = this.maxCourse;
    let isError = false;

    if (this.state.token === "") {
      window.location.replace("/profile/2");
      return;
    }

    e.target.blur();
    const requestOptions = {
      method: "GET",
      mode: "cors",
      Headers: {
        "Access-Control-Allow-Origin": "https://localhost:3000",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
      },
    };
    try {
      fetch(
        "/api/v1/courses/?enrollment_state=active&access_token=" +
          this.state.token,
        requestOptions
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not OK");
            this.isError = true;
          }
          return res.json();
        })
        .then(
          function (data) {
            const items = data;
            console.log(items);

            const updates = {};

            data.map((courseData) => {
              let isSkip = false;

              let requestData = {
                id: 0,
                cid: courseData.id,
                name: courseData.name,
                student: [],
                course_code: courseData.course_code,
                roomNumber: "",
                meeting_Dates: courseData.start_at + " - " + courseData.end_at,
                type: "Canvas",
              };

              const fResultCourse = listCourses.filter(
                (x) => x.cid === courseData.id
              );

              if (fResultCourse.length !== 0) {
                isSkip = true;
              } else {
                requestData.student.push(uid);
              }

              if (isSkip === false) {
                if (isNodata === true) {
                  updates["/courses/" + 0] = requestData;
                  maxCourse = 1;
                  isNodata = false;
                } else {
                  requestData.id = maxCourse;
                  updates["/courses/" + maxCourse] = requestData;
                  maxCourse++;
                }
              }
            });

            update(ref(getDatabase()), updates);
          },
          (error) => {
            this.isError = true;

            console.log(error);
          }
        );
    } catch {
      this.isError = true;
    }
    if (this.isError === true) {
      this.handleShowMsg("Sync fail!");
    } else {
      this.handleShowMsg("Sync successfully!");
    }
  };

  createNewCourse() {
    let cID = 0;

    if (this.isNodata === true) {
      cID = 0;
      this.isNodata = false;
    } else {
      cID = this.maxCourse;
      this.maxCourse = this.maxCourse + 1;
    }

    const courseData = {
      id: cID,
      name: this.state.fName,
      course_code: this.state.fCourseCode,
      roomNumber: this.state.fRNumber,
      meeting_Dates: this.setMTDate(),
      type: "Manual",
      student: [this.state.user.uid],
    };

    const updates = {};
    updates["/courses/" + cID] = courseData;

    update(ref(getDatabase()), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  }

  updateCourse() {
    let courseData = this.state.courseData;

    courseData.name = this.state.fName;
    courseData.course_code = this.state.fCourseCode;
    courseData.roomNumber = this.state.fRNumber;
    courseData.meeting_Dates = this.setMTDate();

    const updates = {};
    updates["/courses/" + this.state.fID] = courseData;

    update(ref(getDatabase()), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleShowEdit = (e) => {
    let id = "";
    if (e.target.innerHTML !== "") {
      id = e.target.parentElement.parentElement.childNodes[0].innerText;
    } else {
      id =
        e.target.parentElement.parentElement.parentElement.childNodes[0]
          .innerText;
    }

    const starCountRef = ref(getDatabase(), "courses/" + id);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({
          fID: id,
          fName: data.name,
          fCourseCode: data.course_code,
          fRNumber: data.roomNumber,
        });

        this.getMTDate(data.meeting_Dates);

        this.setState({ courseData: data });
      }
    });
    e.target.blur();
    this.setState({ formShow: true, mode: false, showError: false });
  };

  handleDelete = (e) => {
    let id = "";

    if (e.target.innerHTML !== "") {
      id = e.target.parentElement.parentElement.childNodes[0].innerText;
    } else {
      id =
        e.target.parentElement.parentElement.parentElement.childNodes[0]
          .innerText;
    }

    remove(ref(getDatabase(), "courses/" + this.state.fID));

    this.removeAllAssignmentData(this.state.fID);

    e.target.blur();

    this.setState({
      showConfirm: false,
    });

    this.handleShowMsg("The selected data has been removed!");
  };

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
  };

  handleShowMsg(msg) {
    this.setState({ message: msg, showMessage: true });
  }

  handleShowAdd = (e) => {
    this.setState({
      fID: "",
      fName: "",
      fSection: "",
      fRNumber: "",
      fMDates: "",
      fSession: "",
    });
    e.target.blur();
    this.setState({ formShow: true, mode: true, showError: false });
  };

  setMTDate() {
    var startTime = new Date(this.state.fMDates + " " + this.state.fMTime);
    var endTime = new Date(this.state.fMFDates + " " + this.state.fMFTime);

    return startTime.toISOString() + " - " + endTime.toISOString();
  }

  getMTDate(meetingTime) {
    const atime = meetingTime.split(" ");
    let endTime = "";
    var startTime = new Date(atime[0]);
    var eTime = new Date();

    if (atime[2] === "null") {
      endTime = "";
    } else {
      endTime = "1";
      var eTime = new Date(atime[2]);
    }

    const sMonth = startTime.getMonth() + 1 + "";
    const sDate = startTime.getDate() + "";
    const sHours = startTime.getHours() + "";
    const sMin = startTime.getMinutes() + "";

    this.setState({
      fMDates:
        startTime.getFullYear() +
        "-" +
        sMonth.padStart(2, 0) +
        "-" +
        sDate.padStart(2, 0),
      fMTime: sHours.padStart(2, 0) + ":" + sMin.padStart(2, 0),
    });

    if (endTime === "") {
      this.setState({
        fMFDates: "",
        fMFTime: "",
      });
    } else {
      const eMonth = eTime.getMonth() + 1 + "";
      const eDate = eTime.getDate() + "";
      const eHours = eTime.getHours() + "";
      const eMin = eTime.getMinutes() + "";

      this.setState({
        fMFDates:
          eTime.getFullYear() +
          "-" +
          eMonth.padStart(2, 0) +
          "-" +
          eDate.padStart(2, 0),
        fMFTime: eHours.padStart(2, 0) + ":" + eMin.padStart(2, 0),
      });
    }
  }

  displayTime(time) {
    const atime = time.split(" ");
    let endTime = "";
    var startTime = new Date(atime[0]);
    var strStart = "";

    const sMonth = startTime.getMonth() + 1 + "";
    const sDate = startTime.getDate() + "";
    const sHours = startTime.getHours() + "";
    const sMin = startTime.getMinutes() + "";

    strStart =
      startTime.getFullYear() +
      "-" +
      sMonth.padStart(2, 0) +
      "-" +
      sDate.padStart(2, 0).padStart(2, 0) +
      " " +
      sHours.padStart(2, 0) +
      ":" +
      sMin.padStart(2, 0);

    if (atime[2] === "null") {
      endTime = "No End Time";
    } else {
      var eTime = new Date(atime[2]);

      const eMonth = eTime.getMonth() + 1 + "";
      const eDate = eTime.getDate() + "";
      const eHours = eTime.getHours() + "";
      const eMin = eTime.getMinutes() + "";

      endTime =
        eTime.getFullYear() +
        "-" +
        eMonth.padStart(2, 0) +
        "-" +
        eDate.padStart(2, 0) +
        " " +
        eHours.padStart(2, 0) +
        ":" +
        eMin.padStart(2, 0);
    }

    return strStart + " - " + endTime;
  }

  removeAllAssignmentData(couseID) {
    const starCountRef = ref(getDatabase(), "assignments");
    let filter = [];

    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      if (data != null) {
        for (var key of Object.keys(data)) {
          if (
            data[key].cid == couseID &&
            data[key].uid == this.state.user.uid
          ) {
            filter.push(data[key]);
          }
        }
      }
    });

    filter.map((asgn) => {
      remove(ref(getDatabase(), "assignments/" + asgn.id));
    });
  }

  render() {
    const listCourses = this.state.listCurCourses;

    return (
      <div className="content">
        <div className="content">
          <div className="content course-function">
            <Button variant="primary" size="sm" onClick={this.handleShowAdd}>
              Add Course
            </Button>
            {this.state.showSync ? (
              <Button
                variant="primary"
                size="sm"
                className="btn-s"
                onClick={this.handleSync}
              >
                Sync with UNT
              </Button>
            ) : null}
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col" className="t-col-0">
                ID
              </th>
              <th scope="col" className="t-col-3">
                Name
              </th>
              <th scope="col" className="t-col-1">
                Course Code
              </th>
              <th scope="col" className="t-col-1">
                Room Number
              </th>
              <th scope="col" className="t-col-2">
                Meeting Dates
              </th>
              <th scope="col" className="t-col-1">
                Course format
              </th>
              <th scope="col" className="t-col-1"></th>
            </tr>
          </thead>
          <tbody>
            {listCourses.map((course) => (
              <tr key={course.id}>
                <td scope="row">{course.id}</td>
                <td>
                  <Link to={`/assignments/` + course.id}>{course.name}</Link>
                </td>
                <td>{course.course_code}</td>
                <td>{course.roomNumber}</td>
                <td>{this.displayTime(course.meeting_Dates)}</td>
                <td>{course.type === "Canvas" ? "Campus" : "Online"}</td>
                <td scope="col">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={this.handleShowEdit}
                  >
                    <i className="fa fa-edit"></i>
                  </Button>
                  <Button
                    variant="danger"
                    onClick={this.handleShowConfirm}
                    size="sm"
                  >
                    <i className="fa fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <>
          <Modal show={this.state.formShow} onHide={this.handleClose} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                {this.state.mode ? "Couse Add" : "Course Edit"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Alert show={this.state.showError} variant="danger">
                  <ul>
                    {this.state.profileError.map((error_V) => (
                      <li key={error_V}>{error_V}</li>
                    ))}
                  </ul>
                </Alert>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Name:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fName"
                    onChange={this.handleInput}
                    value={this.state.fName}
                    placeholder="Name input"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Course Code:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fCourseCode"
                    onChange={this.handleInput}
                    value={this.state.fCourseCode}
                    placeholder="Course Code input"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Room Number:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fRNumber"
                    onChange={this.handleInput}
                    value={this.state.fRNumber}
                    placeholder="Room Number input"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Meeting Start Date:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="3">
                  <Form.Control
                    type="date"
                    name="fMDates"
                    onChange={this.handleInput}
                    value={this.state.fMDates}
                  />
                </Col>
                <Col sm="2">
                  <Form.Control
                    type="time"
                    name="fMTime"
                    onChange={this.handleInput}
                    value={this.state.fMTime}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Meeting End Date:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="3">
                  <Form.Control
                    type="date"
                    name="fMFDates"
                    onChange={this.handleInput}
                    value={this.state.fMFDates}
                  />
                </Col>
                <Col sm="2">
                  <Form.Control
                    type="time"
                    name="fMFTime"
                    onChange={this.handleInput}
                    value={this.state.fMFTime}
                  />
                </Col>
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
        <>
          <Modal show={this.state.showConfirm} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Confirming</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{this.state.message}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                No
              </Button>
              <Button variant="primary" onClick={this.handleDelete}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
        </>
        <>
          <Modal show={this.state.showMessage} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Message</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{this.state.message}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      </div>
    );
  }
}
