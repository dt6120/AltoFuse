import React, { Component } from 'react';
import { CardGroup, Card, Button, Form } from 'react-bootstrap';
import web3 from '../ethereum/getweb3';
import ipfs from '../ethereum/getIpfs';
import contract from '../ethereum/getContract';
import ipfsmeta from '../ethereum/IPFSmetadata.json';

class Colab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ipfsHashAudio:null,
      ipfshashfull:null,
      buffer:'',
      buffer2:'',
      ethAddress:'',
      term: '',
      viewPrice: 0,
      transactionHash:'',
      name:'',
      noa:'',
      colabstat:"Collab status here",
      appstat:"Final result here"
    };

    this.captureFile = this.captureFile.bind(this);
    this.convertToBuffer = this.convertToBuffer.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onSubmit2 = this.onSubmit2.bind(this);
    this.setViewPrice = this.setViewPrice.bind(this);
    this.setName = this.setName.bind(this);
    this.checkcolab = this.checkcolab.bind(this);
    this.showcolab = this.showcolab.bind(this);
    this.approvecolab = this.approvecolab.bind(this);
    this.disapprovecolab = this.disapprovecolab.bind(this);
  }

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
        contract.methods.requestColab(1, this.state.ipfshashfull).send({
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
    setName = async (event) => {
      event.preventDefault();
      this.setState({name:event.target.value});
    }
    setnoa = async (event) => {
      event.preventDefault();
      this.setState({noa:event.target.value});
    }
    checkcolab = async (event)=>{
      this.setState({colabstat:"Loading..."})
      const accounts = await web3.eth.getAccounts();
      event.preventDefault();
      var colabprogress= await contract.methods.checkColab(1).send({
        from: accounts[0]
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({transactionHash});
      });
      if(colabprogress)
      {
        this.setState({colabstat:"Your Colab Request is Under Review"})
      }
      else {
        this.setState({colabstat:"Congratulations Your Request have been accepted"})
      }
    }
    showcolab = async () => {
      const accounts = await web3.eth.getAccounts();
      const { match: { params } } = this.props;
      var colab= await contract.methods.viewColab(params.id).send({
        from: accounts[0]
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({transactionHash});
      });
      //colab ko show kaise karu??? hash ke saath
      this.setState({});
    }
    approvecolab = async () => {
      this.setState({appstat:"Loading..."})
      const accounts = await web3.eth.getAccounts();
      const { match: { params } } = this.props;
      var colab= await contract.methods.approveColab(params.id,true).send({
        from: accounts[0]
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({transactionHash});
      });
      //colab ko show kaise karu??? hash ke saath
      this.setState({appstat:"Colab Has been approved"});
    }
    disapprovecolab = async () => {
      this.setState({appstat:"Loading..."})
      const accounts = await web3.eth.getAccounts();
      const { match: { params } } = this.props;
      var colab= await contract.methods.approveColab(params.id,false).send({
        from: accounts[0]
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({transactionHash});
      });
      //colab ko show kaise karu??? hash ke saath
      this.setState({appstat:"Colab Has been disapproved"});
    }

render() {

     return (<>
       <img src="colab_banner.png" alt="collab banner" width="100%" />
         <div className="m-5">
           <CardGroup>
           <Card>
             <Card.Body>
             <Form onSubmit={this.onSubmit}>
               <Card.Title>Request For Collab</Card.Title>
               <Card.Text>
               <view>Enter Your Name</view>
                 <input className="inp1" OnChange = {this.setnoa}/>
               </Card.Text>
               <Card.Text>
               <view>Enter Track Name</view>
                 <input className="inp1" OnChange={this.setName} />
               </Card.Text>
               <Card.Text>
               <label for="file-upload" class="custom-file-upload">
               <i class="IPFS-cloud-upload"></i> Select Audio File
               </label>
               <input id="file-upload" type="file" onChange = {this.captureFile} />
               </Card.Text>
               <Button
               variant="primary"
               type="submit">
               Upload Your File
               </Button>
              </Form>
             </Card.Body>
             <Card.Footer>
             <small className="text-muted">{this.state.ipfshashfull}</small>
             </Card.Footer>
           </Card>
           <Card>
             <Card.Body>
               <Card.Title>Check Colab Status </Card.Title>
               <Card.Text>
               <Button
               variant="primary"
               OnClick = {this.checkcolab}>
               Check now
               </Button>
               </Card.Text>
             </Card.Body>
             <Card.Footer>
               <small className="text-muted">{this.state.colabstat}</small>
             </Card.Footer>
           </Card>
           <Card>
             <Card.Body>
               <Card.Title>Approve Colab Request</Card.Title>
               <Card.Text>
                 You are the owner!?
               </Card.Text>
               <Button
               variant="primary"
               OnClick = {this.checkcolab}>
               Check Colabs
               </Button>
               <Card.Text>
               <Button
               variant="primary"
               OnClick = {this.approvecolab}>
               Approve Colab
               </Button>
               <Button
               variant="primary"
               OnClick = {this.disapprovecolab}>
               DisApprove Colab
               </Button>
               </Card.Text>
             </Card.Body>
             <Card.Footer>
             <Card.Footer>
               <small className="text-muted">{this.state.appstat}</small>
             </Card.Footer>
             </Card.Footer>
           </Card>
         </CardGroup>
         </div>
         </>
     );
    }
}

export default Colab;
