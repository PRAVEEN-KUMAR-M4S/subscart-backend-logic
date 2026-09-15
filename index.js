const express = require('express');
const mongoose = require('mongoose');
const Product = require("./models/Product")
const app = express();
app.use(express.json());



mongoose.connect("mongodb+srv://praveenkumarotp3_db_user:yHkhK500cBJ1b6S1@cluster0.7lt3gtu.mongodb.net/?appName=Cluster0").then(() => {
    console.log("connected to database")
    app.listen(3000, () => {
        console.log("server is listening on port funcking");
    })
}).catch(() => { console.log("connection failed") })

app.get('/', (req, res) => {
    res.send("hey i am here listing funcking ");
})

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json({
            success: true,
            message: 'Product created successfully',
            data: products
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.put('/api/product/:id',async(req,res)=>{
    try {
        const{id}=req.params;
        const product=await Product.findByIdAndUpdate(id,req.body);
        if(!product){
            res.status(400).json({message:"product not found"});
        }
        const updatedProduct=await Product.findById(id);
        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.delete('/api/product/:id',async(req,res)=>{
    try {
        const {id}=req.params
        const product = Product.findByIdAndDelete(id);
        if(!product){
            res.status(400).json({message:"product not found"});
        }

        res.status(200).json({message:"deleted"});
    } catch (error) {
         res.status(500).json({ message: error.message })
    }
})

app.get('/api/product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
        res.status(200).json({
            success: true,

            data: product
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/api/product', async (req, res) => {
    try {
        // 1. Create a new product instance from the request body
        const product = new Product(req.body);
        // 2. Save the product to the database
        const savedProduct = await product.save();

        // 3. Return a 201 Created status with the saved product data
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: savedProduct
        });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
