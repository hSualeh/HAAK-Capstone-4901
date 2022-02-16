import React from 'react';
import { Nav, NavLink, Bars, NavMenu, NavBtn, NavBtnLink} from './navbarElements';


const Navbar = () => {
    return ( 
        <>
            <Nav>
                <NavLink to="/">
                    {/*<img src="/" alt="" />*/}
                    <h1>Logo</h1>
                </NavLink>
                <Bars>

                </Bars>
                <NavMenu>
                    <NavLink to ="/timetable" activeStyle>
                        Timetable
                    </NavLink>
                    <NavLink to ="/courses" activeStyle>
                        Courses
                    </NavLink>
                    <NavLink to ="/assignments" activeStyle>
                        Assignments
                    </NavLink>
                    <NavLink to ="/tasks" activeStyle>
                        Tasks
                    </NavLink>
                    <NavLink to ="/more" activeStyle>
                        More
                    </NavLink>
                    <NavLink to ="/signup" activeStyle>
                        Sign Up
                    </NavLink>
                </NavMenu>
                <NavBtn>
                    <NavBtnLink to="/">
                        Sign In
                    </NavBtnLink>
                </NavBtn>
            </Nav>
        </>
     );
}

export default Navbar;
