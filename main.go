package main

import (
	mainApp "cli-runner/src"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var embeddedAssets embed.FS

func main() {
	// Create an instance of the app structure
	app := mainApp.NewApp()
	downloader := mainApp.NewDownloader()
	// Create application with options
	err := wails.Run(&options.App{
		Title:  "walpress",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: embeddedAssets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Bootstrap,
		// Fullscreen:       false,
		// MinWidth:         1024,
		// MinHeight:        768,
		Bind: []interface{}{
			app,
			downloader,
		},
	})

	if err != nil {
		println(err)
		println("Error:", err.Error())
	}
}
