import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateFieldDataFields {
  /** Field to update in the metadata */
  field: types.AnchorFieldKind
  /** Value to write for the field */
  value: string
}

export interface UpdateFieldDataJSON {
  /** Field to update in the metadata */
  field: types.AnchorFieldJSON
  /** Value to write for the field */
  value: string
}

export class UpdateFieldData {
  /** Field to update in the metadata */
  readonly field: types.AnchorFieldKind
  /** Value to write for the field */
  readonly value: string

  constructor(fields: UpdateFieldDataFields) {
    this.field = fields.field
    this.value = fields.value
  }

  static layout(property?: string) {
    return borsh.struct(
      [types.AnchorField.layout("field"), borsh.str("value")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdateFieldData({
      field: types.AnchorField.fromDecoded(obj.field),
      value: obj.value,
    })
  }

  static toEncodable(fields: UpdateFieldDataFields) {
    return {
      field: fields.field.toEncodable(),
      value: fields.value,
    }
  }

  toJSON(): UpdateFieldDataJSON {
    return {
      field: this.field.toJSON(),
      value: this.value,
    }
  }

  static fromJSON(obj: UpdateFieldDataJSON): UpdateFieldData {
    return new UpdateFieldData({
      field: types.AnchorField.fromJSON(obj.field),
      value: obj.value,
    })
  }

  toEncodable() {
    return UpdateFieldData.toEncodable(this)
  }
}
