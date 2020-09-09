# Annotations / Decorators for mongoose

<span class="badge-npmversion"><a href="https://npmjs.org/package/mongoose-annotations" title="View this project on NPM"><img src="https://img.shields.io/npm/v/mongoose-annotations.svg" alt="NPM downloads" /></a></span>

Provides basic annotations to get started with mongoose in typescript

```
    npm i mongoose-annotations
```

#### API:

- `field = <T>(options?: SchemaTypeOpts<T>): PropertyDecorator`
  - options: Field options. eg: index, default etc
  - when options is not provided the type information is gathered with `reflect-metadata`, all simple types can easily be gathered
    - `@field() name?: string` => `{ type: String }`
    - `@field() count?: number = 100` => `{ type: String, default: 100 }` The default is figured by calling `new MySchema`, so it's necessary that constructor overrides must have default values. This behaviour can be disabled using `setDefaults({...})`
    - `@field() date?: Date` => `{ type: Date }`
    - `@field({type: String}) value?: number` => `{ type: String }` options have higher preference.
- `schema = (options?: SchemaOptions): ClassDecorator`
  - options: mongoose schema options. eg: disable \_id, add timestamps
- `collection = (name: string, target: any, skipInit = false): ClassDecorator`
  - name : collection name for database
  - target: class that decorated with schema or field
  - skipInit: skip schema initialisation
- `arrayOf = (target: any): [SchemaType]` optional, added for the purpose of improving readability
  - target: Any mongoose allowed types
- `function MongooseModel<T, F = {}>(): Model<T & Document, F>` This function is totally unnecessary, but this adds type information to the extended model, thus increases readability and correctness.
- `type Doc<T> = T & MongooseDocument;` This type adds annotation for field/method made available in subschema by mongoose implicitly
- `enumValues<T>(value: any): any[]` returns values for typescript enum.
- `class MongooseSchema` optionally extended by schema class to access compiled schema

check example for usage:

```typescript
import {
  collection,
  field,
  schema,
  MongooseModel,
  Doc,
  MongooseSchema,
  enumValues,
} from "mongoose-annotations";

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
  type_string: Type[] = [];
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
```

---

### Model usage

connect first, always connect first.

```typescript
connect("mongodb://localhost:27017/myapp", { useNewUrlParser: true });
```

#### Indices

```typescript
User.schema.index({
  "auths.name": 1,
  type: 1,
});

User.createIndexes();
```

#### Fetch and save

```typescript
User.findById("5f42181555791f7879cfaebc")
  .exec()
  .then((e) => {
    e?.auth.push(new UserAuth());
    e?.getMyName();
    e!!.auths.name = "Junaid";
    e!!.auths.value = 100;
    e?.markModified("auths");
    return e?.save();
  })
  .then((e) => {
    console.log(JSON.stringify(e));
  });
```

---

### License

MIT - No warranty
