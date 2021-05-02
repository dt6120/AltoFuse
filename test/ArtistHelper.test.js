const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtistHelper", () => {
    let contract, artist_1, artist_2;
    before(async () => {
        let Contract = await ethers.getContractFactory("ArtistHelper");
        contract = await Contract.deploy();
        await contract.deployed();

        [artist_1, artist_2] = await ethers.getSigners();
    });

    describe("deployment", () => {
        it("deploys successfully", async () => {
            expect(contract.address).to.not.be.null;
        });
    });

    describe("addNewArtist", () => {
        it("adds new artist", async () => {
            const oldArtistCount = await contract.getArtistCount();

            const tx = await contract.connect(artist_1).addNewArtist("artist-info-uri-1");
            const receipt = await tx.wait();

            const newArtistCount = await contract.getArtistCount();

            expect(newArtistCount).to.equal(oldArtistCount + 1);
        });
    });
});
