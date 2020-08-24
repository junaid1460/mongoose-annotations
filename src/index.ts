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

const schemaSymbol = Symbol(undefined);
const schemaInstanceSymbol = Symbol(undefined);
const isDecoratedType = Symbol(undefined);
const isSchemaType = Symbol(undefined);

export const schema = (options?: SchemaOptions): ClassDecorator => (target) => {
  const currentSchema = target.prototype[schemaSymbol] || {};
  setDefaults: {
    try {
      const object = new (target as any)();
      Object.keys(currentSchema).forEach((key) => {
        const type = currentSchema[key];
        const defaultValue = object[key];
        if (defaultValue && !type["default"]) {
          type["default"] = defaultValue;
        }
      });
    } catch (e) {
      throw new Error(
        "Contructor/extending schema with non schema not allowed in schema"
      );
    }
  }
  const mongooseSchema = new Schema(currentSchema, options);
  mongooseSchema.loadClass(target);
  setMeta: {
    if (Object.getPrototypeOf(target) !== Model)
      Object.setPrototypeOf(target, mongooseSchema);
    Object.defineProperty(target, isSchemaType, {
      value: true,
    });
    Object.defineProperty(target, schemaInstanceSymbol, {
      value: mongooseSchema,
    });
  }
  return target;
};

export const collection = (
  name: string,
  target: any,
  skipInit = false
): ClassDecorator => (modelTarget) => {
  const schemaInstance = (target as any)[schemaInstanceSymbol];
  const mongooseSchema =
    schemaInstance || schema()(target as any)[schemaInstanceSymbol];
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

export const field = <T>(options?: SchemaTypeOpts<T>): PropertyDecorator => (
  target,
  key
) => {
  if (!(target as any)[schemaSymbol]) {
    Object.defineProperty(target, schemaSymbol, {
      value: {},
    });
  }

  const schema = (target as any)[schemaSymbol];
  const fieldType = Reflect.getMetadata("design:type", target, key);
  const type = getSchemaType(fieldType);

  if (type !== Object) {
    schema[key] = {
      type: fieldType,
    };
    if (options) {
      Object.assign(schema[key], options);
    }
  } else {
    schema[key] = {
      type: Schema.Types.Mixed,
    };
    if (options) {
      Object.assign(schema[key], options);
    }
  }
};

const getSchemaType = (schemaType: any) => {
  if (!schemaType) {
    throw new Error("Cannot embed non schema types");
  }
  if (schemaType[isSchemaType]) {
    return schemaType;
  }

  if (schemaType[isDecoratedType]) {
    return schemaType.schema;
  }

  if (schemaType.prototype && schemaType.prototype[schemaSymbol]) {
    return schema()(schemaType);
  }

  return schemaType;
};

export const arrayOf = <T>(schema: T): T[] => {
  const embedded = getSchemaType(schema);
  const type = [embedded];
  Object.defineProperty(type, isSchemaType, {
    value: true,
  });
  return type;
};

export function MongooseModel<T, F = {}>(): Model<T & Document, F> {
  return Model as any;
}

export type Doc<T> = T & MongooseDocument;
