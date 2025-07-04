import { https, config } from 'firebase-functions';
import admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();
const db = admin.firestore();

export const verifyPaystackPayment = https.onCall(async (data, context) => {
  const { reference, courseId, userId } = data;

  const paystackSecretKey = config().paystack.secret;
  if (!paystackSecretKey) {
    console.error('Configuration error: Paystack secret key missing');
    throw new https.HttpsError('internal', 'Server configuration error.');
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${paystackSecretKey}` },
      }
    );

    console.log(
      'Paystack API response:',
      JSON.stringify(response.data, null, 2)
    );
    const transactionData = response.data.data;

    if (transactionData.status !== 'success') {
      console.error('Payment verification failed:', transactionData.status);
      throw new https.HttpsError(
        'internal',
        `Payment was not successful: ${transactionData.status}`
      );
    }

    console.log('Fetching course document...');
    const courseRef = db.collection('courses').doc(courseId);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) {
      console.error('Course not found:', courseId);
      throw new https.HttpsError('not-found', 'Course not found.');
    }

    const coursePrice = parseFloat(courseSnap.data().coursePrice) || 0;
    const amountInDollars = transactionData.amount / 100;

    console.log('Payment validation:', { amountInDollars, coursePrice });
    if (amountInDollars < coursePrice) {
      console.error('Amount validation failed:', {
        amountInDollars,
        coursePrice,
      });
      throw new https.HttpsError(
        'internal',
        'Paid amount is less than course price.'
      );
    }

    console.log('Creating enrollment document...');
    const enrollmentRef = await db.collection('enrollments').add({
      userId: userId,
      courseId: courseId,
      amountPaid: amountInDollars,
      currency: transactionData.currency,
      paymentReference: reference,
      status: 'enrolled',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Enrollment document created with ID:', enrollmentRef.id);

    console.log('Updating dashboard_summary...');
    const earningsRef = db
      .collection('dashboard_summary')
      .doc('overall_earnings');
    await earningsRef.set(
      {
        total: admin.firestore.FieldValue.increment(amountInDollars),
      },
      { merge: true }
    );
    console.log('Dashboard summary updated');

    console.log('Updating user enrolledCourses...');
    const userRef = db.collection('users').doc(userId);
    await userRef.set(
      {
        enrolledCourses: admin.firestore.FieldValue.arrayUnion(courseId),
      },
      { merge: true }
    );
    console.log('User enrolledCourses updated');

    console.log('Function completed successfully');
    return { success: true, enrollmentId: enrollmentRef.id };
  } catch (error) {
    console.error('Error in verifyPaystackPayment:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    throw new https.HttpsError('internal', `Error: ${error.message}`);
  }
});
