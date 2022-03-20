import React, { Component } from "react";
import "../../styles/dashboard.css";
import logo from "../../img/logo.PNG";
import { Button } from "react-bootstrap";

import { getDatabase, ref, onValue, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import Navside from "../navbar/navside";

import UserProfileDropDown from "../home/userProfileDropDown";
import Breadcrumb from "../home/breadcrumb";

import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Toolbar,
  ViewSwitcher,
  MonthView,
  WeekView,
  DayView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  DragDropProvider,
  EditRecurrenceMenu,
  AllDayPanel,
} from "@devexpress/dx-react-scheduler-material-ui";
import { connectProps } from "@devexpress/dx-react-core";
import DateTimePicker from "@mui/lab/DateTimePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterMoment from "@mui/lab/AdapterMoment";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import LocationOn from "@mui/icons-material/LocationOn";
import Notes from "@mui/icons-material/Notes";
import Close from "@mui/icons-material/Close";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Create from "@mui/icons-material/Create";
import todoContainer from "./todoContainer.js"
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
};

const StyledDiv = styled("div")(({ theme }) => ({
  [`& .${classes.icon}`]: {
    margin: theme.spacing(2, 0),
    marginRight: theme.spacing(2),
  },
  [`& .${classes.header}`]: {
    overflow: "hidden",
    paddingTop: theme.spacing(0.5),
  },
  [`& .${classes.textField}`]: {
    width: "100%",
  },
  [`& .${classes.content}`]: {
    padding: theme.spacing(2),
    paddingTop: 0,
  },
  [`& .${classes.closeButton}`]: {
    float: "right",
  },
  [`& .${classes.picker}`]: {
    marginRight: theme.spacing(2),
    "&:last-child": {
      marginRight: 0,
    },
    width: "50%",
  },
  [`& .${classes.wrapper}`]: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
  },
  [`& .${classes.buttonGroup}`]: {
    display: "flex",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 2),
  },
  [`& .${classes.button}`]: {
    marginLeft: theme.spacing(2),
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  [`&.${classes.addButton}`]: {
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(4),
  },
}));
export default class todo extends Component  {
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

  commitDeletedAppointment() {
    this.setState((state) => {
      const { data, deletedAppointmentId } = state;
      const nextData = data.filter(
        (appointment) => appointment.id !== deletedAppointmentId
      );

      return { data: nextData, deletedAppointmentId: null };
    });
    this.toggleConfirmationVisible();
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
        this.setDeletedAppointmentId(deleted);
        this.toggleConfirmationVisible();
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
    
      this.setState({user:currentUser});
      console.log(this.state.user)
      this.getUserTasks();
    });
   
  }
  getUserTasks = () => {
    console.log(this.state.user?.email);
    const starCountRef = ref(getDatabase(), "todo/"+this.state.user?.uid);
    onValue(starCountRef, (snapshot) => {
      const dt = snapshot.val();
      if (dt != null) {
       
        this.setState({ data: dt });
        console.log(dt);
      } else {
        this.isNodata = true;
      }
    });
  };
  componentDidUpdate() {
    this.appointmentForm.update();
    this.update(); // updating database
   
  }

  update() {
    const updates = {};
    var i = 0;
    try{
        while (i < this.state.data.length) {
            const userData = {
              id: this.state.data[i].id,
              title: this.state.data[i].title,
              location: this.state.data[i].location,
              notes: this.state.data[i].notes,
              startDate: this.state.data[i].startDate,
              endDate: this.state.data[i].endDate,
            };
      
            updates["/todo/" + this.state.user?.uid + "/" + this.state.data[i].id] =
              userData;
            i++;
          }
          update(ref(getDatabase()), updates)
            .then(() => {
             console.log("Data saved successfully!")
            })
            .catch((error) => {
              console.log(error);
            });
       
    }
    catch(error){
console.log("PRoblem updating tasks")

    }
     }

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
                      onEditingAppointmentChange={
                        this.onEditingAppointmentChange
                      }
                      onAddedAppointmentChange={this.onAddedAppointmentChange}
                    />
                    <WeekView
                      startDayHour={startDayHour}
                      endDayHour={endDayHour}
                    />
                    <MonthView />
                    <DayView />
                    <AllDayPanel />
                    <EditRecurrenceMenu />
                    <Appointments />
                    <AppointmentTooltip
                      showOpenButton
                      showCloseButton
                      showDeleteButton
                    />
                    <Toolbar />
                    <ViewSwitcher />
                    <AppointmentForm
                      overlayComponent={this.appointmentForm}
                      visible={editingFormVisible}
                      onVisibilityChange={this.toggleEditingFormVisibility}
                    />
                    <DragDropProvider />
                  </Scheduler>

                  <Dialog
                    open={confirmationVisible}
                    onClose={this.cancelDelete}
                  >
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
                        endDate: new Date(currentDate).setHours(
                          startDayHour + 1
                        ),
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
