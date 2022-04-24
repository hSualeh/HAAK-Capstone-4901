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
      fCFormat: "",
      rRule: "",
      meetingDays: [],
      fAllDay: false,
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
    const starCountRef = ref(getDatabase(), "courses/" + this.state.user.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        let allData = [];

        for (var key of Object.keys(data)) {
          allData.push(data[key]);
        }

        this.setState({ listCurCourses: allData });

        this.maxCourse =
          Math.max.apply(
            Math,
            allData.map(function (o) {
              return o.id;
            })
          ) + 1;
      } else {
        this.isNodata = true;
        this.setState({ listCurCourses: [] });
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
      newErrors.push("Title cannot be blank!");

    if (
      (this.state.fMDates || this.state.fMDates !== "") &&
      (this.state.fMTime || this.state.fMTime !== "") &&
      (this.state.fMFDates || this.state.fMFDates !== "") &&
      (this.state.fMFTime || this.state.fMFTime !== "")
    ) {
      var startTime = new Date(this.state.fMDates + " " + this.state.fMTime);
      var endTime = new Date(this.state.fMFDates + " " + this.state.fMFTime);

      if (startTime > endTime) {
        newErrors.push("Start Date is greater then End Date!");
      }
    }

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
            const updates = {};

            data.map((courseData) => {
              let isSkip = false;

              let requestData = {
                id: 0,
                title: courseData.name,
                cid: courseData.id, // used for grabing of assingments from canvas
                course_code: courseData.course_code,
                course_format: "",
                roomNumber: "", // not given by canvas api
                startDate: new Date(), // not given by canvas api
                endDate: new Date(), // not given by canvas api
                rRule: "", //"RRULE:INTERVAL=1;FREQ=WEEKLY;COUNT="+count+";BYDAY=TU,TH", //"RRULE:INTERVAL=1;FREQ=WEEKLY;COUNT=5;BYDAY=TU,TH",
                type: "Canvas",
                allDay: "true",
              };
              const fResultCourse = listCourses.filter(
                (x) => x.course_code === courseData.course_code
              );

              if (fResultCourse.length !== 0) {
                isSkip = true;
              }

              if (isSkip === false) {
                if (isNodata === true) {
                  updates["/courses/" + uid + "/" + 0] = requestData;
                  maxCourse = 1;
                  isNodata = false;
                } else {
                  requestData.id = maxCourse;
                  updates["/courses/" + uid + "/" + maxCourse] = requestData;
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
      title: this.state.fName,
      course_code: this.state.fCourseCode,
      roomNumber: this.state.fRNumber,
      startDate: new Date(), //this.setMTDate(true),
      endDate: new Date(), //this.setMTDate(false),
      course_format: this.state.fCFormat,
      type: "Manual",
      allDay: false,
      rRule: this.state.rRule,
    };

    const updates = {};
    updates["/courses/" + this.state.user.uid + "/" + cID] = courseData;

    update(ref(getDatabase()), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  }
  //This function send request to firebase API to update a course with the new given information
  updateCourse() {
    let courseData = this.state.courseData;

    courseData.title = this.state.fName;
    courseData.course_code = this.state.fCourseCode;
    courseData.roomNumber = this.state.fRNumber;
    courseData.course_format = this.state.fCFormat;
    courseData.rRule = this.state.rRule;
    courseData.allDay = this.state.fAllDay;
    courseData.startDate = this.setMTDate(true);
    courseData.endDate = this.setMTDate(false);

    const updates = {};
    updates["/courses/" + this.state.user.uid + "/" + this.state.fID] =
      courseData;

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

    const starCountRef = ref(
      getDatabase(),
      "courses/" + this.state.user.uid + "/" + id
    );
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({
          fID: id,
          fName: data.title,
          fCourseCode: data.course_code,
          fRNumber: data.roomNumber,
          fCFormat: data.course_format,
          fAllDay: data.allDay,
          rRule: data.rRule,
        });

        this.getMTDate(data);

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

    remove(
      ref(
        getDatabase(),
        "courses/" + this.state.user.uid + "/" + this.state.fID
      )
    );

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

    if (name === "fAllDay") {
      this.setState({ [name]: !this.state.fAllDay });
    } else if (name == "meetingDays") {
      let isChecked = e.target.checked;
      let count = 13; //13 weeks semester
      let mtDays = this.state.meetingDays;
     
      isChecked ? mtDays.push(value) : mtDays.pop(value);

      let rRule_val =
        "RRULE:INTERVAL=1;FREQ=WEEKLY;COUNT=" +
        count * mtDays.length +
        ";BYDAY=" +
        mtDays.join(",");
      console.log(mtDays);
      console.log(rRule_val);
      if (mtDays.length == 0) rRule_val = "";
      this.setState({ rRule: rRule_val });
      this.setState({ meetingDays: mtDays });
      // let rRule = "RRULE:INTERVAL=1;FREQ=WEEKLY;COUNT="+count+";BYDAY="+this.state.meetingDays
      // this.setState({ [rRule]: value});
    } else {
      this.setState({ [name]: value });
    }
  };

  handleShowMsg(msg) {
    this.setState({ message: msg, showMessage: true });
  }

  handleShowAdd = (e) => {
    this.setState({
      fID: "",
      fName: "",
      fCourseCode: "",
      fRNumber: "",
      fMDates: "",
      fMTime: "",
      fMFDates: "",
      fMFTime: "",
      fCFormat: "",
      fAllDay: false,
    });
    e.target.blur();
    this.setState({ formShow: true, mode: true, showError: false });
  };

  setMTDate(isStart) {
    var startTime = "";
    var endTime = "";

    if (
      (this.state.fMDates || this.state.fMDates !== "") &&
      (this.state.fMTime || this.state.fMTime !== "")
    ) {
      startTime = new Date(this.state.fMDates + " " + this.state.fMTime);
    }

    if (
      (this.state.fMFDates || this.state.fMFDates !== "") &&
      (this.state.fMFTime || this.state.fMFTime !== "")
    ) {
      endTime = new Date(this.state.fMFDates + " " + this.state.fMFTime);
    }

    if (isStart) {
      return startTime === "" ? "" : startTime.toISOString();
    } else {
      return endTime === "" ? "" : endTime.toISOString();
    }
  }

  getMTDate(data) {
    if (
      data.startDate === "null" ||
      data.startDate == "" ||
      typeof data.startDate === "undefined"
    ) {
      this.setState({
        fMDates: "",
        fMTime: "",
      });
    } else {
      var startTime = new Date(data.startDate);
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
    }

    if (
      data.endDate === "null" ||
      data.endDate == "" ||
      typeof data.endDate === "undefined"
    ) {
      this.setState({
        fMFDates: "",
        fMFTime: "",
      });
    } else {
      var eTime = new Date(data.endDate);

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

  displayTime(data) {
    let endTime = "";
    var strStart = "";

    if (
      data.startDate === "null" ||
      data.startDate == "" ||
      typeof data.startDate === "undefined"
    ) {
      strStart = "No Start Time";
    } else {
      var startTime = new Date(data.startDate);
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
    }
    if (
      data.endDate === "null" ||
      data.endDate == "" ||
      typeof data.endDate === "undefined"
    ) {
      endTime = "No End Time";
    } else {
      var eTime = new Date(data.endDate);

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
    const starCountRef = ref(
      getDatabase(),
      "assignments/" + this.state.user.uid
    );
    let filter = [];

    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      if (data != null) {
        for (var key of Object.keys(data)) {
          if (data[key].cid == couseID) {
            filter.push(data[key]);
          }
        }
      }
    });

    filter.map((asgn) => {
      remove(
        ref(getDatabase(), "assignments/" + this.state.user.uid + "/" + asgn.id)
      );
    });
  }

  render() {
    const listCourses = this.state.listCurCourses;

    return (
      <div className="content">
        <div className="">
          <div className="course-function">
            <Button variant="success" size="sm" onClick={this.handleShowAdd}>
              <i className="fa fa-plus" aria-hidden="true"></i> Add Course
            </Button>
            {this.state.showSync ? (
              <Button
                variant="primary"
                size="sm"
                className="btn-s"
                onClick={this.handleSync}
              >
                <i className="fa fa-upload" aria-hidden="true"></i> Sync with
                Canvas
              </Button>
            ) : null}
          </div>

          <table className="table course-table" responsive="sm">
            <thead>
              <tr>
                <th scope="col" className="t-col-3" style={{ display: "none" }}>
                  ID
                </th>
                <th scope="col" className="t-col-3">
                  Title
                </th>

                <th scope="col" className="t-col-1">
                  Room Number
                </th>
                <th scope="col" className="t-col-2">
                  Meeting Days
                </th>
                {/*
                </tr>{<th scope="col" className="t-col-1">
                  Course format
                </th>*/}
                <th scope="col" className="t-col-0">
                  Assignments
                </th>
                <th
                  scope="col"
                  className="t-col-1"
                  style={{ "text-align": "center" }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {listCourses.map((course) => (
                <tr key={course.id}>
                  <td scope="row" style={{ display: "none" }}>
                    {course.id}
                  </td>
                  <td scope="row">{course.title.substring(0, 21) + "..."}</td>

                  <td>{course.roomNumber}</td>
                  <td>M T W TH F S SU</td>
                  {/*<td>{this.displayTime(course)}</td>
                  <td>{course.course_format}</td>*/}
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="btn-assignments"
                    >
                      <Link to={`/assignments/` + course.id}>Assignments</Link>
                    </Button>
                  </td>
                  <td scope="col" style={{ "text-align": "center" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={this.handleShowEdit}
                      style={{ marginRight: "5px" }}
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
        </div>
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
                  Course Name:<text className="required">(*)</text>{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fName"
                    onChange={this.handleInput}
                    value={this.state.fName}
                    placeholder="Course name"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Course Code:{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fCourseCode"
                    onChange={this.handleInput}
                    value={this.state.fCourseCode}
                    placeholder="Course Code"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Course Format:{" "}
                </Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    name="fCFormat"
                    onChange={this.handleInput}
                    value={this.state.fCFormat}
                    placeholder="Course format"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Room Number:{" "}
                </Form.Label>
                <Col sm="6">
                  <Form.Control
                    type="text"
                    name="fRNumber"
                    onChange={this.handleInput}
                    value={this.state.fRNumber}
                    placeholder="Room Number"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Semester Start / End Dates:{" "}
                </Form.Label>
                <Col sm="4">
                  <Form.Control
                    type="date"
                    name="fMDates"
                    onChange={this.handleInput}
                    value={this.state.fMDates}
                  />
                </Col>
                <Col sm="4">
                  <Form.Control
                    type="date"
                    name="fMFDates"
                    onChange={this.handleInput}
                    value={this.state.fMFDates}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <div className="mb-3">
                  <Form.Label column sm="3">
                    Meeting Days:{" "}
                  </Form.Label>
                  <Form.Check
                    inline
                    label="Sun"
                    name="meetingDays"
                    type="checkbox"
                    id="Sun"
                    onChange={this.handleInput}
                    value="SU"
                  />
                  <Form.Check
                    inline
                    label="Mon"
                    name="meetingDays"
                    type="checkbox"
                    id="Mon"
                    onChange={this.handleInput}
                    value="MO"
                  />
                  <Form.Check
                    inline
                    label="Tue"
                    name="meetingDays"
                    type="checkbox"
                    id="Tue"
                    onChange={this.handleInput}
                    value="TU"
                  />
                  <Form.Check
                    inline
                    label="Wed"
                    name="meetingDays"
                    type="checkbox"
                    id="Wed"
                    onChange={this.handleInput}
                    value="WE"
                  />
                  <Form.Check
                    inline
                    label="Thur"
                    name="meetingDays"
                    type="checkbox"
                    id="Thur"
                    onChange={this.handleInput}
                    value="TH"
                  />
                  <Form.Check
                    inline
                    label="Fri"
                    name="meetingDays"
                    type="checkbox"
                    id="Fri"
                    onChange={this.handleInput}
                    value="FR"
                  />
                  <Form.Check
                    inline
                    label="Sat"
                    name="meetingDays"
                    type="checkbox"
                    id="Sat"
                    onChange={this.handleInput}
                    value="SA"
                  />
                </div>
                <Col sm="3" style={{ alignSelf: "center" }}>
                  <Form>
                    <Form.Check
                      type="switch"
                      id="custom-switch"
                      label="No Meeting"
                      name="fNoMeeting"
                      onChange={this.handleInput}
                      checked={this.state.fAllDay}
                    />
                  </Form>
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3">
                  Meeting Start / End Times:{" "}
                </Form.Label>
                <Col sm="4">
                  <Form.Control
                    type="time"
                    name="fMTime"
                    onChange={this.handleInput}
                    value={this.state.fMTime}
                  />
                </Col>
                <Col sm="4">
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
