/*import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
} from "@devexpress/dx-react-scheduler-material-ui";*/

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
import coursesContainer from "./coursesContainer.js";

const PREFIX = "courses";
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
function randomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const coursescolor = ["red", "orange", "green", "light blue", "purple"];
const Appointment = ({ children, style, ...restProps }) => (
  <Appointments.Appointment
    {...restProps}
    style={{
      ...style,
      backgroundColor: "#42a5f5", //coursescolor[randomNumber(0, 4)], // should not be a random color
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
  const onCIDChange = (nextValue) => {
    onFieldChange({ cid: nextValue });
  };
  const onCCodeChange = (nextValue) => {
    onFieldChange({ course_code: nextValue });
  };
  const onRoomChange = (nextValue) => {
    onFieldChange({ roomNumber: nextValue });
  };
  const onTypeChange = (nextValue) => {
    onFieldChange({ type: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
    >
      <AppointmentForm.TextEditor
        value={appointmentData.cid}
        onValueChange={onCIDChange}
        placeholder="Course ID"
      />

      <AppointmentForm.TextEditor
        value={appointmentData.course_code}
        onValueChange={onCCodeChange}
        placeholder="Course Code"
      />

      <AppointmentForm.TextEditor
        value={appointmentData.roomNumber}
        onValueChange={onRoomChange}
        placeholder="Room Number"
      />

      <AppointmentForm.TextEditor
        value={appointmentData.type}
        onValueChange={onTypeChange}
        placeholder="Course Type"
      />
    </AppointmentForm.BasicLayout>
  );
};

export default class courses extends Component {
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

    this.appointmentForm = connectProps(coursesContainer, () => {
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

  commitDeletedAppointment() {
    this.setState((state) => {
      const { data, deletedAppointmentId } = state;

      remove(
        // removing from firebase
        ref(
          getDatabase(),
          "/courses/" + this.state.user?.uid + "/" + deletedAppointmentId
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
  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId =
          data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];

        const updates = {};
        if (data[startingAddedId].title === undefined) {
          data[startingAddedId].title = "N/A";
        }
        updates["/courses/" + this.state.user?.uid + "/" + startingAddedId] =
          data[startingAddedId];

        update(ref(getDatabase()), updates);
      }
      if (changed) {
        data = data.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        );

        const updates = {};
        updates["/courses/" + this.state.user?.uid + "/"] = data;
        update(ref(getDatabase()), updates);
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

  getUserTasks = () => {
    if (this.state.user == null) {
      return;
    }
    const starCountRef = ref(getDatabase(), "courses/" + this.state.user.uid);
    onValue(starCountRef, (snapshot) => {
      const dt = snapshot.val();
      if (dt != null) {
        this.setState({ data: dt });
      } else {
        this.isNodata = true;
      }
      //console.log(dt);
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
