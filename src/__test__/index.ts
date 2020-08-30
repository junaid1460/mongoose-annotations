import {
  collection,
  field,
  schema,
  MongooseModel,
  Doc,
  MongooseSchema,
  enumValues,
} from "..";

@schema({ _id: false })
class NonDefaultTypesSchema extends MongooseSchema {
  @field() date?: Date;
  @field() map?: Map<string, number>;
  // @field() weakMap?: WeakMap<Object, number>;
  @field() array?: Array<string>;
  @field() buffer?: Buffer;
  @field() bigInt?: BigInt;
}

@collection("user", NonDefaultTypesSchema)
export class NonDefaultTypes extends MongooseModel<NonDefaultTypesSchema>() {
  static getAll() {
    return this.find().exec();
  }
}

@schema({ _id: false })
class UserAuth extends MongooseSchema {
  @field() name?: string = "name";

  @field() type?: number = 254;

  getType() {
    return this.type;
  }

  static getName() {
    return "hello";
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
    default: [Type.NAME],
  })
  type_string: Type[] = [];

  getTypeString() {
    return "hskdjskd";
  }

  static getName2() {
    return "hello";
  }
}

@schema()
export class UserSchema extends MongooseSchema {
  @field({ default: Date })
  date!: Date;

  @field()
  randomDATA: { heloo?: string } = { heloo: "hello" };

  @field({ type: [UserAuth] })
  auths!: Doc<UserAuth>[];

  @field({ type: UserAuthExtended })
  auth: Doc<UserAuthExtended> = {} as any;

  getName() {
    return "hi";
  }

  static getHell() {
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

describe("Path comparisons", () => {
  it("UserAuth", () => {
    const schema = UserAuth.schema;
    expect(schema.paths.name).not.toBeNull();
    expect(schema.paths.type).not.toBeNull();
    expect(schema.paths._id).toBeUndefined();
    expect(Object.keys(schema.paths).join("")).toEqual(
      ["name", "type"].join("")
    );
  });

  it("UserAuthExtended", () => {
    const schema = UserAuthExtended.schema;
    expect(schema.paths.name).not.toBeNull();
    expect(schema.paths.type).not.toBeNull();
    expect(schema.paths._id).not.toBeNull();
    expect(Object.keys(schema.paths).sort().join("")).toEqual(
      ["name", "type", "type_string", "_id"].sort().join("")
    );
  });

  it("UserSchema", () => {
    const schema = UserSchema.schema;
    expect(Object.keys(schema.paths).sort().join("")).toEqual(
      ["date", "randomDATA", "auths", "_id", "auth"].sort().join("")
    );
    expect((schema.paths.auth as any).schema).toBe(UserAuthExtended.schema);
    expect((schema.paths.auths as any).schema).toBe(UserAuth.schema);
    expect((schema.paths.auths as any)["$isMongooseArray"]).toBe(true);
  });
});

describe("Schema instance methods", () => {
  it("UserAuth", () => {
    const schema = UserAuth.schema;
    expect(schema.methods.getType).toBeInstanceOf(Function);
  });

  it("UserAuthExtended", () => {
    const schema = UserAuthExtended.schema;
    expect(schema.methods.getType).toBeInstanceOf(Function);
    expect(schema.methods.getTypeString).toBeInstanceOf(Function);
  });
});

describe("Schema static methods", () => {
  it("UserAuth", () => {
    const schema = UserAuth.schema;
    expect(schema.statics.getName).toBeInstanceOf(Function);
  });

  it("UserAuthExtended", () => {
    const schema = UserAuthExtended.schema;
    expect(schema.statics.getName).toBeInstanceOf(Function);
    expect(schema.statics.getName2).toBeInstanceOf(Function);
  });
});

describe("Model static methods", () => {
  it("from User", () => {
    const schema = User.schema;
    expect(schema.statics.getAll).toBeInstanceOf(Function);
    expect(schema.statics.getHell).toBeInstanceOf(Function);
  });

  it("from UserSchema", () => {
    const schema = User.schema;
    expect(schema.statics.getHell).toBeInstanceOf(Function);
  });
});

describe("Default values", () => {
  it("assinged default value UserAuthExtended.type", () => {
    const user = new User();
    expect(user.auth.type).toEqual(254);
  });

  it("provided default value preference over assigned", () => {
    const user = new User();
    expect(user.auth.type_string.join("")).toEqual([Type.NAME].join(""));
  });
});
