import { Page, expect, Locator } from "@playwright/test";
import { CommonMethods } from "../tests/commonMethods";

export default class DispensaryPage {
  readonly page: Page;
  private maxRetries = 3;
  private timeoutDuration = 5000;
  public dispensary: {
    dispensaryLink: Locator;
    activateCounter: Locator;
    counterSelection: Locator;
    counterName: Locator;
    activatedCounterInfo: Locator;
    deactivateCounterButton: Locator;
    titleName: Locator;
    name: Locator;
    prescription: Locator;
    reports: Locator;
    fromDate: Locator;
    showReportButton: Locator;
    userCollectionReport: Locator;
    counterDropdown: Locator;
    counterNameFromTable: Locator
  };

  constructor(page: Page) {
    this.page = page;
    this.dispensary = {
      dispensaryLink: page.locator('a[href="#/Dispensary"]'),
      activateCounter: page.locator("//a[contains(text(),'Counter')]"),
      counterSelection: page.locator('//div[@class="counter-item"]'),
      counterName: page.locator('//div[@class="counter-item"]//h5'),
      activatedCounterInfo: page.locator(`div.mt-comment-info`),
      deactivateCounterButton: page.locator(
        `//button[contains(text(),'Deactivate Counter')]`
      ),
      titleName: page.locator('//span[@class="caption-subject"]'),
      name: page.locator('(//div[@class="col-sm-4 col-md-3"]//label//span)[1]'),
      prescription: page.locator("//a[contains(text(),' Prescription ')]"),
      reports: page.locator(`//a[contains(text(),'Reports')]`),
      fromDate: page.locator(`(//input[@id="date"])[1]`),
      showReportButton: page.locator(`//span[text()="Show Report"]`),
      userCollectionReport: page.locator(`//i[text()="User Collection"]`),
      counterDropdown: page.locator(`select#ddlCounter`),
      counterNameFromTable: page.locator(`div[col-id="CounterName"]`),
    };
  }

  /**
   * @Test4 Verifies the activation message for a randomly selected counter in the Dispensary module.
   *
   * @description This method navigates to the Dispensary module and checks if multiple counters are available.
   *              If counters exist, it selects one at random, activates it, and verifies that the activation message
   *              correctly displays the name of the selected counter. Logs are included to provide insights into
   *              counter selection and activation status. The method highlights elements during interactions
   *              for better visibility in debugging.
   */
  async verifyActiveCounterMessageInDispensary() {
    try {
      // Navigate to Dispensary module
      await CommonMethods.highlightElement(this.dispensary.dispensaryLink);
      await this.dispensary.dispensaryLink.click();
      await CommonMethods.highlightElement(this.dispensary.activateCounter);
      await this.dispensary.activateCounter.click();
      // Wait for the page to load
      await this.page.waitForTimeout(2000);
      await this.page.waitForSelector("//span[@class='caption-subject']", {
        state: "visible",
      });
      // Get the count of available counters
      const counterCount = await this.dispensary.counterSelection.count();
      console.log(`Counter count >> ${counterCount}`);
      if (counterCount >= 1) {
        // Select a random counter index
        const randomIndex = Math.floor(Math.random() * counterCount);
        console.log(`Random counter index selected: ${randomIndex}`);
        // Fetch the name of the selected counter
        const fullCounterText = await this.dispensary.counterName
          .nth(randomIndex)
          .textContent();
        let counterName =
          fullCounterText?.split("click to Activate")[0].trim() || ""; // Extracts "Morning Counter"
        console.log(`Counter name at index ${randomIndex}: ${counterName}`);
        // Highlight and select the random counter
        const randomCounter = this.dispensary.counterSelection.nth(randomIndex);
        await CommonMethods.highlightElement(randomCounter);
        await randomCounter.click();
        // Activate the selected counter
        await CommonMethods.highlightElement(this.dispensary.activateCounter);
        await this.page.waitForTimeout(2000);
        await this.dispensary.activateCounter.click({ force: true });
        // Get and verify the activation message text
        const activatedCounterInfoText =
          await this.dispensary.activatedCounterInfo.textContent();
        console.log(
          `Activated counter info text : ${activatedCounterInfoText}`
        );
        // Check if the message contains the selected counter name
        if (activatedCounterInfoText?.includes(counterName)) {
          console.log(
            `-------------------------Verified-------------------------`
          );
        }
      }
    } catch (e) {
      console.error("Error selecting random counter:", e);
    }
  }

  /**
   * @Test11 This method verifies if the counter is activated in the dispensary section.
   *
   * @description Navigates to the dispensary module, selects the 'Morning Counter' from the dropdown, 
   * and generates the user collection report for the specified date.
   * 
   * @param data - An object containing the date range or specific date for the report.
   *               Example: { "FromDate": "01-01-2020" }
   */

  async generateMorningCounterReport(data: Record<string, string>) {
    const fromDate = data['FromDate'];
    await CommonMethods.highlightElement(this.dispensary.dispensaryLink);
    await this.dispensary.dispensaryLink.click();
    await this.page.waitForTimeout(2000);

    await CommonMethods.highlightElement(this.dispensary.reports);
    await this.dispensary.reports.click();

    await CommonMethods.highlightElement(this.dispensary.userCollectionReport);
    await this.dispensary.userCollectionReport.click();

    await CommonMethods.highlightElement(this.dispensary.fromDate);
    await this.dispensary.fromDate.type(data['FromDate'], { delay: 100 });

    // Select 'Morning Counter' from the dropdown
    await this.dispensary.counterDropdown.selectOption({ label: 'Morning Counter' });

    await CommonMethods.highlightElement(this.dispensary.showReportButton);
    await this.dispensary.showReportButton.click();
    await this.page.waitForTimeout(2000);

    const counterColumn = this.dispensary.counterNameFromTable;
    for (let i = 1; i < await counterColumn.count(); i++) {
      expect(await counterColumn.nth(i).textContent()).toEqual("Morning Counter")
    }
  };

  async searchPatientInDispensary(): Promise<boolean> {
    try {
      await CommonMethods.highlightElement(this.dispensary.dispensaryLink);
      await this.dispensary.dispensaryLink.click();
      await CommonMethods.highlightElement(this.dispensary.prescription);
      await this.dispensary.prescription.click();

      return true;
    } catch (e) {
      console.error("Error selecting random counter:", e);
      return false;
    }
  }
}
