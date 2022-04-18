import React, { Component } from 'react';

import { Button, Alert, Table, Col, Row } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";


class assignmentNotificationByCourse extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
        
          listAssignment: [],
          fid: "",
          fStatus: "Not completed",
          fName: "",
          fType: "Quiz",
          fDescription: "",
          fDuedate: "2022-01-01",
          user: null,
          assignmentData: null,
         
        };
    
       
      }
    
      componentDidMount() {
        onAuthStateChanged(auth, (currentUser) => {
          this.setState({ user: currentUser });
          this.getAllAssignmentData();
      
        });
      }


    getAllAssignmentData = () => {
        const starCountRef = ref(getDatabase(), "assignments/"+ this.state.user.uid);
        let courseID = this.props.courseid;
     console.log("hhh"+courseID);
        onValue(starCountRef, (snapshot) => {
          const data = snapshot.val();
          let allData = [];
          let filter = [];
    
          if (data != null) {
           
            for (var key of Object.keys(data)) {
              allData.push(data[key]);
              if (data[key].cid == courseID && data[key].status == "Not completed") {
                filter.push(data[key]);
              }
            }
        this.setState({ listAssignment: filter });
          } else {
          
            this.setState({ listAssignment: filter });
          }
        });
      };
    render() {
        const listAssignment = this.state.listAssignment;
        return (
   
         <Table className="table">
            <thead>
              <tr>
               
                <th scope="col" >
                  Type
                </th>
                <th scope="col">
                  Name
                </th>
               
                <th scope="col" >
                  Status
                </th>
                <th scope="col" >
                  Due Dates
                </th>
               
              </tr>
            </thead>
            <tbody>
              {listAssignment.map((asgn) => (
                <tr key={asgn.id}>
                 
                  <td className="">{asgn.type}</td>
                  <td className="">{asgn.name}</td>
                 
                  <td className="">{asgn.status}</td>
                  <td className="">{asgn.duedate}</td>
                 
                </tr>
              ))}
            </tbody>
          </Table>
        
        
        );
    }
}

export default assignmentNotificationByCourse;