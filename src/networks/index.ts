import { Wallet, ethers } from "ethers";

import { NetworkConfiguration } from "../types";

export async function loadNetworkConfigurations(networkConfig: any): Promise<NetworkConfiguration[]> {
  if (networkConfig.length === 0) {
    throw new Error('No configurations for networks found.');
  }

  const configurations = [];
  for (const c of networkConfig) {
    configurations.push(loadNetworkConfiguration(c));
  }

  return Promise.all(configurations);
}

async function loadNetworkConfiguration(config: any): Promise<NetworkConfiguration> {
  const wallet = new Wallet(config.privateKey);
  const provider = new ethers.providers.JsonRpcProvider(config.provider);
  const transactionCount = await provider.getTransactionCount(wallet.address);

  return {
    api3Authorizer: config.api3Authorizer,
    chainId: config.chainId,
    gasPrice: config.gasPrice,
    provider: provider,
    transactionCount: transactionCount,
    wallet: wallet
  } as NetworkConfiguration;
}
