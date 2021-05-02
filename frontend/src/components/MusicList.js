import React, { useState, useEffect } from 'react';
import { Jumbotron } from 'react-bootstrap';
import MusicCard from './MusicCard';
import contract from '../ethereum/getContract';

const MusicList = (props) => {
    const [cards, setCards] = useState(null);

    useEffect(() => {
        getCards();
    });

    const getCards = async () => {
        const count = await contract.methods.nfts().call();

        if (count === 0) {
            setCards((<h3>No songs deployed to network</h3>))
            return;
        }

        let ids = [];
        for (let i=1; i <= count; i++) {
            ids.push(i);
        }

        const musicCards = ids.map(id => {
            return <MusicCard key={id} id={id} />
        })

        setCards(musicCards);
    };

    return (
        <div>
            <img src="jumbo_banner.png" alt="music list" width="100%" />
            <div>
                {cards ? cards : "Loading..."}
            </div>
        </div>
    );
};

export default MusicList;
