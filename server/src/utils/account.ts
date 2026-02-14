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
      address: "0xYourTangleContractAddress",
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