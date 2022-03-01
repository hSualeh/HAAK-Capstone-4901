import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
//Css
import "../../styles/course.css";

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

    this.maxCourse = 0;
    this.isNodata = false;

    this.state = {
      mode: true,
      show: false,
      listAllCourses: [],
      listCurCourses: [],
      syncData: [],
    };
  }

  componentDidMount() {
    const auth = getAuth(app);
    if (auth.currentUser === null) {
      //window.location.href = "/";
      userID = "1";
    } else {
      userID = auth.currentUser.uid;
    }

    this.getAllCourseData();
  }

  componentWillUnmount() {}

  getAllCourseData = () => {
    const starCountRef = ref(db, "courses");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const filter = data.filter(x => x.student.findIndex(y => y === userID) !== -1);
        this.setState({ listAllCourses: data });
        this.setState({ listCurCourses: filter });
        
        this.maxCourse = data.length;
      } else {
        this.isNodata = true;
      }
    });
  };

  updateAssignmentData = () => {
    set(ref(db, "assignments/" + this.state.assignmentid), {
      aid: this.state.assignmentid,
      classid: this.state.classid,
      description: this.state.description,
      duedate: this.state.duedate,
      title: this.state.atitle,
      uid: "1",
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
    const token =
      "9082~TQsKgb46KJw9l6ziIt5Y0Jc7U1j8ZMor7l5xQiKaH8ZjKz5i91c7j1slQI82rRzCF"; // API Token

    const requestOptions = {
      method: "GET",
      mode: "cors",
      Headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
      },
    };
    fetch(
      "https://unt.instructure.com/api/v1/courses/?enrollment_state=active&access_token=9082~TQsKgb46KJw9l6ziIt5Y0Jc7U1j8ZMor7l5xQiKaH8ZjKz5i91c7j1slQI82rRzC",
      requestOptions
    )
      .then((res) => res.json())
      .then(
        (result) => {
          const listCourses = this.state.listAllCourses;
          const updates = {};

          result.map((courseData) => {
            let curIndex = -1;
            let isSkip = false;
            
            let requestData = {
              mid:0,
              id: courseData.id,
              name: courseData.name,
              course_code: courseData.course_code,
              start_at: courseData.start_at,
              end_at: courseData.end_at,
              time_zone: courseData.time_zone,
              student: [],
            };

            // check course is existed
            const fResultCourse = listCourses.filter(
              (x) => x.id === courseData.id
            );

            if (fResultCourse.length !== 0) {
              // check student is enrolled
              const fResultStudent = fResultCourse[0].student.filter(
                (x) => x === userID
              );

              if (fResultStudent.length === 0) {
                requestData.student = fResultCourse[0].student;
                requestData.student.push(userID);
              } else {
                isSkip = true;
              }
              
              curIndex = listCourses.findIndex(x => x.id === fResultCourse[0].id);
            } else {
              requestData.student.push(userID);
            }
            if (isSkip === false) {
              if (curIndex === -1) {
                if (this.isNodata === true) {
                  updates["/courses/" + 0] = requestData;
                  this.maxCourse = 1;
                  this.isNodata = false;
                } else {
                  requestData.mid = this.maxCourse;
                  updates["/courses/" + this.maxCourse] = requestData;
                  this.maxCourse++;
                }
              } else {
                requestData.mid = curIndex;
                updates["/courses/" + curIndex] = requestData;
              }
            }
          });

          update(ref(db), updates);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  createNewCourse(courseData) {
    // // Get a key for a new Post.
    // const newPostKey = push(child(ref(db), "courses")).key;

    const updates = {};
    if (this.isNodata === true) {
      updates["/courses/" + 0] = courseData;
      this.isNodata = false;
    } else {
      updates["/courses/" + this.maxCourse] = courseData;
    }

    update(ref(db), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  }

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
    const listCourses = this.state.listCurCourses;

    return (
      <div className="assignment-wrapper">
        <div className="assignment-inner">
          <div className="header-function">
            <Button variant="primary" onClick={this.handleShowAdd}>
              Sync with School
            </Button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Class Code</th>
                <th scope="col">Name</th>
              </tr>
            </thead>
            <tbody>
              {listCourses.map((course) => (
                <tr key={course.id}>
                  <th scope="row">{course.id}</th>
                  <td>{course.course_code}</td>
                  <td>{course.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
