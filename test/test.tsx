import test from "ava";
import * as sleep from "sleep-promise";
import { sync } from "../src";
import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
Enzyme.configure({ adapter: new Adapter() });
const { shallow } = Enzyme;

import { Action, Domain, Actor, Changer, Mutation } from "@cqrsfk/core";
import * as M from "pouchdb-adapter-memory";
import * as PouchDB from "pouchdb";

import * as React from "react";

PouchDB.plugin(M);

const db = new PouchDB("test", { adapter: "memory" });

class User extends Actor {
  name: string = "";
  constructor() {
    super();
  }
  @Action({
    validater(name: string) {
      if (name.length > 6) throw new Error("name.length can't > 6");
    }
  })
  changeName(name: string) {
    this.$cxt.apply("change", name);
  }

  @Changer("change")
  changeMyName(event) {
    this.name = event.data;
  }

  @Mutation({ event: "change2" })
  changeMyName2(name) {
    this.name = name + 2;
  }
}

test("sync-react test", async function (t) {
  var domain = new Domain({ name: "test6", db });
  domain.reg(User);

  interface IState {
    user?: any;
  }

  class UI extends React.Component<any, IState> {
    private ud;
    private userProto: User;
    constructor(prop) {
      super(prop);
      this.state = {};
    }

    async componentWillMount() {
      this.userProto = await domain.create<User>("User", []);
      this.ud = sync(this, "user");
      const user = this.userProto.$sync(this.ud);
      this.setState({
        user
      });
    }

    stop() {
      this.userProto.$stopSync(this.ud);
    }

    changename() {
      this.userProto && this.userProto.changeName(this.state.user.name + 1);
    }

    render() {
      return (
        <div>
          {this.state.user && this.state.user.name}
          <button onClick={this.changename.bind(this)}>click</button>
        </div>
      );
    }
  }

  const wrapper = shallow(<UI />);
  await sleep(500);
  t.is(wrapper.state("user").name, "");
  wrapper.find("button").simulate("click");
  await sleep(500);
  t.is(wrapper.state("user").name, "1");
  wrapper.instance().stop();
  wrapper.find("button").simulate("click");
  await sleep(500);
  t.is(wrapper.state("user").name, "1");

  t.pass();
});
