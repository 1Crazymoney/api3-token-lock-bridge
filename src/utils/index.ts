import { providers, utils } from "ethers";

import { EventAuthorize } from "../constants";
import { AuthorizeEvent } from "../types";

export function parseLogs(logs: providers.Log[]): Record<number, AuthorizeEvent[]> {
  const ABI = new utils.Interface([EventAuthorize]);

  const parsedLogs = logs.map((l) => ({
    blockNumber: l.blockNumber,
    logIndex: l.logIndex,
    transactionHash: l.transactionHash,
    parsedLog: (ABI.parseLog(l).args as any)
  })) as AuthorizeEvent[];

  return groupEventsByChainId(parsedLogs);
}

function groupEventsByChainId(events: AuthorizeEvent[]): Record<number, AuthorizeEvent[]> {
  return events.reduce((groups, item: AuthorizeEvent) => ({
    ...groups,
    [item.parsedLog.chainId.toNumber()]: [...(groups[item.parsedLog.chainId.toNumber()] || []), item]
  }), {} as Record<number, AuthorizeEvent[]>);
}
