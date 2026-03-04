// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPYENQpIDmOM2M9ITNZpkeGtw910hAZWc",
  authDomain: "parking-bm.firebaseapp.com",
  projectId: "parking-bm",
  storageBucket: "parking-bm.appspot.com",
  messagingSenderId: "288115518754",
  appId: "1:288115518754:web:95d0b2ddf8fd63112c897b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Helper function to get all booked slots
async function getBookedSlotsFromFirebase() {
  try {
    const snapshot = await db.collection('bookedSlots').get();
    return snapshot.docs.map(doc => doc.data().slotId);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return [];
  }
}

// Helper function to upload GCash receipt to Firebase Storage
async function uploadGCashReceipt(slotId, receiptFile) {
  try {
    // Create a unique filename
    const timestamp = new Date().getTime();
    const extension = (receiptFile.name.split('.').pop() || 'jpg').toLowerCase();
    const filename = `gcash-receipts/${slotId}-${timestamp}.${extension}`;
    
    // Upload file to Storage
    const uploadTask = storage.ref(filename).put(receiptFile);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        null,
        (error) => {
          console.error('Error uploading receipt:', error);
          reject(error);
        },
        async () => {
          // Get download URL
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadGCashReceipt:', error);
    throw error;
  }
}

// Helper function to save a booked slot
async function saveBookedSlotToFirebase(slotId, bookingData, receiptUrl = null, receiptBase64 = null) {
  try {
    const booking = {
      slotId: slotId,
      name: bookingData.name,
      plate: bookingData.plate,
      vehicleType: bookingData.vehicleType,
      startDateTime: bookingData.startDateTime,
      endDateTime: bookingData.endDateTime,
      duration: bookingData.duration,
      cost: bookingData.cost,
      paymentMethod: bookingData.paymentMethod || 'card',
      bookedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Add receipt info and status for GCash payment
    if (booking.paymentMethod === 'gcash') {
      if (receiptUrl) {
        booking.receiptUrl = receiptUrl;
      }
      if (receiptBase64) {
        booking.receiptBase64 = receiptBase64;
      }
      booking.paymentStatus = 'pending_verification';
    } else {
      booking.paymentStatus = 'confirmed';
    }
    
    await db.collection('bookedSlots').doc(slotId).set(booking);
    return true;
  } catch (error) {
    console.error('Error saving booked slot:', error);
    return false;
  }
}
