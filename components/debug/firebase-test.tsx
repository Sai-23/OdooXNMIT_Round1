/**
 * Quick Firebase Test Component
 * Add this to your products page to test Firebase connection
 */

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'

export function FirebaseTest() {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setTestResult('Testing...')

    try {
      // Test 1: Try to read products
      const productsRef = collection(db, 'products')
      const snapshot = await getDocs(productsRef)
      
      if (snapshot.empty) {
        setTestResult(`✅ Connected! No products found. (${snapshot.size} documents)`)
        
        // Test 2: Try to create a test product
        const testProduct = {
          title: 'Test Product',
          description: 'Auto-created test product',
          category: 'Electronics',
          price: 100,
          imageUrl: '/placeholder.jpg',
          condition: 'good',
          location: 'Test City',
          sellerId: 'test-user',
          sellerName: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        }
        
        const docRef = await addDoc(productsRef, testProduct)
        setTestResult(`✅ Connected & Test product created! ID: ${docRef.id}`)
        
      } else {
        setTestResult(`✅ Connected! Found ${snapshot.size} products.`)
      }
      
    } catch (error: any) {
      console.error('Firebase test error:', error)
      
      if (error.code === 'permission-denied') {
        setTestResult(`❌ Permission Denied: Update your Firestore security rules!`)
      } else if (error.code === 'auth/invalid-api-key') {
        setTestResult(`❌ Invalid API Key: Check your Firebase configuration.`)
      } else {
        setTestResult(`❌ Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold mb-2">🔥 Firebase Connection Test</h3>
      <button 
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
      >
        {loading ? 'Testing...' : 'Test Firebase'}
      </button>
      {testResult && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
          {testResult}
        </div>
      )}
    </div>
  )
}
