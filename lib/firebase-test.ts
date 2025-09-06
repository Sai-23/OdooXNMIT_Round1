// Firebase connection test utility
import { db } from "./firebase"
import { collection, getDocs, addDoc } from "firebase/firestore"

export async function testFirebaseConnection() {
  console.log("Testing Firebase connection...")
  
  try {
    // Test reading from products collection
    console.log("1. Testing read access to products collection...")
    const productsRef = collection(db, "products")
    const snapshot = await getDocs(productsRef)
    console.log("✅ Successfully read products collection. Documents found:", snapshot.size)
    
    // List all documents
    snapshot.docs.forEach((doc) => {
      console.log("Document ID:", doc.id, "Data:", doc.data())
    })
    
    return {
      success: true,
      documentsFound: snapshot.size,
      message: `Successfully connected to Firebase. Found ${snapshot.size} documents.`
    }
    
  } catch (error: any) {
    console.error("❌ Firebase connection failed:", error)
    
    return {
      success: false,
      error: error.message,
      message: `Failed to connect to Firebase: ${error.message}`
    }
  }
}

export async function testCreateProduct() {
  console.log("Testing product creation...")
  
  try {
    const testProduct = {
      title: "Test Product",
      description: "This is a test product to verify Firebase is working",
      category: "Electronics",
      price: 50,
      imageUrl: "/placeholder.jpg",
      condition: "good",
      location: "Test City",
      sellerId: "test-user-id",
      sellerName: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active"
    }
    
    const productsRef = collection(db, "products")
    const docRef = await addDoc(productsRef, testProduct)
    console.log("✅ Test product created with ID:", docRef.id)
    
    return {
      success: true,
      productId: docRef.id,
      message: `Successfully created test product with ID: ${docRef.id}`
    }
    
  } catch (error: any) {
    console.error("❌ Failed to create test product:", error)
    
    return {
      success: false,
      error: error.message,
      message: `Failed to create test product: ${error.message}`
    }
  }
}
