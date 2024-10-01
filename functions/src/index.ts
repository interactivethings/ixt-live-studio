import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as puppeteer from "puppeteer";
import * as path from "path";
import {Bucket} from "@google-cloud/storage";

admin.initializeApp();

const firestore = admin.firestore();
const rtdb = admin.database();
const storage = admin.storage();

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
      const bucket = storage.bucket();
      const screenshotFilePath = await takeScreenshotAndUpload(bucket);

      console.log(`Screenshot saved at: ${screenshotFilePath}`);

      const ref = rtdb.ref(pathToClear);
      await ref.remove();

      await initializeRealtimeDatabase();

      console.log(`Successfully cleared the path: ${pathToClear}`);
      return null;
    } catch (error) {
      console.error("Error clearing Realtime Database path:", error);
      return null;
    }
  });

const takeScreenshotAndUpload = async (bucket: Bucket) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const url = "https://ixt-live-studio.vercel.app";
  await page.goto(url, {waitUntil: "networkidle2"});

  await new Promise((resolve) => setTimeout(resolve, 60000));

  const screenshotBuffer = await page.screenshot({fullPage: true});
  const date = new Date().toISOString().split("T")[0];
  const screenshotFileName = `snapshot_${date}.png`;

  const file = bucket.file(screenshotFileName);

  await file.save(screenshotBuffer, {
    contentType: "image/png",
    metadata: {
      firebaseStorageDownloadTokens: Date.now(),
    },
  });

  await browser.close();

  return screenshotFileName;
};

const initializeRealtimeDatabase = async () => {
  const ref = await firestore.collection("metrics").get();
  const metrics = ref.docs.map((doc) => doc.data());
  const dataRef = rtdb.ref("/data");
  metrics.forEach((metric) => {
    dataRef.child(metric.id).set({
      title: metric.title,
      description: metric.description,
      sensors: {},
    });
  });
};
