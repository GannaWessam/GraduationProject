const cron = require("node-cron");
const { event } = require("../models/index.js");
const {
  closeEventById,
} = require("../modules/admin/eventManagement/eventService.js");
const { Op } = require("sequelize");

class CloseExpiredEventsService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
  }

  init() {
    this.cronJob = cron.schedule(
      "0 0 * * *",
      async () => {
        await this.processExpiredEvents();
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    console.log(
      "Close Expired Events Service initialized - Running daily at 00:00 UTC"
    );
  }

  async processExpiredEvents() {
    if (this.isRunning) {
      console.log(
        "Close Expired Events process already running, skipping..."
      );
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    console.log(
      `\n[${startTime.toISOString()}] Starting expired events check...`
    );

    try {
      const currentDate = new Date();

      const expiredEvents = await event.findAll({
        where: {
          endDateRes: {
            [Op.lt]: currentDate,
          },
          status: {
            [Op.ne]: "closed",
          },
        },
        attributes: ["eventId", "eventName", "endDateRes", "status", "type"],
      });

      if (expiredEvents.length === 0) {
        console.log("No expired events found to close.");
        this.isRunning = false;
        return;
      }

      console.log(
        `Found ${expiredEvents.length} expired event(s) to close:`
      );

      const closedEvents = [];
      const failedEvents = [];

      for (const expiredEvent of expiredEvents) {
        try {
          console.log(
            `\nProcessing event: ${expiredEvent.eventName} (ID: ${expiredEvent.eventId})`
          );
          console.log(`Type: ${expiredEvent.type}`);
          console.log(`Reservation End Date: ${expiredEvent.endDateRes}`);
          console.log(`Current Status: ${expiredEvent.status}`);

          await closeEventById(expiredEvent.eventId);

          closedEvents.push({
            eventId: expiredEvent.eventId,
            eventName: expiredEvent.eventName,
            type: expiredEvent.type,
          });

          console.log(`Successfully closed event: ${expiredEvent.eventName}`);
        } catch (error) {
          console.error(
            `Failed to close event ${expiredEvent.eventName} (ID: ${expiredEvent.eventId}):`,
            error.message
          );

          failedEvents.push({
            eventId: expiredEvent.eventId,
            eventName: expiredEvent.eventName,
            error: error.message,
          });
        }
      }

      const endTime = new Date();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(
        `\n[${endTime.toISOString()}] Expired Events Processing Summary:`
      );
      console.log(`Successfully closed: ${closedEvents.length} event(s)`);
      console.log(`Failed to close: ${failedEvents.length} event(s)`);
      console.log(`Total duration: ${duration} seconds`);

      if (closedEvents.length > 0) {
        console.log(`\nClosed Events List:`);
        closedEvents.forEach((evt, index) => {
          console.log(
            `${index + 1}. ${evt.eventName} (${evt.type}) - ID: ${evt.eventId}`
          );
        });
      }

      if (failedEvents.length > 0) {
        console.log(`\nFailed Events List:`);
        failedEvents.forEach((evt, index) => {
          console.log(`${index + 1}. ${evt.eventName} - ID: ${evt.eventId}`);
          console.log(`Error: ${evt.error}`);
        });
      }

      console.log("─".repeat(60));
    } catch (error) {
      console.error("Error in Close Expired Events Service:", error.message);
      console.error("Stack trace:", error.stack);
    } finally {
      this.isRunning = false;
    }
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("🛑 Close Expired Events Service stopped");
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.cronJob !== null && this.cronJob.running !== null,
    };
  }
}

const closeExpiredEventsService = new CloseExpiredEventsService();

module.exports = closeExpiredEventsService;
