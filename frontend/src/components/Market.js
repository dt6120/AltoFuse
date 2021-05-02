import React, { useState, useEffect } from 'react';
import { Card, Button, Jumbotron } from 'react-bootstrap';
import SellCard from './SellCard';
import contract from '../ethereum/getContract';

const Market = () => {
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
            return <SellCard key={id} id={id} />
        })

        setCards(musicCards);
    };
    return (
        <div>
            <img src="marketplace_banner.png" alt="market" width="100%" />
            <div>
                {cards}
            </div>
        </div>
    );
};

export default Market;
