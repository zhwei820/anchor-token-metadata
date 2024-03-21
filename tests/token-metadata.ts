const { describe, it } = require("mocha");

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenMetadata as AnchorTokenMetadata } from "../target/types/token_metadata";
import {
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  getMint,
  getMetadataPointerState,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  unpack,
  pack,
  TokenMetadata,
  createUpdateFieldInstruction,
} from "@solana/spl-token-metadata";

describe("token-metadata", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .TokenMetadata as Program<AnchorTokenMetadata>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // Generate a new mint keypair
  const mintKeypair = Keypair.generate();
  const mintPublicKey = mintKeypair.publicKey;
  const decimals = 9;

  // Find the Program Derived Address (PDA) for metadata
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), mintPublicKey.toBuffer()],
    program.programId
  );

  // Define token metadata
  const metaData: TokenMetadata = {
    updateAuthority: wallet.publicKey,
    mint: mintPublicKey,
    name: "name",
    symbol: "symbol",
    uri: "uri",
    additionalMetadata: [
      ["key1", "value1"],
      ["key1", ""], // Remove value
    ],
  };

  it("Is initialized!", async () => {
    // Calculate size and lamports required for mint account
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen
    );

    // Create account and initialize instructions
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintPublicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    // Enable MetadataPointer extension on mint account
    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mintPublicKey,
        wallet.publicKey, // Pointer update authority
        metadataPDA,
        TOKEN_2022_PROGRAM_ID
      );

    // Initialize mint account data
    const initializeMintInstruction = createInitializeMintInstruction(
      mintPublicKey,
      decimals,
      wallet.publicKey, // Mint authority
      null, // Freeze authority
      TOKEN_2022_PROGRAM_ID
    );

    // Create and initialize metadata account using our custom metadata program
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: program.programId,
      metadata: metadataPDA,
      updateAuthority: metaData.updateAuthority,
      mint: mintPublicKey,
      mintAuthority: wallet.publicKey,
      name: metaData.name,
      symbol: metaData.symbol,
      uri: metaData.uri,
    });

    // Additional accounts required by our instruction
    // Used to create the metadata account via CPI in the program instruction
    initializeMetadataInstruction.keys.push(
      { isSigner: true, isWritable: true, pubkey: wallet.publicKey },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId }
    );

    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction
    );

    const transactionSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer, mintKeypair],
      { skipPreflight: true, commitment: "confirmed" }
    );

    console.log(
      "\nCreate Mint Account:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );

    // Check mint account metadata pointer matches the PDA
    const mintInfo = await getMint(
      connection,
      mintPublicKey,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );
    const metadataPointer = getMetadataPointerState(mintInfo);
    console.log(
      "\nMetadata Pointer:",
      JSON.stringify(metadataPointer, null, 2)
    );
    console.log("\nMetadata PDA:", metadataPDA.toString());

    // Check metadata account data updated correctly
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    // Metadata starts with offset of 12 bytes
    // 8 byte discriminator + 4 byte extra offset? (not sure)
    let unpackedData = unpack(metadataAccount.data.subarray(12));
    console.log("\nMetadata:", JSON.stringify(unpackedData, null, 2));

    // const validIndex = findValidUnpackIndex(metadataAccount.data);
  });

  it("Update Field, add data", async () => {
    const updateFieldInstruction = createUpdateFieldInstruction({
      programId: program.programId, // custom metadata program
      metadata: metadataPDA, // use mint as metadata address
      updateAuthority: metaData.updateAuthority,
      field: metaData.additionalMetadata[0][0],
      value: metaData.additionalMetadata[0][1],
    });
    // Additional accounts required by our instruction
    // Used to create the metadata account via CPI in the program instruction
    updateFieldInstruction.keys.push(
      { isSigner: false, isWritable: false, pubkey: mintPublicKey },
      { isSigner: true, isWritable: true, pubkey: wallet.publicKey },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId }
    );

    const transaction = new Transaction().add(updateFieldInstruction);

    const transactionSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true, commitment: "confirmed" }
    );

    console.log(
      "\nCreate Mint Account:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );

    // Check mint account metadata pointer matches the PDA
    const mintInfo = await getMint(
      connection,
      mintPublicKey,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );
    const metadataPointer = getMetadataPointerState(mintInfo);
    console.log(
      "\nMetadata Pointer:",
      JSON.stringify(metadataPointer, null, 2)
    );
    console.log("\nMetadata PDA:", metadataPDA.toString());

    // Check metadata account data updated correctly
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    // Metadata starts with offset of 12 bytes
    // 8 byte discriminator + 4 byte extra offset? (not sure)
    let unpackedData = unpack(metadataAccount.data.subarray(12));
    console.log("\nMetadata:", JSON.stringify(unpackedData, null, 2));

    // const validIndex = findValidUnpackIndex(metadataAccount.data);
  });

  it("Update Field, reduce data", async () => {
    const updateFieldInstruction = createUpdateFieldInstruction({
      programId: program.programId, // custom metadata program
      metadata: metadataPDA, // use mint as metadata address
      updateAuthority: metaData.updateAuthority,
      field: metaData.additionalMetadata[0][0],
      value: metaData.additionalMetadata[1][1],
    });
    // Additional accounts required by our instruction
    // Used to create the metadata account via CPI in the program instruction
    updateFieldInstruction.keys.push(
      { isSigner: false, isWritable: false, pubkey: mintPublicKey },
      { isSigner: true, isWritable: true, pubkey: wallet.publicKey },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId }
    );

    const transaction = new Transaction().add(updateFieldInstruction);

    const transactionSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true, commitment: "confirmed" }
    );

    console.log(
      "\nCreate Mint Account:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );

    // Check mint account metadata pointer matches the PDA
    const mintInfo = await getMint(
      connection,
      mintPublicKey,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );
    const metadataPointer = getMetadataPointerState(mintInfo);
    console.log(
      "\nMetadata Pointer:",
      JSON.stringify(metadataPointer, null, 2)
    );
    console.log("\nMetadata PDA:", metadataPDA.toString());

    // Check metadata account data updated correctly
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    // Metadata starts with offset of 12 bytes
    // 8 byte discriminator + 4 byte extra offset? (not sure)
    let unpackedData = unpack(metadataAccount.data.subarray(12));
    console.log("\nMetadata:", JSON.stringify(unpackedData, null, 2));

    // const validIndex = findValidUnpackIndex(metadataAccount.data);
  });
});

function findValidUnpackIndex(tlvData) {
  for (let i = 0; i < tlvData.length; i++) {
    try {
      // Try to unpack starting from index 'i'
      const metadata = unpack(tlvData.slice(i));

      // If unpacking is successful, log the metadata and return the index
      console.log("Successful unpack at index:", i);
      console.log("Metadata:", JSON.stringify(metadata, null, 2));
      return i;
    } catch (error) {
      // If an error occurs, continue to the next index
      // console.log("Unpack failed at index:", i, "Error:", error.message);
    }
  }
  // If no successful unpacking, return an indication
  return -1;
}
