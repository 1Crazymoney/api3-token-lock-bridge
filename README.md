# API3 Token Lock External Bridge
A TypeScript serverless function, triggered periodically to filter the latest N blocks for
Authorization events from `API3TokenLockExternal.sol`, each of which has data about a client whitelisting on a given side-chain.
Based on the event log data, the function executes a client whitelisting transaction to a `API3Authorizer.sol`, which is deployed on a specific side-chain.

## How to run?

### Prerequisites

```
npm install -g serverless
```

* Logged into AWS or saved `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Configuration

```
cd api3-token-lock-external-bridge
npm install
```

Create `security.json` in the default directory. The file stores the environment variables, used to run the application
```json
{
  "BLOCKS_BEHIND": "",
  "TOKEN_LOCK_EXTERNAL_PROVIDER": "",
  "TOKEN_LOCK_EXTERNAL_CONTRACT_ADDRESS": ""
}
```

where:

`BLOCKS_BEHIND` - How many blocks before the current block will be queried.

`TOKEN_LOCK_EXTERNAL_PROVIDER` - The JSON-RPC provider of the network on which `API3TokenLockExternal.sol` is deployed.

`TOKEN_LOCK_EXTERNAL_CONTRACT_ADDRESS` - The address of the `API3TokenLockExternal.sol`.

Populate `src/config.json` with the network configurations for `API3Authorizer.sol` on the different networks:

```json
[
  {
    "api3Authorizer": "",
    "privateKey": "",
    "chainId": 0,
    "provider": ""
  },
  ...
]
```
where:

`api3Authorizer` - The address of the `API3Authorizer.sol`.

`privateKey` - The private key, which is a super admin in `API3Authorizer.sol`.

`chainId` - The chain id on which `API3Authorizer.sol` is deployed.

`provider` - The JSON-RPC provider to the target chain.

### Deploy

After `security.json` is created and `config.json` is populated, execute:
```
serverless deploy --region $REGION --stage $STAGE
```
