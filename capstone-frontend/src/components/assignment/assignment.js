import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Button, Alert, Table, Col, Row, Badge } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { Link } from "react-router-dom";

export default class assignment extends Component {
  constructor(props) {
    super(props);
    this.maxAssignment = 0;
    this.isNodata = true;
    this.state = {
      mode: true,
      show: false,
      showSync: true,
      showConfirm: false,
      showMessage: false,
      message: "",
      listAssignment: [],
      fid: "",
      fStatus: "Not completed",
      fName: "",
      fType: "Quiz",
      fDescription: "",
      fDuedate: "",
      fDuetime: "",
      user: null,
      couseData: null,
      assignmentData: null,
      token: "",
      showError: false,
      agnError: [],
    };

    this.couseID = window.location.href.split("//")[1].split("/")[2];
  }

  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });

      this.getAllAssignmentData();
      this.getCourseData();
      this.getUNTToken();
    });
  }

  componentWillUnmount() {}
/**
   * Get all assignments of a course
   */

  getAllAssignmentData = () => {
    const starCountRef = ref(
      getDatabase(),
      "assignments/" + this.state.user.uid
    );
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      let allData = [];
      let filter = [];

      if (data != null) {
        this.isNodata = false;
        for (var key of Object.keys(data)) {
          allData.push(data[key]);
          if (data[key].cid === this.couseID) {
            filter.push(data[key]);
          }
        }

        this.maxAssignment =
          Math.max.apply(
            Math,
            allData.map(function (o) {
              return o.id;
            })
          ) + 1;

        this.setState({ listAssignment: filter });
      } else {
        this.isNodata = true;
        this.maxAssignment = 0;
        this.setState({ listAssignment: filter });
      }
    });
  };
 /**
   * Get course information
   */

  getCourseData = () => {
    const starCountRef = ref(
      getDatabase(),
      "courses/" + this.state.user.uid + "/" + this.couseID
    );
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({ couseData: data });
      }
    });
  };
 /**
   * Get UNT token from user information
   * @returns UNT token
   */

  getUNTToken = () => {
    if (this.state.user == null) {
      return;
    }
    const starCountRef = ref(getDatabase(), "users/" + this.state.user.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({ token: data.token });
        if (this.state.couseData.type === "Manual")
          this.setState({ showSync: false });
      }
    });
  };
 /**
   * Add a new assignment into DB
   */

  addAssignmentData = () => {
    let cID = 0;

    if (this.isNodata === true) {
      cID = 0;
      this.isNodata = false;
    } else {
      cID = this.maxAssignment;
      this.maxAssignment = this.maxAssignment + 1;
    }

    const assignmentData = {
      allDay: false,
      id: cID,
      cid: this.couseID,
      title: this.state.fName,
      status: this.state.fStatus,
      type: this.state.fType,
      duedate: this.setDueDate(),
      description: this.state.fDescription,
      untid: "",
    };

    const updates = {};
    updates["/assignments/" + this.state.user.uid + "/" + cID] = assignmentData;

    update(ref(getDatabase()), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  };
  /**
   * Update a assignment data
   */

  updateAssignmentData = () => {
    let assignmentData = this.state.assignmentData;

    assignmentData.title = this.state.fName;
    assignmentData.status = this.state.fStatus;
    assignmentData.type = this.state.fType;
    assignmentData.description = this.state.fDescription;
    assignmentData.duedate = this.setDueDate();

    const updates = {};
    updates["/assignments/" + this.state.user.uid + "/" + this.state.fid] =
      assignmentData;

    update(ref(getDatabase()), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  };
 /**
   * Display message popup with input message
   * @param {*} msg Message
   */

  handleShowMsg(msg) {
    this.setState({ message: msg, showMessage: true });
  }
  /**
   * Close modal popup
   * @param {*} e current element
   */


  handleClose = (e) => {
    this.setState({
      show: false,
      showError: false,
      showConfirm: false,
      showMessage: false,
    });
  };
  /**
   * Save data into DB
   * @param {*} e current element
   */

  handleSubmitForm = (e) => {
    let newErrors = this.findFormErrors();

    if (newErrors.length === 0) {
      this.setState({
        agnError: newErrors,
        showError: false,
      });
    } else {
      this.setState({
        agnError: newErrors,
        showError: true,
      });

      return;
    }

    if (e.target.innerText === "Save") {
      this.updateAssignmentData();
    } else {
      this.addAssignmentData();
    }

    e.target.blur();
    this.setState({ show: false });

    this.handleShowMsg("Save successfully!");
  };
/**
   * Form validation
   * @returns error list
   */

  findFormErrors = () => {
    const newErrors = [];
    // Email errors
    if (!this.state.fName || this.state.fName === "")
      newErrors.push("Name cannot be blank!");

    if (
      !this.state.fDuedate ||
      this.state.fDuedate === "" ||
      !this.state.fDuetime ||
      this.state.fDuetime === ""
    )
      newErrors.push("Due Date cannot be blank!");

    return newErrors;
  };
 /**
   * Show the addition assignment form
   * @param {*} e current element
   */

  handleShowAdd = (e) => {
    this.setState({
      fid: "",
      fStatus: "Not completed",
      fName: "",
      fType: "Quiz",
      fDescription: "",
      fDuedate: "",
      fDuetime: "",
    });

    this.setState({ show: true, mode: true, showError: false });
  };
/**
   * Get the target assignmnet information and display in edit popup
   * @param {*} e current element
   */

  handleShowEdit = (e) => {
    //Load data from table
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
      "assignments/" + this.state.user.uid + "/" + id
    );
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({
          fid: id,
          fName: data.title,
          fStatus: data.status,
          fType: data.type,
          fDescription: data.description,
        });
        this.getDuedate(data.duedate);
        this.setState({ assignmentData: data });
      }
    });

    e.target.blur();
    this.setState({ show: true, mode: false, showError: false });
  };
