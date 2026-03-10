const cron = require("node-cron");
const axios = require("axios");
const { Receipts } = require("../models");

class ReceiptSyncService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
    this.baseUrl = process.env.RECEIPTS_BASE_URL;
  }

  init() {
    this.cronJob = cron.schedule(
      "0 3 * * *",
      async () => {
        await this.syncReceipts();
      },
      {
        scheduled: true,
        timezone: "Africa/Cairo",
      },
    );

    console.log(
      "Receipt Sync Service initialized - Running daily at 03:00 AM Egypt time",
    );
  }

  async syncReceipts() {
    if (this.isRunning) {
      console.log("ReceiptSync already running... skipping");
      return;
    }

    this.isRunning = true;

    console.log("\n=========== RECEIPTS SYNC STARTED ===========");

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/payments/receipts`,
        {
          params: {
            connectionTypeIds: 1,
          },
        },
      );

      const receipts = response.data;

      console.log(`Receipts received from API: ${receipts.length}`);

      for (const receipt of receipts) {
        try {
          await this.processReceipt(receipt);
        } catch (err) {
          console.error(
            `Error processing receipt ${receipt.id}:`,
            err.message,
          );
        }
      }

      console.log("Receipts sync completed successfully");
    } catch (error) {
      console.error("Fatal receipt sync error:", error.message);
    } finally {
      this.isRunning = false;
      console.log("=============================================\n");
    }
  }

  // ======================================================
  // PROCESS SINGLE RECEIPT
  // ======================================================
  async processReceipt(receipt) {
    await Receipts.upsert({
      receiptId: receipt.id,
      receiptSerialNumber: receipt.receiptSerialNumber,
      receiptName: receipt.receiptName,
      description: receipt.description,
      receiptTypeName: receipt.receiptTypeName,
      receiptTypeDescription: receipt.receiptTypeDescription,
      totalAmount: receipt.totalAmount,
      currency: receipt.currency,
    });

    console.log(`Receipt synced: ${receipt.receiptSerialNumber}`);
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("🛑 Receipt Sync Service stopped");
    }
  }
}

const service = new ReceiptSyncService();

module.exports = {
  name: "ReceiptSyncService",
  init: () => service.init(),
  stop: () => service.stop(),
};