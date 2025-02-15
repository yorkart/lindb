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

package config

import (
	"testing"

	"github.com/BurntSushi/toml"
	"github.com/stretchr/testify/assert"

	"github.com/lindb/lindb/pkg/ltoml"
)

func TestBroker_TOML(t *testing.T) {
	defaultCfg := NewDefaultBrokerTOML()
	brokerCfg := &Broker{}
	_, err := toml.Decode(defaultCfg, brokerCfg)
	assert.NoError(t, err)
	assert.Equal(t, brokerCfg.TOML(), defaultCfg)

	assert.NotEmpty(t, (&User{}).TOML())
}

func TestDumpExampleCfg(t *testing.T) {
	assert.NoError(t, ltoml.WriteConfig("broker.toml.example", NewDefaultBrokerTOML()))
	assert.NoError(t, ltoml.WriteConfig("storage.toml.example", NewDefaultStorageTOML()))
	assert.NoError(t, ltoml.WriteConfig("standalone.toml.example", NewDefaultStandaloneTOML()))
}
