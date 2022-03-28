//This component will be used in the dashboard overview
//summary of todos list
import React, { Component } from "react";
import { ListGroup, Badge, Modal } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase-config";
import { format } from "date-fns";
export default class listTodoSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedDialog: -1,
      actionType: "",
      showHide: false,
      listAlltodos: [],
      user: this.props.user,
    };
  }
  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });
      this.getAlltodoData();
    });
   
  }
  getAlltodoData = () => {
    console.log(this.state.user?.email);
    const starCountRef = ref(getDatabase(), "todo/" + this.state.user?.uid);
    onValue(starCountRef, (snapshot) => {
      const dt = snapshot.val();
      if (dt != null) {
        this.setState({ listAlltodos: dt });
        console.log(dt);
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

  render() {
    const listtodos = this.state.listAlltodos;

    return (
      <div className="courseSum col-4">
        <div className="card">
          <h5 className="card-header">TODO</h5>
          <div className="card-body">
            <ListGroup as="ol" numbered>
              {listtodos.map((todo) => (
                <ListGroup.Item
                  as=""
                  className="d-flex justify-content-between align-items-start"
                >
                  <div className="ms-2 me-auto">
                  <div className="fw-bold"><i
                    class="fa fa-dot-circle-o"
                    aria-hidden="true"
                    title="detail"
                  
                  ></i><a  onClick={() => this.openModal(todo.id, "detail")}  Style="cursor: pointer;">{todo.title}</a></div>
                  <Badge bg = "success">
                  <i
                    class="fa fa-clock-o"
                    aria-hidden="true"
                    title="detail"
                  
                  ></i>{format(new Date(todo.endDate), "yyyy/MM/dd kk:mm:ss")}
                  </Badge>
               
                  </div>
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
               
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
      </div>
    );
  }
}
