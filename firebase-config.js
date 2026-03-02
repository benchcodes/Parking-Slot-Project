// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPYENQpIDmOM2M9ITNZpkeGtw910hAZWc",
  authDomain: "parking-bm.firebaseapp.com",
  projectId: "parking-bm",
  storageBucket: "parking-bm.firebasestorage.app",
  messagingSenderId: "288115518754",
  appId: "1:288115518754:web:95d0b2ddf8fd63112c897b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

// Helper function to save a booked slot
async function saveBookedSlotToFirebase(slotId, bookingData) {
  try {
    await db.collection('bookedSlots').doc(slotId).set({
      slotId: slotId,
      name: bookingData.name,
      plate: bookingData.plate,
      vehicleType: bookingData.vehicleType,
      startDateTime: bookingData.startDateTime,
      endDateTime: bookingData.endDateTime,
      duration: bookingData.duration,
      cost: bookingData.cost,
      bookedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving booked slot:', error);
    return false;
  }
}
