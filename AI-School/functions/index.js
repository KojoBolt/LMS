// functions/index.js

// --- Imports for all functions ---
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { defineString } from "firebase-functions/params";
import axios from "axios";

// --- Initialize Firebase Services Once at the top ---
initializeApp();
const db = getFirestore();
const adminAuth = getAuth();

// --- Define Secrets Once ---
const paystackSecretKey = defineString("PAYSTACK_SECRET");


// ========================================================================
// --- 1. Your Existing, Working Paystack Verification Function ---
// ========================================================================
// THIS FUNCTION HAS NOT BEEN CHANGED.
export const verifyPaystackPayment = onCall(async (request) => {
  if (!request.auth) {
    console.error("Authentication failed: User not logged in.");
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const { reference, courseId } = request.data;
  const userId = request.auth.uid;

  console.log("Verifying payment for:", { reference, courseId, userId });

  if (!reference || !courseId) {
    throw new HttpsError("invalid-argument", "Required parameters are missing.");
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${paystackSecretKey.value()}` },
      }
    );

    const transactionData = response.data.data;
    if (transactionData.status !== "success") {
      throw new HttpsError("internal", "Payment was not successful with Paystack.");
    }

    const courseRef = db.collection("courses").doc(courseId);
    const courseSnap = await courseRef.get(); 
    if (!courseSnap.exists) {
      throw new HttpsError("not-found", "Course not found.");
    }

    const coursePrice = parseFloat(courseSnap.data().coursePrice) || 0;
    const discountPrice = parseFloat(courseSnap.data().discountPrice) || 0;
    const expectedAmount = (discountPrice > 0 ? discountPrice : coursePrice);
    const amountPaid = transactionData.amount / 100;

    if (Math.abs(amountPaid - expectedAmount) > 0.01) {
      console.error("Amount validation failed:", { amountPaid, expectedAmount });
      throw new HttpsError("internal", "Paid amount does not match course price.");
    }

    const batch = db.batch();

    const enrollmentRef = db.collection("enrollments").doc();
    batch.set(enrollmentRef, {
      userId: userId,
      courseId: courseId,
      amountPaid: amountPaid,
      currency: transactionData.currency,
      paymentReference: reference,
      status: "enrolled",
      createdAt: FieldValue.serverTimestamp(),
    });

    const earningsRef = db.collection("dashboard_summary").doc("overall_earnings");
    batch.set(earningsRef, {
        total: FieldValue.increment(amountPaid)
    }, { merge: true });

    const userRef = db.collection("users").doc(userId);
    batch.set(userRef, {
        enrolledCourses: FieldValue.arrayUnion(courseId),
    }, { merge: true });

    await batch.commit();
    console.log("Database updated successfully for user:", userId);

    return { success: true, message: "Enrollment successful!" };

  } catch (error) {
    console.error("Error in verifyPaystackPayment:", error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError("internal", "An unexpected error occurred during verification.");
  }
});


// ========================================================================
// --- 2. UPDATED Function to Create Users with Roles ---
// ========================================================================
// This replaces the old 'createAdminUser' function with a more flexible one.
export const createUserWithRole = onCall(async (request) => {
    if (request.auth?.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can create new users.');
    }

    const { email, password, name, profilePicUrl, role } = request.data;

    if (!email || !password || !name || !role) {
        throw new HttpsError('invalid-argument', 'Missing required fields: email, password, name, and role.');
    }
    
    const allowedRoles = ['admin', 'instructor'];
    if (!allowedRoles.includes(role)) {
        throw new HttpsError('invalid-argument', 'Invalid role specified.');
    }

    try {
        const userRecord = await adminAuth.createUser({
            email: email,
            password: password,
            displayName: name,
            photoURL: profilePicUrl || null,
        });

        await adminAuth.setCustomUserClaims(userRecord.uid, { role: role });

        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            name: name,
            email: email,
            role: role,
            profilePicUrl: profilePicUrl || '',
            createdAt: new Date().toISOString(),
            enrolledCourses: []
        });

        console.log(`Successfully created new ${role}:`, userRecord.uid);
        return { success: true, uid: userRecord.uid };

    } catch (error) {
        console.error(`Error creating new ${role}:`, error);
        throw new HttpsError('internal', error.message);
    }
});


// ========================================================================
// --- 3. Temporary Function to Create the First Admin ---
// ========================================================================
// THIS FUNCTION HAS NOT BEEN CHANGED.
export const setInitialAdmin = onCall(async (request) => {
  if (request.auth?.token.email !== 'kojobolt@gmail.com') {
    throw new HttpsError('permission-denied', 'You are not authorized to perform this action.');
  }

  try {
    const adminUid = request.auth.uid;
    await adminAuth.setCustomUserClaims(adminUid, { role: 'admin' });

    const userRef = db.collection('users').doc(adminUid);
    await userRef.set({ role: 'admin' }, { merge: true });

    return { success: true, message: `User ${adminUid} has been made an admin.` };
  } catch (error) {
    console.error("Error setting initial admin:", error);
    throw new HttpsError('internal', 'Failed to set admin role.');
  }
});

// ========================================================================
// --- 4. Function to Delete an Admin User ---
// ========================================================================
// THIS FUNCTION HAS NOT BEEN CHANGED.
export const deleteAdminUser = onCall(async (request) => {
    if (request.auth?.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can delete users.');
    }

    const { uid: uidToDelete } = request.data;
    const requestingAdminUid = request.auth.uid;

    if (!uidToDelete) {
        throw new HttpsError('invalid-argument', 'A user ID must be provided to delete.');
    }

    if (uidToDelete === requestingAdminUid) {
        throw new HttpsError('permission-denied', 'Admins cannot delete their own accounts.');
    }

    try {
        await adminAuth.deleteUser(uidToDelete);
        const userDocRef = db.collection('users').doc(uidToDelete);
        await userDocRef.delete();
        return { success: true, message: `User ${uidToDelete} has been deleted.` };
    } catch (error) {
        console.error('Error deleting admin user:', error);
        throw new HttpsError('internal', `Failed to delete user: ${error.message}`);
    }
});
