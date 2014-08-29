package main

import (
	//"log"
	// "strings"
	

	"github.com/go-martini/martini"
	"github.com/codegangsta/martini-contrib/render"
)


func main() {
	m := martini.Classic()
	m.Use(render.Renderer())

	m.Get(".*", func(r render.Render) {
		//return "hi"
		r.HTML(200, "index", nil)
	})

	m.NotFound(func() string {
		// handle 404
		return "Sorry, that route doenst exist"
	})

	m.Run()

	// r := gin.Default()
	// r.LoadHTMLTemplates("templates/*")

	// r.GET("/", func(c *gin.Context) {
 //        obj := gin.H{"title": "Bubbles"}
 //        c.HTML(200, "index.tmpl", obj)
 //    })

 //    // Listen and server on 0.0.0.0:8080
 //    log.Println("Listening on port 8080...")
 //    r.Run(":8000")
}