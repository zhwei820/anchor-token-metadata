import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface InitializeDataFields {
  name: string
  symbol: string
  uri: string
}

export interface InitializeDataJSON {
  name: string
  symbol: string
  uri: string
}

export class InitializeData {
  readonly name: string
  readonly symbol: string
  readonly uri: string

  constructor(fields: InitializeDataFields) {
    this.name = fields.name
    this.symbol = fields.symbol
    this.uri = fields.uri
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.str("name"), borsh.str("symbol"), borsh.str("uri")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitializeData({
      name: obj.name,
      symbol: obj.symbol,
      uri: obj.uri,
    })
  }

  static toEncodable(fields: InitializeDataFields) {
    return {
      name: fields.name,
      symbol: fields.symbol,
      uri: fields.uri,
    }
  }

  toJSON(): InitializeDataJSON {
    return {
      name: this.name,
      symbol: this.symbol,
      uri: this.uri,
    }
  }

  static fromJSON(obj: InitializeDataJSON): InitializeData {
    return new InitializeData({
      name: obj.name,
      symbol: obj.symbol,
      uri: obj.uri,
    })
  }

  toEncodable() {
    return InitializeData.toEncodable(this)
  }
}
