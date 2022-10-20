/*
Licensed to LinDB under one or more contributor
license agreements. See the NOTICE file distributed with
this work for additional information regarding copyright
ownership. LinDB licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { StorageType } from "@src/constants";
import * as _ from "lodash-es";

function getObject(key: StorageType): Object {
  const val = localStorage.getItem(key);
  if (!val) {
    return {};
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    // delete wrong key
    localStorage.removeItem(key);
    return {};
  }
}

function setValue(key: string, value: string) {
  return localStorage.setItem(key, value);
}

function setObjectValue(key: StorageType, oKey: string, oVal: any) {
  const obj = getObject(key);
  _.set(obj, oKey, oVal);
  setValue(key, JSON.stringify(obj));
}

export default {
  getObject,
  setValue,
  setObjectValue,
};
