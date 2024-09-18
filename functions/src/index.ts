import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

const firestore = admin.firestore();
const rtdb = admin.database();

exports.updateActiveMetric = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const projectConfigDoc = await firestore
        .collection("project")
        .doc("config")
        .get();

      if (!projectConfigDoc.exists) {
        console.log("No project config found!");
        return null;
      }

      const projectConfig = projectConfigDoc.data();

      const metricArray = projectConfig?.metric;

      if (!Array.isArray(metricArray) || metricArray.length === 0) {
        console.log("Metric array is empty or invalid");
        return null;
      }

      const activeRef = rtdb.ref("/active");
      const activeSnapshot = await activeRef.once("value");
      const currentActive = activeSnapshot.val();

      const currentIndex = metricArray.indexOf(currentActive);

      let nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;

      if (nextIndex >= metricArray.length) {
        nextIndex = 0;
      }

      const nextActive = metricArray[nextIndex];
      await activeRef.set(nextActive);

      console.log(`Updated active value to: ${nextActive}`);

      return null;
    } catch (error) {
      console.error("Error updating active value:", error);
      return null;
    }
  });

exports.clearRealtimeDatabase = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (_) => {
    const pathToClear = "/data";

    try {
      const ref = rtdb.ref(pathToClear);

      await ref.remove();

      console.log(`Successfully cleared the path: ${pathToClear}`);
      return null;
    } catch (error) {
      console.error("Error clearing Realtime Database path:", error);
      return null;
    }
  });
