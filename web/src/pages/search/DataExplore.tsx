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
import { Card, Form, Space, Switch, Typography } from "@douyinfe/semi-ui";
import { Chart, Icon, MetadataSelect, TagFilterSelect } from "@src/components";
import { Route, SQL } from "@src/constants";
import { useParams } from "@src/hooks";
import { ChartType, QueryStatement } from "@src/models";
import { URLStore } from "@src/stores";
import * as _ from "lodash-es";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const { Text } = Typography;

const ExploreForm: React.FC = () => {
  return (
    <Form
      style={{ paddingBottom: 0, paddingTop: 0 }}
      wrapperCol={{ span: 20 }}
      layout="horizontal"
    >
      <MetadataSelect
        variate={{
          tagKey: "db",
          label: "Database",
          sql: SQL.ShowDatabases,
          watch: { clear: ["namespace", "metric"] },
        }}
        labelPosition="inset"
        type="db"
      />
      <MetadataSelect
        variate={{
          db: "${db}",
          tagKey: "namespace",
          label: "Namespace",
          sql: "show namespaces",
          watch: { clear: ["metric"], cascade: ["db"] },
        }}
        labelPosition="inset"
        type="namespace"
      />
      <MetadataSelect
        variate={{
          db: "${db}",
          namespace: "namespace",
          tagKey: "metric",
          label: "Metrics",
          sql: "show metrics",
          watch: {
            clear: ["field", "groupBy", "tags"],
            cascade: ["db", "namespace"],
          },
        }}
        labelPosition="inset"
        type="metric"
      />
      <Space>
        <Switch
          onChange={(val) =>
            URLStore.changeURLParams({ params: { show: `${val}` } })
          }
          checked={JSON.parse(_.get(URLStore.getParams(), "show", "false"))}
        />
        Show LQL
      </Space>
    </Form>
  );
};

const MetricMetaForm: React.FC = () => {
  const { db, metric, tags } = useParams(["db", "metric", "tags"]);
  const formApi = useRef() as MutableRefObject<any>;
  const [tagFilter, setTagFilter] = useState<Object>();
  useEffect(() => {
    if (!formApi.current) {
      return;
    }
    if (_.isEmpty(tags)) {
      formApi.current.setValue("tag", []);
      return;
    }
    try {
      const tagObj = JSON.parse(tags);
      const tagsSelected: string[] = [];
      _.mapKeys(tagObj, (value, key) => {
        if (_.isArray(value) && value.length > 0) {
          tagsSelected.push(`${key}(${value.length})`);
        }
      });
      formApi.current.setValue("tag", tagsSelected);
      setTagFilter(tagObj);
    } catch (err) {
      formApi.current.setValue("tag", []);
    }
  }, [tags]);
  return (
    <Form
      getFormApi={(api) => {
        formApi.current = api;
      }}
      className="lin-tag-filter"
      layout="horizontal"
    >
      <MetadataSelect
        variate={{
          db: "${db}",
          namespace: "namespace",
          tagKey: "field",
          label: "Field",
          sql: `show fields from '${metric}'`,
          watch: {
            cascade: ["metric"],
          },
        }}
        type="field"
        labelPosition="inset"
        multiple
      />
      <Form.TagInput
        field="tag"
        prefix="Filter By"
        labelPosition="inset"
        style={{ minWidth: 0 }}
        onRemove={(removedValue: string, _idx: number) => {
          if (tagFilter) {
            URLStore.changeURLParams({
              params: {
                tags: JSON.stringify(
                  _.omit(
                    tagFilter,
                    removedValue.substring(0, removedValue.lastIndexOf("("))
                  )
                ),
              },
            });
          }
        }}
        suffix={<TagFilterSelect db={db || ""} metric={metric || ""} />}
      />
      <MetadataSelect
        variate={{
          db: "${db}",
          namespace: "namespace",
          tagKey: "groupBy",
          label: "Group By",
          sql: `show tag keys from '${metric}'`,
        }}
        labelPosition="inset"
        multiple
        type="tagKey"
      />
    </Form>
  );
};

const SQLView: React.FC<{ showLQL: boolean; db: string; sql: string }> = (
  props
) => {
  const { showLQL, db, sql } = props;
  if (!showLQL) {
    return null;
  }
  return (
    <Card
      headerStyle={{ padding: 12 }}
      bodyStyle={{ padding: 12 }}
      style={{ marginBottom: 12 }}
    >
      <Space align="center" className="lin-small-space">
        <Icon icon="iconterminal" />
        <Text style={{ marginLeft: 4 }}>
          <Link target={"_blank"} to={`${Route.Search}?db=${db}&sql=${sql}`}>
            {sql}
          </Link>
        </Text>
      </Space>
    </Card>
  );
};

const DataExplore: React.FC = () => {
  const params = useParams();
  const db = _.get(params, "db", "");

  const sql = URLStore.bindSQL({} as QueryStatement);
  console.log("sql.......", sql);
  const renderContent = () => {
    const metric = _.get(params, "metric");
    if (!metric) {
      return null;
    }
    return (
      <>
        <Card
          bodyStyle={{ padding: 12 }}
          headerStyle={{ padding: 6 }}
          style={{ marginBottom: 12 }}
        >
          <MetricMetaForm />
        </Card>
        <SQLView showLQL={_.get(params, "show") === "true"} db={db} sql={sql} />
        <Chart
          height={400}
          type={ChartType.Line}
          config={{ title: metric }}
          queries={[{ sql: sql, db: db }]}
          disableBind
        />
      </>
    );
  };

  return (
    <>
      <Card style={{ marginBottom: 12 }} bodyStyle={{ padding: 12 }}>
        <ExploreForm />
      </Card>
      {renderContent()}
    </>
  );
};

export default DataExplore;
