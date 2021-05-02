import React, { Component } from 'react';
import '../App.css';
import { Button, Table, Form } from 'react-bootstrap';
import web3 from '../ethereum/getweb3';
import ipfs from '../ethereum/getIpfs';
import contract from '../ethereum/getContract';
import ipfsmeta from '../ethereum/IPFSmetadata.json';

class Register extends Component {
  state = {
      ipfsHashAudio:null,
      ipfshashfull:null,
      buffer:'',
      buffer2:'',
      ethAddress:'',
      term: '',
      viewPrice: 0,
      buyPrice: 0,
      transactionHash:'',
      name:'',
      noa:''
    };
    captureFile =(event) => {
            event.stopPropagation()
            event.preventDefault()
            const file = event.target.files[0]
            let reader = new window.FileReader()
            reader.readAsArrayBuffer(file)
            reader.onloadend = () => this.convertToBuffer(reader)
          };

    convertToBuffer = async(reader) => {
            const buffer = await Buffer.from(reader.result);
            this.setState({buffer});
      };
    onSubmit = async (event) => {
          event.preventDefault();
          const accounts = await web3.eth.getAccounts();
          this.setState({ipfsHashAudio:"Loading...",ipfshashfull:"Loading..."})
          console.log('Sending from Metamask account: ' + accounts[0]);
          const ethAddress= await contract.options.address;
          this.setState({ethAddress});
          await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.log(err,ipfsHash);
            this.setState({ ipfsHashAudio:ipfsHash[0].hash });
            this.onSubmit2();
          });
        };
        onSubmit2 = async ()=> {
          const accounts = await web3.eth.getAccounts();
          ipfsmeta.name =this.state.name;
          ipfsmeta.name_of_artist = this.state.noa;
          ipfsmeta.audio = this.state.ipfsHashAudio;
          console.log(ipfsmeta);
          await ipfs.files.add(Buffer.from(JSON.stringify(ipfsmeta)), (err,ipfsHash) => {
            console.log(err,ipfsHash);
            this.setState({ ipfshashfull:ipfsHash[0].hash });
            contract.methods.mint(this.state.ipfsHashAudio, this.state.ipfshashfull,this.state.viewPrice, this.state.buyPrice).send({
              from: accounts[0]
            }, (error, transactionHash) => {
              console.log(transactionHash);
              this.setState({transactionHash});
            });
          });
        }

        setViewPrice = async (event) => {
          event.preventDefault();
          this.setState({viewPrice:event.target.value});
        }
        setBuyPrice = async (event) => {
          event.preventDefault();
          this.setState({buyPrice:event.target.value});
        }
        setName = async (event) => {
          event.preventDefault();
          this.setState({name:event.target.value});
        }
        setnoa = async (event) => {
          event.preventDefault();
          this.setState({noa:event.target.value});
        }


  render() {
    return (<>
      <img src="banner.png" alt="header" width="100%" />
      <div className="">
        {/* <header className="App-header">
          <h1> Upload your File and be live on our Decentralized Network! </h1>
        </header> */}

        <hr />

        <div className="centerbody">
          <Form onSubmit={this.onSubmit}>
            <view className="heading-2">Please Enter the View Price you want to set</view>
            <input className="input-vp"
            value= {this.state.viewPrice}
            onChange = {this.setViewPrice} />
            <br />
            <view className="heading-2">Please Enter the Buy Price you want to set</view>
            <input className="input-bp"
            value= {this.state.buyPrice}
            onChange = {this.setBuyPrice} />
            <div>
              <view className="a2">Enter the name of the track</view>
              <input className="input-a2"
              value= {this.state.name}
              onChange = {this.setName} />
            </div>
            <div>
              <view className="a3">Enter your name</view>
              <input className="input-a3"
              value= {this.state.noa}
              onChange = {this.setnoa}/>
            </div>
            <div className="file-input">
            <label for="file-upload" class="custom-file-upload">
              <i class="IPFS-cloud-upload"></i> Select Audio File
            </label>
            <input id="file-upload" type="file" onChange = {this.captureFile} />
            </div>
            <Button className="B1"
              bsStyle="primary"
              type="submit">
              Send it
            </Button>
          </Form>
        </div>
        <hr/>
        <div className="table">
          <Table bordered responsive>
            <thead>
              <tr>
                <th className="A">Values</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="B">IPFS Hash of Audio File</td>
                <td>{this.state.ipfsHashAudio}</td>
              </tr>
              <tr>
                <td className="C">Ethereum Contract Address</td>
                <td>{this.state.ethAddress}</td>
              </tr>
              <tr>
                <td className="D">Full IPFS hash</td>
                <td>{this.state.ipfshashfull}</td>
              </tr>
              <tr>
                <td className="E">You Can listen to your audio file</td>
                <td><a href={ `https://ipfs.infura.io/ipfs/${this.state.ipfsHashAudio}` } >here</a></td>
                <td className="F">After Uploading</td>
              </tr>
            </tbody>
          </Table>
        </div>

      </div>
      </>
);
  }
}

export default Register;
