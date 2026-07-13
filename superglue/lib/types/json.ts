/**
 * A JSON Primitive value
 */
export type JSONPrimitive = string | number | boolean | null | undefined

/**
 * A JSON Object
 */
export type JSONObject = {
  [key: string]: JSONValue
}

/**
 * A JSON Object or an array of values
 */
export type JSONMappable = JSONValue[] | JSONObject

/**
 * A array of JSON key value objects or a JSON Object
 */
export type JSONKeyable = JSONObject[] | JSONObject

/**
 * A primitive or a mappable object
 */
export type JSONValue = JSONPrimitive | JSONMappable
