import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface NameJSON {
  kind: "Name"
}

export class Name {
  static readonly discriminator = 0
  static readonly kind = "Name"
  readonly discriminator = 0
  readonly kind = "Name"

  toJSON(): NameJSON {
    return {
      kind: "Name",
    }
  }

  toEncodable() {
    return {
      Name: {},
    }
  }
}

export interface SymbolJSON {
  kind: "Symbol"
}

export class Symbol {
  static readonly discriminator = 1
  static readonly kind = "Symbol"
  readonly discriminator = 1
  readonly kind = "Symbol"

  toJSON(): SymbolJSON {
    return {
      kind: "Symbol",
    }
  }

  toEncodable() {
    return {
      Symbol: {},
    }
  }
}

export interface UriJSON {
  kind: "Uri"
}

export class Uri {
  static readonly discriminator = 2
  static readonly kind = "Uri"
  readonly discriminator = 2
  readonly kind = "Uri"

  toJSON(): UriJSON {
    return {
      kind: "Uri",
    }
  }

  toEncodable() {
    return {
      Uri: {},
    }
  }
}

export type KeyFields = [string]
export type KeyValue = [string]

export interface KeyJSON {
  kind: "Key"
  value: [string]
}

export class Key {
  static readonly discriminator = 3
  static readonly kind = "Key"
  readonly discriminator = 3
  readonly kind = "Key"
  readonly value: KeyValue

  constructor(value: KeyFields) {
    this.value = [value[0]]
  }

  toJSON(): KeyJSON {
    return {
      kind: "Key",
      value: [this.value[0]],
    }
  }

  toEncodable() {
    return {
      Key: {
        _0: this.value[0],
      },
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.AnchorFieldKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("Name" in obj) {
    return new Name()
  }
  if ("Symbol" in obj) {
    return new Symbol()
  }
  if ("Uri" in obj) {
    return new Uri()
  }
  if ("Key" in obj) {
    const val = obj["Key"]
    return new Key([val["_0"]])
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(obj: types.AnchorFieldJSON): types.AnchorFieldKind {
  switch (obj.kind) {
    case "Name": {
      return new Name()
    }
    case "Symbol": {
      return new Symbol()
    }
    case "Uri": {
      return new Uri()
    }
    case "Key": {
      return new Key([obj.value[0]])
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Name"),
    borsh.struct([], "Symbol"),
    borsh.struct([], "Uri"),
    borsh.struct([borsh.str("_0")], "Key"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
