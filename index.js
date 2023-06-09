/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');

admin.initializeApp();

const firestore = admin.firestore();
const prisma = new PrismaClient({
    datasources: {
      db: {
        url: functions.config().prisma.db_url,
      },
    },
});
// Cloud Function for users collection
exports.createBenefactor = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const newValue = snap.data();
    const benefactorData = {
      name: newValue.fullname,
      CI: newValue.ci,
      lat: newValue.address.latitude,
      lng: newValue.address.longitude,
      phone: newValue.phone,
      email: newValue.email,
      firebase_id: context.params.userId,
    };
    return prisma.benefactor.create({ data: benefactorData });
  });

// Cloud Function for donations collection
exports.createDonation = functions.firestore
  .document('donations/{donationId}')
  .onCreate(async (snap, context) => {
      const newValue = snap.data();
      console.log(newValue)
      const benefactor = await prisma.benefactor.findFirst({ where: { firebase_id: newValue.userId } });
      console.log(benefactor)
    const donationData = {
        campaign_id: newValue.campaignId,
        institution_id: newValue.institutionId,
        benefactor_id: benefactor.id,
        description: newValue.description,
        quantity: parseInt(newValue.quantity),
        donation_date: newValue.donation_date.toDate(),
        status: newValue.status,
        anonymous: newValue.anonymous,
        firebase_id: context.params.donationId,
    };
    return prisma.donation.create({ data: donationData });
  });