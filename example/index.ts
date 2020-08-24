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
  @field({ default: Date })
  name!: Date;

  @field()
  type: { heloo?: string } = { heloo: "hello" };

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

console.log(new User().type);
