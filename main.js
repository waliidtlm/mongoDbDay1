const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// Replace the placeholder with your Atlas connection string
const uri = "mongodb://127.0.0.1:27017";
let db;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const db = client.db("mydb");
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    return db;
  } catch (err) {
    console.log(err);
    // Ensures that the client will close when you finish/error
  }
}

// Define a route for the home page
app.get("/", async (req, res) => {
  const db = await run();
  const products = await db.collection("products").find().toArray();
  res.render("home", { products: products });
});

// Get a product by ID and render an EJS template
app.get("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  const db = await run();
  const product = await db.collection("products").findOne({ id: productId });
  console.log(product);
  if (product) {
    res.render("productDetails", { product: product });
  } else {
    res.status(404).send("No product found");
  }
});

// Search for products based on query parameters and render an EJS template
app.get("/advanced-search", async (req, res) => {
  const { name, minPrice, maxPrice } = req.query;
  const db = await run();
  console.log("name:", name);
  let query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
  } else if (minPrice && maxPrice) {
    query.price = { $lte: parseFloat(maxPrice), $gte: parseFloat(minPrice) };
  } else if (minPrice) {
    query.price = { $gte: parseFloat(minPrice) };
  } else {
    query.price = { $lte: parseFloat(maxPrice) };
  }

  const products = await db.collection("products").find(query).toArray();

  res.render("home", { products: products });
});

// Render a form to create a new product
app.get("/products/new", (req, res) => {
  res.render("new-product");
});

// Create a new product and render an EJS template
app.post("/products", (req, res) => {
  const { name, price } = req.body;
  const newProduct = { id: products.length + 1, name, price };
  products.push(newProduct);
  res.render("product-created", { product: newProduct });
});

// Render a form to edit a specific product
app.get("/products/:id/edit", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.render("edit-product", { product: product });
  } else {
    res.status(404).send("No product found");
  }
});

// Update the details of a specific product and render an EJS template
app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProductData = req.body;
  const indexOfProduct = products.findIndex(
    (product) => product.id === productId
  );

  if (indexOfProduct === -1) {
    res.status(404).send("Product not found");
  } else {
    products[indexOfProduct] = {
      ...products[indexOfProduct],
      ...updatedProductData,
    };
    res.render("product-updated", { product: products[indexOfProduct] });
  }
});

// Delete a product by ID and render an EJS template
app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const indexOfProduct = products.findIndex((p) => p.id === productId);

  if (indexOfProduct === -1) {
    res.status(404).send("Product not found");
  } else {
    const deletedProduct = products.splice(indexOfProduct, 1);
    res.render("product-deleted", { product: deletedProduct[0] });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
