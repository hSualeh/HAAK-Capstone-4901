import styled from 'styled-components'
import { NavLink as Link} from 'react-router-dom'
import { FaBars } from 'react-icons/fa'

export const Nav = styled.nav`
    background: #0b0c10;
    heignt: 80px;
    display: flex;
    justify-content: space-between;
    padding: 0.5rem calc((100vw - 1000px) / 2);
    z-index: 10;
`

export const NavLink = styled(Link)`
    color: #66fcf1;
    text-decoration: none;
    display: flex;
    allign-items: center;
    padding: 0 1rem;
    height: 50%;
    cursor: pointer;

    &.active{
        color: #c5c6c7;
    }
`
export const Bars = styled(FaBars)`
    display: none;
    color: #66fcf1;
    height: 5%;
    left: 90vw;

    @media screen and (max-width: 768px){
        display: block;
        position: absolute;
        top: 0;
        right 0;
        transform: translated(-100%, 75%);
        font-size: 1.8rem;
        cursor:pointer;
    }
`

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    margin-right: -24px;
    
    @media screen and (max-width: 768px){
        display: none;
    }
`

export const NavBtn = styled.nav`
    display: flex;
    align-items: center;
    margin-right: 24px;

    @media screen and (max-width: 768px){
        display: none;
    }
`

export const NavBtnLink = styled(Link)`
    border-radius: 4px;
    background: #1f2833;
    padding 10px;
    color: #66fcf1;
    border: solid;
    border-color: #66fcf1;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;

    &.hover {
        transition: all 0.2s ease-in-out;
        background: #242424;
        color: #c5c6c7;
    }

`