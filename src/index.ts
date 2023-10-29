import express, { NextFunction, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

const db = new PrismaClient();

app.use(express.json());

let users = {
    users: [
        { id: uuidv4(), name: "John" },
        { id: uuidv4(), name: "Bahn" },
        { id: uuidv4(), name: "Elton" },
    ]
};

const isAuthorized: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(authHeader == "secretvalue"){
        next();
    } else {
        res.status(401);
        res.json({msg: "Not Authorized"})
    }
}


// CREATE
app.post('/users', isAuthorized, async (req, res) => {
    const user = await db.user.create({
        data: {
            name: req.body.name
        }
    });
    res.json(user);
});

// READ
app.get('/users', isAuthorized, (req, res) => {
    res.json(users["users"]);
});

// UPDATE
app.put('/users/', isAuthorized, (req, res) => {
    const {id , name} = req.body;
    users["users"] = users["users"].map((user) => {
        if(user.id === id) {
            user.name = name;
        }
        return user;
    });

    res.json(users);
});

// DELETE
app.delete('/users', isAuthorized, (req, res) => {
    const id = req.body.id;
    users["users"] = users["users"].filter((user) => user.id !== id);
    res.json(users);
});

// GET User by name
app.get("/users/:name", isAuthorized, (req, res) => {
    const name = req.params.name;
    const user = users["users"].filter((user) => user.name.toLowerCase() === name.toLowerCase());
    if(user) {
        res.json(user);
    } else {
        res.json({msg: `No User found with name: ${name}`})
    }
});

// Server
app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`);
});