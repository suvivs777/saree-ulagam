import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection and ensure ADMIN-001 user doc + migrate any old SRM-1001 references on startup
async function testConnectionAndMigrate() {
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));

    // Ensure admin user doc id = "ADMIN-001"
    await setDoc(
      doc(firestoreDb, 'users', 'ADMIN-001'),
      {
        id: 'ADMIN-001',
        referralId: 'ADMIN-001',
        fullName: 'Root System Administrator',
        mobile: '7339267709',
        deliveryAddress: 'Admin HQ, Saree MLM Towers, Surat, Gujarat - 395002',
        role: 'admin',
        status: 'active',
        joinAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Migrate any users with referredBy === "SRM-1001" or sponsorReferralId === "SRM-1001" to "ADMIN-001"
    const snap = await getDocs(collection(firestoreDb, 'users'));
    for (const userDoc of snap.docs) {
      const data = userDoc.data();
      if (data.referredBy === 'SRM-1001' || data.sponsorReferralId === 'SRM-1001') {
        await updateDoc(doc(firestoreDb, 'users', userDoc.id), {
          referredBy: 'ADMIN-001',
          sponsorReferralId: 'ADMIN-001',
          level: 1,
          badge: '1st Member',
          tag: 'Direct Member of Admin',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection check: Client offline or unreachable.');
    }
  }
}

testConnectionAndMigrate();
