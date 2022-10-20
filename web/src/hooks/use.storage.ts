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
import { SQL } from "@src/constants";
import { StateKit } from "@src/utils";
import { ExecService } from "@src/services";
import { useQuery } from "@tanstack/react-query";
import * as _ from "lodash-es";

const aliveStorage = SQL.ShowStorageAliveNodes;

export function useStorage(name?: string) {
  const { isLoading, isError, error, data } = useQuery(
    ["show_alive_storage"],
    async () => {
      return ExecService.exec<any[]>({ sql: aliveStorage });
    }
  );

  return {
    isLoading,
    isError,
    error,
    storages: StateKit.getStorageState(data, name),
  };
}
