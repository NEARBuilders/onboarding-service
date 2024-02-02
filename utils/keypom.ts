require("dotenv").config({ path: require("find-config")(".env") });

const { connect, KeyPair, keyStores, utils } = require("near-api-js");

const NETWORK = process.env.NEXT_PUBLIC_NETWORK;
const keyStore = new keyStores.InMemoryKeyStore();
const keypair = KeyPair.fromString(process.env.NEXT_PUBLIC_NEAR_PRIVATE_KEY);
const walletBase = process.env.WALLET_BASE

const setKeyStore = async () => {
  return await keyStore.setKey(
    NETWORK,
    process.env.NEXT_PUBLIC_CLIENT_ACCOUNT,
    keypair
  );
};

setKeyStore();
const config = {
  keyStore,
  networkId: `${NETWORK}`,
  nodeUrl: `https://rpc.${NETWORK}.near.org`
};

const addKey = async (dropId: number)  => {

  const near = await connect({ ...config, keyStore });
  const signerAccount = await near.account(
      process.env.NEXT_PUBLIC_CLIENT_ACCOUNT
    );

  const keypom_contract = process.env.NEXT_PUBLIC_KEYPOM_CONTRACT;
  const keyPair = await KeyPair.fromRandom("ed25519");
  const publicKeys = [];
  publicKeys.push(keyPair.publicKey.toString());

  //need this for trial account drop
  const deposit = utils.format.parseNearAmount("0.5")

  try {
      await signerAccount.functionCall({
          contractId: keypom_contract,
          methodName: "add_keys",
          args: {
            public_keys: publicKeys,
            drop_id: String(dropId),
        },
          gas: '250000000000000',
          attachedDeposit: String(deposit)
       });

       console.log(`${walletBase}/${keypom_contract}/${keyPair.secretKey}`)
       return(`${walletBase}/${keypom_contract}/${keyPair.secretKey}`)
    
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
}

export {addKey};