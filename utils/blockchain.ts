import * as Crypto from 'expo-crypto';
import type { User } from '@/types';

/**
 * Generates a blockchain ID using SHA-256 hash of user information
 * In production, this would include additional security measures like:
 * - Server-side salt generation
 * - Hardware security module (HSM) integration
 * - Multi-signature verification
 */
export async function generateBlockchainId(user: User): Promise<string> {
  const userData = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    timestamp: Date.now(),
    salt: 'tourist-safety-2024', // In production, use secure random salt
  };

  const dataString = JSON.stringify(userData);

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    dataString,
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  return `TSM-${hash.substring(0, 32).toUpperCase()}`;
}


/**
 * Creates a blockchain issuance payload
 * This is the structure that would be sent to a smart contract
 */
export interface BlockchainIssuancePayload {
  id: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
  metadata: {
    issuedAt: string;
    version: string;
  };
}

/**
 * Example of how to integrate with Ethereum/Polygon smart contract:
 * 
 * import { ethers } from 'ethers';
 * 
 * const CONTRACT_ADDRESS = '0x...'; // Your deployed contract address
 * const CONTRACT_ABI = [...]; // Your contract ABI
 * 
 * async function issueToEthereum(payload: BlockchainIssuancePayload) {
 *   // Connect to provider (MetaMask, WalletConnect, etc.)
 *   const provider = new ethers.providers.Web3Provider(window.ethereum);
 *   const signer = provider.getSigner();
 *   
 *   // Create contract instance
 *   const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
 *   
 *   // Call smart contract function
 *   const tx = await contract.issueTouristId(
 *     payload.id,
 *     payload.userInfo.name,
 *     payload.userInfo.email,
 *     payload.metadata.issuedAt
 *   );
 *   
 *   // Wait for transaction confirmation
 *   const receipt = await tx.wait();
 *   return receipt.transactionHash;
 * }
 * 
 * For Hyperledger Fabric integration:
 * 
 * import { Gateway, Wallets } from 'fabric-network';
 * 
 * async function issueToHyperledger(payload: BlockchainIssuancePayload) {
 *   // Create a new file system based wallet for managing identities
 *   const wallet = await Wallets.newFileSystemWallet('./wallet');
 *   
 *   // Create a new gateway for connecting to peer node
 *   const gateway = new Gateway();
 *   
 *   await gateway.connect(connectionProfile, {
 *     wallet,
 *     identity: 'user1',
 *     discovery: { enabled: true, asLocalhost: true }
 *   });
 *   
 *   // Get the network (channel) our contract is deployed to
 *   const network = await gateway.getNetwork('mychannel');
 *   
 *   // Get the contract from the network
 *   const contract = network.getContract('tourist-safety');
 *   
 *   // Submit the transaction
 *   const result = await contract.submitTransaction(
 *     'issueTouristId',
 *     payload.id,
 *     JSON.stringify(payload.userInfo),
 *     JSON.stringify(payload.metadata)
 *   );
 *   
 *   return result.toString();
 * }
 */

export function createIssuancePayload(
  id: string,
  userInfo: { name: string; email: string; phone: string },
  metadata: { issuedAt: string; version: string }
): BlockchainIssuancePayload {
  return {
    id,
    userInfo,
    metadata,
  };
}