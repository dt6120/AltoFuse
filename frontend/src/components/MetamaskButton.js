import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class MetamaskButton extends Component {
    constructor() {
        super();

        this.connectToMetamask = this.connectToMetamask.bind(this);
    }

    async connectToMetamask() {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.log(error.message);
        }
    }

    render() {
        return (
            <Button variant="warning" onClick={this.connectToMetamask}>Connect to MetaMask</Button>
        );
    }
}

export default MetamaskButton;
