// Simple test to check if our purchase flow works and updates product status
const testProduct = {
  id: "test-product-123",
  title: "Test Product",
  price: 100,
  imageUrl: "test.jpg",
  sellerId: "seller-123",
  sellerName: "Test Seller"
};

const testCartItem = {
  userId: "buyer-123",
  productId: "test-product-123",
  product: testProduct,
  quantity: 1,
  addedAt: new Date()
};

console.log("Test data prepared:");
console.log("Product:", testProduct);
console.log("Cart item:", testCartItem);
console.log("This would test the purchase flow to mark products as sold");
