import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './components/Home';
import MusicList from './components/MusicList';
import Register from './components/Register';
import Market from './components/Market';
import Colab from './components/colab';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    getAddress()
  }, [address]);

  const getAddress = async () => {
    setAddress((await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]);
  };

  return (
    <Router>
      <div>
        <Nav account={address}/>
          <Route path="/" exact component={Home} />
          <Route path="/songs" exact component={MusicList} />
          <Route path="/register" exact component={Register} />
          <Route path="/market" exact component={Market} />
          <Route path="/collab/:id" exact component={Colab} />
      </div>
    </Router>
  )
}

export default App;
