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
import { MonitoringDB } from "@src/constants";
import { Dashboard, Unit } from "@src/models";
import { chartOptions } from "./system";

export const BrokerWriteDashboard: Dashboard = {
  rows: [
    {
      panels: [
        {
          chart: {
            title: "Out Of Time Range",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'out_of_time_range' from 'lindb.broker.database.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 12,
        },
        {
          chart: {
            title: "Shard Not Found",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'shard_not_found' from 'lindb.broker.database.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 12,
        },
      ],
    },
    {
      panels: [
        {
          chart: {
            title: "Current Active Family Channels",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'active_families' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Batch Metric",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'batch_metrics' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Batch Metric Failure",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'batch_metrics_failures' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
      ],
    },
    {
      panels: [
        {
          chart: {
            title: "Sent Successfully",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'send_success' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Sent Failure",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'send_failures' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Sent Size",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'send_size' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Bytes,
          },
          span: 8,
        },
      ],
    },
    {
      panels: [
        {
          chart: {
            title: "Pending For Sending",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'pending_send' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Retry Send",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'retry' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Drop After Retry Failure",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'retry_drop' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
      ],
    },
    {
      panels: [
        {
          chart: {
            title: "Create Write Stream",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'create_stream' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Create Write Stream Failure",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'create_stream_failures' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
        {
          chart: {
            title: "Leader Changed",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'leader_changed' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 8,
        },
      ],
    },
    {
      panels: [
        {
          chart: {
            title: "Create Write Stream",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'close_stream' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 12,
        },
        {
          chart: {
            title: "Close Write Stream Failure",
            config: { type: "line", options: chartOptions },
            targets: [
              {
                db: MonitoringDB,
                sql: "select 'close_stream_failures' from 'lindb.broker.family.write' group by db,node",
                watch: ["node", "db"],
              },
            ],
            unit: Unit.Short,
          },
          span: 12,
        },
      ],
    },
  ],
};
