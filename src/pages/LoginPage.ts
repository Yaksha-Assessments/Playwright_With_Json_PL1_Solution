import { expect, Locator, Page } from "@playwright/test";
import { CommonMethods } from "../tests/commonMethods";
import testData from "../Data/testData.json";

export class LoginPage {
  readonly page: Page;
  private usernameInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  private loginErrorMessage: Locator;
  private admin: Locator;
  private logOut: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator(`#username_id`);
    this.passwordInput = page.locator(`#password`);
    this.loginButton = page.locator(`#login`);
    this.loginErrorMessage = page.locator(
      `//div[contains(text(),"Invalid credentials !")]`
    );
    this.admin = page.locator('//li[@class="dropdown dropdown-user"]');
    this.logOut = page.locator("//a[text() = ' Log Out ']");
  }

  async navigate() {
    // navigate to homepage
    await this.page.goto("/");
  }

  /**
   * @Test1 This method logs in the user with valid credentials.
   *
   * @description This method performs the login operation using the provided valid credentials, which should be fetched from 
   *              testdata.json file. It highlights the input fields for better visibility during interaction and fills the 
   *              username and password fields. After submitting the login form by clicking the login button, it validates 
   *              the success of the login process. The login is considered successful if there are no errors.
   */

  async performLogin() {
    try {
      const ValidUserName: string = testData.ValidLogin[0].ValidUserName as string;
      const ValidPassword: string = testData.ValidLogin[1].ValidPassword as string;

      // Highlight and fill the username field
      await CommonMethods.highlightElement(this.usernameInput);
      await this.usernameInput.fill(ValidUserName);

      // Highlight and fill the password field
      await CommonMethods.highlightElement(this.passwordInput);
      await this.passwordInput.fill(ValidPassword);

      // Highlight and click the login button
      await CommonMethods.highlightElement(this.loginButton);
      await this.loginButton.click();

      // Verify successful login by checking if 'admin' element is visible
      await this.admin.waitFor({ state: "visible", timeout: 20000 });
      expect(await this.admin.isVisible()).toBeTruthy();
    } catch (e) {
      console.error("Error during login:", e);
    }
  }

  /**
   * @Test16 This method attempts login with invalid credentials and retrieves the resulting error message.
   *
   * @description Tries logging in with incorrect credentials which should be fetched from testData.json file 
   *              to verify the login error message display. Highlights each input field and the login button 
   *              during interaction. Captures and logs the error message displayed upon failed login attempt.
   */

  async performLoginWithInvalidCredentials() {
    try {
      const InvalidUserName: string = testData.InvalidLogin[0].InvalidUserName as string;
      const InvalidPassword: string = testData.InvalidLogin[1].InvalidPassword as string;

      await this.page.waitForTimeout(2000);
      // Attempt to reset login state by logging out if logged in
      if (await this.admin.isVisible()) {
        await CommonMethods.highlightElement(this.admin);
        await this.admin.click();
        await CommonMethods.highlightElement(this.logOut);
        await this.logOut.click();
      }
      // Highlight and fill username and password fields with invalid credentials
      await CommonMethods.highlightElement(this.usernameInput);
      await this.usernameInput.fill(InvalidUserName);
      await CommonMethods.highlightElement(this.passwordInput);
      await this.passwordInput.fill(InvalidPassword);
      // Highlight and click the login button
      await CommonMethods.highlightElement(this.loginButton);
      await this.loginButton.click();
      expect(await this.loginErrorMessage.isVisible());
    } catch (error) {
      console.error("Error during login with invalid credentials:", error);
      throw new Error(
        "Login failed, and error message could not be retrieved."
      );
    }
  }
}
