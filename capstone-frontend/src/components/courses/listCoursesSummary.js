//This component will be used in the dashboard overview
//summary of courses list
import React, { Component } from 'react'
import { ListGroup } from "react-bootstrap";
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
          
            this.setState({ listAllCourses: data });
         
          } else {
            this.isNodata = true;
          }
        })
      };
      
      
  render() {
    let listCourses = this.state.listAllCourses;
    const filterCourses = listCourses.filter(x => x.student.findIndex(y => y === this.state.user?.uid) !== -1);
  
    return (
    
   
       <div className="courseSum col-12 col-md-6 col-lg-3 mb-4 mb-lg-0">
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
      <div className="fw-bold">{course.course_code}</div>
      {course.name}
    </div>
   
    <i class="fa fa-bell" aria-hidden="true" title="notifications"></i>
    <i class="fa fa-calendar-check-o" aria-hidden="true" title="Schedule"></i>
    <i class="fa fa-cog" aria-hidden="true" title="setting"></i>
  </ListGroup.Item>
    ))}
  </ListGroup>
          </div>
        </div>
  </div>
   
    )
  }
}
