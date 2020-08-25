# Annotations for mongoose

Provides basic annotations to get started with mongoose in typescript

```
    npm i mongoose-annotations
```

#### API:

- `field = <T>(options?: SchemaTypeOpts<T>): PropertyDecorator`
  - options: Field options. eg: index, default etc
  - when options is not provided the type information is gathered from `reflect-metadata` all simple types can easily be gathered
    - `@field() name?: string` => `{ type: String }`
    - `@field() count?: number = 100` => `{ type: String, default: 100 }` The default is figured by calling new MySchema, so it's necessary that constructor overrides must have default values.
    - `@field() date?: Date` => `{ type: Date }`
    - `@field({type: String}) value?: number` => `{ type: String }` options have higher preference
- `schema = (options?: SchemaOptions): ClassDecorator`
  - options: mongoose schema options. eg: disable id add timestamps
- `collection = (name: string, target: any, skipInit = false): ClassDecorator`
  - name : collection name
  - target: class that decorated with schema or field
  - skipInit: skip schema init
- `arrayOf = (target: any): [SchemaType]` optional added for purpose improving readability
  - target: Any mongoose allowed types
- `function MongooseModel<T, F = {}>(): Model<T & Document, F>` This function is totally unnecessary, but this adds type information to the extended model, thus increases readability and correctness.
- `type Doc<T> = T & MongooseDocument;` This type adds annotation for field/method made available in subschema by mongoose implicitly

check example for usage:

```typescript
import { collection, field, schema, MongooseModel, Doc } from "../src/index";

@schema({ _id: true })
class UserAuth {
  // Lib will call new on the class and figures the default values
  // If default is dynamic then pass in a provider function @field({ default: ... })
  // These defaults will be part of generated schema
  @field() name?: string = "name";

  @field() type?: number = 254; // Default schema value will be 254

  getType() {
    return this.type;
  }
}

export class UserSchema {
  @field({ default: Date }) // Default provider function
  date!: Date;

  @field()
  randomDATA: { heloo?: string } = { heloo: "hello" }; // Mixed type

  @field({ type: [UserAuth] })
  auths!: Doc<UserAuth>[];

  @field({ type: UserAuth })
  auth: Doc<UserAuth> = {} as any; // Doc type brings type annotations for sub schema

  getName() {
    return "helslls";
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

### Model usage

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

### License

MIT - No warranty
