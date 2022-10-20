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
import { StateMetric } from "@src/models";
import { ExecService } from "@src/services";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useStateMetric(sql: string) {
  const [loading, setLoading] = useState(true);
  const [stateMetric, setStateMetric] = useState<StateMetric>();

  useEffect(() => {
    const fetchStateMetric = async () => {
      try {
        setLoading(true);
        const metric = await ExecService.exec<StateMetric>({ sql: sql });
        setStateMetric(metric);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStateMetric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, stateMetric };
}
/**
 * fetch alive state,
 * 1. role=broker, return alive nodes for broker.
 * 2. role=storage, return alive storage cluster list.
 * @param sql query alive state
 */
export function useAliveState(sql: string) {
  const {
    isLoading,
    isError,
    error,
    data: aliveState,
  } = useQuery(["show_alive_state", sql], async () => {
    return ExecService.exec<any[]>({ sql: sql });
  });

  return { isLoading, isError, error, aliveState };
}
