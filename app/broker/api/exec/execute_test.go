// Licensed to LinDB under one or more contributor
// license agreements. See the NOTICE file distributed with
// this work for additional information regarding copyright
// ownership. LinDB licenses this file to you under
// the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package exec

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/lindb/lindb/app/broker/deps"
	"github.com/lindb/lindb/config"
	"github.com/lindb/lindb/coordinator"
	"github.com/lindb/lindb/internal/mock"
	"github.com/lindb/lindb/models"
	"github.com/lindb/lindb/pkg/encoding"
	"github.com/lindb/lindb/pkg/ltoml"
	"github.com/lindb/lindb/pkg/state"
	"github.com/lindb/lindb/sql"
)

func TestExecuteAPI_show_master(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// prepare
	master := coordinator.NewMockMasterController(ctrl)
	api := NewExecuteAPI(&deps.HTTPDeps{
		Ctx:    context.Background(),
		Master: master,
		BrokerCfg: &config.Broker{BrokerBase: config.BrokerBase{
			HTTP: config.HTTP{ReadTimeout: ltoml.Duration(time.Second * 10)},
		}},
	})
	r := gin.New()
	api.Register(r)

	cases := []struct {
		name    string
		reqBody string
		prepare func()
		assert  func(resp *httptest.ResponseRecorder)
	}{
		{
			name: "param invalid",
			assert: func(resp *httptest.ResponseRecorder) {
				assert.Equal(t, http.StatusInternalServerError, resp.Code)
			},
		},
		{
			name:    "parse sql failure",
			reqBody: `{"sql":"show a"}`,
			assert: func(resp *httptest.ResponseRecorder) {
				assert.Equal(t, http.StatusInternalServerError, resp.Code)
			},
		},
		{
			name:    "parse sql failure",
			reqBody: `{"sql":"show a"}`,
			assert: func(resp *httptest.ResponseRecorder) {
				assert.Equal(t, http.StatusInternalServerError, resp.Code)
			},
		},
		{
			name:    "master not found",
			reqBody: `{"sql":"show master"}`,
			prepare: func() {
				master.EXPECT().GetMaster().Return(nil)
			},
			assert: func(resp *httptest.ResponseRecorder) {
				assert.Equal(t, http.StatusNotFound, resp.Code)
			},
		},
		{
			name:    "found master",
			reqBody: `{"sql":"show master"}`,
			prepare: func() {
				master.EXPECT().GetMaster().Return(&models.Master{})
			},
			assert: func(resp *httptest.ResponseRecorder) {
				assert.Equal(t, http.StatusOK, resp.Code)
			},
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			defer func() {
				sqlParseFn = sql.Parse
			}()
			if tt.prepare != nil {
				tt.prepare()
			}
			resp := mock.DoRequest(t, r, http.MethodPut, ExecutePath, tt.reqBody)
			if tt.assert != nil {
				tt.assert(resp)
			}

		})
	}
}

func TestExecuteAPI_show_databases(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// prepare
	repo := state.NewMockRepository(ctrl)
	api := NewExecuteAPI(&deps.HTTPDeps{
		Ctx:  context.Background(),
		Repo: repo,
		BrokerCfg: &config.Broker{BrokerBase: config.BrokerBase{
			HTTP: config.HTTP{ReadTimeout: ltoml.Duration(time.Second * 10)},
		}},
	})
	r := gin.New()
	api.Register(r)

	cases := []struct {
		name    string
		reqBody string
		prepare func()
		assert  func(resp *httptest.ResponseRecorder)
	}{
		{
			name:    "get database list err",
			reqBody: `{"sql":"show databases"}`,
			prepare: func() {
				repo.EXPECT().List(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("err"))
			},
			assert: func(resp *httptest.ResponseRecorder) {
				assert.Equal(t, http.StatusInternalServerError, resp.Code)
			},
		},
		{
			name:    "get database successfully, with one wrong data",
			reqBody: `{"sql":"show databases"}`,
			prepare: func() {
				// get ok
				database := models.Database{
					Name:          "test",
					Storage:       "cluster-test",
					NumOfShard:    12,
					ReplicaFactor: 3,
				}
				database.Desc = database.String()
				data := encoding.JSONMarshal(&database)
				repo.EXPECT().List(gomock.Any(), gomock.Any()).Return([]state.KeyValue{
					{Key: "db", Value: data},
					{Key: "err", Value: []byte{1, 2, 4}},
				}, nil)
			},
			assert: func(resp *httptest.ResponseRecorder) {
				assert.Equal(t, http.StatusOK, resp.Code)
			},
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			defer func() {
				sqlParseFn = sql.Parse
			}()
			if tt.prepare != nil {
				tt.prepare()
			}
			resp := mock.DoRequest(t, r, http.MethodPut, ExecutePath, tt.reqBody)
			if tt.assert != nil {
				tt.assert(resp)
			}
		})
	}

}