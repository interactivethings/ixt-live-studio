import {Bucket} from "@google-cloud/storage";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as puppeteer from "puppeteer";
import {
  RTDBData,
  TeamCommunicationData,
  TeamCommunicationEntry,
} from "./types/firebase-types";

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
      const data = await ref.once("value");
      const dataValue = data.val();
      const preparedTeamCommunicationsData =
      prepareTeamCommunicationSync(dataValue);
      preparedTeamCommunicationsData.forEach(async (entry) => {
        await syncTeamMembersData(entry, "team-communication");
      });


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

const prepareTeamCommunicationSync =
(data: RTDBData<TeamCommunicationData>) => {
  const preparedData: TeamCommunicationEntry[] = [];

  const dataSource = data["team-communication"];
  for (const sensorKey in dataSource.sensors) {
    if (Object.prototype.hasOwnProperty
      .call(dataSource.sensors, sensorKey)) {
      const sensorData = dataSource.sensors[sensorKey].value;
      for (const key in sensorData) {
        if (Object.prototype.hasOwnProperty
          .call(sensorData, key)) {
          const incomingMember = sensorData[key];

          // Check if the member with the same id already exists
          const existingMemberIndex =
          preparedData.findIndex((member) => member.id === incomingMember.id);

          if (existingMemberIndex !== -1) {
            const existingMember = preparedData[existingMemberIndex];

            preparedData[existingMemberIndex] = {
              id: incomingMember.id,
              timestamp: Date.now(),
              connections:
              (Object.keys(existingMember.connections).length || 0) +
              (Object.keys(incomingMember.connections).length || 0),
              characters: (existingMember.characters || 0) +
              (incomingMember.characters || 0),
              messages: (existingMember.messages || 0)+
              (incomingMember.messages || 0),
              reactions: (existingMember.reactions || 0)+
              (incomingMember.reactions || 0),
            };
          } else {
            preparedData.push({
              id: incomingMember.id,
              timestamp: Date.now(),
              connections: Object.keys(incomingMember.connections).length || 0,
              characters: incomingMember.characters || 0,
              messages: incomingMember.messages || 0,
              reactions: incomingMember.reactions || 0,
            });
          }
        }
      }
    }
  }

  return preparedData;
};

const syncTeamMembersData = async (
  entry: TeamCommunicationEntry,
  stat: string,
) => {
  const userRef = firestore
    .collection("users")
    .doc(entry.id)
    .collection(`${stat}-stats`)
    .doc(`stat-${entry.id}`);
  await userRef.set(entry);
};
