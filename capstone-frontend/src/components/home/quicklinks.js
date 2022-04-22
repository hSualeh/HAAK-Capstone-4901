import React, { Component } from 'react'
import { Button } from "react-bootstrap";
export default class quicklinks extends Component {

  

  render() {
    return (
        <div className="courseSum col-4">
        <div className="card">
            <h5 className="card-header">Quick Links</h5>
            <div className="card-body">
            <div className="mb-2">
    <Button onClick={()=> window.open("http://catalog.unt.edu/", "_blank")} className="quicklink_btn" variant="secondary" size="md">
   <i className="fa fa-university" aria-hidden="true"></i> UNT Courses Catalog
    </Button>
    <Button onClick={()=> window.open("https://registrar.unt.edu/registration-guides-by-semester", "_blank")} className="quicklink_btn" variant="secondary" size="md">
    <i className="fa fa-graduation-cap" aria-hidden="true"></i>  Registration Calendar
    </Button>
    <Button onClick={()=> window.open("https://transportation.unt.edu/parking-permits", "_blank")} className="quicklink_btn" variant="secondary" size="md">
    <i className="fa fa-car" aria-hidden="true"></i>  Parking permits

    </Button>
    <Button onClick={()=> window.open("https://engineering.unt.edu/academics/undergraduate/advising", "_blank")} className="quicklink_btn" variant="secondary" size="md">
    <i className="fa fa-address-book-o" aria-hidden="true"></i>  Advising Offices
    </Button>
  </div>
            </div>
          </div>
    </div>
    );
  }
}
