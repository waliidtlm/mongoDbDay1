const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express');
const app = express();
const PORT = 3000;



app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));



// Replace the placeholder with your Atlas connection string
const uri = 'mongodb://127.0.0.1:27017';
let products = '';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const db = client.db("mydb")
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    products = await db.collection("products").find().toArray(); 
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);



// Define a route for the home page
app.get('/', (req, res) => {
  res.render('home', { products: products });
});

// Get a list of products and render an EJS template
app.get('/products', (req, res) => {
  res.render('Home', { products: products });
});

// Get a product by ID and render an EJS template
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.render('productDetails', { product: product });
  } else {
    res.status(404).send('No product found');
  }
});

// Search for products based on query parameters and render an EJS template
app.get('/products/search', (req, res) => {
  const { q, maxPrice, minPrice } = req.query;
  const result = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) &&
      p.price >= parseFloat(minPrice) &&
      p.price <= parseFloat(maxPrice)
  );
  res.render('search', { result: result });
});

// Render a form to create a new product
app.get('/products/new', (req, res) => {
  res.render('new-product');
});

// Create a new product and render an EJS template
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  const newProduct = { id: products.length + 1, name, price };
  products.push(newProduct);
  res.render('product-created', { product: newProduct });
});

// Render a form to edit a specific product
app.get('/products/:id/edit', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.render('edit-product', { product: product });
  } else {
    res.status(404).send('No product found');
  }
});

// Update the details of a specific product and render an EJS template
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProductData = req.body;
  const indexOfProduct = products.findIndex((product) => product.id === productId);

  if (indexOfProduct === -1) {
    res.status(404).send('Product not found');
  } else {
    products[indexOfProduct] = { ...products[indexOfProduct], ...updatedProductData };
    res.render('product-updated', { product: products[indexOfProduct] });
  }
});

// Delete a product by ID and render an EJS template
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const indexOfProduct = products.findIndex((p) => p.id === productId);

  if (indexOfProduct === -1) {
    res.status(404).send('Product not found');
  } else {
    const deletedProduct = products.splice(indexOfProduct, 1);
    res.render('product-deleted', { product: deletedProduct[0] });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
