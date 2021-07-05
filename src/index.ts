import { Contract, providers, utils } from "ethers";
import dotenv from "dotenv";

import CONFIG from "./config.json";
import { Api3Authorizer } from "./abi";
import { TopicAuthorize } from "./constants";
import { loadNetworkConfigurations } from "./networks";
import { AuthorizeEvent, AuthorizeLog, NetworkConfiguration } from "./types";
import { parseLogs } from "./utils";

dotenv.config();

export async function bridgeEvents() {
  // Load network configurations
  const configs = await loadNetworkConfigurations(CONFIG);

  const provider: providers.JsonRpcProvider = new providers.JsonRpcProvider(process.env.TOKEN_LOCK_EXTERNAL_PROVIDER!);
  const currentBlock = await provider.getBlockNumber();

  // Filter logs
  const filter = {
    fromBlock: Math.max(0, currentBlock - Number(process.env.BLOCKS_BEHIND)),
    toBlock: currentBlock,
    address: process.env.TOKEN_LOCK_EXTERNAL_CONTRACT_ADDRESS!,
    topics: [
      utils.id(TopicAuthorize)
    ]
  };

  const logs = await provider.getLogs(filter);
  console.info(`${logs.length} logs found.`);

  const parsedLogs = await parseLogs(logs);

  const executions = [];
  for (const chainId in parsedLogs) {
    const events = parsedLogs[chainId];
    executions.push(executeEvents(configs, events));
  }
  await Promise.all(executions);
}

async function executeEvents(configs: NetworkConfiguration[], events: AuthorizeEvent[]): Promise<void> {
  for (const event of events) {
    // Get configuration for the target chain
    const log = event.parsedLog;
    const networkConfig = configs.find(c => c.chainId === log.chainId.toNumber());
    if (!networkConfig) {
      console.info(`Configuration for network [${log.chainId}] not found.`);
      continue;
    }

    // Connect wallet
    const connectedWallet = networkConfig.wallet.connect(networkConfig.provider);

    const contract = new Contract(networkConfig.api3Authorizer, Api3Authorizer, connectedWallet);
    const currentWhitelistingPeriod = await contract.airnodeIdToClientAddressToWhitelistExpiration(log.airnodeId, log.clientAddress);

    if (currentWhitelistingPeriod.eq(log.expiration)) {
      console.info(`[${event.transactionHash}-${event.logIndex}] - Whitelisting Expiration already set: [${log.expiration}].`);
      continue;
    }

    try {
      // Execute setWhitelistExpiration
      await contract.setWhitelistExpiration(log.airnodeId, log.clientAddress, log.expiration, { nonce: networkConfig.transactionCount++, gasPrice: networkConfig.gasPrice });
    } catch (err) {
      console.error(err);
    }
  }
}
