package lind

import (
	"github.com/spf13/cobra"
)

const (
	linDBText = `
    __     _             ____     ____ 
   / /    (_)   ____    / __ \   / __ )
  / /    / /   / __ \  / / / /  / __  |
 / /___ / /   / / / / / /_/ /  / /_/ / 
/_____//_/   /_/ /_/ /_____/  /_____/  

LinDB is a scalable, high performance, high availability, distributed time series database.
Complete documentation is available at https://lindb.io
`
)

// RootCmd command of cobra
var RootCmd = &cobra.Command{
	Use:   "lind",
	Short: "lind is the main command, used to control LinDB",
	Long:  linDBText,
}

func init() {
	RootCmd.AddCommand(
		envCmd,
		versionCmd,
		newStorageCmd(),
		newBrokerCmd(),
		newStandaloneCmd(),
	)
}
