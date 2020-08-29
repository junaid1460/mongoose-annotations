/* eslint max-classes-per-file: 0 */

import {
  Document,
  Model,
  model,
  Schema,
  SchemaOptions,
  SchemaTypeOpts,
  MongooseDocument,
} from "mongoose";
import "reflect-metadata";

import * as mongoose from 'mongoose'
export default mongoose


export const schemaSymbol = Symbol(undefined);
export const schemaClassSymbol = Symbol(undefined);
const schemaInstanceSymbol = Symbol(undefined);
const isDecoratedType = Symbol(undefined);
const isSchemaType = Symbol(undefined);
let defaults: {
  /**
   * If set to to false then assigned values will not be part of schema
   * ```typescript
   * class MySchema {
   *   \@field()
   *   name: string = "hello";
   * }
   * // This will generate a schema like this
   * const schema = {
   *  name: {
   *    type: String,
   *    default: "hello" // ||= new MySchema().name
   *  }
   * }
   *
   * ```
   */
  evaluateDefaultAssignedValue: boolean;
} = {
  evaluateDefaultAssignedValue: true,
};
export function setDefaults(newDefaults: typeof defaults) {
  Object.assign(defaults, newDefaults);
}
/**
 * annotation that turns a class into a mongoose subschema
 * ```
 * \@schema({_id: false})
 * class MySchema {
 *    \@field() name: string = "hello";
 * }
 * ```
 * @param options
 */
export const schema = (options?: SchemaOptions): ClassDecorator => (target): any => {
  const currentSchema = target.prototype[schemaSymbol] || {};
  
  setDefaultValues: {
    if (defaults.evaluateDefaultAssignedValue) {
        const object = new (target as any);
        Object.keys(currentSchema).forEach((key) => {
          const type = currentSchema[key];
          const defaultValue = object[key];
          if (defaultValue && !type["default"]) {
            type["default"] = defaultValue;
          }
        });
    }
  }

  const mongooseSchema = new Schema(currentSchema, options);
  mongooseSchema.loadClass(target);
  setMeta: {
    Object.defineProperty(target, isSchemaType, {
      value: true,
    });
    Object.defineProperty(target, schemaInstanceSymbol, {
      value: mongooseSchema,
    });
  }
  return target;
};

/**
 * Annotation turrns a class into usable mongoose model
 * ```
 * class MySchema {
 *  \@field() name: string = "hello";
 * }
 *
 * \@collection("my_collection", MySchema)
 * class MyCollection {
 * }
 * ```
 * @param name name of collection
 * @param target target schema
 * @param skipInit skip schema init
 */
export const collection = (
  name: string,
  target: any,
  skipInit = false
): ClassDecorator => (modelTarget) => {
  const mongooseSchema = new Schema(getSchemaType(target))
  const CurrentModel = model(
    modelTarget as any,
    mongooseSchema,
    name || target.name,
    skipInit
  );

  Object.defineProperty(CurrentModel, isDecoratedType, {
    value: true,
  });

  Object.defineProperty(CurrentModel, schemaInstanceSymbol, {
    value: mongooseSchema,
  });

  return CurrentModel as any;
};
/**
 * Annotate class property as mongoose schema field
 * ```
 * class MySchema {
 *    \@field() name: string = "hello"; // String
 *    \@field() random: {name: string} = {} as any; // Schema.Types.Mixed
 * }
 * ```
 * @param options
 */
export const field = <T>(options?: SchemaTypeOpts<T>): PropertyDecorator => (
  target,
  key
) => {
  if (!(target as any)[schemaSymbol]) {
    Object.defineProperty(target, schemaClassSymbol, {value: target})
    Object.defineProperty(target, schemaSymbol, {
      value: {},
    });
  }

  if((target as any)[schemaClassSymbol] !== target) {
    Object.defineProperty(target, schemaClassSymbol, {value: target})
    Object.defineProperty(target, schemaSymbol, {
      value: { ... (target as any)[schemaSymbol]},
    });
  }

  const schema = (target as any)[schemaSymbol];
  const fieldType = Reflect.getMetadata("design:type", target, key);
  const type = getSchemaType(fieldType);

  if (type && type !== Object) {
    schema[key] = {
      type: fieldType,
    };
  } else {
    schema[key] = {
      type: Schema.Types.Mixed,
    };
  }
  if (options) {
    if(options.type) {
      options.type = getSchemaType(options.type)
    }
    Object.assign(schema[key], options);
  }
};

const getSchemaType = (schemaType: any): any => {
  if (!schemaType) {
    throw new Error("Cannot embed non schema types");
  }
  if (schemaType[isSchemaType]) {
    return schemaType[schemaInstanceSymbol];
  }

  if (schemaType[isDecoratedType]) {
    return schemaType.schema;
  }

  if (schemaType.prototype && schemaType.prototype[schemaSymbol]) {
    return schema()(schemaType);
  }

  if(Array.isArray(schemaType)) {
    return schemaType.map(type => getSchemaType(type))
  }

  return schemaType;
};

export const arrayOf = <T>(schema: T): T[] => {
  const embedded = getSchemaType(schema);
  const type = [embedded];
  return type;
};
/**
 * Returns typed extendable mongoose.Model
 */
export function MongooseModel<T, F = {}>(): Model<T & Document, F> {
  return Model as any;
}

/**
 * ```
 * class MySchema {
 *    \@field() name: string = "hello"; // String
 *    \@field() random: {name: string} = {} as any; // Schema.Types.Mixed
 * }
 * class User {
 *    \@field({type: MySchema}) mydata: Doc<MySchema> = {} as any
 * }
 *
 * ```
 * Adds type annotation for sub schema field
 */
export type Doc<T> = T & MongooseDocument;


export class MongooseSchema {
  private static [schemaSymbol] = {}
  private static [schemaInstanceSymbol]: Schema = new Schema({});

  static get schema() {
    return (this[schemaInstanceSymbol]) as mongoose.Schema
  }

  static get plainSchema() {
    return (this[schemaSymbol]) as any
  }
}