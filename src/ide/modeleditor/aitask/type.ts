export default interface Type {
  name: string
  properties: Property[]
}

export interface Property {
  name: string
  cardinality: string
  description: string
  class: string
}
