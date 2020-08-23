# Annotations for mongoose

Provides basic annotations to get started with mongoose in typescript

example:

```typescript
import {
  arrayOf,
  collection,
  field,
  schema,
  MongooseModel,
} from "mongoose-annotations";

@schema({ _id: false })
class UserAuth {
  @field() name?: string = "name";

  @field() type?: number = 254;

  getType() {
    return this.type;
  }
}

export class UserSchema {
  @field()
  name: string = "hello";

  @field()
  type: number = 23;

  @field({ type: arrayOf(UserAuth) })
  auth: UserAuth[] = [];

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

User.findById("5f42181555791f7879cfaebc")
  .exec()
  .then((e) => {
    e?.auth.push(new UserAuth());
    e?.getMyName();
    console.log(new User(e).name);
  });
```

### License

MIT - No warranty
