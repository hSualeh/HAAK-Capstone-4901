//This component will be used in the dashboard overview
//summary of courses list
import React, { Component } from "react";
import { ListGroup, Modal, Badge } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase-config";
import AssignmentNotificationByCourse from "../assignment/assignmentNotificationByCourse";
export default class listCoursesSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedDialog: -1,
      actionType: "",
      showHide: false,
      listAllCourses: [],
      user: this.props.user,
      listAssignment: [],
      assignmentData: null,
      showbell: false,
    };
  }
  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });
      this.getAllCourseData();
    });
  }
  getAllCourseData = () => {
    console.log(this.props.user);
    const starCountRef = ref(getDatabase(), "courses");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({ listAllCourses: data });
      } else {
        this.isNodata = true;
      }
    });
  };
  openModal = (course, actionType) => {
    this.setState({
      openedDialog: course,
      actionType: actionType,
    });
  };

  closeModal = () => {
    this.setState({
      openedDialog: null,
    });
  };

  handleModalShowHide() {
    this.setState({ showHide: !this.state.showHide });
  }
  showNotificationForCourse = (courseID) => {
    const starCountRef = ref(getDatabase(), "assignments");
    let uid = this.state.user.uid;
    let showbell = false;
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      let allData = [];

      if (data != null) {
        for (var key of Object.keys(data)) {
          allData.push(data[key]);
          if (
            data[key].cid == courseID &&
            data[key].uid == uid &&
            data[key].status == "Not completed"
          ) {
            showbell = true;
          }
        }
      }
    });
    return showbell;
  };
  render() {
    let listCourses = this.state.listAllCourses;
    let showbell = this.state.showbell;
    const filterCourses = listCourses.filter(
      (x) => x.student.findIndex((y) => y === this.state.user?.uid) !== -1
    );

    return (
      <div className="courseSum col-4">
        <div className="card">
          <h5 className="card-header">Courses</h5>
          <div className="card-body">
            <ListGroup as="ol" numbered>
              {filterCourses.map((course) => (
                <ListGroup.Item
                  as=""
                  className="d-flex justify-content-between align-items-start"
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">{course.name}</div>
                  </div>

                  {this.showNotificationForCourse(course.id) ? (
                    <div>
                      <i
                        class="fa fa-bell"
                        aria-hidden="true"
                        title="notifications"
                        onClick={() =>
                          this.openModal(course.cid, "notification")
                        }
                        Style="cursor: pointer;"
                      ></i>
                      <Modal
                        show={
                          this.state.openedDialog === course.cid &&
                          this.state.actionType === "notification"
                        }
                        onHide={this.closeModal}
                      >
                        <Modal.Header closeButton>
                          <Modal.Title>
                            Notification for {course.course_code}
                          </Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                          <AssignmentNotificationByCourse
                            courseid={course.id}
                          ></AssignmentNotificationByCourse>
                        </Modal.Body>
                      </Modal>
                    </div>
                  ) : null}
                  <i
                    class="fa fa-cog"
                    aria-hidden="true"
                    title="setting"
                    onClick={() => this.openModal(course.cid, "detail")}
                    Style="cursor: pointer;"
                  ></i>
                  <Modal
                    show={
                      this.state.openedDialog === course.cid &&
                      this.state.actionType === "detail"
                    }
                    onHide={this.closeModal}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Course Detail </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                      <table responsive>
                        <tr>
                          <td>
                            <strong className="me-auto">Type :</strong>
                          </td>
                          <td>
                            {" "}
                            <Badge bg="success" pill>
                              {course.type}
                            </Badge>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <strong className="me-auto">Course Name :</strong>
                          </td>
                          <td>{course.name}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong className="me-auto">Meeting Date :</strong>
                          </td>
                          <td>{course.meeting_Dates}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong className="me-auto">Days :</strong>
                          </td>
                          <td>{course.Days}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong className="me-auto">Times :</strong>
                          </td>
                          <td>{course.Times}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong className="me-auto">Section :</strong>
                          </td>
                          <td>{course.section}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong className="me-auto">Session :</strong>
                          </td>
                          <td>{course.session}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong className="me-auto">Room Number :</strong>
                          </td>
                          <td>{course.roomNumber}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong className="me-auto">Location :</strong>
                          </td>
                          <td>{course.location}</td>
                        </tr>
                      </table>
                    </Modal.Body>
                  </Modal>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
      </div>
    );
  }
}
