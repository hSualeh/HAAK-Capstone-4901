import React, { Component } from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase-config";
export default class listdepartment extends Component {

    constructor(props) {
        super(props);
        this.state = {
         
          dep_list : [],
       
        };
      }
      componentDidMount() {
        this.getDepData();
      }

      getDepData = () => {
    
    const starCountRef = ref(getDatabase(), "departments");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
             this.setState({ dep_list: data });
     console.log(data);
      } else {
        this.isNodata = true;
      }
    });
}

  render() {

    const listdep = this.state.dep_list;
    return (
   <>
   <option value="">Select Department</option>
    {listdep.map((dep) => (
<option value={dep.name}>{dep.name}</option>

))}
 <option value="Other">Other</option>
</>
    )
  }
}
