import { Card, Button } from 'react-bootstrap';

const Home = (props) => {
    return (
        <div>
            <img src="banner_alto.png" alt="welcome" width="100%" />
            <div className="row m-5">
                <div className="col-4">
                    <Card>
                        <Card.Header>Pay once, play forever</Card.Header>
                        <Card.Body>
                            A user can pay a one time fee giving them the lifetime access to that song stored on the IPFS and represented on the blockchain as an NFT. This also enables them to get access to future versions of that song, in case other artists collaborate.
                        </Card.Body>
                        <Card.Footer>
                            <Button variant="success" href="/songs">View songs</Button>
                        </Card.Footer>
                    </Card>
                </div>
                <div className="col-4">
                    <Card>
                        <Card.Header>Collaborate with other artists</Card.Header>
                        <Card.Body>
                            An artist can put a collaboration request with an existing song. The existing owners of that song can vote on whether to accept or reject the request, thus making the process decentralized, and giving power in the hand of the owners.
                        </Card.Body>
                        <Card.Footer>
                            <Button variant="warning" href="/collab">Collab now</Button>
                        </Card.Footer>
                    </Card>
                </div>
                <div className="col-4">
                    <Card>
                        <Card.Header>Put up song on sale</Card.Header>
                        <Card.Body>
                            {/* The owners of a song can decide to put up their song on sale. This requires majority vote to go ahead. Once the owners seal a bid, the bidder can buy the song and ownership gets transferred post payment which is managed through a smart contract. */}
                            The owners of a song can decide to put up their song on sale. This allows collectors to view them and if interested, payment is made and each owner gets their fair share as payment division is managed through smart contracts and ownership is transferred.
                        </Card.Body>
                        <Card.Footer>
                            <Button variant="danger" href="market">Buy songs</Button>
                        </Card.Footer>
                    </Card>
                </div>
            </div>
            <div className="row m-5">
                <h3>
                    Are you an artist?
                    <Button variant="info" className="ml-5" href="/register">Add music now</Button>
                </h3>
            </div>
        </div>
    );
};

export default Home;
