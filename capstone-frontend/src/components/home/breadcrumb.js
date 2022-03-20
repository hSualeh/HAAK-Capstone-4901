import React, { Component } from "react";
import "../../styles/dashboard.css";

import { Link } from "react-router-dom";

export default class breadcrumb extends Component {
  render() {
    return (
        <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
          <Link className="breadcrumb-item" to ="/dashboard">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {this.props.currentpage}
          </li>
        </ol>
      </nav>
    )
  }
}
