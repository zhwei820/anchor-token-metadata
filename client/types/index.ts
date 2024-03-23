import * as AnchorField from "./AnchorField"

export { InitializeData } from "./InitializeData"
export type { InitializeDataFields, InitializeDataJSON } from "./InitializeData"
export { UpdateFieldData } from "./UpdateFieldData"
export type {
  UpdateFieldDataFields,
  UpdateFieldDataJSON,
} from "./UpdateFieldData"
export { AnchorField }

export type AnchorFieldKind =
  | AnchorField.Name
  | AnchorField.Symbol
  | AnchorField.Uri
  | AnchorField.Key
export type AnchorFieldJSON =
  | AnchorField.NameJSON
  | AnchorField.SymbolJSON
  | AnchorField.UriJSON
  | AnchorField.KeyJSON
