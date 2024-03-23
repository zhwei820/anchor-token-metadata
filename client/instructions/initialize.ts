import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeArgs {
  data: types.InitializeDataFields
}

export interface InitializeAccounts {
  metadata: PublicKey
  updateAuthority: PublicKey
  mint: PublicKey
  mintAuthority: PublicKey
  payer: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([types.InitializeData.layout("data")])

export function initialize(
  args: InitializeArgs,
  accounts: InitializeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.metadata, isSigner: false, isWritable: false },
    { pubkey: accounts.updateAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.mintAuthority, isSigner: true, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      data: types.InitializeData.toEncodable(args.data),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
