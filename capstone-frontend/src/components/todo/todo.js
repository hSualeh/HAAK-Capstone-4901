import React, { Component } from "react";
import "../../styles/dashboard.css";
import { Button, Form, Row, Col, Badge } from "react-bootstrap";

import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase-config";

import { styled, alpha } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Toolbar,
  DateNavigator,
  ViewSwitcher,
  MonthView,
  WeekView,
  DayView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  DragDropProvider,
  AllDayPanel,
  EditRecurrenceMenu,
} from "@devexpress/dx-react-scheduler-material-ui";
import { connectProps } from "@devexpress/dx-react-core";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import todoContainer from "./todoContainer.js";

const PREFIX = "todo";
const appointments = [];

const classes = {
  content: `${PREFIX}-content`,
  header: `${PREFIX}-header`,
  closeButton: `${PREFIX}-closeButton`,
  buttonGroup: `${PREFIX}-buttonGroup`,
  button: `${PREFIX}-button`,
  picker: `${PREFIX}-picker`,
  wrapper: `${PREFIX}-wrapper`,
  icon: `${PREFIX}-icon`,
  textField: `${PREFIX}-textField`,
  addButton: `${PREFIX}-addButton`,
  todayCell: `${PREFIX}-todayCell`,
  weekendCell: `${PREFIX}-weekendCell`,
  today: `${PREFIX}-today`,
  weekend: `${PREFIX}-weekend`,
};

const StyledFab = styled(Fab)(({ theme }) => ({
  [`&.${classes.addButton}`]: {
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(4),
  },
}));

/*
Creates style for the calender that sets weekends and current date to uniquely identifiable colors
*/
const StyledWeekViewTimeTableCell = styled(WeekView.TimeTableCell)(
  ({ theme }) => ({
    [`&.${classes.todayCell}`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.14),
      },

      "&:focus": {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
      },
    },

    [`&.${classes.weekendCell}`]: {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      "&:hover": {
        backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      },
      "&:focus": {
        backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      },
    },
  })
);

const StyledWeekViewDayScaleCell = styled(WeekView.DayScaleCell)(
  ({ theme }) => ({
    [`&.${classes.today}`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
    [`&.${classes.weekend}`]: {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.06),
    },
  })
);

const TimeTableCell = (props) => {
  const { startDate } = props;
  const date = new Date(startDate);

  if (date.getDate() === new Date().getDate()) {
    return (
      <StyledWeekViewTimeTableCell {...props} className={classes.todayCell} />
    );
  }
  if (date.getDay() === 0 || date.getDay() === 6) {
    return (
      <StyledWeekViewTimeTableCell {...props} className={classes.weekendCell} />
    );
  }
  return <StyledWeekViewTimeTableCell {...props} />;
};

const DayScaleCell = (props) => {
  const { startDate, today } = props;

  if (today) {
    return <StyledWeekViewDayScaleCell {...props} className={classes.today} />;
  }
  if (startDate.getDay() === 0 || startDate.getDay() === 6) {
    return (
      <StyledWeekViewDayScaleCell {...props} className={classes.weekend} />
    );
  }
  return <StyledWeekViewDayScaleCell {...props} />;
};

const Appointment = ({ children, style, ...restProps }) => (
  <Appointments.Appointment
    {...restProps}
    style={{
      ...style,
      backgroundColor: "#F29154",
      borderRadius: "10px",
      color: "black",
    }}
  >
    {children}
  </Appointments.Appointment>
);

