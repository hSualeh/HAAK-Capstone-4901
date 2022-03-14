import React, { Component } from "react";
import "../../styles/dashboard.css";
import logo from "../../img/logo.PNG";
import { Button, Alert, Col, Row, Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";

import { getDatabase, ref, onValue, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import Navside from "../navbar/navside";

import UserProfileDropDown from "../home/userProfileDropDown";
import Breadcrumb from "../home/breadcrumb";

import Paper from "@mui/material/Paper";
import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Toolbar,
  ViewSwitcher,
  WeekView,
  DayView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";

export default class main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saveData: null,
      a_title: "",
      a_startDate: "",
      a_endDate: "",
      a_id: "",
      a_location: "",
      a_status: "",
      profileError: [],
      showError: false,
      showSaveOk: false,
      showCancel: false,
      currentViewName: "work-week",
      user: null,
    };

    this.currentViewNameChange = (currentViewName) => {
      this.setState({ currentViewName });
    };

    this.commitChanges = this.commitChanges.bind(this);
  }

  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId =
          data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
      }
      if (changed) {
        data = data.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        );
      }
      if (deleted !== undefined) {
        data = data.filter((appointment) => appointment.id !== deleted);
      }
      return { data };
    });
  }

  logout = (event) => {
    try {
      signOut(auth);
    } catch (error) {
      this.setState({ signError: error.message });
    }
  };

  componentDidMount() {
    onAuthStateChanged(auth, (currentUser) => {
      this.setState({ user: currentUser });
    });
  }

  getUserProfile = () => {
    if (this.state.user == null) {
      return;
    }
    const starCountRef = ref(getDatabase(), "todo/" + this.state.user.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        this.setState({ a_title: data.title });
        this.setState({ a_startDate: data.startDate });
        this.setState({ a_endDate: data.endDate });
        this.setState({ a_id: data.id });
        this.setState({ a_location: data.location });
        this.setState({ a_status: data.status });
      } else {
        this.isNodata = true;
      }
    });
  };

  handleInput = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    this.setState({ [name]: value });
    // console.log("Name: " + name + "value:" + value);
  };

  cancel = (event) => {
    this.setState({ a_title: this.state.saveData.title });
    this.setState({ a_startDate: this.state.saveData.startDate });
    this.setState({ a_endDate: this.state.saveData.endDate });
    this.setState({ a_id: this.state.saveData.id });
    this.setState({ a_location: this.state.saveData.location });
    this.setState({ a_status: this.state.saveData.status });

    this.setState({
      showError: false,
      showSaveOk: false,
      showCancel: true,
    });
  };

  update = (event) => {
    let newErrors = this.findFormErrors();
    this.setState({ profileError: newErrors });

    if (newErrors.length == 0) {
      this.setState({
        profileError: newErrors,
        showError: false,
        showSaveOk: true,
        showCancel: false,
      });
    } else {
      this.setState({
        profileError: newErrors,
        showError: true,
        showSaveOk: false,
        showCancel: false,
      });
      return;
    }

    const updates = {};
    const userData = {
      title: this.state.title,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      id: this.state.id,
      location: this.state.location,
      status: this.state.status,
    };

    updates["/todo/" + this.state.user.uid] = userData;

    update(ref(getDatabase()), updates)
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <div>
        <nav className="navbar navbar-light bg-light p-3">
          <div className="d-flex col-12 col-md-3 col-lg-2 mb-2 mb-lg-0 flex-wrap flex-md-nowrap justify-content-between">
            <img src={logo} className="logo" alt="Portal logo"></img>
            <Button
              className="navbar-toggler d-md-none collapsed mb-3"
              type="Button"
              data-toggle="collapse"
              data-target="#sidebar"
              aria-controls="sidebar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </Button>
          </div>
          <div className="col-12 col-md-4 col-lg-2"></div>
          <div className="col-12 col-md-5 col-lg-8 d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
            <UserProfileDropDown user={this.state.user}></UserProfileDropDown>
          </div>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <Navside></Navside>
            <main className="profile content">
              <Breadcrumb />
              <div className="tasks_container">
                MAIN BODY of task page Here IN Progress - Please create separate
                components then call it Here
                <h3>Add Task</h3>
                <hr></hr>
                <Alert show={this.state.showCancel} variant="success">
                  <ul>
                    <li>Courses not saved!</li>
                  </ul>
                </Alert>
                <Alert show={this.state.showSaveOk} variant="success">
                  <ul>
                    <li>Save successfully!</li>
                  </ul>
                </Alert>
                <Alert show={this.state.showError} variant="danger">
                  <ul>
                    {this.state.profileError.map((error_V) => (
                      <li key={error_V}>{error_V}</li>
                    ))}
                  </ul>
                </Alert>
                <Form>
                  <Form.Group className="mb-3" controlId="title_r">
                    <Form.Label>Task Name</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Enter Task Name"
                      name="a_title"
                      value={this.state.title}
                      onChange={this.handleInput}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="s_date_r">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Enter Start Date"
                      name="a_startDate"
                      value={this.state.startDate}
                      onChange={this.handleInput}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="e_date_r">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Enter End Date"
                      name="a_endDate"
                      value={this.state.startDate}
                      onChange={this.handleInput}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="location_r">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Location"
                      name="a_location"
                      value={this.state.notes}
                      onChange={this.handleInput}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="status_r">
                    <Form.Label>Task Status</Form.Label>
                    <Form.Select
                      defaultValue=""
                      required
                      placeholder="Select Task Status"
                      name="t_status"
                      value={this.state.status}
                      onChange={this.handleInput}
                    >
                      <option key="-1" value="">
                        Select Status
                      </option>
                      <option key="-2" value="Other">
                        Not Started
                      </option>
                      <option key="-3" value="Other">
                        In Progress
                      </option>
                      <option key="-4" value="Other">
                        Completed
                      </option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3 btn-act">
                    <Button
                      variant="danger"
                      type="button"
                      onClick={this.cancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={(this.update, this.addAppointment)}
                    >
                      Save
                    </Button>
                  </Form.Group>
                </Form>
              </div>
              <Paper>
                <Scheduler>
                  <WeekView />
                  <ViewState
                    defaultCurrentViewName="Week"
                    currentViewName={this.state.currentViewName}
                    onCurrentViewNameChange={this.currentViewNameChange}
                  />
                  <EditingState onCommitChanges={this.commitChanges} />
                  <IntegratedEditing />
                  <DayView startDayHour={9} endDayHour={24} cellDuration={90} />
                  <WeekView
                    startDayHour={9}
                    endDayHour={24}
                    cellDuration={90}
                  />
                  <WeekView
                    name="work-week"
                    displayName="Work Week"
                    excludedDays={[0, 6]}
                    startDayHour={9}
                    endDayHour={24}
                    cellDuration={90}
                  />
                  <Toolbar />
                  <ViewSwitcher />
                  <ConfirmationDialog />
                  <Appointments />
                  <AppointmentTooltip showOpenButton showDeleteButton />
                </Scheduler>
              </Paper>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
