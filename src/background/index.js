const fs = require("fs");
const path = require("path");

class BackgroundServiceManager {
  constructor() {
    this.services = [];
  }

  loadServices() {
    const servicesDir = __dirname;

    const files = fs
      .readdirSync(servicesDir)
      .filter(
        (file) =>
          file !== "index.js" &&
          file.endsWith(".js")
      );

    for (const file of files) {
      try {
        const service = require(path.join(servicesDir, file));

        if (service && typeof service.init === "function") {
          this.services.push(service);
          console.log(`✔ Loaded background service: ${service.name || file}`);
        } else {
          console.warn(`⚠ Skipped ${file} (invalid service format)`);
        }
      } catch (err) {
        console.error(`❌ Failed to load service ${file}`, err);
      }
    }
  }

  startAll() {
    console.log("\n🚀 Starting Background Services...\n");

    for (const service of this.services) {
      try {
        service.init();
      } catch (err) {
        console.error(`❌ Failed to start ${service.name}`, err);
      }
    }

    console.log("\n✅ All background services initialized\n");
  }

  stopAll() {
    for (const service of this.services) {
      try {
        if (service.stop) service.stop();
      } catch (err) {
        console.error(`Error stopping ${service.name}`, err);
      }
    }
  }
}

const manager = new BackgroundServiceManager();

module.exports = manager;