//summary of todos list inn the last 24 hrs
import React, { Component } from "react";
import { ListGroup, Badge, Modal, Form, Row, Col,Alert } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { auth } from "../firebase-config";
import { format } from "date-fns";
import { Link } from "react-router-dom";
export default class todonotification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedDialog: -1,
      actionType: "",
      showHide: false,
      listAlltodos: [],
      user: this.props.user,
      showNotification:false
    };
  }
  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });
      this.getAlltodoData();
    });
  }
  getAlltodoData = () => {
    //console.log(this.state.user?.email);
    const starCountRef = ref(getDatabase(), "todo/" + this.state.user?.uid);
    onValue(starCountRef, (snapshot) => {
      const dt = snapshot.val();
      if (dt != null) {
        this.setState({ listAlltodos: dt });
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
  sortTasks = (listtodos) => {
    let currentime = format(new Date(), "yyyy/MM/dd");
    let list_todo =[];
    try{
      list_todo = listtodos.filter(
        (x) => format(new Date(x.endDate), "yyyy/MM/dd") === currentime
      );
    }
    catch(error){
      console.log(error)
    }

    return list_todo;
  };

  handleSelect(iscomplete) {
    this.setState({ complete: iscomplete });
  }
  render() {
    const listtodos_uns = this.state.listAlltodos;
 const listtodos = this.sortTasks(listtodos_uns);

    return (
     
      <Alert variant="danger" show={Object.getOwnPropertyNames(listtodos).length>1}>
         {this.list_todo}
      <Alert.Heading>  <i className="fa fa-bullhorn" aria-hidden="true"></i> Due soon…</Alert.Heading>
    
      <ul>
       
        {listtodos.map((todo) => (
          <li Style="text-align: left;">
           <a   onClick={() => this.openModal(todo.id, "detail")}
                        Style="cursor: pointer;text-decoration:underline;"> {todo.title} </a>
                      
                      
           {/* due on {format(new Date(todo.endDate), "yyyy/MM/dd")} */}
            <Modal
              show={
                this.state.openedDialog === todo.id &&
                this.state.actionType === "detail"
              }
              onHide={this.closeModal}
            >
              <Modal.Header closeButton>
                <Modal.Title>Task Detail </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <table responsive>
                  <tr>
                    <td>
                      <strong className="me-auto"> Title :</strong>
                    </td>
                    <td>{todo.title}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong className="me-auto">Start Date:</strong>
                    </td>
                    <td>{todo.startDate}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong className="me-auto">End Date :</strong>
                    </td>
                    <td>{todo.endDate}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong className="me-auto">Location :</strong>
                    </td>
                    <td>{todo.location}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong className="me-auto">Notes :</strong>
                    </td>
                    <td>{todo.notes}</td>
                  </tr>
                </table>
              </Modal.Body>
            </Modal>
          </li>
        ))}
      </ul>
      </Alert>
    );
  }
}
