import { BigNumber, ethers } from "ethers";

export interface AuthorizeLog {
  readonly chainId: BigNumber
  readonly airnodeId: string
  readonly clientAddress: string
  readonly expiration: BigNumber
}

export interface AuthorizeEvent {
  readonly blockNumber: number;
  readonly transactionHash: string
  readonly logIndex: number
  readonly parsedLog: AuthorizeLog
}

export interface NetworkConfiguration {
  readonly api3Authorizer: string // Address of Api3Authorizer
  readonly chainId: number;
  readonly gasPrice: ethers.BigNumber | null;
  readonly provider: ethers.providers.JsonRpcProvider;
  transactionCount: number;
  readonly wallet: ethers.Wallet;
}
