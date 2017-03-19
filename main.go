package main

import (
	"log"

	"github.com/alecthomas/kingpin"
	"github.com/gin-gonic/gin"
)

var (
	bindAddr = kingpin.Flag("address", "sets address to bind to").Default(":80").String()
)

func main() {
	kingpin.Parse()
	r := gin.Default()

	r.StaticFile("/favicon.ico", "./favicon.ico")
	r.StaticFile("/", "./html/index.html")
	r.Static("/static", "./static")

	log.Fatalf("Failed to start server: %v", r.Run(*bindAddr))
}
