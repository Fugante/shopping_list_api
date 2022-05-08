require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const Article = require("./models/article")


const app = express()
app.use(express.json())
app.use(cors())

morgan.token("req-body", (request, response) => (
    Object.keys(request.body).length === 0 ? "" : JSON.stringify(request.body)
))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :req-body"))


app.get("/", (request, response) => {return response.send("Welcome!")})
app.get("/api/shopping-list", (request, response) => {
    Article.find({}).then(articles => response.json(articles))
})
app.post("/api/shopping-list", (request, response) => {
    if (Object.keys(request.body).length === 0) {
        return response.status(400).json({error: "content missing"})
    }

    for (key of ["name", "unit", "quantity"]) {
        if (!request.body[key]) {
            return response.status(400).json({error: `${key} is missing`})
        }
    }

    const article = new Article({
        name: request.body.name,
        unit: request.body.unit,
        quantity: request.body.quantity,
    })
    article.save().then(savedArticle => response.json(savedArticle))
})
app.get("/api/shopping-list/:id", (request, response, next) => {
    Article.findById(request.params.id)
        .then(article => {
            if (article) {
                return response.json(article)
            } else {
                return response.status(404).end()
            }
        })
        .catch(error => next(error))
})
app.put("/api/shopping-list/:id", (request, response, next) => {
    Article.findByIdAndUpdate(request.params.id, request.body, {new: true})
        .then(updatedArticle => response.json(updatedArticle))
        .catch(error => next(error))
})
app.delete("/api/shopping-list/:id", (request, response, next) => {
    Article.findByIdAndDelete(request.params.id)
        .then(result => response.status(204).end())
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: "Unknown endpoint"})
}
app.use(unknownEndpoint)

const errorHandler = (request, response, next) => {
    console.log(error)

    if (error.name === "CastError") {
        return response.status(400).send({error: "Malformed id"})
    }

    next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})