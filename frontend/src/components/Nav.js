import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import MetamaskButton from './MetamaskButton';

const Header = (props) => {
    return (
        <React.Fragment>
            <Navbar variant="light" className="custom-color">
                <Navbar.Brand href="/"><img src="altofuse.png" alt="Home" height="41" width="41" /></Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href={'/songs'}>Music List</Nav.Link> {/* Only if props.address is a creator */}
                        <Nav.Link href={'/register'}>Add music</Nav.Link>
                        <Nav.Link href={'/collab'}>Collab</Nav.Link>
                        <Nav.Link href={'/market'}>Market</Nav.Link>
                    </Nav>
                    <Nav>
                        { props.account !== null ? <>Connected account:&nbsp;<strong>{props.account}</strong></> : <MetamaskButton /> }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </React.Fragment>
    );
}

export default Header;