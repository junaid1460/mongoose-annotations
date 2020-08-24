# Annotations for mongoose

Provides basic annotations to get started with mongoose in typescript

```
    npm i mongoose-annotations
```

example:

```typescript
import { collection, field, schema, MongooseModel, Doc } from "../src/index";

@schema({ _id: true })
class UserAuth {
  @field() name?: string = "name";

  @field() type?: number = 254;

  getType() {
    return this.type;
  }
}

export class UserSchema {
  @field({ default: Date })
  date!: Date;

  @field()
  randomDATA: { heloo?: string } = { heloo: "hello" };

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
