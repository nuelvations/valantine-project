import { createWalletClient, http, parseAbi, parseEther } from "viem";
import { privateKeyToAccount, type Address } from "viem/accounts";
import { PRIVATE_KEY } from "./env.utils";
import { base } from "viem/chains";

const account = privateKeyToAccount(PRIVATE_KEY);

export const walletClient = createWalletClient({
  account,
  transport: http(),
  chain: base
});


export const claimTangle = async (recipientAddress: Address) => {
  try {
    await walletClient.writeContract({
      address: "0x5DA0E2A86e4B0A51462B87f448853c428621ab07",
      abi: parseAbi(["function transfer(address to, uint256 amount)"]),
      functionName: "transfer",
      args: [recipientAddress, parseEther("100")],
      account,
      chain: base
    });
  } catch (error) {
    console.error('Error claiming Tangle:', error);
  }
}