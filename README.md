# Annotations for mongoose

Provides basic annotations to get started with mongoose in typescript

```
    npm i mongoose-annotations
```

#### API:

- `field = <T>(options?: SchemaTypeOpts<T>): PropertyDecorator`
  - options: Field options. eg: index, default etc
  - when options is not provided the type information is gathered from `reflect-metadata` all simple types can easily be gathered
    - `@field() name?: string` => `{type: String}`
    - `@field() name?: Date` => `{type: Date}`
    - `@field({type: String}) name?: number` => `{type: String}` options have higher preference
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

console.log(
  new User({
    auths: [{}],
  }).auth.depopulate
);
```

### License

MIT - No warranty
