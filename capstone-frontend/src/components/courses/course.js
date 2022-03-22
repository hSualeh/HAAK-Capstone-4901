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
      listAllCourses: [],
      listCurCourses: [],
      syncData: [],
      fID: "",
      fName: "",
      fSection: "",
      fRNumber: "",
      fMDates: "",
      fSession: "",
      user: null,
      profileError: [],
      showError: false,
      courseData: null,
      token: "",
      showSync: false,
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

        this.setState({ listAllCourses: allData });
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

        let allData = [];
        let filter = [];

        this.setState({ listAllCourses: allData });
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
        if (data.token !== "") this.setState({ showSync: true });
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
    e.target.blur();
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

    if (!this.state.fSection || this.state.fSection === "")
      newErrors.push("Section cannot be blank!");

    if (!this.state.fRNumber || this.state.fRNumber === "")
      newErrors.push("Room Number cannot be blank!");

    if (!this.state.fMDates || this.state.fMDates === "")
      newErrors.push("Meeting Date cannot be blank!");

    if (!this.state.fSession || this.state.fSession === "")
      newErrors.push("Session cannot be blank!");

    return newErrors;
  };

  handleSync = (e) => {
    let listCourses = this.state.listCurCourses;
    let uid = this.state.user.uid;
    let isNodata = this.isNodata;
    let maxCourse = this.maxCourse;

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

    fetch(
      "/api/v1/courses/?enrollment_state=active&access_token=" +
        this.state.token,
      requestOptions
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not OK");
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
              course_format: courseData.course_format,
              roomNumber: "",
              meeting_Dates: courseData.start_at +" - " + courseData.end_at,

              type: "Canvas",
            };

          //  const temp = courseData.course_code.split(" ");
            //  requestData.session = temp[1].split(".")[0];
            // requestData.section = temp[1].split(".")[1];
            // check course is existed
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

          this.handleShowMsg("Sync successfully!");
        },
        (error) => {
          this.handleShowMsg("Sync fail!");
          console.log(error);
        }
      );
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
      session: this.state.fSession,
      section: this.state.fSection,
      roomNumber: this.state.fRNumber,
      meeting_Dates: this.state.fMDates,
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
    courseData.session = this.state.fSession;
    courseData.section = this.state.fSection;
    courseData.roomNumber = this.state.fRNumber;
    courseData.meeting_Dates = this.state.fMDates;

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
          fSection: data.section,
          fRNumber: data.roomNumber,
          fSession: data.session,
          fMDates: data.meeting_Dates,
        });
        this.setState({ courseData: data });
      } else {
        this.isNodata = true;
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
                <td>{course.course_Code}</td>
                <td>{course.roomNumber}</td>
                <td>{course.meeting_Dates}</td>
                <td>{course.course_format}</td>
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
                  Section:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fSection"
                    onChange={this.handleInput}
                    value={this.state.fSection}
                    placeholder="Section input"
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
                  Meeting Date:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="date"
                    name="fMDates"
                    timeFormat="dd-MM-yyyy"
                    onChange={this.handleInput}
                    value={this.state.fMDates}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                Course format:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fSession"
                    onChange={this.handleInput}
                    value={this.state.fSession}
                    placeholder="Session input"
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
