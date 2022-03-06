//This component will be used in the dashboard overview
//summary of courses list
import React, { Component } from 'react'
import { ListGroup,Badge } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase-config";
export default class listCoursesSummary extends Component {

    constructor(props) {
        super(props);
      
     
        this.state = {
         
          listAllCourses: [],
       user:this.props.user
        };
      }
      componentDidMount() {
       
        onAuthStateChanged(auth,(currentUser)=>{
          this.setState({user:currentUser});
        });
        this.getAllCourseData();
      }
      getAllCourseData = () => {


        console.log(this.props.user);
        const starCountRef = ref(getDatabase(), "courses");
        onValue(starCountRef, (snapshot) => {
          const data = snapshot.val();
          if (data != null) {
            const filter = data.filter(x => x.student.findIndex(y => y === this.props.user?.uid) !== -1);
            this.setState({ listAllCourses: filter });
         
          } else {
            this.isNodata = true;
          }
        })
      };
      
      
  render() {
    const listCourses = this.state.listAllCourses;
    return (
    
       
       <div className="courseSum col-12 col-md-6 col-lg-3 mb-4 mb-lg-0">
      <div className="card">
          <h5 className="card-header">Courses</h5>
          <div className="card-body">
         
          <ListGroup as="ol" numbered>
          {listCourses.map((course) => (
  <ListGroup.Item
    as=""
    className="d-flex justify-content-between align-items-start"
  >
    <div className="ms-2 me-auto">
      <div className="fw-bold">{course.course_code}</div>
      {course.name}
    </div>
    <Badge bg="primary" pill>
      14
    </Badge>
  </ListGroup.Item>
    ))}
  </ListGroup>
          </div>
        </div>
  </div>
   
    )
  }
}
