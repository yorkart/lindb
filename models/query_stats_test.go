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

package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewQueryStats(t *testing.T) {
	stats := NewQueryStats()
	stats.MergeLeafTaskStats("task-1", &LeafNodeStats{})
	storageStats, ok := stats.LeafNodes["task-1"]
	assert.NotNil(t, storageStats)
	assert.True(t, ok)
	stats.MergeBrokerTaskStats("node-1", stats)
}
