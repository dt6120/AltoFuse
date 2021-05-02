import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import contract from '../ethereum/getContract';

const SellCard = (props) => {
    const [media, setMedia] = useState(null);
    const [name, setName] = useState(null);
    const [buyPrice, setBuyPrice] = useState(null);
    const [owners, setOwners] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [isOnSale, setIsOnSale] = useState(null);
    const [visible, setVisible] = useState(null);

    useEffect(() => {
        setInfo();
        mediaShow();
    }, [visible]);

    const setInfo = async () => {
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        let isVisible = await contract.methods.viewNow(props.id).call({ from: address });
        const isOnSale = await contract.methods.isOnSale(props.id).call();

        const result = await contract.methods.getNftInfo(props.id).call();
        const uri = result[0]
        const myBuyPrice = result[3].toString();
        const myOwners = result[1].map(owner => owner.toLowerCase());
        const isOwner = myOwners.includes(address)

        isVisible = isVisible || isOwner;

        const res = await fetch(`https://ipfs.infura.io/ipfs/${uri}`);
        const info = await res.json();

        setName(info.name);
        setBuyPrice(myBuyPrice);
        setOwners(myOwners);
        setIsOwner(isOwner);
        setIsOnSale(isOnSale);
        setVisible(isVisible);
    }

    const mediaShow = () => {
        let myMedia = (
            <>
                <Card className="m-5">
                    <Card.Header>
                        <div className="row">
                            {/* <div className="col-3"><img src="" alt="album art" /></div> */}
                            <div className="col-9">Song name: {name}</div>
                        </div>
                        <div className="row mt-3">
                            Owners: {owners}
                        </div>
                    </Card.Header>
                    <Card.Body>
                        To buy &nbsp;
                        <Button variant="info" onClick={() => buySong()}>Pay {buyPrice} wei</Button>
                    </Card.Body>
                    <Card.Footer>
                        {isOwner ? removeSale : null}
                    </Card.Footer>
                </Card>
            </>
        )
        setMedia(isOnSale ? myMedia : null);
    };

    const buySong = async () => {
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        if (isOwner) {
            window.alert("Owner cannot buy song");
        } else {
            await contract.methods.buy(props.id).send({ from: address, value: buyPrice });
            setVisible(true);
        }
    }

    const removeFromSale = async () => {
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        if (!isOwner) {
            window.alert("Only owner can remove from sale");
        } else {
            await contract.methods.removeFromSale(props.id).send({ from: address });
        }
    };

    const removeSale = (
        <Button variant="danger" onClick={removeFromSale}>Remove from sale</Button>
    );

    return (
        <>
            {media}
        </>
    );
};

export default SellCard;
