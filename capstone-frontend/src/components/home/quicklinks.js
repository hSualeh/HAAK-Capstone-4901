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
    <Button className="quicklink_btn" variant="secondary" size="md">
   <i class="fa fa-university" aria-hidden="true"></i> UNT Courses Catalog
    </Button>
    <Button className="quicklink_btn" variant="secondary" size="md">
    <i class="fa fa-graduation-cap" aria-hidden="true"></i>  Registration Calendar
    </Button>
    <Button className="quicklink_btn" variant="secondary" size="md">
    <i class="fa fa-car" aria-hidden="true"></i>  Parking permits

    </Button>
    <Button className="quicklink_btn" variant="secondary" size="md">
    <i class="fa fa-address-book-o" aria-hidden="true"></i>  Advising Offices
    </Button>
  </div>
            </div>
          </div>
    </div>
    )
  }
}
