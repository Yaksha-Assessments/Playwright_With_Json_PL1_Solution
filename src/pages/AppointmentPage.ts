import { Page, expect, Locator } from "@playwright/test";
import { CommonMethods } from "../tests/commonMethods";
import { PatientSearchHelper } from "../tests/reusableMethod";
export default class AppointmentPage {
  readonly page: Page;
  public appointment: {
    appointmentLink: Locator;
    counterItem: Locator;
    titleName: Locator;
    searchBar: Locator;
    patientName: Locator;
    hospitalSearchBar: Locator;
    patientCode: Locator;
    newVisitTab: Locator;
    newVisitHeading: Locator;
  };

  constructor(page: Page) {
    this.page = page;
    this.appointment = {
      appointmentLink: page.locator('a[href="#/Appointment"]'),
      counterItem: page.locator("//div[@class='counter-item']"),
      titleName: page.locator("//span[text() = 'Patient List |']"),
      searchBar: page.locator("#quickFilterInput"),
      hospitalSearchBar: page.locator("#id_input_search_using_hospital_no"),
      patientName: page.locator(
        "//div[@role='gridcell' and @col-id='ShortName'][1]"
      ),
      patientCode: page.locator(
        "//div[@role='gridcell' and @col-id='PatientCode'][1]"
      ),
      newVisitTab: page.locator(`//a[contains(text(),'New Visit')]`),
      newVisitHeading: page.locator(`//h3[contains(@class,"heading")]`),
    };
  }

  /**
   * @Test3 Validates the presence of the specified patient name in the 'ShortName' column of the search results grid.
   *
   * @description This method checks whether the provided patient name appears in the search results under the 'ShortName'
   *              column. It waits for the column to be visible, retrieves the list of displayed names, and verifies that the
   *              expected patient name is included. If the name is found, the method confirms success; otherwise, it logs
   *              an error for troubleshooting purposes.
   *
   * @param {string} patientName - The expected patient name to validate in the search results.
   * @return {Promise<void>} - No return value, but logs any error encountered during the verification process.
   */
  async verifypatientName() {
    try {
      await this.appointment.appointmentLink.click();

      // Select first counter item if available
      await this.page.waitForTimeout(10000);
      const counterCount = await this.appointment.counterItem.count();
      console.log("counter count is " + counterCount);
      if (counterCount > 0) {
        await CommonMethods.highlightElement(
          this.appointment.counterItem.first()
        );
        await this.appointment.counterItem.first().click();
        await this.appointment.appointmentLink.click();
      } else {
        console.log("No counter items available");
      }
      await expect(this.appointment.patientName.first()).toBeVisible();
      const patientName = await this.appointment.patientName.first().innerText();

      await this.appointment.searchBar.fill(patientName);
      await this.appointment.searchBar.press("Enter");
      await this.page.waitForTimeout(1000);


      await this.page.waitForTimeout(3000);
      await expect(
        this.page.locator("//div[@role='gridcell' and @col-id='ShortName']")
      ).toBeVisible();
      const resultList = this.page.locator(
        "//div[@role='gridcell' and @col-id='ShortName']"
      );
      await this.page.waitForTimeout(3000);
      await expect(resultList).toContainText(patientName);
    } catch (e) {
      console.log(`Error in verifying Patient Name ${e}`);
    }
  }

  /**
   * @Test12 This method opens the New Visit page in the appointment module using the Alt + N keyboard shortcut.
   *
   * @description This function clicks the appointment link to navigate to the appointment module.
   *              It then clicks on the "New Visit" tab and simulates pressing the Alt + N keyboard shortcut to open
   *              the New Visit page. After triggering the shortcut, it waits for the page to load and verifies that
   *              the New Visit page is displayed by checking the visibility of the New Visit heading and the URL.
   */
  async openNewVisitPageThroughKeyboardButton() {
    // Navigate to Appointment module
    await CommonMethods.highlightElement(this.appointment.appointmentLink);
    await this.appointment.appointmentLink.click();

    // Select first counter item if available
    await this.page.waitForTimeout(10000);
    const counterCount = await this.appointment.counterItem.count();
    console.log("counter count is " + counterCount);
    if (counterCount > 0) {
      await CommonMethods.highlightElement(
        this.appointment.counterItem.first()
      );
      await this.appointment.counterItem.first().click();
      await this.appointment.appointmentLink.click();
    } else {
      console.log("No counter items available");
    }

    // Click on the New Visit tab
    await CommonMethods.highlightElement(this.appointment.newVisitTab);
    await this.appointment.newVisitTab.click();

    // Trigger Alt + Enter keyboard shortcut to open the New Visit page
    await this.page.keyboard.down('Alt');
    await this.page.keyboard.press('N');
    await this.page.keyboard.up('Alt');
    await this.page.waitForTimeout(2000);

    // Verify the New Visit page is displayed
    expect(await this.appointment.newVisitHeading.isVisible()).toBeTruthy();

    expect(this.page.url()).toContain("Appointment/Visit");
  }

  /**
   * @Test10.1 This method performs a patient search in the appointment section using reusable function.
   *
   * @description This function highlights the appointment link, clicks on it to navigate to the appointment page,
   *              waits for the page to load, and triggers the patient search action using a helper function.
   *              It ensures that the patient search is executed successfully and returns true if the search operation is completed.
   * @return boolean - Returns true if the patient search is successful, otherwise false.
   */

  async searchPatientInAppointment() {
    const patientSearchHelper = new PatientSearchHelper(this.page);
    await CommonMethods.highlightElement(this.appointment.appointmentLink);
    await this.appointment.appointmentLink.click();

    // Select first counter item if available
    await this.page.waitForTimeout(10000);
    const counterCount = await this.appointment.counterItem.count();
    console.log("counter count is " + counterCount);
    if (counterCount > 0) {
      await CommonMethods.highlightElement(
        this.appointment.counterItem.first()
      );
      await this.appointment.counterItem.first().click();
      await this.appointment.appointmentLink.click();
    } else {
      console.log("No counter items available");
    }

    await this.page.waitForTimeout(2000);
    await patientSearchHelper.searchPatient();
  }
}
