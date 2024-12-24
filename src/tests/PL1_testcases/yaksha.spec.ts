import { expect, test, Page } from "playwright/test";
import AppointmentPage from "../../pages/AppointmentPage";
import UtilitiesPage from "../../pages/UtilitiesPage";
import DispensaryPage from "../../pages/DispensaryPage";
import { LoginPage } from "../../pages/LoginPage";
import ProcurementPage from "../../pages/ProcurementPage";
import PatientPage from "../../pages/PatientPage";
import ADTPage from "../../pages/ADTPage";
import RadiologyPage from "../../pages/RadiologyPage";
import LaboratoryPage from "../../pages/LaboratoryPage";
import { CommonMethods } from "../commonMethods";
import testData from "../../Data/testData.json";
import { SettingsPage } from "src/pages/SettingsPage";

test.describe("Yaksha", () => {
  let appointmentPage: AppointmentPage;
  let utilitiesPage: UtilitiesPage;
  let dispensaryPage: DispensaryPage;
  let procurementPage: ProcurementPage;
  let loginPage: LoginPage;
  let patientPage: PatientPage;
  let adtPage: ADTPage;
  let radiologyPage: RadiologyPage;
  let laboratoryPage: LaboratoryPage;
  let settingsPage: SettingsPage;
  let context;
  let page: Page;

  test.beforeAll(async ({ browser: b }) => {
    context = await b.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    utilitiesPage = new UtilitiesPage(page);
    appointmentPage = new AppointmentPage(page);
    dispensaryPage = new DispensaryPage(page);
    procurementPage = new ProcurementPage(page);
    patientPage = new PatientPage(page);
    adtPage = new ADTPage(page);
    radiologyPage = new RadiologyPage(page);
    laboratoryPage = new LaboratoryPage(page);
    settingsPage = new SettingsPage(page);
    await page.goto("/");
  });

  test.describe("boundary", () => {
    test("TS-1 Login with valid credentials from JSON file", async () => {
      await loginPage.performLogin();
      await verifyUserIsLoggedin(page);
    });

    test("TS-2 Verify Page Navigation and Load Time for Billing Counter ", async () => {
      await utilitiesPage.verifyBillingCounterLoadState();
      await verifyUtilitiesURL(page, "Utilities/ChangeBillingCounter");
    });

    test("TS-3 Search and Verify Patient with Valid data ", async () => {
      await appointmentPage.verifypatientName();
      await verifyPatientSearchHappened(page);
    });

    test("TS-4 Activate Counter in Dispensary", async () => {
      await dispensaryPage.verifyActiveCounterMessageInDispensary();
      await verifyDispensaryCounterActivation(page);
    });

    test("TS-5 Purchase Request List Load", async () => {
      await procurementPage.verifyPurchaseRequestListElements();
      await verifyUserIsOnCorrectURL(
        page,
        "ProcurementMain/PurchaseRequest/PurchaseRequestList"
      );
    });

    test("TS-6 Verify error message while adding new lab test in Laboratory", async () => {
      await laboratoryPage.verifyErrorMessage();
      await checkErrorMessageOccurs(page);
    });

    test("TS-7 Handle Alert on Radiology Module", async () => {
      await radiologyPage.performRadiologyRequestAndHandleAlert();
      await verifyUserIsOnCorrectURL(page, "Radiology/ImagingRequisitionList");
    });

    test("TS-8 Verify Patient Search Functionality with Multiple Patients", async () => {
      await patientPage.searchAndVerifyPatients();
      await verifyUserIsOnCorrectURL(page, "Patient/SearchPatient");
    });

    test("TS-9 Error Handling and Logging in Purchase Request List", async () => {
      await procurementPage.verifyNoticeMessageAfterEnteringIncorrectFilters();
      await verifyDateFilterErrorMessage(page);
    });

    test("TS-10 Modular Script for Patient Search", async () => {
      await appointmentPage.searchPatientInAppointment();
      await verifyPatientSearchHappened(page);
      await patientPage.searchPatientInPatientPage();
      await verifyPatientSearchHappened(page);
      await adtPage.searchPatientInADT()
      await verifyPatientSearchHappened(page);
    });

    test("TS-11 Verify 'Morning Counter' selection and report generation for the specified date", async () => {
      await dispensaryPage.generateMorningCounterReport();
      await verifyReportGenereation(page);
    });

    test("TS-12 Verify 'New Visit' tab opens with Alt + N keyboard shortcut in Appointment Page", async () => {
      await appointmentPage.openNewVisitPageThroughKeyboardButton();
      await verifyVisitPageOpens(page);
    });

    test("TS-13 Verify the tooltip text on hover of Star icon in Laboratory", async () => {
      await laboratoryPage.verifyStarTooltip();
      const hoverUsed = await isHoverUsed(laboratoryPage.verifyStarTooltip);
      expect(hoverUsed).toBeTruthy();
    });

    test("TS-14 Add and Verify New Imaging Type in Radiology ", async () => {
      await settingsPage.addAndVerifyNewImagingType();
      await verifyImagingTypeAdded(page);
    });

    test("TS-15 Web Element Handling for Dropdowns in Purchase Request", async () => {
      await procurementPage.verifyRequestedDateColumnDateWithinRange();
      await verifyPurchaseReqDataIsPresent(page);
    });

    test("TS-16 Login with invalid credentials", async () => {
      await loginPage.performLoginWithInvalidCredentials();
      await verifyUserIsNotLoggedin(page);
    });
  });
});


