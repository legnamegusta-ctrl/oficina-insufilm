import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "./firebase"
import type {
  ScheduleBlock,
  CashEntry,
  Customer,
  Vehicle,
  WorkOrder,
  Service,
  InventoryRoll,
  User,
  UserRole,
} from "./types"

// Customer operations
export const customerOperations = {
  async getAll(): Promise<Customer[]> {
    const querySnapshot = await getDocs(query(collection(db, "customers"), orderBy("name")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[]
  },

  async getById(id: string): Promise<Customer | null> {
    const docSnap = await getDoc(doc(db, "customers", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Customer
    }
    return null
  },

  async create(customerData: Omit<Customer, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "customers"), {
      ...customerData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, customerData: Partial<Omit<Customer, "id">>): Promise<void> {
    const customerRef = doc(db, "customers", id)
    await updateDoc(customerRef, customerData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "customers", id))
  },

  async search(searchTerm: string): Promise<Customer[]> {
    const customers = await this.getAll()
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm),
    )
  },
}

// Vehicle operations
export const vehicleOperations = {
  async getAll(): Promise<Vehicle[]> {
    const querySnapshot = await getDocs(query(collection(db, "vehicles"), orderBy("brand")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehicle[]
  },

  async getByCustomerId(customerId: string): Promise<Vehicle[]> {
    const querySnapshot = await getDocs(query(collection(db, "vehicles"), where("customerId", "==", customerId)))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehicle[]
  },

  async getById(id: string): Promise<Vehicle | null> {
    const docSnap = await getDoc(doc(db, "vehicles", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Vehicle
    }
    return null
  },

  async create(vehicleData: Omit<Vehicle, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "vehicles"), {
      ...vehicleData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, vehicleData: Partial<Omit<Vehicle, "id">>): Promise<void> {
    const vehicleRef = doc(db, "vehicles", id)
    await updateDoc(vehicleRef, vehicleData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "vehicles", id))
  },
}

// Work Order operations
export const orderOperations = {
  async getAll(): Promise<WorkOrder[]> {
    const querySnapshot = await getDocs(query(collection(db, "work_orders"), orderBy("createdAt", "desc")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkOrder[]
  },

  async getByStatus(status: WorkOrder["status"]): Promise<WorkOrder[]> {
    const querySnapshot = await getDocs(
      query(collection(db, "work_orders"), where("status", "==", status), orderBy("createdAt", "desc")),
    )
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkOrder[]
  },

  async getByInstaller(installerId: string): Promise<WorkOrder[]> {
    const querySnapshot = await getDocs(
      query(collection(db, "work_orders"), where("assignedTo", "==", installerId), orderBy("createdAt", "desc")),
    )
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkOrder[]
  },

  async getById(id: string): Promise<WorkOrder | null> {
    const docSnap = await getDoc(doc(db, "work_orders", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as WorkOrder
    }
    return null
  },

  async create(orderData: Omit<WorkOrder, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "work_orders"), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, orderData: Partial<Omit<WorkOrder, "id">>): Promise<void> {
    const orderRef = doc(db, "work_orders", id)
    await updateDoc(orderRef, {
      ...orderData,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "work_orders", id))
  },

  async updateStatus(id: string, status: WorkOrder["status"], userId: string): Promise<void> {
    await this.update(id, {
      status,
      updatedBy: userId,
    })
  },
}

// Service operations
export const serviceOperations = {
  async getAll(): Promise<Service[]> {
    const querySnapshot = await getDocs(query(collection(db, "services"), orderBy("name")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[]
  },

  async getActive(): Promise<Service[]> {
    const querySnapshot = await getDocs(query(collection(db, "services"), where("active", "==", true), orderBy("name")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[]
  },

  async getById(id: string): Promise<Service | null> {
    const docSnap = await getDoc(doc(db, "services", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Service
    }
    return null
  },

  async create(serviceData: Omit<Service, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "services"), {
      ...serviceData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, serviceData: Partial<Omit<Service, "id">>): Promise<void> {
    const serviceRef = doc(db, "services", id)
    await updateDoc(serviceRef, serviceData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "services", id))
  },
}

// Inventory operations
export const inventoryOperations = {
  async getAll(): Promise<InventoryRoll[]> {
    const querySnapshot = await getDocs(query(collection(db, "inventory"), orderBy("brand")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryRoll[]
  },

  async getLowStock(threshold = 5): Promise<InventoryRoll[]> {
    const inventory = await this.getAll()
    return inventory.filter((roll) => roll.availableLength <= threshold)
  },

  async getById(id: string): Promise<InventoryRoll | null> {
    const docSnap = await getDoc(doc(db, "inventory", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InventoryRoll
    }
    return null
  },

  async create(inventoryData: Omit<InventoryRoll, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "inventory"), {
      ...inventoryData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, inventoryData: Partial<Omit<InventoryRoll, "id">>): Promise<void> {
    const inventoryRef = doc(db, "inventory", id)
    await updateDoc(inventoryRef, inventoryData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "inventory", id))
  },

  async updateStock(id: string, usedLength: number): Promise<void> {
    const roll = await this.getById(id)
    if (roll) {
      const newAvailableLength = Math.max(0, roll.availableLength - usedLength)
      await this.update(id, { availableLength: newAvailableLength })
    }
  },

  async restockRoll(id: string, additionalLength: number): Promise<void> {
    const roll = await this.getById(id)
    if (roll) {
      const newAvailableLength = roll.availableLength + additionalLength
      const newTotalLength = Math.max(roll.totalLength, newAvailableLength)
      await this.update(id, {
        availableLength: newAvailableLength,
        totalLength: newTotalLength,
      })
    }
  },
}

// User operations
export const userOperations = {
  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(query(collection(db, "users"), orderBy("name")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...doc.data(),
    })) as User[]
  },

  async getByRole(role: UserRole): Promise<User[]> {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", role), orderBy("name")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...doc.data(),
    })) as User[]
  },

  async getById(id: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, "users", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, uid: docSnap.id, ...docSnap.data() } as User
    }
    return null
  },

  async create(userData: Omit<User, "id" | "uid">): Promise<string> {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, userData: Partial<Omit<User, "id" | "uid">>): Promise<void> {
    const userRef = doc(db, "users", id)
    await updateDoc(userRef, userData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "users", id))
  },
}

// User management functions
export async function getAllUsers(): Promise<User[]> {
  return await userOperations.getAll()
}

export async function createUser(
  email: string,
  password: string,
  userData: Omit<User, "id" | "uid" | "email">,
): Promise<string> {
  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const uid = userCredential.user.uid

  // Create user document in Firestore
  await updateDoc(doc(db, "users", uid), {
    ...userData,
    email,
    createdAt: Timestamp.now(),
  })

  return uid
}

export async function updateUser(id: string, userData: Partial<Omit<User, "id" | "uid">>): Promise<void> {
  return await userOperations.update(id, userData)
}

export async function deleteUser(id: string): Promise<void> {
  return await userOperations.delete(id)
}

// Schedule operations
export const scheduleOperations = {
  async getAll(): Promise<ScheduleBlock[]> {
    const querySnapshot = await getDocs(query(collection(db, "schedule"), orderBy("start")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ScheduleBlock[]
  },

  async getByDateRange(startDate: Date, endDate: Date): Promise<ScheduleBlock[]> {
    const startTimestamp = Timestamp.fromDate(startDate)
    const endTimestamp = Timestamp.fromDate(endDate)

    const querySnapshot = await getDocs(
      query(
        collection(db, "schedule"),
        where("start", ">=", startTimestamp),
        where("start", "<=", endTimestamp),
        orderBy("start"),
      ),
    )
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ScheduleBlock[]
  },

  async getByInstaller(installerId: string): Promise<ScheduleBlock[]> {
    const querySnapshot = await getDocs(
      query(collection(db, "schedule"), where("installerId", "==", installerId), orderBy("start")),
    )
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ScheduleBlock[]
  },

  async getById(id: string): Promise<ScheduleBlock | null> {
    const docSnap = await getDoc(doc(db, "schedule", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ScheduleBlock
    }
    return null
  },

  async create(scheduleData: Omit<ScheduleBlock, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "schedule"), {
      ...scheduleData,
      start: Timestamp.fromDate(new Date(scheduleData.start as any)),
      end: Timestamp.fromDate(new Date(scheduleData.end as any)),
    })
    return docRef.id
  },

  async update(id: string, scheduleData: Partial<Omit<ScheduleBlock, "id">>): Promise<void> {
    const scheduleRef = doc(db, "schedule", id)
    const updateData = { ...scheduleData }

    if (scheduleData.start) {
      updateData.start = Timestamp.fromDate(new Date(scheduleData.start as any))
    }
    if (scheduleData.end) {
      updateData.end = Timestamp.fromDate(new Date(scheduleData.end as any))
    }

    await updateDoc(scheduleRef, updateData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "schedule", id))
  },
}

// Cash operations
export const cashOperations = {
  async getAll(): Promise<CashEntry[]> {
    const querySnapshot = await getDocs(query(collection(db, "cash_entries"), orderBy("at", "desc")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CashEntry[]
  },

  async getByDateRange(startDate: Date, endDate: Date): Promise<CashEntry[]> {
    const startTimestamp = Timestamp.fromDate(startDate)
    const endTimestamp = Timestamp.fromDate(endDate)

    const querySnapshot = await getDocs(
      query(
        collection(db, "cash_entries"),
        where("at", ">=", startTimestamp),
        where("at", "<=", endTimestamp),
        orderBy("at", "desc"),
      ),
    )
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CashEntry[]
  },

  async getByType(type: "receita" | "despesa"): Promise<CashEntry[]> {
    const querySnapshot = await getDocs(
      query(collection(db, "cash_entries"), where("type", "==", type), orderBy("at", "desc")),
    )
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CashEntry[]
  },

  async getById(id: string): Promise<CashEntry | null> {
    const docSnap = await getDoc(doc(db, "cash_entries", id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CashEntry
    }
    return null
  },

  async create(cashData: Omit<CashEntry, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "cash_entries"), {
      ...cashData,
      at: Timestamp.fromDate(new Date(cashData.at as any)),
    })
    return docRef.id
  },

  async update(id: string, cashData: Partial<Omit<CashEntry, "id">>): Promise<void> {
    const cashRef = doc(db, "cash_entries", id)
    const updateData = { ...cashData }

    if (cashData.at) {
      updateData.at = Timestamp.fromDate(new Date(cashData.at as any))
    }

    await updateDoc(cashRef, updateData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "cash_entries", id))
  },

  async recordOrderPayment(orderId: string, amount: number, method: string, userId: string): Promise<string> {
    return await this.create({
      type: "receita",
      amount,
      method: method as any,
      refOrderId: orderId,
      notes: `Pagamento da OS #${orderId.slice(-6)}`,
      at: new Date(),
      by: userId,
    })
  },

  async getSummaryByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalReceita: number
    totalDespesa: number
    balance: number
    byMethod: Record<string, number>
  }> {
    const entries = await this.getByDateRange(startDate, endDate)

    const summary = {
      totalReceita: 0,
      totalDespesa: 0,
      balance: 0,
      byMethod: {} as Record<string, number>,
    }

    entries.forEach((entry) => {
      if (entry.type === "receita") {
        summary.totalReceita += entry.amount
      } else {
        summary.totalDespesa += entry.amount
      }

      if (entry.method) {
        summary.byMethod[entry.method] = (summary.byMethod[entry.method] || 0) + entry.amount
      }
    })

    summary.balance = summary.totalReceita - summary.totalDespesa

    return summary
  },
}