/**
   * Handle input event
   * @param {*} e current input element
   */

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
  };


  /**
   * Show delete confirm popup
   * @param {*} e current element
   */

  handleShowConfirm = (e) => {
    let id = "";

    if (e.target.innerHTML !== "") {
      id = e.target.parentElement.parentElement.childNodes[0].innerText;
    } else {
      id =
        e.target.parentElement.parentElement.parentElement.childNodes[0]
          .innerText;
    }

    this.setState({ fid: id });

    this.setState({
      showConfirm: true,
      message: "Want to delete!",
    });
  };
/**
   * Get the assignments of course from API of UNT School
   * @param {*} e current element
   */

  handleSync = (e) => {
    e.target.blur();
    let isError = false;

    const requestOptions = {
      method: "GET",
      mode: "cors",
      Headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
      },
    };

    if (this.state.token === "") {
      window.location.replace("/profile/2");
      return;
    }

    fetch(
      "/api/v1/courses/" +
        this.state.couseData.cid +
        "/assignments?access_token=" +
        this.state.token,
      requestOptions
    )
      .then((res) => {
        if (!res.ok) {
          this.isError = true;
          throw new Error("Network response was not OK");
        }
        return res.json();
      })
      .then(
        (result) => {
          const listAssignment = this.state.listAssignment;
          const updates = {};

          result.forEach((asgn) => {
            let isSkip = false;
            var hours = new Date(asgn.due_at).getHours();

            let requestData = {
              allDay: false,
              id: 0,
              cid: this.couseID,
              title: asgn.name,
              status: "Not completed",
              type: "etc",
              startDate: new Date(asgn.due_at).setHours(hours - 1), // figure out how to display as an actual date YYYY-MM-DD-HR-MIN-SEC-Z
              endDate: asgn.due_at,
              description: asgn.description,
              untid: asgn.id,
            };

            if (asgn.has_submitted_submissions === true) {
              requestData.status = "Completed";
            }

            if (asgn.is_quiz_assignment === true) {
              requestData.type = "Quiz";
            }

            if (asgn.due_at == null || asgn.due_at === "") {
              const datePattern = "YYYY-12-31T00:00:00Z";
              requestData.duedate = datePattern.replace(
                "YYYY",
                new Date().getFullYear()
              );
            }

            if (asgn.description != null && asgn.description !== "") {
              const fist = asgn.description.indexOf("<p>");
              const last = asgn.description.lastIndexOf("</p>");

              requestData.description = asgn.description
                .substring(fist, last)
                .replaceAll("<p>", "");
              requestData.description = requestData.description.replaceAll(
                "</p>",
                ""
              );
              requestData.description = requestData.description.replaceAll(
                "/n",
                ""
              );
            }

            // check Assignment is existed
            const fResultAsgn = listAssignment.filter(
              (x) => x.untid === asgn.id
            );

            if (fResultAsgn.length !== 0) {
              isSkip = true;
            }

            if (isSkip === false) {
              if (this.isNodata === true) {
                updates["/assignments/" + this.state.user.uid + "/" + 0] =
                  requestData;
                this.maxAssignment = 1;
                this.isNodata = false;
              } else {
                requestData.id = this.maxAssignment;
                updates[
                  "/assignments/" +
                    this.state.user.uid +
                    "/" +
                    this.maxAssignment
                ] = requestData;
                this.maxAssignment++;
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

    if (isError) {
      this.handleShowMsg("Sync fail!");
    } else {
      this.handleShowMsg("Sync successfully!");
    }
  };
/**
   * Delete a assignment from DB
   * @param {*} e current element
   */

  handleDelete = (e) => {
    remove(
      ref(
        getDatabase(),
        "assignments/" + this.state.user.uid + "/" + this.state.fid
      )
    );

    e.target.blur();

    this.setState({
      showConfirm: false,
    });

    this.handleShowMsg("The selected data has been removed!");
  };


  /**
   * Convert the input data to ISO format
   * @returns Datetime in ISO format
   */

  setDueDate() {
    var startTime = new Date(this.state.fDuedate + " " + this.state.fDuetime);

    return startTime.toISOString();
  }
 /**
   * Get due time and set to the state variable
   * @param {*} meetingTime Due datetime
   */

  getDuedate(meetingTime) {
    var startTime = new Date(meetingTime);

    const sMonth = startTime.getMonth() + 1 + "";
    const sDate = startTime.getDate() + "";
    const sHours = startTime.getHours() + "";
    const sMin = startTime.getMinutes() + "";

    this.setState({
      fDuedate:
        startTime.getFullYear() +
        "-" +
        sMonth.padStart(2, 0) +
        "-" +
        sDate.padStart(2, 0),
      fDuetime: sHours.padStart(2, 0) + ":" + sMin.padStart(2, 0),
    });
  }
/**
   * Display duetime to table
   * @param {*} time Due time
   * @returns Due time with format
   */

  displayTime(time) {
    var startTime = new Date(time);
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

    return strStart;
  }

  render() {
    const listAssignment = this.state.listAssignment;

    return (
      <div className="content assign">
        <div className="">
          <div className="assignment-intro">
            <i className="fa fa-bookmark" aria-hidden="true"></i>{" "}
            {this.state.couseData == null ? "" : this.state.couseData.title}
          </div>
          <div className="assignment-function">
            <Link className="btn-s btn btn-primary btn-sm" to={`/courses/`}>
              <i className="fa fa-chevron-left" aria-hidden="true"></i> Back
            </Link>

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
            <Button
              variant="secondary"
              size="sm"
              className="btn-s"
              onClick={this.handleShowAdd}
            >
              <i className="fa fa-plus" aria-hidden="true"></i> Add New
              Assignment
            </Button>
          </div>
          <Table className="table assign-table" responsive="sm">
            <thead>
              <tr>
                {/*<th scope="col" className="t-col-id">
                  ID
            </th>*/}
                <th scope="col" className="t-col-type">
                  Type
                </th>
                <th scope="col" className="t-col-name">
                  Name
                </th>

                <th scope="col" className="t-col-status">
                  Status
                </th>
                <th scope="col" className="t-col-dd">
                  Due Date
                </th>
                <th scope="col" className="t-col-func"></th>
              </tr>
            </thead>
            <tbody>
              {listAssignment.map((asgn) => (
                <tr key={asgn.id}>
                  {/*<th scope="row" className="t-col-id">
                    {asgn.id}
                  </th> */}
                  <td className="t-col-type">{asgn.type}</td>
                  <td className="t-col-name">{asgn.title}</td>
                  {/* <td className="t-col-des wrapcontent">{ asgn.description }</td> */}
                  {/* <td className="t-col-des wrapcontent">
                    <div
                      dangerouslySetInnerHTML={{ __html: asgn.description }}
                    />
                  </td>*/}
                  <td className="t-col-status">
                    {" "}
                    <Badge
                      bg={asgn.status === "Completed" ? "success" : "danger"}
                    >
                      {asgn.status}
                    </Badge>
                  </td>
                  <td className="t-col-dd">{this.displayTime(asgn.endDate)}</td>
                  <td className="t-col-func" style={{ "text-align": "center" }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      style={{ "margin-right": "5px" }}
                      onClick={this.handleShowEdit}
                    >
                      <i className="fa fa-arrow-right" aria-hidden="true"></i>{" "}
                      Detail
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ "margin-right": "5px" }}
                      onClick={this.handleShowEdit}
                    >
                      <i className="fa fa-edit"></i>
                    </Button>
                    <Button
                      variant="danger"
                      style={{ "margin-right": "5px" }}
                      onClick={this.handleShowConfirm}
                      size="sm"
                    >
                      <i className="fa fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <>
          <Modal show={this.state.show} onHide={this.handleClose} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                {this.state.mode ? "Assignment Add" : "Assignment"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Alert show={this.state.showError} variant="danger">
                    <ul>
                      {this.state.agnError.map((error_V) => (
                        <li key={error_V}>{error_V}</li>
                      ))}
                    </ul>
                  </Alert>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">
                    Name:<text className="required">(*)</text>
                  </Form.Label>
                  <Col sm="10">
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
                  <Form.Label column sm="2">
                    Status:<text className="required">(*)</text>
                  </Form.Label>
                  <Col sm="10">
                    <Form.Control
                      as="select"
                      name="fStatus"
                      value={this.state.fStatus}
                      onChange={this.handleInput}
                    >
                      <option value="Not completed">Not completed</option>
                      <option value="In progress">In progress</option>
                      <option value="Completed">Completed</option>
                    </Form.Control>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">
                    Type:<text className="required">(*)</text>
                  </Form.Label>
                  <Col sm="10">
                    <Form.Control
                      as="select"
                      name="fType"
                      value={this.state.fType}
                      onChange={this.handleInput}
                    >
                      <option value="Quiz">Quiz</option>
                      <option value="Discussion">Discussion</option>
                      <option value="Homework">Homework</option>
                      <option value="Extra Credit">Extra Credit</option>
                      <option value="etc">etc</option>
                    </Form.Control>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">
                    Due date:<text className="required">(*)</text>
                  </Form.Label>
                  <Col sm="6">
                    <Form.Control
                      type="date"
                      name="fDuedate"
                      onChange={this.handleInput}
                      value={this.state.fDuedate}
                    />
                  </Col>
                  <Col sm="4">
                    <Form.Control
                      type="time"
                      name="fDuetime"
                      onChange={this.handleInput}
                      value={this.state.fDuetime}
                    />
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description: </Form.Label>
                  <Form.Control
                    as="textarea"
                    name="fDescription"
                    className="txt"
                    onChange={this.handleInput}
                    value={this.state.fDescription}
                    placeholder="Description input"
                  />
                </Form.Group>
              </Form>
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