// --------------------------------------------------------------------------------------------------------------------------

async function verifyUserIsLoggedin(page: Page) {
  // Verify successful login by checking if 'admin' element is visible
  await page
    .locator('//li[@class="dropdown dropdown-user"]')
    .waitFor({ state: "visible", timeout: 20000 });
  expect(
    await page.locator('//li[@class="dropdown dropdown-user"]').isVisible()
  );
}

async function verifyPatientSearchHappened(page: Page) {
  const patientList = await page.$$(
    `//div[@role='gridcell' and @col-id='ShortName']`
  );
  if (patientList.length == 1) {
    console.log("Patient search happened");
  } else {
    throw new Error("Patient search didn't happened");
  }
}

async function verifyDispensaryCounterActivation(page: Page) {
  expect(
    await page
      .locator("//button[contains(text(),'Deactivate Counter')]")
      .isVisible()
  ).toBeTruthy();
}

async function verifyReportGenereation(page: Page) {
  const tableLength = (await page.$$(`div[col-id="CounterName"]`)).length;
  expect(tableLength).toBeGreaterThan(1);
}

// async function verifyPurchaseRequestListURL(page: Page, expectedURL: string) {
async function verifyUserIsOnCorrectURL(page: Page, expectedURL: string) {
  const getActualURl = page.url();
  expect(getActualURl).toContain(expectedURL);
}

async function verifyUtilitiesURL(page: Page, expectedURL: string) {
  const utilitiesModule = page.locator("//span[text()='Utilities']");
  const ChangeBillingCounter = page.locator('//a[text()= " Change Billing Counter "]');

  // Navigate to Utilities Module
  await CommonMethods.highlightElement(utilitiesModule);
  await utilitiesModule.click();

  // Click on Change Billing Counter and measure load time
  await CommonMethods.highlightElement(ChangeBillingCounter);
  await ChangeBillingCounter.click();
  const getActualURl = page.url();
  expect(getActualURl).toContain(expectedURL);
}

async function verifyPurchaseReqDataIsPresent(page: Page) {
  const tableData = await page.$$(
    `div[ref="eCenterContainer"] div[col-id="RequestDate"]`
  );
  expect(tableData.length).toBeGreaterThanOrEqual(1);
}

async function verifyUserIsNotLoggedin(page: Page) {
  expect(
    await page
      .locator('//div[contains(text(),"Invalid credentials !")]')
      .isVisible()
  ).toBeTruthy();
}

async function checkErrorMessageOccurs(page: Page) {
  // Close the modal
  const closeButton = page.locator('//button[contains(text(),"Close")]');
  await CommonMethods.highlightElement(closeButton);
  await closeButton.click();

  expect(page.url()).toContain("Lab/Settings/LabTest");
}

async function isHoverUsed(method: Function): Promise<boolean> {
  const methodString = method.toString(); // Convert method to a string
  return methodString.includes(".hover"); // Check for 'hover' keyword
}

async function verifyDateFilterErrorMessage(page: Page) {
  const invalidMsg = page.locator(`//div[contains(@class,"invalid-msg-cal")]`);
  const errorMessage = await invalidMsg.textContent();
  expect(await invalidMsg.isVisible()).toBeTruthy();
  expect(errorMessage?.trim()).toEqual("Date is not between Range. Please enter again");
}

async function verifyVisitPageOpens(page: Page) {
  const visitPage = page.locator('//h3[contains(@class,"heading")]');
  expect(await visitPage.isVisible()).toBeTruthy();
}

async function verifyImagingTypeAdded(page: Page) {
  expect(page.url()).toContain("Settings/RadiologyManage/ManageImagingType");
}