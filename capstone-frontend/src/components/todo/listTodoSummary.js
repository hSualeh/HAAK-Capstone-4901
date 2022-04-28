
//This component will be used in the dashboard overview
//summary of todos list
import React, { Component } from "react";
import { ListGroup, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { auth } from "../firebase-config";
import { format } from "date-fns";
import { Link } from "react-router-dom";
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
  updatestatus = (id, todoData, checked) => {
    console.log("change status" + id);
    todoData.status = checked == 0 ? 1 : 0;
    console.log(todoData);

    const updates = {};
    if (this.state.user?.uid != "") {
      console.log("/todo/" + this.state.user?.uid + "/" + id);
      updates["/todo/" + this.state.user?.uid + "/" + id] = todoData;

      update(ref(getDatabase()), updates)
        .then(() => {
          console.log("Data saved successfully!");
        })
        .catch((error) => {
          console.log(error);
        });
    }
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
    //sort tasks by due date and limit number of tasks to 5 items
    let list_todo_tmp = listtodos.sort((a, b) =>
      a.endDate
        .split("/")
        .reverse()
        .join()
        .localeCompare(b.endDate.split("/").reverse().join())
    );
    let list_todo = list_todo_tmp.slice(0, 5);
    return list_todo;
  };

  handleSelect(iscomplete) {
    this.setState({ complete: iscomplete });
  }
  render() {
    const listtodos_uns = this.state.listAlltodos;
    const listtodos = this.sortTasks(listtodos_uns);

    return (
      <div className="courseSum col-4">
        <div className="card">
          <h5 className="card-header">TODO</h5>
          <div className="card-body">
            <ListGroup as="ol" className="list-group list-group-numbered">
              {listtodos.map((todo) => (
                <ListGroup.Item
                  as=""
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">
                      {" "}
               
                      <a
                        onClick={() => this.openModal(todo.id, "detail")}
                        Style="cursor: pointer;"
                      >
                           { todo.title}
                      </a>
                   
                  
                     
                    </div>
                   
                     
                      {" "}
                     
                        <Row>
                      {format(new Date(todo.endDate), "yyyy/MM/dd") <= format(new Date(), "yyyy/MM/dd") &&  todo.status == 0? 
                      
                         <Col sm="4">
                        <Badge pill
                        bg="danger">Due Date</Badge></Col>: ""} 


                         <Col sm="4">
                        {(
                             <Badge pill
                              bg={todo.status == 1 ? "success" : "secondary"}
                            >
                              <i
                                class="fa fa-clock-o"
                                aria-hidden="true"
                                title="detail"
                              ></i>
                              {format(new Date(todo.endDate), "yyyy/MM/dd")}
                            </Badge>
                          )}
                        
                      
                      
                     
                        </Col>
                    </Row>
                    <Row>
                      <Col sm="12">
                      <Form.Check
                      title = "Complete"
                          type="switch"
                          id="custom-switch"
                          checked={todo.status == 1 ? "checked" : ""}
                          onClick={() =>
                            this.updatestatus(todo.id, todo, todo.status)
                          }
                          label="Mark as complete" style={{color:"blue"}}/> 
                         </Col>
                      </Row>
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
            <Link className="more-link" to="/tasks">
              More
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

