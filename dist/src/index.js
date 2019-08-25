"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
require("react");
function sync(vm, path) {
    return function (change) {
        const ob = lodash_1.get(vm.state, path);
        const newOB = reactStateSync(Object.assign({}, change, { state: ob }));
        const pathArr = path.split(".");
        const obKey = pathArr.pop();
        let sub, newState;
        for (let i = 0; i < pathArr.length; i++) {
            if (i === 0) {
                const v = ob[pathArr[0]];
                sub = Object.assign({}, v);
                newState = { [pathArr[0]]: sub };
            }
            else {
                const key = pathArr[i];
                const v = sub[key];
                sub = sub[key] = Object.assign({}, v);
            }
        }
        if (sub) {
            sub[obKey] = newOB;
        }
        else {
            newState = { [obKey]: newOB };
        }
        vm.setState(newState);
    };
}
exports.sync = sync;
function reactStateSync({ state, parentPath, key, value, isFun, argv }) {
    let part = {};
    let method = key;
    if (isFun) {
        const parentArr = parentPath.split(".");
        key = parentArr.pop();
        parentPath = parentArr.join(".");
    }
    if (parentPath) {
        const pathArr = parentPath.split(".");
        let sub;
        for (let i = 0; i < pathArr.length; i++) {
            if (i === 0) {
                const v = state[pathArr[0]];
                sub = Array.isArray(v) ? [...v] : Object.assign({}, v);
                part = { [pathArr[0]]: sub };
            }
            else {
                const key = pathArr[i];
                const v = sub[key];
                sub = sub[key] = Array.isArray(v) ? [...v] : Object.assign({}, v);
            }
        }
        if (isFun) {
            const pv = sub[key];
            let v;
            if (Array.isArray(pv)) {
                v = [...pv];
            }
            else {
                v = lodash_1.cloneDeep(pv);
            }
            v[method](...argv);
            sub[key] = v;
        }
        else {
            sub[key] = value;
        }
    }
    else {
        if (isFun) {
            const pv = state[key];
            let v;
            if (Array.isArray(pv)) {
                v = [...pv];
            }
            else {
                v = lodash_1.cloneDeep(pv);
            }
            v[method](...argv);
            part = { [key]: v };
        }
        else {
            part = { [key]: value };
        }
    }
    return part;
}
//# sourceMappingURL=index.js.map