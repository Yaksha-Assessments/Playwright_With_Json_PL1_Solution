import { expect, Locator, Page } from "@playwright/test";
import { CommonMethods } from "src/tests/commonMethods";

export class SettingsPage {
    readonly page: Page;
    private settingsLink: Locator;
    private radiologySubmodule: Locator;
    private addImagingTypeButton: Locator;
    private imagingItemNameField: Locator;
    private addButton: Locator;
    private searchBar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.settingsLink = page.locator('a[href="#/Settings"]');
        this.radiologySubmodule = page.locator(`//a[@href="#/Settings/RadiologyManage" and contains(text(),'Radiology')]`);
        this.addImagingTypeButton = page.locator(`//a[text()="Add Imaging Type"]`);
        this.imagingItemNameField = page.locator(`input#ImagingTypeName`);
        this.addButton = page.locator(`input#addBtn`);
        this.searchBar = page.locator(`input#quickFilterInput`);

    }

    /**
   * @Test14 This method automates the process of creating a new imaging type in the Radiology section of the Settings module.
   *
   * @description This function performs the following actions:
   *              1. Navigates to the Settings module and clicks on the Radiology submodule.
   *              2. Clicks on the "Add Imaging Type" button to open the modal for adding a new imaging type.
   *              3. Fills the "Imaging Item Name" field with a random name (Test-{random4digitnumber}) and clicks "Add".
   *              4. Verifies that the newly added imaging type appears in the list of imaging types.
   */
    async addAndVerifyNewImagingType() {
        // Navigate to Settings module and click on Radiology submodule
        await CommonMethods.highlightElement(this.settingsLink);
        await this.settingsLink.click();

        await CommonMethods.highlightElement(this.radiologySubmodule);
        await this.radiologySubmodule.click();
        await this.page.waitForTimeout(2000);

        // Click on Add Imaging Type button to open the modal
        await CommonMethods.highlightElement(this.addImagingTypeButton);
        await this.addImagingTypeButton.click();

        // Generate a random Imaging Item Name (Test-{random4digitnumber})
        const randomImagingName = `Test-${Math.floor(1000 + Math.random() * 9000)}`;

        // Fill the Imaging Item Name field and click Add
        await CommonMethods.highlightElement(this.imagingItemNameField);
        await this.imagingItemNameField.fill(randomImagingName);

        await CommonMethods.highlightElement(this.addButton);
        await this.addButton.click();

        // Wait for the new imaging type to appear in the list
        await this.page.waitForTimeout(3000);

        await this.searchBar.fill(randomImagingName);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000);

        // Verify the newly created Imaging Type is displayed in the list
        const isNewImagingTypeVisible = await this.page.locator(`//div[text()="${randomImagingName}"]`).isVisible();
        expect(isNewImagingTypeVisible).toBeTruthy();
    }
}