const TextEditor = (props) => {
  if (props.type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
};
/*
Used to add additional or modify fields with the calenders appointment management window.
Additional fields should be added after basic layout as this contains the time select functions.
*/
const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
  const onLocationChange = (nextValue) => {
    onFieldChange({ location: nextValue });
  };
  const onNotesChange = (nextValue) => {
    onFieldChange({ notes: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
    >
      <AppointmentForm.TextEditor
        value={appointmentData.location}
        onValueChange={onLocationChange}
        placeholder="Location"
      />
      <AppointmentForm.TextEditor
        value={appointmentData.notes}
        onValueChange={onNotesChange}
        placeholder="Notes"
      />

      <Row>
        <Col>
          <Form.Check
            type="switch"
            id="custom-switch"
            onClick={() => {
              const updates = {};

              if (appointmentData.status === 0) {
                // onclick function to alter appointment status
                console.log("Set to complete");
                appointmentData.status = 1;

                /*
                const updates = [];
                updates[
                  "/todo/" + this.state.user?.uid + "/" + appointmentData.id
                ] = appointmentData;

                update(ref(getDatabase()), updates);*/
              } else {
                console.log("Set to incomplete");
                appointmentData.status = 0;
              }

              //update(ref(getDatabase()), updates);
            }}
          />
        </Col>
        <Col sm="9">
          {" "}
          <Badge
            bg={appointmentData.status === 1 ? "success" : "light"}
            text={appointmentData.status === 1 ? "" : "dark"}
          >
            <i className="fa fa-clock-o" aria-hidden="true" title="detail"></i>
            {"Task Status"}
          </Badge>
        </Col>
      </Row>
    </AppointmentForm.BasicLayout>
  );
};

export default class todo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: appointments,
      confirmationVisible: false,
      editingFormVisible: false,
      deletedAppointmentId: undefined,
      editingAppointment: undefined,
      previousAppointment: undefined,
      addedAppointment: {},
      startDayHour: 8,
      endDayHour: 24,
      cellDuration: 180,
      isNewAppointment: false,
      listAlltodos: [],
      user: this.props.user,
    };

    this.toggleConfirmationVisible = this.toggleConfirmationVisible.bind(this);

    this.commitDeletedAppointment = this.commitDeletedAppointment.bind(this);

    this.toggleEditingFormVisibility =
      this.toggleEditingFormVisibility.bind(this);

    this.commitChanges = this.commitChanges.bind(this);

    this.onEditingAppointmentChange =
      this.onEditingAppointmentChange.bind(this);

    this.onAddedAppointmentChange = this.onAddedAppointmentChange.bind(this);

    this.appointmentForm = connectProps(todoContainer, () => {
      const {
        editingFormVisible,
        editingAppointment,
        data,
        addedAppointment,
        isNewAppointment,
        previousAppointment,
      } = this.state;

      const currentAppointment =
        data.filter(
          (appointment) =>
            editingAppointment && appointment.id === editingAppointment.id
        )[0] || addedAppointment;

      const cancelAppointment = () => {
        if (isNewAppointment) {
          this.setState({
            editingAppointment: previousAppointment,
            isNewAppointment: false,
          });
        }
      };

      return {
        visible: editingFormVisible,
        appointmentData: currentAppointment,
        commitChanges: this.commitChanges,
        visibleChange: this.toggleEditingFormVisibility,
        onEditingAppointmentChange: this.onEditingAppointmentChange,
        cancelAppointment,
      };
    });
  }

  onEditingAppointmentChange(editingAppointment) {
    this.setState({ editingAppointment });
  }

  onAddedAppointmentChange(addedAppointment) {
    this.setState({ addedAppointment });
    const { editingAppointment } = this.state;
    if (editingAppointment !== undefined) {
      this.setState({
        previousAppointment: editingAppointment,
      });
    }
    this.setState({ editingAppointment: undefined, isNewAppointment: true });
  }

  setDeletedAppointmentId(id) {
    this.setState({ deletedAppointmentId: id });
  }

  toggleEditingFormVisibility() {
    const { editingFormVisible } = this.state;
    this.setState({
      editingFormVisible: !editingFormVisible,
    });
  }

  toggleConfirmationVisible() {
    const { confirmationVisible } = this.state;
    this.setState({ confirmationVisible: !confirmationVisible });
  }

  /*
Partitioned away from the commit changes function as there is a possibility that the
user changes their mind and cancles the changes to their todo item.
In addition to removing the appointment from the local array it also updates the
firebase database to match.
*/
  commitDeletedAppointment() {
    this.setState((state) => {
      const { data, deletedAppointmentId } = state;

      remove(
        // removing from firebase
        ref(
          getDatabase(),
          "/todo/" + this.state.user?.uid + "/" + deletedAppointmentId
        )
      );

      const nextData = data.filter(
        // removing from local array
        (appointment) => appointment.id !== deletedAppointmentId
      );

      this.toggleConfirmationVisible();
      return { data: nextData, deletedAppointmentId: null };
    });
  }
  /*
Handles the adding, updating, and deleting of appointments to the local and database appointment arrays.
Is only called upon state changes to tthe data stored within this.state
*/
  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId =
          data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];

        // setting default values for any created tasks, note these should be appended to if additional items are added to the appointment object
        const updates = {};
        if (data[startingAddedId].title === undefined) {
          data[startingAddedId].title = "N/A";
        }
        if (data[startingAddedId].status === undefined) {
          data[startingAddedId].status = 0;
        }
        if (data[startingAddedId].startDate === undefined) {
          data[startingAddedId].startDate = new Date();
        }
        if (data[startingAddedId].endDate === undefined) {
          data[startingAddedId].endDate = new Date();
        }
        updates["/todo/" + this.state.user?.uid + "/" + startingAddedId] =
          data[startingAddedId];

        update(ref(getDatabase()), updates); // adding the newly added appointment to the database
      }
      if (changed) {
        data = data.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        );
        // remember to add the functionality that the database gets updated as well
      }
      if (deleted !== undefined) {
        this.toggleConfirmationVisible();
        this.setDeletedAppointmentId(deleted);
      }
      return { data, addedAppointment: {} };
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
      this.getUserTasks();
    });
  }

  componentDidUpdate() {
    this.appointmentForm.update();
  }

  /*
Retrieves Users Current todo items from the firebase database.
Is run on mounting of the component and stores retrieved tasks in the
global appointments array for further use.
*/
  getUserTasks = () => {
    if (this.state.user == null) {
      return;
    }
    const starCountRef = ref(getDatabase(), "todo/" + this.state.user.uid); // retrieves todo items from database
    onValue(starCountRef, (snapshot) => {
      const dt = snapshot.val();
      if (dt != null) {
        this.setState({ data: dt });
      } else {
        this.isNodata = true; // note the database may have no tasks therefor noData is set to true for error handling elsewhere
      }
    });
  };

  render() {
    const {
      currentDate,
      confirmationVisible,
      editingFormVisible,
      startDayHour,
      endDayHour,
    } = this.state;
    const data = this.state.data;

    return (
      <div>
        <Paper>
          <Scheduler data={data} height={660}>
            <ViewState currentDate={currentDate} />
            <EditingState
              onCommitChanges={this.commitChanges}
              onEditingAppointmentChange={this.onEditingAppointmentChange}
              onAddedAppointmentChange={this.onAddedAppointmentChange}
              update={this.update}
            />
            <WeekView
              startDayHour={startDayHour}
              endDayHour={endDayHour}
              timeTableCellComponent={TimeTableCell}
              dayScaleCellComponent={DayScaleCell}
            />
            <MonthView />
            <DayView />
            <EditRecurrenceMenu />
            <Appointments appointmentComponent={Appointment} />
            <AllDayPanel />
            <AppointmentTooltip
              showOpenButton
              showCloseButton
              showDeleteButton
            />
            <Toolbar />
            <DateNavigator />
            <ViewSwitcher />
            <AppointmentForm
              basicLayoutComponent={BasicLayout}
              textEditorComponent={TextEditor}
              //overlayComponent={this.appointmentForm}
              visible={editingFormVisible}
              onVisibilityChange={this.toggleEditingFormVisibility}
            />
            <DragDropProvider />
          </Scheduler>

          <Dialog open={confirmationVisible} onClose={this.cancelDelete}>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this appointment?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.toggleConfirmationVisible}
                color="primary"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={this.commitDeletedAppointment}
                color="secondary"
                variant="outlined"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <StyledFab
            color="secondary"
            className={classes.addButton}
            onClick={() => {
              this.setState({ editingFormVisible: true });
              this.onEditingAppointmentChange(undefined);
              this.onAddedAppointmentChange({
                startDate: new Date(currentDate).setHours(startDayHour),
                endDate: new Date(currentDate).setHours(startDayHour + 1),
              });
            }}
          >
            <AddIcon />
          </StyledFab>
        </Paper>
      </div>
    );
  }
}
