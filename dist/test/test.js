"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const sleep = require("sleep-promise");
const src_1 = require("../src");
const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");
Enzyme.configure({ adapter: new Adapter() });
const { shallow } = Enzyme;
const core_1 = require("@cqrsfk/core");
const M = require("pouchdb-adapter-memory");
const PouchDB = require("pouchdb");
const React = require("react");
PouchDB.plugin(M);
const db = new PouchDB("test", { adapter: "memory" });
class User extends core_1.Actor {
    constructor() {
        super();
        this.name = "";
    }
    changeName(name) {
        this.$cxt.apply("change", name);
    }
    changeMyName(event) {
        this.name = event.data;
    }
    changeMyName2(name) {
        this.name = name + 2;
    }
}
__decorate([
    core_1.Action({
        validater(name) {
            if (name.length > 6)
                throw new Error("name.length can't > 6");
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], User.prototype, "changeName", null);
__decorate([
    core_1.Changer("change"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], User.prototype, "changeMyName", null);
__decorate([
    core_1.Mutation({ event: "change2" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], User.prototype, "changeMyName2", null);
ava_1.default("sync-react test", async function (t) {
    var domain = new core_1.Domain({ name: "test6", db });
    domain.reg(User);
    class UI extends React.Component {
        constructor(prop) {
            super(prop);
            this.state = {};
        }
        async componentWillMount() {
            this.userProto = await domain.create("User", []);
            this.ud = src_1.sync(this, "user");
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
            return (React.createElement("div", null,
                this.state.user && this.state.user.name,
                React.createElement("button", { onClick: this.changename.bind(this) }, "click")));
        }
    }
    const wrapper = shallow(React.createElement(UI, null));
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
//# sourceMappingURL=test.js.map