import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate required environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAaaXxKG4BwAKIBdDk0vrSNsQzK8BbWIA0",
  authDomain: "brancofilmcv.firebaseapp.com",
  projectId: "brancofilmcv",
  storageBucket: "brancofilmcv.firebasestorage.app",
  messagingSenderId: "513537369615",
  appId: "1:513537369615:web:6cfec35394b5852857e57a"
};

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("Missing required Firebase environment variables:", missingEnvVars)
  console.error("Please add these variables to your .env.local file:")
  missingEnvVars.forEach((envVar) => {
    console.error(`${envVar}=your_${envVar.toLowerCase().replace("next_public_firebase_", "")}_here`)
  })

  throw new Error(
    `Missing Firebase configuration. Please set the following environment variables: ${missingEnvVars.join(", ")}`,
  )
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
