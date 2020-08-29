import {
  collection,
  field,
  schema,
  MongooseModel,
  Doc,
  MongooseSchema,
  enumValues,
} from "../src/index";

@schema({ _id: true })
class UserAuth extends MongooseSchema {
  // Lib will call new on the class and figures the default values
  // If default is dynamic then pass in a provider function @field({ default: ... })
  // These defaults will be part of generated schema
  @field() name?: string = "name";

  @field() type?: number = 254; // Default schema value will be 254

  getType() {
    return this.type;
  }
}

enum Type {
  NAME = "1",
  HEY = 2,
}

@schema()
class UserAuthExtended extends UserAuth {
  @field({
    enum: [...enumValues(Type)],
  })
  type_string: Type[] = []; // Default schema value will be 254
}

@schema()
export class UserSchema extends MongooseSchema {
  @field({ default: Date }) // Default provider function
  date!: Date;

  @field()
  randomDATA: { heloo?: string } = { heloo: "hello" }; // Mixed type

  @field({ type: [UserAuth] })
  auths!: Doc<UserAuth>[];

  @field({ type: UserAuthExtended })
  auth: Doc<UserAuthExtended> = {} as any; // Doc type brings type annotations for sub schema

  getName() {
    return "hi";
  }

  getMyName() {}
}

@collection("user", UserSchema)
export class User extends MongooseModel<UserSchema>() {
  static getAll() {
    return this.find().exec();
  }
}
