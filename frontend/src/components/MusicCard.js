import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import contract from '../ethereum/getContract';

const MusicCard = (props) => {
    const [media, setMedia] = useState(null);
    const [name, setName] = useState(null);
    const [source, setSource] = useState(null);
    const [viewPrice, setViewPrice] = useState(null);
    const [buyPrice, setBuyPrice] = useState(null);
    const [owners, setOwners] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [isOnSale, setIsOnSale] = useState(null);
    const [visible, setVisible] = useState(null);

    useEffect(() => {
        setInfo();
        mediaShow();
    }, [visible, isOnSale]);

    const setInfo = async () => {
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        let isVisible = await contract.methods.viewNow(props.id).call({ from: address });
        const isOnSale = await contract.methods.isOnSale(props.id).call();

        const result = await contract.methods.getNftInfo(props.id).call();
        const uri = result[0]
        const myViewPrice = result[2].toString();
        const myBuyPrice = result[3].toString();
        const myOwners = result[1].map(owner => owner.toLowerCase());
        const isOwner = myOwners.includes(address)

        isVisible = isVisible || isOwner;

        const res = await fetch(`https://ipfs.infura.io/ipfs/${uri}`);
        const info = await res.json();

        setName(info.name);
        setSource("https://ipfs.infura.io/ipfs/" + info.audio);
        setViewPrice(myViewPrice);
        setBuyPrice(myBuyPrice);
        setOwners(myOwners);
        setIsOwner(isOwner);
        setIsOnSale(isOnSale);
        setVisible(isVisible);
    }

    const mediaShow = () => {
        if (visible) {
            let myMedia = (
                <audio controls>
                    <source src={source} type="audio/mpeg" />
                </audio>
            );
            setMedia(myMedia);
        } else {
            let myMedia = <Button variant="info" onClick={() => payArtist()}>Pay {viewPrice} wei</Button>
            setMedia(myMedia);
        }
    };

    const payArtist = async () => {
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        await contract.methods.buyview(props.id).send({ from: address, value: viewPrice });
        setVisible(true);
    }

    const putForSale = async () => {
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        await contract.methods.putOnSale(props.id).send({ from: address });
    };

    const colab = async () => {
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
    };

    const sellButton = (
        <Button variant="success" onClick={putForSale}>Put up on sale for {buyPrice} wei</Button>
    );

    const colabButton = (
        <Button variant="warning" href={"collab/" + props.id}>Collab with this piece</Button>
    );

    return (
        <Card className="m-5">
            <Card.Header>
                <div className="row">
                    <div className="col-3">Token ID: {props.id}</div>
                    <div className="col-9">Song name: {name}</div>
                </div>
                <div className="row mt-3">
                    Owners: {owners}
                </div>
            </Card.Header>
            <Card.Body>
                {media}
            </Card.Body>
            <Card.Footer>
                {isOwner && !isOnSale ? sellButton : null}
                {!isOwner && !isOnSale ? colabButton : null}
            </Card.Footer>
        </Card>
    );
};

export default MusicCard;
