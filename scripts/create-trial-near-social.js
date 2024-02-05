const { initKeypom, createTrialAccountDrop } = require('@keypom/core');
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { Account } = require('@near-js/accounts');
const { Near } = require("@near-js/wallet-account");
const { readFileSync } = require('fs');

require('dotenv').config()
const path = require("path");
const homedir = require("os").homedir();

const funderAccountId = 'jaswinders.testnet';
const NETWORK_ID = 'testnet';
async function createTrialAccount() {
	// Initiate connection to the NEAR blockchain.
    const CREDENTIALS_DIR = '.near-credentials';
    const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);

    let keyStore = new UnencryptedFileSystemKeyStore(credentialsPath);  

    let nearConfig = {
        networkId: NETWORK_ID,
        keyStore: keyStore,
        nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,//`https://rpc.testnet.harmonicguild.io`,//
        walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
        helperUrl: `https://helper.${NETWORK_ID}.near.org`,
        explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
    };  

    let near = new Near(nearConfig);
    fundingAccount = new Account(near.connection, funderAccountId);

	// Initialize the SDK and point it to the custom NEAR object that was created.
    await initKeypom({
		near,
		network: NETWORK_ID
	});

	// What contracts can the trial account call?
    const callableContracts = [
        'v1.social08.testnet'
    ]
    // What is the maximum amount of $NEAR that can be attached to a call for each callable contract?
    const maxAttachableNEARPerContract = [
        '1'
    ]
	// What methods can the trial account call?
	const callableMethods = [
		['*']
	]
    
    const DROP_CONFIG = {
    // How many claims can each key have.
    usesPerKey: 1,
    usage: {
        autoDeleteDrop: true,
        autoWithdraw: true
    }
    }
    const wasmDirectory = `${require('path').resolve(__dirname, '..')}/trial-accounts/ext-wasm/trial-accounts.wasm`
    const {keys} = await createTrialAccountDrop({
		account: fundingAccount,
        numKeys: 0,
        contractBytes: [...readFileSync(wasmDirectory)],
		// How much $NEAR should be made available to the trial account when it's created?
        startingBalanceNEAR: 0.1 + 0.1,
        callableContracts,
        callableMethods,
        maxAttachableNEARPerContract,
		// Once the trial account has spent this much $NEAR, the trial will be over.
        trialEndFloorNEAR: 0.09,
	    config: DROP_CONFIG
    })  

    

    const guestBookInstance = "http://localhost:1234/trial-url#"
    const keypomContractId = "v2.keypom.testnet"
    const delimiter = "/"
    const secretKey = keys.secretKeys[0]

    const alphaInstance = "http://localhost:3000/#trial-url/"

    console.log(`
    
    Guest-Book App:
 	${guestBookInstance}${keypomContractId}${delimiter}${secretKey}
    
    Alpha:
 	${alphaInstance}${keypomContractId}${delimiter}${secretKey}


 	Good Luck!
    `)
}

createTrialAccount();
