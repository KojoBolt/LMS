import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineString } from "firebase-functions/params";
import axios from "axios";

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

// Define the Paystack secret key as a parameter
const paystackSecretKey = defineString("PAYSTACK_SECRET");

export const verifyPaystackPayment = onCall(async (request) => {
  // 1. Check for authentication
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
    // 2. Verify the transaction with Paystack
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

    // 3. Verify the amount paid
    const courseRef = db.collection("courses").doc(courseId);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) {
      throw new HttpsError("not-found", "Course not found.");
    }

    // --- THIS IS THE FIX ---
    // The logic now correctly checks for a discount price, matching the frontend.
    const coursePrice = parseFloat(courseSnap.data().coursePrice) || 0;
    const discountPrice = parseFloat(courseSnap.data().discountPrice) || 0;
    const expectedAmount = (discountPrice > 0 ? discountPrice : coursePrice);
    const amountPaid = transactionData.amount / 100; // Amount from Paystack is in kobo/pesewas

    // Use a small tolerance for floating point comparisons
    if (Math.abs(amountPaid - expectedAmount) > 0.01) {
      console.error("Amount validation failed:", { amountPaid, expectedAmount });
      throw new HttpsError("internal", "Paid amount does not match course price.");
    }
    // --- END OF FIX ---

    // 4. Create enrollment and update earnings in a batch for safety
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