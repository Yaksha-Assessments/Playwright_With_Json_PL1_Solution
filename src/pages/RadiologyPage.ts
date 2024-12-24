import { Locator, Page } from "playwright";
import { CommonMethods } from "../tests/commonMethods";
import testData from "../Data/testData.json";

export default class RadiologyPage {
  readonly page: Page;
  private radiologyModule: Locator;
  private listRequestSubModule: Locator;
  private fromDate: Locator;
  private okButton: Locator;
  private addReportButton: Locator;
  private closeModalButton: Locator;
  constructor(page: Page) {
    this.page = page;
    this.radiologyModule = page.locator('a[href="#/Radiology"]');
    this.listRequestSubModule = page.locator(
      '//a[contains(text(),"List Requests")]'
    );
    this.fromDate = page.locator(`(//input[@id="date"])[1]`);
    this.okButton = page.locator(`//button[contains(text(),"OK")]`);
    this.addReportButton = page.locator(
      '(//a[contains(text(),"Add Report")])[1]'
    );
    this.closeModalButton = page.locator(`a[title="Cancel"]`);
  }
  /**
   * @Test7.1 This method performs a radiology request and handles alerts that may arise during the process.
   *
   * @description This method navigates through the Radiology module, applies a date filter,
   *              attempts to add a report, and handles any resulting alert dialogs.
   *              It loops through the process twice to ensure the requests are handled.
   */

  async performRadiologyRequestAndHandleAlert() {
    try {
      const FromDate: string = testData.DateRange[0].FromDate as string;

      console.log(`From Date: ${FromDate}`);

      // Loop to repeat the process twice
      for (let i = 0; i < 2; i++) {
        // Step 1: Navigate to Radiology Module and List Request sub-module
        await CommonMethods.highlightElement(this.radiologyModule);
        await this.radiologyModule.click();
        await CommonMethods.highlightElement(this.listRequestSubModule);
        await this.listRequestSubModule.click();

        // Step 2: Set From Date
        await CommonMethods.highlightElement(this.fromDate);
        await this.fromDate.type(FromDate, { delay: 100 }); // Typing with delay

        // Step 3: Click OK to apply date filter
        await CommonMethods.highlightElement(this.okButton);
        await this.okButton.click();

        // Wait for the table to load
        await this.addReportButton.waitFor({ state: "visible" });

        // Step 4: Click "Add Report" button in the table
        await CommonMethods.highlightElement(this.addReportButton);
        await this.addReportButton.click();

        // Step 5: Close the modal
        await CommonMethods.highlightElement(this.closeModalButton);
        await this.closeModalButton.click({ delay: 100, force: true });

        // Check if modal is still open and force close if necessary
        if (await this.closeModalButton.isVisible()) {
          console.log("Close button still visible, forcing close.");
          await this.closeModalButton.click({ delay: 100, force: true });
          await this.closeModalButton.press("Enter");
        }

        await this.page.waitForTimeout(2000);

        // Press Shift+Tab three times to navigate backward
        for (let i = 0; i < 3; i++) {
          await this.page.keyboard.press("Shift+Tab");
        }

        // Press Enter to confirm or close
        await this.page.keyboard.press("Enter");

        // Step 6: Handle alert
        await this.handleAlert();

        await CommonMethods.highlightElement(this.listRequestSubModule);
        await this.listRequestSubModule.click();
      }
    } catch (error) {
      console.error("Error during radiology request test:", error);
    }
  }

  /**
   * @Test7.2 This method handles alert dialogs that may appear during radiology requests.
   *
   * @description Listens for dialog events on the page. If the alert matches the expected
   *              message, it accepts the dialog; otherwise, it dismisses it.
   *
   * @return boolean - Returns true if the alert handling was successful.
   */
  async handleAlert(): Promise<boolean> {
    try {
      // Wait for the alert, then accept it
      this.page.on("dialog", async (dialog) => {
        console.log(`Alert message: ${dialog.message()}`);
        if (
          dialog
            .message()
            .includes("Changes will be discarded. Do you want to close anyway?")
        ) {
          await dialog.accept();
          console.log("Alert accepted.");
        } else {
          await dialog.dismiss();
          console.log("Alert dismissed.");
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to handle alert:", error);
      return false;
    }
  }
}
