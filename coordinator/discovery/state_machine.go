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

package discovery

import (
	"context"
	"fmt"
	"io"

	"go.uber.org/atomic"

	"github.com/lindb/lindb/pkg/logger"
)

//go:generate mockgen -source=./state_machine.go -destination=./state_machine_mock.go -package=discovery

// StateMachineType represents state machine type.
type StateMachineType int

const (
	UnknownStateMachineType StateMachineType = iota
	DatabaseConfigStateMachine
	ShardAssignmentStateMachine
	ReplicaLeaderStateMachine
	LiveNodeStateMachine
	StorageStatusStateMachine
	StorageConfigStateMachine
	StorageNodeStateMachine
)

// String returns state machine type desc.
func (st StateMachineType) String() string {
	switch st {
	case DatabaseConfigStateMachine:
		return "DatabaseConfigStateMachine"
	case ShardAssignmentStateMachine:
		return "ShardAssignmentStateMachine"
	case ReplicaLeaderStateMachine:
		return "ReplicaLeaderStateMachine"
	case LiveNodeStateMachine:
		return "LiveNodeStateMachine"
	case StorageStatusStateMachine:
		return "StorageStatusStateMachine"
	case StorageConfigStateMachine:
		return "StorageConfigStateMachine"
	case StorageNodeStateMachine:
		return "StorageNodeStateMachine"
	default:
		return "Unknown"
	}
}

type StateMachineFactory interface {
	Start() error
	Stop()
}

// Listener represents discovery resource event callback interface,
// includes create/delete/cleanup operation.
type Listener interface {
	// OnCreate is resource creation callback.
	OnCreate(key string, resource []byte)
	// OnDelete is resource deletion callback.
	OnDelete(key string)
}

// StateMachine represents state changed event state machine.
// Like node online/offline, database create events etc.
type StateMachine interface {
	Listener
	io.Closer
}

// stateMachine implements StateMachine interface.
type stateMachine struct {
	stateMachineType StateMachineType

	ctx    context.Context
	cancel context.CancelFunc

	onCreateFn func(key string, resource []byte)
	onDeleteFn func(key string)

	discovery Discovery

	running *atomic.Bool

	logger *logger.Logger
}

// NewStateMachine creates a state machine instance.
func NewStateMachine(ctx context.Context,
	stateMachineType StateMachineType,
	discoveryFactory Factory,
	watchPath string,
	needInitialize bool,
	onCreateFn func(key string, resource []byte),
	onDeleteFn func(key string),
) (StateMachine, error) {
	c, cancel := context.WithCancel(ctx)
	stateMachine := &stateMachine{
		ctx:              c,
		cancel:           cancel,
		stateMachineType: stateMachineType,
		onCreateFn:       onCreateFn,
		onDeleteFn:       onDeleteFn,
		running:          atomic.NewBool(true),
		logger:           logger.GetLogger("coordinator", "StateMachine"),
	}

	// new state discovery
	stateMachine.discovery = discoveryFactory.CreateDiscovery(watchPath, stateMachine)
	if err := stateMachine.discovery.Discovery(needInitialize); err != nil {
		return nil, fmt.Errorf("discovery state error:%s", err)
	}

	stateMachine.logger.Info("state machine start successfully",
		logger.String("type", stateMachineType.String()))
	return stateMachine, nil
}

// OnCreate watches state changed, such as node online event.
func (sm *stateMachine) OnCreate(key string, resource []byte) {
	if !sm.running.Load() {
		sm.logger.Warn("state machine is stopped",
			logger.String("type", sm.stateMachineType.String()))
		return
	}
	sm.logger.Info("discovery new state",
		logger.String("type", sm.stateMachineType.String()),
		logger.String("key", key),
		logger.String("data", string(resource)))

	if sm.onCreateFn != nil {
		sm.onCreateFn(key, resource)
	}
}

// OnDelete watches state deleted, such as node offline event.
func (sm *stateMachine) OnDelete(key string) {
	if !sm.running.Load() {
		sm.logger.Warn("state machine is stopped",
			logger.String("type", sm.stateMachineType.String()))
		return
	}
	if sm.onDeleteFn != nil {
		sm.onDeleteFn(key)
	}
}

// Close closes state machine, stops watch change event.
func (sm *stateMachine) Close() error {
	if sm.running.CAS(true, false) {
		defer func() {
			sm.cancel()
		}()

		sm.discovery.Close()

		sm.logger.Info("state machine stop successfully",
			logger.String("type", sm.stateMachineType.String()))
	}
	return nil
}