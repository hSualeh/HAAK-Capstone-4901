//This component will be used in the dashboard overview
//summary of todos list
import React, { Component } from 'react'
import { ListGroup,Badge } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase-config";
export default class listTodoSummary extends Component {

    constructor(props) {
        super(props);
      
     
        this.state = {
         
          listAlltodos: [],
       user:this.props.user
        };
      }
      componentDidMount() {
       
        onAuthStateChanged(auth,(currentUser)=>{
          this.setState({user:currentUser});
        });
        this.getAlltodoData();
      }
      getAlltodoData = () => {


        console.log(this.props.user);
        const starCountRef = ref(getDatabase(), "todo");
        onValue(starCountRef, (snapshot) => {
          const data = snapshot.val();
          if (data != null) {
          //  const filter = data.filter(x => x.student.findIndex(y => y === this.props.user?.uid) !== -1);
            this.setState({ listAlltodos: data });
         
          } else {
            this.isNodata = true;
          }
        })
      };
      
      
  render() {
    const listtodos = this.state.listAlltodos;
    const filterTODO = listtodos.filter(x => x.student.findIndex(y => y === this.state.user?.uid) !== -1);
  
    return (
    
       
       <div className="courseSum col-12 col-md-6 col-lg-3 mb-4 mb-lg-0">
      <div className="card">
          <h5 className="card-header">TODO</h5>
          <div className="card-body">
         
          <ListGroup as="ol" numbered>
          {filterTODO.map((todo) => (
  <ListGroup.Item
    as=""
    className="d-flex justify-content-between align-items-start"
  >
    <div className="ms-2 me-auto">
      <div className="fw-bold">{todo.name}</div>
      {todo.dueDate}
    </div>
    <Badge bg="success" pill>
    {todo.dueDate}
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
