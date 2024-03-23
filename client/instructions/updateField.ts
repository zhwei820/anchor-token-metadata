import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateFieldArgs {
  data: types.UpdateFieldDataFields
}

export interface UpdateFieldAccounts {
  metadata: PublicKey
  updateAuthority: PublicKey
  mint: PublicKey
  payer: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([types.UpdateFieldData.layout("data")])

export function updateField(
  args: UpdateFieldArgs,
  accounts: UpdateFieldAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.metadata, isSigner: false, isWritable: false },
    { pubkey: accounts.updateAuthority, isSigner: true, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([164, 49, 117, 6, 187, 205, 13, 217])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      data: types.UpdateFieldData.toEncodable(args.data),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
